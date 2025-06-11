import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const PUT = requireAuth(['cocina', 'mozo'])(async (request, { params }) => {
  const { estado } = await request.json();
  const id = Number(params.id);

  const permitidos = ['pendiente', 'en_preparacion', 'listo', 'servido', 'cancelada'];
  if (!permitidos.includes(estado))
    return NextResponse.json({ error: 'Estado no permitido' }, { status: 400 });

  if (estado === 'cancelada') {
    const factura = await prisma.factura.findUnique({ where: { ordenId: id } });
    if (factura)
      return NextResponse.json(
        { error: 'No se puede cancelar: la orden ya tiene factura' },
        { status: 409 }
      );
  }

  try {
    const orden = await prisma.orden.update({
      where: { id },
      data:  { estado },
      include: { mesa: true }
    });

    if (estado === 'servido' || estado === 'cancelada') {
      await prisma.mesa.update({
        where: { id: orden.mesaId },
        data:  { estado: 'libre' }
      });
    }

    return NextResponse.json(orden);
  } catch {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }
});
