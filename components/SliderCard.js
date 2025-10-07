'use client';
import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { getLocalizedOption } from "@/utils/getLocalized";
export default function SliderCard({
  opciones,
  valorRespuesta,
  handleRespuestaChange,
  i18n
}) {
  
  return (
    <Box position="relative" sx={{ width: '100%', height: 60, px: 1 }}>
      <Slider
        value={valorRespuesta || 0}
        min={0}
        max={opciones.length - 1}
        step={1}
        onChange={(e, value) => handleRespuestaChange(value)}
        onChangeCommitted={(e) => handleRespuestaChange(valorRespuesta, e)} // Dispara confeti al soltar
        sx={{ position: 'relative', zIndex: 2, width: '80%', marginLeft: '10%' }}
      />

      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        display="flex"
        justifyContent="space-between"
        px={0.5}
        sx={{ pointerEvents: 'none', zIndex: 1, textAlign: 'left !important' }}
      >
        {opciones.map((op) => (
          <Typography
            key={op.label}
            variant="caption"
            align="center"
            sx={{ width: `${100 / opciones.length}%` }}
          >
            {getLocalizedOption(op, i18n.language)}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}