import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { calcularTotal } from '@/lib/calc-total';
import { NextResponse } from 'next/server';

/*  GET /api/ordenes/:id ─ admin • mozo • cocina  */
export const GET = requireAuth(['admin', 'mozo', 'cocina'])(async (_req, { params }) => {
  const id = Number(params.id);

  const orden = await prisma.orden.findUnique({
    where:   { id },
    include: { detalles:true, mesa:true, cliente:true, mozo:true }
  });

  if (!orden)
    return NextResponse.json({ error:'Orden no encontrada' }, { status:404 });

  return NextResponse.json(orden);               // 200 OK
});

export const DELETE = requireAuth(['admin', 'mozo'])(async (_req, { params }) => {
  const id = Number(params.id);

  const orden = await prisma.orden.findUnique({
    where: { id },
    include: { mesa: true }
  });
  if (!orden)
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

  if (await prisma.factura.findUnique({ where: { ordenId: id } }))
    return NextResponse.json(
      { error: 'No se puede eliminar: la orden ya tiene factura' },
      { status: 409 }
    );

  await prisma.$transaction(async (tx) => {
    await tx.detalleOrden.deleteMany({ where: { ordenId: id } });
    await tx.orden.delete({ where: { id } });
    await tx.mesa.update({ where: { id: orden.mesaId }, data: { estado: 'libre' } });
  });

  return NextResponse.json({ ok: true });
});


/* ——— PUT  /api/ordenes/:id ———
   (admin • mozo)  — editar  */
export const PUT = requireAuth(['admin', 'mozo'])(async (request, { params }) => {
  const id      = Number(params.id);
  const {
    mesaId,            // opc.  ➜  Int  — nueva mesa
    clienteId,         // opc.  ➜  Int  — elegir existente
    cliente,           // opc.  ➜  { nombre,dni,telefono } — crear if needed
    items = [],        // opc.  ➜  [{ platoId,cantidad }]
    notas              // opc.  ➜  String
  } = await request.json();

  /* ——— 1. Verificar que la orden exista y no tenga factura ——— */
  const orden = await prisma.orden.findUnique({ where:{ id }, include:{ factura:true, mesa:true } });
  if (!orden)  return NextResponse.json({ error:'Orden no encontrada' }, { status:404 });
  if (orden.factura)
      return NextResponse.json({ error:'No se puede editar: ya tiene factura' }, { status:409 });
  
  /* ——— NUEVA VALIDACIÓN: Verificar que la orden no esté en estado 'listo', 'servido' o 'cancelada' ——— */
  if (['listo', 'servido', 'cancelada'].includes(orden.estado)) {
      return NextResponse.json({ 
        error: `No se puede editar una orden en estado "${orden.estado}"` 
      }, { status: 409 });
  }

  /* ——— 2. Validar / (opcional) cambiar mesa ——— */
  let mesaConectar = undefined;
  if (mesaId && mesaId !== orden.mesaId) {
    const mesaNueva = await prisma.mesa.findUnique({ where:{ id: mesaId } });
    if (!mesaNueva || mesaNueva.estado === 'ocupada')
      return NextResponse.json({ error:'Mesa ocupada o inexistente' }, { status:409 });
    mesaConectar = { connect:{ id: mesaId }};
  }

  /* ——— 3. Validar items (si vinieron) ——— */
  let detallesData = undefined;
  let total = orden.total;
  if (items.length) {
    const detalles = [];
    for (const it of items) {
      const plato = await prisma.plato.findUnique({ where:{ id: it.platoId } });
      if (!plato)
        return NextResponse.json({ error:`Plato ${it.platoId} no existe` }, { status:404 });
      if (!plato.disponible)
        return NextResponse.json({ error:`El plato "${plato.nombre}" no está disponible` }, { status:409 });
      detalles.push({
        platoId : plato.id,
        cantidad: it.cantidad,
        subtotal: plato.precio * it.cantidad,
      });
    }
    total        = calcularTotal(detalles);
    detallesData = detalles;               // la usaremos en la tx
  }

  /* ——— 4. Preparar relación con cliente ——— */
  let clienteRel = undefined;
  if (clienteId) {
    clienteRel = { connect:{ id: clienteId } };
  } else if (cliente?.dni) {
    clienteRel = {
      connectOrCreate:{
        where : { dni: cliente.dni },
        create: {
          nombre  : cliente.nombre,
          dni     : cliente.dni,
          telefono: cliente.telefono,
        },
      },
    };
  }

  /* ——— 5. Transacción de actualización ——— */
  const resultado = await prisma.$transaction(async (tx) => {
    /* ▸ borrar detalles viejos si llegan nuevos */
    if (detallesData) {
      await tx.detalleOrden.deleteMany({ where:{ ordenId: id } });
      await tx.detalleOrden.createMany({ data: detallesData.map(d => ({ ...d, ordenId:id })) });
    }

    /* ▸ actualizar cabecera */
    return tx.orden.update({
      where : { id },
      data  : {
        ...(mesaConectar  && { mesa   : mesaConectar }),
        ...(clienteRel     && { cliente: clienteRel   }),
        ...(notas !== undefined && { notas }),
        ...(detallesData   && { total }),
      },
      include:{ mesa:true, cliente:true, detalles:true, mozo:true }
    });
  });

  /* ——— 6. Si la mesa cambió, liberar la vieja y ocupar la nueva ——— */
  if (mesaConectar) {
    await prisma.$transaction([
      prisma.mesa.update({ where:{ id: orden.mesaId }, data:{ estado:'libre'   }}),
      prisma.mesa.update({ where:{ id: mesaId        }, data:{ estado:'ocupada'}}),
    ]);
  }

  return NextResponse.json(resultado);   // 200 OK
});