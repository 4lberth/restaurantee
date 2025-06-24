import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { registrarActividad } from '@/lib/actividad';

// ─────── GET /api/facturas  (mozo • admin) ───────
export const GET = requireAuth(['mozo', 'admin'])(async () => {
  const facturas = await prisma.factura.findMany({
    include: {
      cliente: true,
      orden: { include: { detalles: true, mesa: true } }
    },
    orderBy: { creadoEn: 'desc' }
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
  if (!ordenId)
    return NextResponse.json({ error: 'ordenId es requerido' }, { status: 400 });

  if (descuento < 0 || propina < 0)
    return NextResponse.json({ error: 'Valores negativos no permitidos' }, { status: 422 });

  if (!['porcentaje', 'monto'].includes(tipoDescuento))
    return NextResponse.json({ error: 'tipoDescuento inválido' }, { status: 400 });

  if (tipoDescuento === 'porcentaje' && descuento > 100)
    return NextResponse.json({ error: 'Porcentaje > 100' }, { status: 400 });

  /* 1. Verificar orden */
  const orden = await prisma.orden.findUnique({
    where: { id: ordenId },
    include: { cliente: true, mesa: true }
  });
  
  if (!orden)
    return NextResponse.json({ error: 'Orden no existe' }, { status: 404 });

  /* 1.a No facturar si la orden está cancelada o pendiente/en preparación */
  if (orden.estado === 'cancelada')
    return NextResponse.json(
      { error: 'No se puede facturar una orden cancelada' },
      { status: 409 }
    );
  
  if (!['listo', 'servido'].includes(orden.estado))
    return NextResponse.json(
      { error: `No se puede facturar una orden en estado "${orden.estado}". La orden debe estar lista o servida.` },
      { status: 409 }
    );

  /* 2. Evitar factura duplicada */
  const facturaExistente = await prisma.factura.findUnique({ where: { ordenId } });
  if (facturaExistente)
    return NextResponse.json({ error: 'La orden ya tiene factura' }, { status: 409 });

  /* 3. Calcular montos */
  const subtotal = Number(orden.total);
  const valorDescuento =
    tipoDescuento === 'porcentaje'
      ? subtotal * (descuento / 100)
      : Number(descuento);

  if (tipoDescuento === 'monto' && valorDescuento > subtotal)
    return NextResponse.json({ error: 'El descuento no puede ser mayor al subtotal' }, { status: 400 });

  const totalFinal = Math.max(0, subtotal - valorDescuento + Number(propina));

  /* 4. Crear factura en transacción */
  const factura = await prisma.$transaction(async (tx) => {
    // Crear la factura con clienteId opcional
    const nuevaFactura = await tx.factura.create({
      data: {
        ordenId,
        clienteId: orden.clienteId || null, // null si no hay cliente
        subtotal,
        descuento: Number(descuento),
        tipoDescuento,
        propina: Number(propina),
        totalFinal
      }
    });

    // Buscar la factura con includes después de crearla
    const facturaCompleta = await tx.factura.findUnique({
      where: { id: nuevaFactura.id },
      include: { 
        cliente: true, 
        orden: {
          include: {
            mesa: true,
            detalles: {
              include: {
                plato: true
              }
            }
          }
        }
      }
    });

    // Si la orden aún no está servida, actualizarla
    if (orden.estado === 'listo') {
      await tx.orden.update({
        where: { id: ordenId },
        data: { estado: 'servido' }
      });

      // Liberar la mesa
      await tx.mesa.update({
        where: { id: orden.mesaId },
        data: { estado: 'libre' }
      });
    }

    return facturaCompleta;
  });

  // Registrar actividades
  await registrarActividad(
    'factura_creada',
    `Factura #${factura.id} creada - Orden #${orden.id} - Mesa ${orden.mesa.numero} - Total: S/${totalFinal.toFixed(2)}`,
    request.user?.userId
  );

  if (orden.estado === 'listo') {
    await registrarActividad(
      'mesa_liberada',
      `Mesa ${orden.mesa.numero} liberada al facturar orden #${orden.id}`,
      request.user?.userId
    );
  }

  return NextResponse.json(factura, { status: 201 });
});