'use client';
import React from 'react';
import { Switch, FormControlLabel, Box } from '@mui/material';
import { getLocalizedOption } from "@/utils/getLocalized";

export default function RadioCard({
  opciones,
  valorRespuesta,
  handleRespuestaChange,
  i18n
}) {
  return (
    <Box display="flex" flexDirection="row" gap={opciones.lenght}>
      {opciones.map(op => (
        <FormControlLabel
          key={op.id}
          control={
            <Switch
              checked={valorRespuesta === op.label}
              onClick={(e) => {
                const newValue = valorRespuesta === op.label ? null : op.label;
                handleRespuestaChange(newValue, e);
              }}
            />
          }
          label={getLocalizedOption(op, i18n.language)}
        />
      ))}
    </Box>
  );
}