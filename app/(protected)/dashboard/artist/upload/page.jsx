"use client";
import React, { useState,useEffect  } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, Stepper, Step, StepLabel, Paper, Grid, TextField, IconButton, InputAdornment, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import { getLocalizedField } from "@/utils/getLocalized";

function getAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration));
    };
    audio.src = URL.createObjectURL(file);
  });
}

export default function UploadSongWizard() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [songs, setSongs] = useState([]);
  const [setImage, setSetImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [questions, setQuestions] = useState([]); // catálogo
  const [globalQuestions, setGlobalQuestions] = useState([]); // ids
  const [songQuestions, setSongQuestions] = useState({}); // { idx: [ids] }
  const [useGlobalQuestions, setUseGlobalQuestions] = useState(true);
  const [musicSetName, setMusicSetName] = useState("");
  const { t, i18n } = useTranslation();
  const steps = [
    t("step1"),
    t("step2"),
    t("step3"),
    t("step4"),
    t("step5"),
    t("step6"),
  ];
  const theme = useTheme();
  useEffect(() => { setMounted(true); }, []);
  // Cargar preguntas del catálogo al montar
  useEffect(() => {
    console.log('[useEffect] activo => step:', activeStep);
    if (activeStep === 3) {
      (async () => {
        try {
          const r = await fetch('/api/questions');
          const data = await r.json();
          setQuestions(data);
        } catch (e) {
          console.error('Error cargando preguntas:', e);
        }
      })();
    }
  }, [activeStep]);

  // Paso 1: Drag & Drop
  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    const newSongs = await Promise.all(files.map(async (file) => ({
      archivo: file,
      nombre: file.name.replace(/\.[^/.]+$/, ''),
      extension: file.name.split('.').pop(),
      duracion: await getAudioDuration(file),
      tipo: 'evaluacion',
      letra: '',
      letraFile: null,
      imagen: null,
    })));
    setSongs(prev => [...prev, ...newSongs]);
  };
  const handleDragOver = (e) => e.preventDefault();

  // Paso 2: Ordenar, tipo
  const handleSongTypeChange = (idx, value) => {
    const updated = [...songs];
    updated[idx].tipo = value;
    // Si cambia a comparación, inicializa el campo comparisonWith
    if (value === 'comparacion' && !updated[idx].comparisonWith) {
      updated[idx].comparisonWith = '';
    }
    if (value !== 'comparacion') {
      delete updated[idx].comparisonWith;
    }
    setSongs(updated);
  };
  const moveSong = (from, to) => {
    if (to < 0 || to >= songs.length) return;
    const updated = [...songs];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSongs(updated);
  };

  // Paso 3: Letra opcional
  const handleLyricsFile = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updated = [...songs];
      updated[idx].letra = ev.target.result;
      updated[idx].letraFile = file;
      setSongs(updated);
    };
    reader.readAsText(file);
  };

  // Paso 4: Imagen
  const handleSongImage = (idx, e) => {
    const file = e.target.files[0];
    const updated = [...songs];
    updated[idx].imagen = file;
    setSongs(updated);
  };
  const handleSetImage = (e) => {
    setSetImage(e.target.files[0]);
  };

  // Paso 5: Guardar
  const handleSave = async () => {
    if (!songs.length) {
      setSnackbar({
        open: true,
        message: t("songreq"),
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("musicSetName", musicSetName || t("noname"));

    songs.forEach((song, i) => {
      formData.append("title", song.nombre);
      formData.append("lyrics", song.letra || "");
      formData.append("duration", song.duracion);
      formData.append("extension", song.extension);
      formData.append("audio", song.archivo);

      if (song.imagen) {
        formData.append(`image_${i}`, song.imagen);
      } else if (setImage) {
        formData.append(`image_${i}`, setImage);
      }
      
      // Determina qué preguntas usar
      const questionsToAppend = useGlobalQuestions
        ? globalQuestions
        : songQuestions[i] || [];

      // Adjunta las preguntas como una cadena separada por comas para cada canción
      formData.append("questions", questionsToAppend.join(','));
    });

    try {
      const res = await fetch("/api/artist/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setActiveStep(0);
        setSongs([]);
        setSetImage(null);
        setMusicSetName("");
      } else {
        setSnackbar({
          open: true,
          message: data.error || t("saveerror"),
          severity: "error",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: t("neterror"),
        severity: "error",
      });
    }
  };




  // Wizard navigation
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  return (
    
    <Box maxWidth={700} mx="auto" mt={5} sx={{
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}
    >
      {mounted && (
        <>
      <Typography variant="h4" gutterBottom>{t("uploadtitle")}</Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label={t("setname")}
          variant="outlined"
          fullWidth
          value={musicSetName}
          onChange={(e) => setMusicSetName(e.target.value)}
        />
      </Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, flexShrink: 0}}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      <Paper sx={{ p: 3,  flexGrow: 1, overflow: 'auto', mb: 2 }} className='pequeno'>
        {activeStep === 0 && (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('audio-upload').click()}
            sx={{
              border: '2px dashed #6607a8',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
              color: '#6607a8',
              cursor: 'pointer',
              transition: 'background 0.2s',
              '&:hover': { background: '#f3eaff' },
            }}
          >
            <Typography variant="h6" sx={{ color: '#6607a8' }}>{t("dropfile")}</Typography>
            <Typography variant="body2">{t("dropfiledesc")}</Typography>
            <input
              type="file"
              accept="audio/*"
              multiple
              style={{ display: 'none' }}
              id="audio-upload"
              onChange={async (e) => {
                const files = Array.from(e.target.files).filter(f => f.type.startsWith('audio/'));
                const newSongs = await Promise.all(files.map(async (file) => ({
                  archivo: file,
                  nombre: file.name.replace(/\.[^/.]+$/, ''),
                  extension: file.name.split('.').pop(),
                  duracion: await getAudioDuration(file),
                  tipo: 'evaluacion',
                  letra: '',
                  letraFile: null,
                  imagen: null,
                })));
                setSongs(prev => [...prev, ...newSongs]);
                // Limpiar el input para permitir volver a subir los mismos archivos si se desea
                e.target.value = '';
              }}
              tabIndex={-1}
            />
            {songs.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" sx={{ color: '#6607a8', fontWeight: 'bold' }}>
                  {songs.length} {songs.length > 1 ? t("loadedsongs") : t("loadedsong")}:
                </Typography>
                <ul style={{ listStyle: 'none', padding: 0, color: '#6607a8', fontWeight: 500 }}>
                  {[...songs].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((song, idx) => (
                    <li key={idx}>{idx + 1}. {song.nombre}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            {songs.length === 0 ? <Typography>{t("nosongs")}</Typography> : (
              [...songs].map((song, idx) => {
                const realIdx = songs.findIndex(s => s === song);
                return (
                  <Paper key={realIdx} sx={{ mb: 2, p: 2, position: 'relative', borderColor: '#6607a8' }} className="accent-purple">
                    <Grid container spacing={2} alignItems="stretch">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label={t("setname")}
                          value={song.nombre}
                          onChange={(e) => {
                            const updated = [...songs];
                            updated[realIdx].nombre = e.target.value;
                            setSongs(updated);
                          }}
                          size="small"
                          sx={{
                            mb: 1,
                            '& .MuiInputBase-root': { borderColor: '#6607a8' },
                            '& .MuiInputLabel-root': { color: '#6607a8' },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">{t("durationlbl")}: {song.duracion || '...'} seg | {t("extensionlbl")}: {song.extension}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label={t("type")}
                          value={song.tipo}
                          onChange={e => handleSongTypeChange(realIdx, e.target.value)}
                          
                          sx={{ mb: 1,'& .MuiInputBase-root': { borderColor: '#6607a8' } }}
                          
                        >
                          <MenuItem value="evaluacion">{t("evaltype")}</MenuItem>
                          <MenuItem value="comparacion">{t("comptype")}</MenuItem>
                        </TextField>
                        {song.tipo === 'comparacion' && (
                          <TextField
                            select
                            label="Comparar con"
                            value={song.comparisonWith || ''}
                            onChange={e => {
                              const updated = [...songs];
                              updated[realIdx].comparisonWith = e.target.value;
                              setSongs(updated);
                            }}
                            
                            sx={{ mt: 1, '& .MuiInputBase-root': { borderColor: '#6607a8' } }}
                          >
                            {songs.filter((_, i) => i !== realIdx).map((s, i2) => (
                              <MenuItem value={s.nombre} key={i2}>{s.nombre}</MenuItem>
                            ))}
                          </TextField>
                        )}
                      </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'block',float:'right', position: 'relative', alignItems: 'flex-end', justifyContent: 'flex-end', height: '100%' }}>
                      <Box>
                        <Button onClick={() => moveSong(realIdx, realIdx - 1)} disabled={realIdx === 0} sx={{ color: '#6607a8', minWidth: 0, mr: 1 }}>↑</Button>
                        <Button onClick={() => moveSong(realIdx, realIdx + 1)} disabled={realIdx === songs.length - 1} sx={{ color: '#6607a8', minWidth: 0, mr: 1 }}>↓</Button>
                        <IconButton onClick={() => setSongs(songs.filter((_, i) => i !== realIdx))} sx={{ color: '#6607a8' }}><DeleteIcon /></IconButton>
                      </Box>
                    </Grid>
                    </Grid>
                  </Paper>
                );
              })
            )}
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            {[...songs].map((song, idx) => {
              const realIdx = songs.findIndex(s => s === song);
              return (
                <Paper key={realIdx} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1">{song.nombre}</Typography>
                  <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    {t("loadlyricbtn")} (.txt)
                    <input type="file" accept=".txt" hidden onChange={e => handleLyricsFile(realIdx, e)} />
                  </Button>
                  {song.letra && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{song.letra.slice(0, 200)}{song.letra.length > 200 ? '...' : ''}</Typography>}
                </Paper>
              );
            })}
          </Box>
        )}
        {activeStep === 3 && (
          <Box>
           
            <Box mb={2}>
              <Button
                variant={useGlobalQuestions ? 'contained' : 'outlined'}
                sx={{ mr: 2 }}
                onClick={() => setUseGlobalQuestions(true)}
                style={{marginBottom: '10px'}}
              >
                {t("questionforall")}
              </Button>
              <Button
                variant={!useGlobalQuestions ? 'contained' : 'outlined'}
                onClick={() => setUseGlobalQuestions(false)}
              >
                {t("questionforsong")}
              </Button>
               <br/>
            </Box>
            {useGlobalQuestions ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>{t("questionval")}:</Typography>
                <Box mb={2}>
                  <Button
                    variant="outlined"
                    sx={{ mr: 1 }}
                    onClick={() => setGlobalQuestions(questions.map(q => q.id))}
                  >
                    {t("all")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setGlobalQuestions([])}
                  >
                    {t("none")}
                  </Button>
                </Box>
                {questions.map(q => (
                  <Box key={q.id} display="flex" alignItems="center" mb={1}>
                    <input
                      type="checkbox"
                      checked={globalQuestions.includes(q.id)}
                      onChange={e => {
                        setGlobalQuestions(prev => e.target.checked ? [...prev, q.id] : prev.filter(id => id !== q.id));
                      }}
                    />
                    <Typography sx={{ ml: 1 }}>{getLocalizedField(q, i18n.language)} <span style={{ color: '#888', fontSize: 12 }}>({q.type})</span></Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>{t("questionvalsong")}:</Typography>
                {songs.map((song, idx) => (
                  <Box key={idx} mb={2}>
                    <Typography variant="subtitle2">{song.nombre}</Typography>
                    <Box mb={1}>
                      <Button
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => setSongQuestions(prev => ({
                          ...prev,
                          [idx]: questions.map(q => q.id)
                        }))}
                      >
                        {t("all")}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setSongQuestions(prev => ({
                          ...prev,
                          [idx]: []
                        }))}
                      >
                        {t("none")}
                      </Button>
                    </Box>
                    {questions.map(q => (
                      <Box key={q.id} display="flex" alignItems="center" mb={1}>
                        <input
                          type="checkbox"
                          checked={songQuestions[idx]?.includes(q.id) || false}
                          onChange={e => {
                            setSongQuestions(prev => {
                              const arr = prev[idx] || [];
                              return {
                                ...prev,
                                [idx]: e.target.checked ? [...arr, q.id] : arr.filter(id => id !== q.id)
                              };
                            });
                          }}
                        />
                        <Typography sx={{ ml: 1 }} className='pequeno'>
                          {getLocalizedField(q, i18n.language)}
                          <span style={{ color: '#888', fontSize: 12 }}>({q.type})</span>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        {activeStep === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>{t("imagesforset")}:</Typography>
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              {t("loadforset")}
              <input type="file" accept="image/*" hidden onChange={handleSetImage} />
            </Button>
            {setImage && (
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <img
                  src={URL.createObjectURL(setImage)}
                  alt="Set"
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                />
                <Typography variant="body2">Imagen set: {setImage.name}</Typography>
              </Box>
            )}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>{t("imagesforsong")}:</Typography>
            {[...songs].map((song, idx) => {
              const realIdx = songs.findIndex(s => s === song);
              return (
                <Paper key={realIdx} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle2">{song.nombre}</Typography>
                  <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    {t("loadforsong")}
                    <input type="file" accept="image/*" hidden onChange={e => handleSongImage(realIdx, e)} />
                  </Button>
                  {song.imagen && (
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <img
                        src={URL.createObjectURL(song.imagen)}
                        alt={song.imagen.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                      <Typography variant="body2">{t("imagelbl")}: {song.imagen.name}</Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
        {activeStep === 5 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t("finalreview")}</Typography>
            {[...songs].map((song, idx) => {
              const numPregs = useGlobalQuestions ? globalQuestions.length : (songQuestions[idx]?.length || 0);
              return (
                <Grid key={idx} container spacing={0} sx={{borderBottomWidth:1,borderBottomColor:"#6607a8",borderBottomStyle:"solid",marginBottom:2}}>
                 {/* <Paper } sx={{ mb: 2, p: 2 }}> */}
                  {(song.imagen || setImage) ? (
                    <Grid size={2}>
                      <img
                        src={song.imagen ? URL.createObjectURL(song.imagen) : URL.createObjectURL(setImage)}
                        alt={song.imagen ? song.imagen.name : setImage.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                      
                    </Grid>
                  ) : (
                    <Typography variant="body2">{t("noimage")}</Typography>
                  )}
                
                  <Grid size={7}>
                  <Typography variant="subtitle1" sx={{color:"#c205a2ff"}}>{song.nombre}</Typography>
                  </Grid>
                  <Grid size={3}>
                  <Typography variant="caption" sx={{color:"#6607a8"}}>{t("durationlbl")}:</Typography> <Typography variant="caption">{song.duracion} seg</Typography><br/>
                  <Typography variant="caption" sx={{color:"#6607a8"}}>{t("typelbl")}:</Typography> <Typography variant="caption">{song.tipo}</Typography><br/>
                  <Typography variant="caption" sx={{color:"#6607a8"}}>{t("lyricbtn")}:</Typography> <Typography variant="caption">{song.letra ? 'Sí' : 'No'}</Typography><br/>
                  <Typography variant="caption" sx={{color:"#6607a8"}}>{t("asignedquestions")}:</Typography> <Typography variant="caption">{numPregs}</Typography>
                  </Grid>
                </Grid>
              );
            })}
            <Button variant="contained" color="primary" onClick={handleSave}>{t("savebtn")}</Button>
          </Box>
        )}
      </Paper>
      <Box display="flex" justifyContent="space-between" mt={3} flexShrink={0}>
        <Button disabled={activeStep === 0} onClick={handleBack}>{t("prevbtn")}</Button>
        <Button
          disabled={activeStep === steps.length - 1 || (activeStep === 0 && songs.length === 0)}
          onClick={handleNext}
        >
          {t("nextbtn")}
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </>)}
    </Box>
  );
}