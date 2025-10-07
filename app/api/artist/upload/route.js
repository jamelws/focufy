// app/api/artist/upload/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log("📥 [UPLOAD] Iniciando subida de canciones...");

    // 🔑 Leer cookie con el JWT
    const session = await auth();
    const users = session.user;
    console.log("usuario",users);
    if (!users) {
      console.log("❌ Usuario no autenticado (sin cookie)");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: users.id },
    });

    if (!user) {
      console.log("❌ Usuario no encontrado:", decoded.id);
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    console.log("👤 Usuario encontrado:", user.id);

    // Obtener formData
    const formData = await req.formData();
    console.log("📦 formData keys:", [...formData.keys()]);

    // Crear el set de canciones
    const musicSetName = formData.get("musicSetName");
    console.log("🎶 Creando MusicSet:", musicSetName);

    const musicSet = await prisma.musicSet.create({
      data: {
        name: musicSetName,
        userId: user.id,
      },
    });
    console.log("✅ MusicSet creado:", musicSet.id);

    // Datos generales
    const titles = formData.getAll("title");
    const lyrics = formData.getAll("lyrics");
    const durations = formData.getAll("duration");
    const extensions = formData.getAll("extension");
    const audioFiles = formData.getAll("audio");
    const questionsPerSong = formData.getAll("questions");

    console.log("🎵 Canciones detectadas:", titles.length);

    // Procesar canciones
    for (let i = 0; i < titles.length; i++) {
      console.log(`\n--- Procesando canción ${i + 1} ---`);
      console.log("Título:", titles[i]);
      console.log("Duración:", durations[i]);
      console.log("Extensión:", extensions[i]);

      const audioFile = audioFiles[i];
      const imageFile = formData.get(`image_${i}`);

      let audioBuffer = null;
      let imageBuffer = null;

      if (audioFile && typeof audioFile.arrayBuffer === "function") {
        audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        console.log("📀 Audio cargado (bytes):", audioBuffer.length);
      }

      if (imageFile && typeof imageFile.arrayBuffer === "function") {
        imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        console.log("🖼️ Imagen cargada (bytes):", imageBuffer.length);
      }

      // Crear la canción
      const song = await prisma.song.create({
        data: {
          title: titles[i] || "Sin título",
          lyrics: lyrics[i] || null,
          durationSec: durations[i] ? parseInt(durations[i]) : null,
          extension: extensions[i] || null,
          file: audioBuffer,
          image: imageBuffer,
          artistId: user.id,
          musicSetId: musicSet.id,
        },
      });
      console.log("✅ Canción guardada con ID:", song.id);

      // Procesa las preguntas para la canción actual
      const questionIds = questionsPerSong[i]
        ? questionsPerSong[i].split(",").filter((id) => id)
        : [];

      if (questionIds.length > 0) {
        console.log(`🧠 Procesando ${questionIds.length} preguntas para la canción ${song.id}:`, questionIds);
        for (const qId of questionIds) {
          console.log(`➡️ Guardando relación SongQuestion (songId=${song.id}, questionId=${qId})`);
          await prisma.songQuestion.create({
            data: {
              songId: song.id,
              questionId: parseInt(qId),
            },
          });
        }
        console.log("✅ Preguntas guardadas para canción", song.id);
      } else {
        console.log("⚠️ No llegaron preguntas para esta canción");
      }
    }

    console.log("🎉 Proceso finalizado correctamente");
    return NextResponse.json({ message: "Canciones cargadas correctamente" }, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR en /api/artist/upload:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", detail: error.message },
      { status: 500 }
    );
  }
}
