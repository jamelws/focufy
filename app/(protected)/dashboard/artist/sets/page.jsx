"use client";
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, RadioGroup, FormControlLabel, Radio, MenuItem,
  Snackbar, Alert, IconButton, Badge, Table, TableHead, TableRow, TableCell, TableBody,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import "dayjs/locale/es";
import "dayjs/locale/en";
import "dayjs/locale/fr";
export default function MySongs() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [musicSets, setMusicSets] = useState([]);
  const [users, setUsers] = useState([]);
  const [focusGroups, setFocusGroups] = useState([]);
  const [error, setError] = useState(null);

  // 🎵 Estados canciones
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [openLyrics, setOpenLyrics] = useState(false);
  const [lyricsContent, setLyricsContent] = useState("");

  // 📤 Compartir
  const [openShare, setOpenShare] = useState(false);
  const [shareSetId, setShareSetId] = useState("");
  const [shareType, setShareType] = useState("users");
  const [shareStart, setShareStart] = useState("");
  const [shareEnd, setShareEnd] = useState("");
  const [shareUserIds, setShareUserIds] = useState([]);
  const [shareFocusGroupId, setShareFocusGroupId] = useState("");
  const [shareEmails, setShareEmails] = useState("");
  const [shareLinks, setShareLinks] = useState([]);
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState("en");
  

  // 🔔 Solicitudes pendientes
  const [openRequests, setOpenRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  useEffect(() => {
    setLang(i18n.la);
  }, []);
  // 🔹 Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/artist/my-songs");
        if (!res.ok) throw new Error("Error al cargar datos");
        const data = await res.json();
        setMusicSets(data.musicSets || []);
        setUsers(data.users || []);
        setFocusGroups(data.focusGroups || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🎵 Canciones
  const playSong = (songId) => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingSongId(null); }
    const audio = new Audio(`/api/song-audio?id=${songId}`);
    audio.play();
    setCurrentAudio(audio);
    setPlayingSongId(songId);
    audio.onended = () => { setCurrentAudio(null); setPlayingSongId(null); };
  };

  const stopSong = () => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingSongId(null); }
  };

  const showLyrics = async (songId) => {
    const res = await fetch(`/api/song-lyrics?id=${songId}`);
    const data = await res.json();
    if (!data?.lyrics || data.lyrics.trim() === '') return;
    setLyricsContent(data.lyrics);
    setOpenLyrics(true);
  };

  // 📤 Compartir
  const openShareDialog = (setId, startsAt, endsAt) => {
    setShareSetId(String(setId));
    setShareType(focusGroups.length ? 'focusgroup' : 'users');
    setShareStart(startsAt ? new Date(startsAt).toISOString().slice(0, 10) : '');
    setShareEnd(endsAt ? new Date(endsAt).toISOString().slice(0, 10) : '');
    setShareUserIds([]);
    setShareFocusGroupId(focusGroups[0]?.id || '');
    setShareEmails('');
    setShareLinks([]);
    setOpenShare(true);
  };

  const submitShare = async () => {
    if (!shareSetId) {
      setSnackbar({ open: true, message: t("erroridset"), severity: 'error' });
      return;
    }
    if (!shareStart || !shareEnd) {
      setSnackbar({ open: true, message: t("errordates"), severity: 'warning' });
      return;
    }

    const payload = {
      musicSetId: shareSetId,
      startAt: shareStart,
      endAt: shareEnd,
      target: shareType,
      focusGroupId: shareType === 'focusgroup' ? shareFocusGroupId : undefined,
      userIds: shareType === 'users' ? shareUserIds : undefined,
      emails: shareType === 'emails' ? shareEmails : undefined,
    };

    try {
      const res = await fetch('/api/artist/share-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("erroronshare"));
      setShareLinks(data.links || []);
      setSnackbar({ open: true, message: data.message || 'Set compartido', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: 'error' });
    }
  };

  // 🔔 Solicitudes
  const openRequestsDialog = (set) => {
    const allPending = set.tokens?.flatMap((t) => t.shareTokenUsers || []) || [];
    setPendingRequests(allPending.filter((u) => !u.aprovado));
    setOpenRequests(true);
  };

  const refreshSets = async () => {
    const res = await fetch("/api/artist/my-songs");
    if (res.ok) {
      const data = await res.json();
      setMusicSets(data.musicSets || []);
    }
  };

  const handleApprove = async (reqId) => {
    const res = await fetch(`/api/sharetokenuser/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reqId }),
    });
    if (res.ok) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
      window.dispatchEvent(new Event("pendingUpdated"));
      await refreshSets(); // 🔄 vuelve a cargar los sets y sus badges
    }
  };

  const handleIgnore = async (reqId) => {
    const res = await fetch(`/api/sharetokenuser/ignore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reqId }),
    });
    if (res.ok) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
      window.dispatchEvent(new Event("pendingUpdated"));
      await refreshSets(); // 🔄 vuelve a cargar los sets y sus badges
    }
  };

  if (loading) return <Typography >{t("loading")}...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <Box sx={{padding:"2rem"}}>
        <Typography variant="h4" mb={2}>{t("sets")}</Typography>
        <Button variant="contained" onClick={() => router.push("/dashboard/artist/upload")} sx={{ mb: 2 }}>{t("loadset")}</Button>

        {musicSets.length === 0 ? (
          <Typography>{t("noset")}</Typography>
        ) : (
          musicSets.map(set => (
            <Accordion key={set.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} component="div" className="bg-gradient-to-r to-purple-700 from-purple-400 rounded-3xl">
                <Typography sx={{ flexGrow: 1 }}>{set.name}</Typography>
                <Box display="flex" gap={1}>
                  {set.pendingRequests > 0 && (
                    <IconButton onClick={() => openRequestsDialog(set)}>
                      <Badge badgeContent={set.pendingRequests} color="error">
                        <GroupIcon />
                      </Badge>
                    </IconButton>
                  )}

                  <Button
                    variant="contained"
                    onClick={() => openShareDialog(set.id, set.startsAt, set.endsAt)}
                  >
                    {t("sharebtn")}
                  </Button>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {set.songs.length === 0 ? (
                  <Typography color="text.secondary">{t("nosongs")}</Typography>
                ) : (
                  set.songs.map(song => (
                    <Box key={song.id} display="flex" alignItems="center" gap={3} p={1} border={1} borderColor="#eee" borderRadius={1} mb={1}>
    <img
      src={`/api/song-image?id=${song.id}`}
      alt={song.title}
      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
      onError={(e) => e.target.style.display = 'none'}
    />
    <Typography sx={{ flexGrow: 1 }}>{song.title}</Typography>
    <Typography sx={{ minWidth: 100 }}>
      {song.durationSec ? `${song.durationSec} seg` : ""}
    </Typography>
    <Button
      variant="contained"
      color={playingSongId === song.id ? 'error' : 'primary'}
      onClick={() => (playingSongId === song.id ? stopSong() : playSong(song.id))}
    >
      {playingSongId === song.id ?  <PauseCircleFilledIcon/> : <PlayCircleOutlineIcon/>}
    </Button>
    {song.lyrics && song.lyrics.trim() !== '' && (
      <Button variant="outlined" onClick={() => { setLyricsContent(song.lyrics); setOpenLyrics(true); }}>
        {t("lyricsbtn")}
      </Button>
    )}
  </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}

        {/* Dialog solicitudes */}
        <Dialog open={openRequests} onClose={() => setOpenRequests(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t("pendingreq")}</DialogTitle>
          <DialogContent>
            {pendingRequests.length === 0 ? (
              <Typography>{t("noreq")}</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("userlbl")}</TableCell>
                    <TableCell>{t("actionlbl")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.user?.name || req.user?.email}</TableCell>
                      <TableCell>
                        <Button color="success" variant="contained" size="small" onClick={() => handleApprove(req.id)}>{t("aceptbtn")}</Button>
                        <Button color="error" variant="outlined" size="small" onClick={() => handleIgnore(req.id)} sx={{ ml: 1 }}>{t("ignorebtn")}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequests(false)}>{t("closebtn")}</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog compartir */}
        <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="md">
          <DialogTitle>Compartir Set</DialogTitle>
          <DialogContent dividers>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
              <DatePicker 
                label={t("startdate")}
                value={shareStart ? dayjs(shareStart) : null}
                onChange={(newValue) => setShareStart(newValue ? newValue.toDate() : null)}
              />
              <DatePicker 
                label={t("enddate")}
                value={shareEnd ? dayjs(shareEnd) : null}
                onChange={(newValue) => setShareEnd(newValue)}
              />            
            </Box>
            <RadioGroup row value={shareType} onChange={(e) => setShareType(e.target.value)} sx={{ mb: 2 }}>
              {!!focusGroups.length && <FormControlLabel value="focusgroup" control={<Radio />} label="FocusGroup" />}
              <FormControlLabel value="users" control={<Radio />} label={t("reguserslbl")} />
              <FormControlLabel value="emails" control={<Radio />} label={t("emailslbl")} />
              <FormControlLabel value="enlace" control={<Radio />} label={t("onlylink")} />
            </RadioGroup>

            {shareType === 'focusgroup' && (
              <TextField select fullWidth label={t("selectfg")} value={shareFocusGroupId} onChange={(e) => setShareFocusGroupId(e.target.value)}>
                {focusGroups.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.nombre || `Pull #${g.id}`}</MenuItem>
                ))}
              </TextField>
            )}
            {shareType === 'users' && (
              <TextField select fullWidth label={t("selectusers")} SelectProps={{ multiple: true }} value={shareUserIds}
                onChange={(e) => setShareUserIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} sx={{ mt: 1 }}>
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </TextField>
            )}
            {shareType === 'emails' && (
              <TextField label={t("emailslbl")} fullWidth value={shareEmails} onChange={(e) => setShareEmails(e.target.value)} />
            )}

            {shareLinks.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle2">{t("separatedlinks")}:</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("destlbl")}</TableCell>
                      <TableCell>{t("linklbl")}</TableCell>
                      <TableCell>{t("actionlbl")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shareLinks.map((l, idx) => {
                      const fullUrl = `${window.location.origin}${l.url}`;
                      return (
                        <TableRow key={idx}>
                          <TableCell>{l.recipient || "invitado"}</TableCell>
                          <TableCell><TextField value={fullUrl} InputProps={{ readOnly: true }} fullWidth size="small" /></TableCell>
                          <TableCell><Button variant="outlined" size="small" onClick={() => navigator.clipboard.writeText(fullUrl)}>{t("copybtn")}</Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenShare(false)}>{t("closebtn")}</Button>
            <Button variant="contained" onClick={submitShare}>{t("genlinks")}</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
