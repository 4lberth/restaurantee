// src/app/api/platos/route.js
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const cats = await prisma.categoria.findMany({
    include: { platos: true },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(cats);
};


export const POST = requireAuth(['admin'])(async (request) => {
  const { nombre, descripcion, precio, categoriaId } = await request.json();
  const nuevo = await prisma.plato.create({
    data: { nombre, descripcion, precio, categoriaId },
  });
  return NextResponse.json(nuevo, { status: 201 });
});
