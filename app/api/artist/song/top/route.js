// /app/api/artist/song/top/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const userId = user.id;

    const songs = await prisma.song.findMany({
      where: { userId },
      include: {
        plays: true,
        responses: {
          include: { user: true }
        }
      }
    });

    const processed = songs.map(song => {
      const totalPlays = song.plays.length;
      const completions = song.plays.filter(p => p.completed).length;
      const replays = song.plays.reduce((acc, p) => acc + p.replayCount, 0);
      const avgScore =
        song.plays.length > 0
          ? song.plays.reduce((acc, p) => acc + (p.score ?? 0), 0) / song.plays.length
          : null;

      // retention drop
      const dropPoints = song.plays
        .filter(p => !p.completed && p.stoppedAtSec)
        .map(p => p.stoppedAtSec);

      let hasMajorDrop = null;
      if (dropPoints.length > 0) {
        const counts = {};
        dropPoints.forEach(sec => (counts[sec] = (counts[sec] || 0) + 1));
        const [at, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        hasMajorDrop = {
          at: `${at}s`,
          drop: ((count / song.plays.length) * 100).toFixed(1)
        };
      }

      // agrupar respuestas de encuestas
      const questions = [];
      song.responses.forEach(r => {
        Object.entries(r.answers).forEach(([q, v]) => {
          let qObj = questions.find(qq => qq.question === q);
          if (!qObj) {
            qObj = { question: q, values: [], avg: null };
            questions.push(qObj);
          }
          qObj.values.push(v);
        });
      });
      questions.forEach(q => {
        q.avg = q.values.reduce((a, b) => a + b, 0) / q.values.length;
      });

      return {
        id: song.id,
        title: song.title,
        overallScore: avgScore ? avgScore.toFixed(2) : "N/A",
        completionRate: totalPlays > 0 ? ((completions / totalPlays) * 100).toFixed(1) : 0,
        replay: replays,
        retentionDrop: hasMajorDrop,
        questions
      };
    });

    // top 3 canciones de ese artista
    const top = [...processed]
      .sort((a, b) => parseFloat(b.overallScore) - parseFloat(a.overallScore))
      .slice(0, 3);

    return NextResponse.json({ songs: processed, top });
  } catch (err) {
    console.error("Error fetching songs", err);
    return NextResponse.json({ error: "Error fetching songs" }, { status: 500 });
  }
}
