import { prisma }   from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/* GET  /api/ordenes/historial?desde=2025-06-18&hasta=2025-06-19
   Roles:  admin  •  cocina
   Devuelve órdenes «cerradas» (listo | servido | cancelada)          */
export const GET = requireAuth(['admin', 'cocina'])(async (request) => {
  const { searchParams } = new URL(request.url);
  const desde = searchParams.get('desde');                 // ISO  yyyy-mm-dd
  const hasta = searchParams.get('hasta');

  const where = {
    estado: { in: ['listo', 'servido', 'cancelada'] },
    ...(desde && { createdAt: { gte: new Date(desde) } }),
    ...(hasta && { createdAt: { lte: new Date(hasta + 'T23:59:59') } }),
  };

  const ordenes = await prisma.orden.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { mesa:true, cliente:true, mozo:true, detalles:true },
  });

  return NextResponse.json(ordenes);
});
