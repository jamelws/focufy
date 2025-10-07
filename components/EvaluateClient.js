"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Slide,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import confetti from "canvas-confetti";

import MultiCard from "@/components/MultiCard";
import RadioCard from "@/components/RadioCard";
import SliderCard from "@/components/SliderCard";
import CheckboxCard from "@/components/CheckboxCard";
import RankingCard from "@/components/RankingCard";
import MusicPlayer from "@/components/MusicPlayer";
import i18n from "@/lib/i18n";

export default function EvaluateClient({ data, session, onError }) {
  const [step, setStep] = useState("intro");
  const [responses, setResponses] = useState({});
  const [songIndex, setSongIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();

  const musicSet = data.data?.musicSet;
  const songs = musicSet?.songs || [];
  const currentSong = songs[songIndex];
  const questions = currentSong?.songQuestions || [];
  const currentQuestion = questions[questionIndex] || null;

  const ComponentMultipleChoice = useMemo(() => {
    if (!currentQuestion?.question) return null;
    const comps = [MultiCard, RadioCard, CheckboxCard, SliderCard];
    return currentQuestion.question.type === "MULTIPLE_CHOICE"
      ? comps[currentQuestion.question.id % comps.length]
      : null;
  }, [currentQuestion]);

  useEffect(() => {
    if (data?.error && !data.needRequest) {
      onError?.(data.error);
    }
  }, [data?.error, data?.needRequest, onError]);

  useEffect(() => {
    if (data?.needRequest) {
      setOpenRequestDialog(true);
    }
  }, [data?.needRequest]);

  const handleConfirm = async () => {
    if (!session?.user?.id) {
      onError?.("Debes iniciar sesión para solicitar acceso.");
      return;
    }
    try {
      const res = await fetch("/api/sharetokenuser/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: data.data.token,
          userId: session.user.id,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al enviar solicitud");
      }
      setOpenRequestDialog(false);
      setOpenSuccess(true);
    } catch (err) {
      onError?.(err.message);
    }
  };

  if (openRequestDialog) {
    return (
      <>
        <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
          <DialogTitle>Solicitar acceso</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Quieres solicitar acceso al artista para poder participar en este Focus Group?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequestDialog(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} color="primary" variant="contained">
              Solicitar acceso
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={openSuccess}
          autoHideDuration={6000}
          onClose={() => setOpenSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Solicitud enviada. Espera la aprobación del artista.
          </Alert>
        </Snackbar>
      </>
    );
  }

  const fireConfetti = (e) => {
    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ["#ae83e5", "#ffffff", "#f4a261"],
      });
    }
  };

  const handleResponseChange = (questionId, value, event) => {
    setResponses((prev) => ({
      ...prev,
      [`${currentSong.id}_${questionId}`]: value,
    }));
    if (event) fireConfetti(event);
  };

  const navigate = (direction) => {
    setSlideIn(false);
    setTimeout(() => {
      if (direction === "next") {
        if (questionIndex < questions.length - 1) {
          setQuestionIndex((i) => i + 1);
        } else if (songIndex < songs.length - 1) {
          setSongIndex((i) => i + 1);
          setQuestionIndex(0);
        }
      } else {
        if (questionIndex > 0) {
          setQuestionIndex((i) => i - 1);
        } else if (songIndex > 0) {
          setSongIndex((i) => i - 1);
          setQuestionIndex(questions.length - 1);
        }
      }
      setSlideIn(true);
    }, 220);
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = Object.entries(responses).map(([key, value]) => {
        const [songId, questionId] = key.split("_");
        return {
          songId,
          questionId: parseInt(questionId, 10),
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
        };
      });
      const res = await fetch("/api/listener/save-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload, token: data.data.token }),
      });
      if (!res.ok) throw new Error("Error al enviar respuestas");
      setStep("finished");
    } catch (e) {
      onError?.(e.message || "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const questionsProgress = ((questionIndex + 1) / (questions.length || 1)) * 100;

  if (step === "intro") {
    return (
      <Box sx={{ maxHeight: "80vh", overflowY: "auto", p: 2 }}>
        <Typography variant="h5" gutterBottom>{t("intro1")}</Typography>
        <Typography variant="h6" gutterBottom className="text-purple">{t("intro2")}</Typography>
        <Typography variant="body1">{t("intro3")} <br /><br />
          <span className="text-purple"><b>{t("intro3b")}</b>; {t("intro3s")}</span>
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{t("intro4")}</Typography>

        <List>
          <ListItem>
            <ListItemIcon><LooksOneIcon /></ListItemIcon>
            <ListItemText>{t("intro5t")}
              <Typography variant="body2">{t("intro5d1")}<br />{t("intro5d2")}<br />{t("intro5d3")}</Typography>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon><LooksTwoIcon /></ListItemIcon>
            <ListItemText>{t("intro6t")}<br />
              <Typography variant="body2">{t("intro6d")}</Typography>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon><Looks3Icon /></ListItemIcon>
            <ListItemText>{t("intro7t")}
              <Typography variant="body2">{t("intro7d")}</Typography>
            </ListItemText>
          </ListItem>
        </List>

        <List>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary={t("introlist1")} />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary={t("introlist2")} />
          </ListItem>
        </List>

        <Typography variant="body2"><b>{t("titleacept")}</b><br />{t("descacept")}</Typography>
        <Typography variant="body2">{t("introthanks")}</Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" size="large" onClick={() => setStep("quiz")}>
            {t("btnTerms")}
          </Button>
        </Box>
      </Box>
    );
  }

  if (step === "quiz") {
    return (
      <Box p={3} mx="auto">
        <Box mb={3}>
          {questions.length > 0 && (
            <>
              <Typography variant="body2" gutterBottom>
                {t("questionsforsong")}: {questionIndex + 1} / {questions.length}
              </Typography>
              <LinearProgress variant="determinate" value={questionsProgress} />
              <Divider sx={{ my: 2 }} />
            </>
          )}
        </Box>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
          <Box flex={{ md: "0 0 300px" }}>
            <MusicPlayer
              song={currentSong}
              musicSet={musicSet}
              isPlaying={audioPlayingId === currentSong?.id}
              onPlayPause={() => setAudioPlayingId((prevId) => (prevId === currentSong?.id ? null : currentSong?.id))}
              songCount={songs.length}
              currentIndex={songIndex}
              onNext={() => navigate("next")}
              onPrev={() => navigate("prev")}
              isNextDisabled={songIndex === songs.length - 1 && questionIndex === questions.length - 1}
              isPrevDisabled={songIndex === 0 && questionIndex === 0}
            />
          </Box>

          {questions.length > 0 && (
            <Box flex="1" sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2, bgcolor: "background.paper" }}>
              <Slide in={slideIn} direction="left" mountOnEnter unmountOnExit>
                <Box>
                  {currentQuestion?.question?.type === "TEXT" && (
                    <>
                      <Typography component="legend" sx={{ fontSize: "1.25rem", mb: 1 }}>
                        {currentQuestion.question.title}
                      </Typography>
                      <TextField
                        fullWidth
                        value={responses[`${currentSong.id}_${currentQuestion.question.id}`] ?? ""}
                        sx={{ mt: 1 }}
                        onChange={(e) =>
                          handleResponseChange(currentQuestion.question.id, e.target.value)
                        }
                      />
                    </>
                  )}

                  {currentQuestion?.question?.type === "MULTIPLE_CHOICE" && ComponentMultipleChoice && (
                    <ComponentMultipleChoice
                      opciones={currentQuestion.question.options
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((o) => ({ id: o.id, label: o.label, labelEn: o.labelEn, labelFr: o.labelFr, value: o.value }))}
                      pregunta={currentQuestion.question}
                      i18n={i18n}
                      valorRespuesta={responses[`${currentSong.id}_${currentQuestion.question.id}`] ?? ""}
                      handleRespuestaChange={(value, event) =>
                        handleResponseChange(currentQuestion.question.id, value, event)
                      }
                    />
                  )}

                  {currentQuestion?.question?.type === "SCALE_1_5" && (
                    <>
                      <Typography component="legend" sx={{ fontSize: "1.25rem", mb: 1 }}>
                        {currentQuestion.question.title}
                      </Typography>
                      <RankingCard
                        pregunta={currentQuestion.question}
                        valorRespuesta={responses[`${currentSong.id}_${currentQuestion.question.id}`] ?? ""}
                        handleRespuestaChange={(value, event) =>
                          handleResponseChange(currentQuestion.question.id, value, event)
                        }
                      />
                    </>
                  )}
                </Box>
              </Slide>

              <Box mt={3} display="flex" justifyContent="space-between" gap={1}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate("prev")}
                  disabled={songIndex === 0 && questionIndex === 0}
                >
                  {t("prevbtn")}
                </Button>

                {songIndex === songs.length - 1 && questionIndex === questions.length - 1 ? (
                  <Button variant="contained" color="success" onClick={submit} disabled={submitting}>
                    {submitting ? t("sending") : t("send")}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={() => navigate("next")}>
                    {t("nextbtn")}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  if (step === "finished") {
    return (
      <Box p={3} maxWidth="720px" mx="auto" textAlign="center">
        <Typography variant="h5" gutterBottom>{t("finish1")}</Typography>
        <Typography variant="h6">{t("finish2")}</Typography>
        <Typography variant="body1">{t("finish3")}</Typography>
        <Typography variant="body1">{t("finish4")} <span className="text-purple">Focufy.ai</span>.</Typography>
        <Typography variant="body1">{t("finish5")}</Typography>
        <Typography variant="body1">✨ {t("finish6")}</Typography>

        <Box mt={4}>
          <Button variant="contained" size="large" onClick={() => router.push("/listener/my-music")}>
            {t("btnfinish")}
          </Button>
        </Box>
      </Box>
    );
  }

  return null;
}
