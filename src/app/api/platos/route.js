import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* -------- GET: categorías + platos -------- */
export const GET = async () => {
  const cats = await prisma.categoria.findMany({
    include: { platos: true },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(cats);
};

/* -------- POST: crear plato (solo admin) -------- */
export const POST = requireAuth(['admin'])(async (request) => {
  const { nombre, descripcion, precio, categoriaId } = await request.json();

  /* Validaciones y casting de tipos */
  const catId = categoriaId !== null && categoriaId !== undefined
    ? Number(categoriaId)
    : null;
  if (categoriaId && isNaN(catId))
    return NextResponse.json(
      { error: 'categoriaId debe ser un entero' },
      { status: 400 }
    );

  const precioFloat = Number(precio);
  if (isNaN(precioFloat) || precioFloat < 0)
    return NextResponse.json(
      { error: 'precio debe ser un número positivo' },
      { status: 400 }
    );

  try {
    const nuevo = await prisma.plato.create({
      data: { nombre, descripcion, precio: precioFloat, categoriaId: catId },
    });
    return NextResponse.json(nuevo, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo crear el plato' },
      { status: 500 }
    );
  }
});
