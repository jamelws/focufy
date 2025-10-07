import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // 🔹 Obtener sesión
    const session = await auth();
    const users = session.user;
    if (!users) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // Usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: users.id },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
    }

    const me = await prisma.user.findFirst({
      where: { id: user.id },
      select: { id: true }
    });
    if (!me) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 400 });
    }

    const { musicSetId, startAt, endAt, target, focusGroupId, userIds, emails } = await req.json();

    // 🔹 Validar fecha de fin
    const expiresAt = endAt && !isNaN(new Date(`${endAt}T23:59:59`).getTime())
      ? new Date(`${endAt}T23:59:59`)
      : null;

    // 🔹 Actualizar fechas de validez en MusicSet
    await prisma.musicSet.update({
      where: { id: musicSetId },
      data: {
        startsAt: startAt ? new Date(startAt) : null,
        endsAt: expiresAt,
      }
    });

    const links = [];

    // 🔹 Compartir a un FocusGroup
    if (target === 'focusgroup' && focusGroupId) {
      const members = await prisma.pullUsers.findMany({
        where: { pullId: parseInt(focusGroupId) },
        select: { userId: true, correo: true }
      });

      for (const m of members) {
        const token = crypto.randomUUID();
        const newToken = await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            pullId: focusGroupId,
            expiresAt,
            active: true
          }
        });

        await prisma.shareTokenUser.create({
          data: {
            shareTokenId: newToken.id,
            userId: me.id,
            aprovado: true
          }
        });

        links.push({ recipient: m.correo || m.userId, url: `/dashboard/listener/evaluate/${token}` });
      }
    }

    // 🔹 Compartir a usuarios registrados
    if (target === 'users' && Array.isArray(userIds)) {
      for (const uid of userIds) {
        const token = crypto.randomUUID();
        const newToken = await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            expiresAt,
            active: true
          }
        });

        await prisma.shareTokenUser.create({
          data: {
            shareTokenId: newToken.id,
            userId: me.id,
            aprovado: true
          }
        });

        links.push({ recipient: uid, url: `/dashboard/listener/evaluate/${token}` });
      }
    }

    // 🔹 Compartir por correos
    if (target === 'emails' && emails) {
      const list = emails.split(',').map(e => e.trim()).filter(Boolean);
      for (const email of list) {
        const token = crypto.randomUUID();
        await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            expiresAt,
            active: true
          }
        });
        links.push({ recipient: email, url: `/dashboard/listener/evaluate/${token}` });
      }
    }

    // 🔹 Compartir por enlace público
    if (target === 'enlace') {
      const token = crypto.randomUUID();
      await prisma.shareToken.create({
        data: {
          token,
          ownerId: me.id,
          musicSetId,
          expiresAt,
          active: true,
        }
      });
      links.push({ recipient: 'public', url: `/dashboard/listener/evaluate/${token}` });
    }

    return new Response(JSON.stringify({ message: 'Set compartido con éxito', links }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al compartir el set' }), { status: 500 });
  }
}
