import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET  /api/mesas   (admin • mozo)
export const GET = requireAuth(['admin', 'mozo'])(async () => {
  const mesas = await prisma.mesa.findMany();
  return NextResponse.json(mesas);
});

// POST /api/mesas   (solo admin)
export const POST = requireAuth(['admin'])(async (request) => {
  const { numero } = await request.json();
  const nueva = await prisma.mesa.create({ data: { numero } });
  return NextResponse.json(nueva, { status: 201 });
});
