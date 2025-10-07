import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// GET uno
export async function GET(req, { params }) {
  try {
    const { id } = await params; // Next 15 → params es Promise
    const focus = await prisma.pull.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        nombre: true,
        createdAt: true,
        PullUsers: {
          select: {
            id: true,
            correo: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { id: "asc" }
        }
      }
    });

    if (!focus) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(focus);
  } catch (e) {
    console.error("Error en GET [id]:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // 👈 desempaquetar params
    const { nombre, userIds = [], emails = "" } = await req.json();

    const fg = await prisma.pull.update({
      where: { id: Number(id) }, // 👈 convertir a Int
      data: {
        nombre,
        PullUsers: {
          deleteMany: {}, // elimina relaciones previas
          create: [
            // usuarios por ID
            ...userIds.map((uid) => ({ userId: uid })),
            // emails sueltos
            ...emails
              .split(",")
              .map((correo) => correo.trim())
              .filter(Boolean)
              .map((correo) => ({ correo })),
          ],
        },
      },
      include: {
        PullUsers: { include: { user: true } },
      },
    });

    return NextResponse.json(fg);
  } catch (e) {
    console.error("Error PUT focusgroup:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await prisma.pull.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error DELETE focusgroup:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
