'use client';
import React from 'react';
import { BsFillStarFill } from 'react-icons/bs';
import { Box, IconButton } from '@mui/material';

export default function RankingCard({
  valorRespuesta,
  handleRespuestaChange
}) {
  return (
    <Box display="flex" justifyContent="center" gap={1}>
      {[1, 2, 3, 4, 5].map((num) => {
        const current = parseInt(valorRespuesta, 10);
        const isSelected = current >= num;

        return (
          <IconButton
            key={num}
            aria-label={`Calificar ${num} estrella${num > 1 ? 's' : ''}`}
            onClick={(e) => {
              handleRespuestaChange(num, e);
            }}
            sx={{
              p: 0.5,
              fontSize: '1.8rem',
              color: isSelected ? '#f4a261' : '#ccc',
              '&:hover': { color: '#f4a261' },
              transition: 'transform 0.2s ease',
              transform: isSelected && current === num ? 'scale(1.1)' : 'scale(1.0)',
            }}
          >
            <BsFillStarFill />
          </IconButton>
        );
      })}
    </Box>
  );
}