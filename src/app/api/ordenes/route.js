import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { calcularTotal } from '@/lib/calc-total';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

/* ─── GET /api/ordenes ─── (admin • mozo • cocina) */
export const GET = requireAuth(['admin', 'mozo', 'cocina'])(async () => {
  const ordenes = await prisma.orden.findMany({
    include: { detalles: true, mesa: true, cliente: true, mozo: true }
  });
  return NextResponse.json(ordenes);
});

export const POST = requireAuth(['mozo'])(async (request) => {
  const mozoId = request.user.userId;
  const { mesaId, clienteId, cliente, items = [], notas } =
    await request.json();

  /* ── 1. Mesa libre ── */
  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
  if (!mesa || mesa.estado === 'ocupada')
    return NextResponse.json(
      { error: 'Mesa ocupada o inexistente' },
      { status: 409 },
    );

  /* ── 2. Validar items ── */
  const detalles = [];
  for (const it of items) {
    const plato = await prisma.plato.findUnique({ where: { id: it.platoId } });
    if (!plato)
      return NextResponse.json(
        { error: `Plato ${it.platoId} no existe` },
        { status: 404 },
      );
    if (!plato.disponible)
      return NextResponse.json(
        { error: `El plato "${plato.nombre}" no está disponible` },
        { status: 409 },
      );
    detalles.push({
      platoId: plato.id,
      cantidad: it.cantidad,
      subtotal: plato.precio * it.cantidad,
    });
  }
  const total = calcularTotal(detalles);

  /* ── 3. Conectar o crear cliente ── */
  let clienteRel = undefined;

  if (clienteId) {
    clienteRel = { connect: { id: clienteId } };
  } else if (cliente?.dni) {
    clienteRel = {
      connectOrCreate: {
        where:  { dni: cliente.dni },
        create: {
          nombre:   cliente.nombre,
          dni:      cliente.dni,
          telefono: cliente.telefono,
        },
      },
    };
  }

  /* ── 4. Crear orden ── */
  const orden = await prisma.orden.create({
    data: {
      total,
      notas,
      mozo:  { connect: { id: mozoId } },
      mesa:  { connect: { id: mesaId } },
      ...(clienteRel && { cliente: clienteRel }),
      detalles: { createMany: { data: detalles } },
    },
    include: { mesa: true, cliente: true, detalles: true, mozo: true },
  });

  /* ── 5. Ocupa la mesa ── */
  await prisma.mesa.update({
    where: { id: mesaId },
    data:  { estado: 'ocupada' },
  });

  // 🆕 Registrar actividades
  await registrarActividad(
    'orden_creada',
    `Nueva orden #${orden.id} - Mesa ${orden.mesa.numero} (S/${orden.total})`,
    request.user?.userId
  );

  await registrarActividad(
    'mesa_ocupada',
    `Mesa ${orden.mesa.numero} ocupada por orden #${orden.id}`,
    request.user?.userId
  );

  return NextResponse.json(orden, { status: 201 });
});