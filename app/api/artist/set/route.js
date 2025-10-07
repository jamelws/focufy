import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    const set = await prisma.musicSet.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        songs: {
          select: { id: true, title: true, extension: true },
        },
      },
    });
    if (!set) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(set);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
