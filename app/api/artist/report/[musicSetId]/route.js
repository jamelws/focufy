import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { musicSetId } = await params;
  if (!musicSetId) {
    return NextResponse.json(
      { error: "MusicSet ID es requerido" },
      { status: 400 }
    );
  }

  try {
    const musicSet = await prisma.musicSet.findUnique({
      where: { id: String(musicSetId) },
      include: {
        songs: {
          include: {
            songPlays: true,
            responses: {
              include: {
                user: {
                  include: {
                    pais: true,
                    ciudad: true,
                    genres: true,
                  },
                },
                question: { include: { options: true } },
              },
            },
          },
        },
      },
    });

    if (!musicSet) {
      return NextResponse.json(
        { error: "MusicSet no encontrado" },
        { status: 404 }
      );
    }

    // ----------------------------
    // 📊 Métricas globales del Set
    // ----------------------------
    const allPlays = musicSet.songs.flatMap((s) => s.songPlays);
    const totalPlays = allPlays.length;
    const completionRate =
      totalPlays > 0
        ? Math.round(
            (allPlays.filter((p) => p.completed).length / totalPlays) * 100
          )
        : 0;
    const replayRatio =
      totalPlays > 0
        ? Math.round(
            (allPlays.reduce((acc, p) => acc + (p.replayCount || 0), 0) /
              totalPlays) *
              100
          )
        : 0;

    const demographicsData = {};
    const genresData = {};
   
    musicSet.songs.forEach((song) => {
      song.responses.forEach((r) => {
        const u = r.user;
        if (u) {
          const keyCity = u.ciudad?.nombre || "Desconocida";
          demographicsData[keyCity] = (demographicsData[keyCity] || 0) + 1;

          const keyPais = u.pais?.nombre || "México";
          demographicsData[keyPais] = (demographicsData[keyPais] || 0) + 1;

          u.genres.forEach((g) => {
            const gKey = g.name || "Otro";
            genresData[gKey] = (genresData[gKey] || 0) + 1;
          });
        }
      });
    });

    const topCity = Object.entries(demographicsData).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
    const topGenres = Object.entries(genresData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const setMetrics = {
      playCount: totalPlays,
      completionRate,
      replayRatio,
      overallScore: Number(
        ((completionRate / 100) + (replayRatio / 100)).toFixed(1)
      ),
    };

    // ----------------------------
    // 📋 Construir respuesta
    // ----------------------------
    const responseData = {
      musicSet: {
        id: musicSet.id,
        name: musicSet.name,
        summary: {
          recommendation: `El set "${musicSet.name}" tiene ${totalPlays} reproducciones y una tasa de finalización del ${completionRate}%.`,
          nicheDescription: `Principalmente en ${topCity || "ciudades principales"} (${musicSet.songs.length} canciones analizadas).`,
          keywords: topGenres.length > 0 ? topGenres : ["Pop", "Indie"],
        },
        metrics: setMetrics,

        // 🔹 Canciones individuales
        songs: musicSet.songs.map((song) => {
          const playCount = song.songPlays.length;
          const completed = song.songPlays.filter((p) => p.completed).length;
          const cRate =
            playCount > 0 ? Math.round((completed / playCount) * 100) : 0;
          const totalReplays = song.songPlays.reduce(
            (acc, p) => acc + (p.replayCount > 1 ? p.replayCount - 1 : 0),
            0
          );

          const rRatio =
            playCount > 0
              ? Math.round((totalReplays / playCount) * 100)
              : 0;

          // 🔹 Calificación promedio (pregunta "calificacion")
          const calificaciones = song.responses
            .filter((r) => r.question?.key === "calificacion")
            .map((r) => parseInt(r.value, 10))
            .filter((v) => !isNaN(v));

          const promedio =
            calificaciones.length > 0
              ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
              : 0;

          // 🔹 Retention curve + punto de mayor caída
          const retentionData = { timestamps: [], retention: [], drop: null, at: null };

          // detectar mayores drops por canción
          const dropPoints = song.songPlays
            .filter((p) => !p.completed && p.stoppedAtSec)
            .map((p) => p.stoppedAtSec);

          if (dropPoints.length > 0) {
            const counts = {};
            dropPoints.forEach((sec) => (counts[sec] = (counts[sec] || 0) + 1));
            const [at, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            retentionData.drop = ((count / song.songPlays.length) * 100).toFixed(1);
            retentionData.at = `${at}s`;
          }

          // buckets de retención
          const buckets = [30, 60, 90, 120, 150, 180];
          buckets.forEach((sec) => {
            const stillHere =
              playCount > 0
                ? Math.round(
                    (song.songPlays.filter(
                      (p) => !p.stoppedAtSec || p.stoppedAtSec >= sec
                    ).length /
                      playCount) *
                      100
                  )
                : 0;
            retentionData.timestamps.push(
              `${Math.floor(sec / 60)}:${("0" + (sec % 60)).slice(-2)}`
            );
            retentionData.retention.push(stillHere);
          });


          // 🔹 Demographics (edades)
          const ageGroups = ["<18", "18-21", "22-24", "25-28", "29-34", "35+"];
          const ageData = new Array(ageGroups.length).fill(0);
          song.responses.forEach((r) => {
            const nacimiento = r.user?.nacimiento;
            if (nacimiento) {
              const birthYear = parseInt(nacimiento, 10); // 👈 fuerza número
              const edad = new Date().getFullYear() - birthYear;
              let idx = 5;
              if (edad < 18) idx = 0;
              else if (edad <= 21) idx = 1;
              else if (edad <= 24) idx = 2;
              else if (edad <= 28) idx = 3;
              else if (edad <= 34) idx = 4;
              ageData[idx]++;
            }
          });

          // 🔹 Keywords por canción
          const songGenres = {};
          song.responses.forEach((r) => {
            r.user?.genres.forEach((g) => {
              const gKey = g.name || "Otro";
              songGenres[gKey] = (songGenres[gKey] || 0) + 1;
            });
          });
          const topSongGenres = Object.entries(songGenres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);

          // 🔹 Agrupar respuestas por pregunta
          const grouped = {};
          song.responses.forEach((r) => {
            const qKey = r.question?.key || "unknown";
            if (!grouped[qKey]) {
              grouped[qKey] = {
                questionKey: qKey,
                questionText: r.question?.title,
                type: r.question?.type,
                options:
                  r.question?.options?.map((o) => o.value) ||
                  ["1", "2", "3", "4", "5"],
                values: [],
              };
            }
            grouped[qKey].values.push(r.value);
          });

          const responsesGrouped = Object.values(grouped).map((q) => {
            const total = q.values.length || 1;
            const palette = [
              "#3b82f6",
              "#10b981",
              "#f59e0b",
              "#ef4444",
              "#8b5cf6",
              "#ec4899",
              "#14b8a6",
            ];

            let chartData = [];

            if (q.type === "MULTIPLE_CHOICE") {
              chartData = q.options.map((opt, i) => {
                let matches = 0;
                q.values.forEach((val) => {
                  try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) {
                      const peso = 1 / parsed.length;
                      parsed.forEach((v) => {
                        if (v?.toLowerCase() === opt?.toLowerCase()) {
                          matches += peso;
                        }
                      });
                    } else if (val?.toLowerCase() === opt?.toLowerCase()) {
                      matches += 1;
                    }
                  } catch {
                    if (val?.toLowerCase() === opt?.toLowerCase()) {
                      matches += 1;
                    }
                  }
                });
                const percent = Math.round((matches / total) * 100);
                return {
                  label: opt,
                  value: percent,
                  color: palette[i % palette.length],
                };
              });
            } else if (q.type === "SCALE_1_5") {
              const scaleLabels = {
                "1": "Muy malo",
                "2": "Malo",
                "3": "Regular",
                "4": "Bueno",
                "5": "Muy bueno",
              };
              chartData = ["1", "2", "3", "4", "5"].map((opt, i) => {
                const matches = q.values.filter((val) => val === opt).length;
                const percent = Math.round((matches / total) * 100);
                return {
                  label: scaleLabels[opt],
                  value: percent,
                  color: palette[i % palette.length],
                };
              });
            } else if (q.type === "TEXT") {
              chartData = [];
            }

            return {
              questionKey: q.questionKey,
              questionText: q.questionText,
              type: q.type,
              chartData,
              rawValues: q.values,
            };
          });

          return {
            id: song.id,
            title: song.title,
            summary: {
              recommendation: `La canción "${song.title}" tiene ${cRate}% de finalización y ${rRatio}% de repetición.`,
              nicheDescription: `Principalmente escuchada en ${topCity || "ciudades principales"}`,
              keywords: topSongGenres.length > 0 ? topSongGenres : ["Indie", "Pop"],
            },
            metrics: {
              playCount,
              completionRate: cRate,
              replayRatio: rRatio,
              overallScore: Number(promedio.toFixed(1)), // ✅ ahora es de 1 a 5
            },
            retentionData,
            demographics: { data: ageData, labels: ageGroups },
            affinity: { topArtists: topSongGenres.map((g) => ({ name: g })) },
            responsesGrouped,
          };
        }),
      },
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Fallo al generar el reporte" },
      { status: 500 }
    );
  }
}
