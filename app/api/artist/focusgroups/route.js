import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// GET: todos los focus groups del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const groups = await prisma.pull.findMany({
      where: { userId: session.user.id },
      include: {
        PullUsers: { include: { user: true } },
        _count: { select: { PullUsers: true, ShareTokens: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(groups);
  } catch (e) {
    console.error("Error GET focusgroups:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: crear focus group
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { nombre, userIds = [], emails = "" } = await req.json();

    const fg = await prisma.pull.create({
      data: {
        nombre,
        userId: session.user.id,
        PullUsers: {
          create: [
            ...userIds.map((id) => ({ userId: id })),
            ...emails
              .split(",")
              .map((correo) => correo.trim())
              .filter(Boolean)
              .map((correo) => ({ correo })),
          ],
        },
      },
      include: { PullUsers: true },
    });

    return NextResponse.json(fg);
  } catch (e) {
    console.error("Error POST focusgroups:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
