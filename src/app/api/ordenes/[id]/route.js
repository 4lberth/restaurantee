import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

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
