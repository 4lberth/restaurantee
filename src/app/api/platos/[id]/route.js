import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* PUT ─ editar plato (nombre, precio, disponible, etc.) */
export const PUT = requireAuth(['admin'])(async (request, { params }) => {
  const data = await request.json();           // puede incluir 'disponible'
  const id = Number(params.id);

  try {
    const plato = await prisma.plato.update({ where: { id }, data });
    return NextResponse.json(plato);
  } catch {
    return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
  }
});

/* DELETE ─ eliminar plato */
export const DELETE = requireAuth(['admin'])(async (_req, { params }) => {
  const id = Number(params.id);

  try {
    await prisma.plato.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
  }
});
