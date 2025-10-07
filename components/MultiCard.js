// Archivo: MultiCard.js

'use client';
import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { getLocalizedOption } from "@/utils/getLocalized";

export default function MultiCard({
  opciones,
  valorRespuesta,
  handleRespuestaChange,
  i18n
}) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
      {opciones.map((op) => {
        
        // Asegura que valorRespuesta sea siempre un array
        const currentSelection = Array.isArray(valorRespuesta) ? valorRespuesta : [];
        const isSelected = currentSelection.includes(op.label);

        return (
          <Card
            key={op.id}
            onClick={(e) => {
              // Lógica para agregar o quitar el elemento del array
              const newValue = isSelected
                ? currentSelection.filter(t => t !== op.label)
                : [...currentSelection, op.label];
              
              // Llama a la función del padre de la manera correcta y simplificada
              handleRespuestaChange(newValue, e);
            }}
            sx={{
              width: '8rem',
              cursor: 'pointer',
              border: isSelected ? '2px solid #ff00ff' : '1px solid #444',
              transition: 'all 0.2s',
              p: 2,
              textAlign: 'center',
              backgroundColor: isSelected ? 'rgba(255,0,255,0.1)' : 'inherit',
              '&:hover': {
                borderColor: '#ff00ff',
                boxShadow: '0 0 10px rgba(255,0,255,0.5)'
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}
            >
              {getLocalizedOption(op, i18n.language)}
            </Typography>
          </Card>
        );
      })}
    </Box>
  );
}