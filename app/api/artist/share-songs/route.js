// pages/api/artist/share-song.js

import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { songId, shareType, focusGroupId, emails } = req.body;
  if (!songId || !shareType) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    if (shareType === 'focusGroup') {
      // Relacionar la canción con el focus group
      await prisma.focusGroup.update({
        where: { id: focusGroupId },
        data: { songId },
      });
      return res.status(200).json({ ok: true, message: 'Canción compartida con el focus group.' });
    } else if (shareType === 'emails') {
      if (!emails) return res.status(400).json({ error: 'Debes ingresar al menos un correo.' });
      const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
   
      // Obtén info de la canción
      const song = await prisma.song.findUnique({ where: { id: songId } });
      for (const to of emailList) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to,
          subject: `Te han compartido una canción en Focufy`,
          text: `Te han invitado a escuchar la canción "${song?.title || 'una canción'}" en Focufy. Ingresa a la plataforma para escucharla.`
        });
      }
      return res.status(200).json({ ok: true, message: 'Invitaciones enviadas a los correos.' });
    }
    return res.status(400).json({ error: 'Tipo de compartición no válido' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al compartir la canción', details: error.message });
  }
}
