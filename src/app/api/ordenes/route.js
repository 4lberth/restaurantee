import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { calcularTotal } from '@/lib/calc-total';
import { NextResponse } from 'next/server';

/* ─── GET /api/ordenes ─── (admin • mozo • cocina) */
export const GET = requireAuth(['admin', 'mozo', 'cocina'])(async () => {
  const ordenes = await prisma.orden.findMany({
    include: { detalles: true, mesa: true, cliente: true, mozo: true }
  });
  return NextResponse.json(ordenes);
});

/* ─── POST /api/ordenes ─── (solo mozo) */
export const POST = requireAuth(['mozo'])(async (request) => {
  const mozoId = request.user.userId;               // ← puesto por middleware
  const { mesaId, clienteId, items, notas } = await request.json();

  if (!items?.length)
    return NextResponse.json({ error: 'items vacío' }, { status: 400 });

  /* 1. Verificar que la mesa exista y esté libre */
  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
  if (!mesa || mesa.estado === 'ocupada')
    return NextResponse.json({ error: 'Mesa ocupada o inexistente' }, { status: 409 });

  /* 2. Construir detalles con verificación de platos */
  const detalles = [];
  for (const it of items) {
    const plato = await prisma.plato.findUnique({ where: { id: it.platoId } });
    if (!plato)
      return NextResponse.json(
        { error: `Plato ${it.platoId} no existe` },
        { status: 404 }
      );
    detalles.push({
      platoId: it.platoId,
      cantidad: it.cantidad,
      subtotal: plato.precio * it.cantidad
    });
  }

  const total = calcularTotal(detalles);

  /* 3. Crear la orden */
  const orden = await prisma.orden.create({
    data: {
      total,
      notas,
      mozo:    { connect: { id: mozoId } },
      mesa:    { connect: { id: mesaId } },
      cliente: { connect: { id: clienteId } },
      detalles: { createMany: { data: detalles } }
    },
    include: { detalles: true, mozo: true, mesa: true, cliente: true }
  });

  /* 4. Cambiar mesa a ocupada */
  await prisma.mesa.update({ where: { id: mesaId }, data: { estado: 'ocupada' } });

  return NextResponse.json(orden, { status: 201 });
});
