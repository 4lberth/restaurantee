import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/clientes/:id     (admin • mozo) – uno solo
export const GET = requireAuth(['admin', 'mozo'])(async (_req, { params }) => {
  const cliente = await prisma.cliente.findUnique({ where: { id: +params.id } });
  if (!cliente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(cliente);
});

// PUT /api/clientes/:id     (solo admin) – editar
export const PUT = requireAuth(['admin'])(async (request, { params }) => {
  const data = await request.json();
  try {
    const upd = await prisma.cliente.update({
      where: { id: Number(params.id) },
      data,
    });
    return NextResponse.json(upd);
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
});

// DELETE /api/clientes/:id  (solo admin) – eliminar
export const DELETE = requireAuth(['admin'])(async (_req, { params }) => {
  try {
    await prisma.cliente.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
});
