// app/(protected)/dashboard/listen/[token]/page.js
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import Image from "next/image";

export default function ListenerPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setData, setSetData] = useState(null);

  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
 
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/listener/resolve?token=${token}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "No se pudo abrir la invitación");
        setSetData(data.set);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Actualizar barra de progreso
  useEffect(() => {
    if (currentAudio) {
      const interval = setInterval(() => {
        if (currentAudio.duration > 0) {
          setProgressMap((prev) => ({
            ...prev,
            [playingSongId]: (currentAudio.currentTime / currentAudio.duration) * 100,
          }));
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentAudio, playingSongId]);
  
  // ▶️ Reproducir
  const playSong = (id, index = null) => {
    if (currentAudio && playingSongId) {
      currentAudio.pause();

      const stoppedAt = Math.floor(currentAudio.currentTime);
      registerPlay(playingSongId, false, stoppedAt);  // ✅ usa el id correcto
      setCurrentAudio(null);
      setPlayingSongId(null);
    }

    const audio = new Audio(`/api/song-audio?id=${id}`);
    setCurrentAudio(audio);
    setPlayingSongId(id);

    audio.play();

    audio.onended = () => {
      registerPlay(id, true, 0); // ✅ se terminó
      setCurrentAudio(null);
      setPlayingSongId(null);

      // Autoplay siguiente
      if (index !== null && index + 1 < setData.songs.length) {
        const nextSong = setData.songs[index + 1];
        playSong(nextSong.id, index + 1);
      }
    };
  };

  // ⏹️ Detener manualmente
  const stopSong = () => {
    if (currentAudio && playingSongId) {
      const stoppedAt = Math.floor(currentAudio.currentTime);
      registerPlay(playingSongId, false, stoppedAt); // ❌ detenido manualmente
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSongId(null);
    }
  };

  // 📡 Registro al backend
  async function registerPlay(songId, completed, stoppedAtSec) {
    try {
      console.log("Enviado",songId,completed,stoppedAtSec);
      await fetch("/api/song-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          completed,
          stoppedAtSec,
        }),
      });
    } catch (e) {
      console.error("❌ Error registrando play:", e);
    }
  }

  if (loading) return <Box p={3}><Typography>Cargando…</Typography></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!setData) return <Box p={3}><Alert severity="warning">Invitación no válida</Alert></Box>;

  return (
    <Box p={3}>
      <Typography variant="h5" mb={1}>{setData.name}</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Disponible desde {new Date(setData.startsAt).toLocaleString()} hasta {new Date(setData.endsAt).toLocaleString()}
      </Typography>

      {setData.songs.map((song, idx) => {
        const progress = progressMap[song.id] || 0;
        return (
          <Box
            key={song.id}
            display="flex"
            alignItems="center"
            gap={2}
            p={1}
            border={1}
            borderColor="#eee"
            borderRadius={1}
            mb={1}
          >
            <Image width={48} height={48}
              src={`/api/song-image?id=${song.id}`}
              alt={song.title}
              style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography>{song.title}</Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 8, borderRadius: 5 }}
              />
            </Box>

            <Button
              variant="contained"
              color={playingSongId === song.id ? "error" : "primary"}
              onClick={() =>
                playingSongId === song.id ? stopSong() : playSong(song.id, idx)
              }
            >
              {playingSongId === song.id ? "Stop" : "Play"}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
