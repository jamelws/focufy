import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const musicSets = await prisma.musicSet.findMany({
      // Nueva regla: solo traer MusicSets que tengan
      // al menos un token en su lista de tokens.
      where: {
        tokens: {
          some: {}, // 'some' con un objeto vacío significa "al menos uno".
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(musicSets);
  } catch (error) {
    console.error("API Error (List):", error);
    return NextResponse.json({ error: 'Failed to fetch music sets' }, { status: 500 });
  }
}