'use client';
import React from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { getLocalizedOption } from "@/utils/getLocalized";

export default function CheckboxCard({
  opciones,
  valorRespuesta,
  handleRespuestaChange,
  i18n
}) {
  
  return (
    <Box display="flex" justifyContent="center">
      <FormGroup
        row
        sx={{
          gap: 2, // espacio horizontal uniforme
          flexWrap: 'nowrap', // evita salto de línea
        }}
      >
        {opciones.map(op => {
          const labelText=getLocalizedOption(op, i18n.language);
          // Asegúrate de que valorRespuesta sea siempre un array para evitar errores
          const currentSelection = Array.isArray(valorRespuesta) ? valorRespuesta : [];
          const checked = currentSelection.includes(labelText);

          return (
            <FormControlLabel
              key={op.id}
              control={
                <Checkbox
                  checked={checked}
                  onClick={(e) => {
                    const isChecked = !checked;
                    const newValue = isChecked
                      ? [...currentSelection, labelText]
                      : currentSelection.filter((t) => t !== labelText);

                    handleRespuestaChange(newValue, e); // ahora e tiene clientX/clientY
                  }}
                  color="primary"
                  size="medium"
                />

              }
              label={labelText}
            />
          );
        })}
      </FormGroup>
    </Box>
  );
}