import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT (editar)  — admin
export const PUT = requireAuth(['admin'])(async (req, { params }) => {
  const { nombre } = await req.json();
  const cat = await prisma.categoria.update({
    where: { id: +params.id },
    data: { nombre },
  });
  return NextResponse.json(cat);
});

// DELETE  — admin
export const DELETE = requireAuth(['admin'])(async (_req, { params }) => {
  await prisma.categoria.delete({ where: { id: +params.id } });
  return NextResponse.json({ ok: true });
});
