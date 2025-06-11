import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT /api/platos/:id  ──────── (admin)
export const PUT = requireAuth(['admin'])(async (request, { params }) => {
  const body = await request.json();          // { nombre, descripcion, precio }
  const id = Number(params.id);

  try {
    const plato = await prisma.plato.update({
      where: { id },
      data:  body,
    });

    return NextResponse.json(plato);          // 200 OK
  } catch (err) {
    return NextResponse.json(
      { error: 'Plato no encontrado' },
      { status: 404 }
    );
  }
});

// DELETE /api/platos/:id  ───── (admin)
export const DELETE = requireAuth(['admin'])(async (_request, { params }) => {
  const id = Number(params.id);

  try {
    await prisma.plato.delete({ where: { id } });
    return NextResponse.json({ ok: true });   // 200 OK
  } catch {
    return NextResponse.json(
      { error: 'Plato no encontrado' },
      { status: 404 }
    );
  }
});
