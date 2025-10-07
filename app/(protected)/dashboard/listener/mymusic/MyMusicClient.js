"use client";

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function MyMusicClient({ pullsWithSets }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [openLyrics, setOpenLyrics] = useState(false);
  const [lyricsContent, setLyricsContent] = useState("");
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

    // 👇 evita errores de hidratación
  
  const playSong = (songId) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSongId(null);
    }
    const audio = new Audio(`/api/song-audio?id=${songId}`);
    audio.play();
    setCurrentAudio(audio);
    setPlayingSongId(songId);
    audio.onended = () => {
      setCurrentAudio(null);
      setPlayingSongId(null);
    };
  };

  const stopSong = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSongId(null);
    }
  };

  const showLyrics = async (songId) => {
    const res = await fetch(`/api/song-lyrics?id=${songId}`);
    const data = await res.json();
    if (!data?.lyrics || data.lyrics.trim() === "") return;
    setLyricsContent(data.lyrics);
    setOpenLyrics(true);
  };
  if (!mounted) return null;
  return (
    <Box>
      <Typography variant="h4" mb={2}>
        {t("artistmusictitle")}
      </Typography>
      {pullsWithSets.length === 0 ? (
        <Typography>{t("nomusic")}</Typography>
      ) : (
        pullsWithSets.map((pull, idx) =>
          pull.ShareTokens.map((t, i) => {
            const set = t.musicSet;
            if (!set) return null;
            return (
              <Box
                key={`${idx}-${i}`}
                mb={4}
                p={2}
                border={1}
                bgcolor="#fff"
                borderRadius={2}
                color={"#333"}
                boxShadow={1}
              >
                {/* Datos del artista */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {t.owner.image && (
                    <Image
                      src={`/api/user-image?id=${t.owner.id}`}
                      alt={t.owner.name}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1">{t.owner.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t.owner.email}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" mb={2}>
                  {set.name}
                </Typography>

                {/* Lista de canciones */}
                {set.songs.map((song) => (
                  <Box key={song.id} display="flex" alignItems="center" gap={2} mb={1}>
                    <Image
                      src={`/api/song-image?id=${song.id}`}
                      alt={song.title}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <Typography sx={{ flexGrow: 1 }}>{song.title}</Typography>

                    {song.lyrics && song.lyrics.trim() !== "" && (
                      <Button variant="outlined" onClick={() => showLyrics(song.id)}>
                        Letra
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      color={playingSongId === song.id ? "error" : "primary"}
                      onClick={() =>
                        playingSongId === song.id ? stopSong() : playSong(song.id)
                      }
                    >
                      {playingSongId === song.id ? "Stop" : "Play"}
                    </Button>
                  </Box>
                ))}

                {/* Botón Evaluar */}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => router.push(`/dashboard/listener/evaluate/${t.token}`)}
                  >
                    {t("evaluateset")}
                  </Button>
                </Box>
              </Box>
            );
          })
        )
      )}

      {/* Modal Letra */}
      <Dialog open={openLyrics} onClose={() => setOpenLyrics(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("lyricbtn")}</DialogTitle>
        <DialogContent dividers>
          <Typography whiteSpace="pre-line">{lyricsContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLyrics(false)}>{t("closebtn")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
