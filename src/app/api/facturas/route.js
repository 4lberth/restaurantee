import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// ─────── GET /api/facturas  (solo admin) ───────
export const GET = requireAuth(['admin'])(async () => {
  const facturas = await prisma.factura.findMany({
    include: {
      cliente: true,
      orden: { include: { detalles: true, mesa: true } }
    }
  });
  return NextResponse.json(facturas);
});

// ─────── POST /api/facturas  (mozo • admin) ───────
export const POST = requireAuth(['mozo', 'admin'])(async (request) => {
  const {
    ordenId,
    descuento      = 0,
    tipoDescuento  = 'porcentaje',   // 'porcentaje' | 'monto'
    propina        = 0
  } = await request.json();

  /* ───── VALIDACIONES BÁSICAS ───── */
  if (descuento < 0 || propina < 0)
    return NextResponse.json({ error: 'Valores negativos no permitidos' }, { status: 422 });

  if (!['porcentaje', 'monto'].includes(tipoDescuento))
    return NextResponse.json({ error: 'tipoDescuento inválido' }, { status: 400 });

  if (tipoDescuento === 'porcentaje' && descuento > 100)
    return NextResponse.json({ error: 'Porcentaje > 100' }, { status: 400 });

  /* 1. Verificar orden */
  const orden = await prisma.orden.findUnique({
    where: { id: ordenId },
    include: { cliente: true }
  });
  if (!orden)
    return NextResponse.json({ error: 'Orden no existe' }, { status: 404 });

  /* 1.a No facturar si la orden está cancelada */
  if (orden.estado === 'cancelada')
    return NextResponse.json(
      { error: 'No se puede facturar una orden cancelada' },
      { status: 409 }
    );

  /* 2. Evitar factura duplicada */
  if (await prisma.factura.findUnique({ where: { ordenId } }))
    return NextResponse.json({ error: 'La orden ya tiene factura' }, { status: 409 });

  /* 3. Calcular montos */
  const subtotal = orden.total;
  const valorDescuento =
    tipoDescuento === 'porcentaje'
      ? subtotal * (descuento / 100)
      : descuento;

  const totalFinal = subtotal - valorDescuento + propina;

  /* 4. Crear factura */
  const factura = await prisma.factura.create({
    data: {
      ordenId,
      clienteId: orden.clienteId,
      subtotal,
      descuento,
      tipoDescuento,
      propina,
      totalFinal
    },
    include: { cliente: true, orden: true }
  });

  return NextResponse.json(factura, { status: 201 });
});
