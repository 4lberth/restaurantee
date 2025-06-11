import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { toPlain } from '@/lib/toPlain';
import { NextResponse } from 'next/server';

export const GET = requireAuth(['admin'])(async (req) => {
  const { searchParams } = new URL(req.url);
  const limite = Number(searchParams.get('limite') ?? 10);

  if (!Number.isInteger(limite) || limite <= 0)
    return NextResponse.json({ error: 'limite debe ser entero positivo' }, { status: 400 });

  const top = await prisma.$queryRaw`
    SELECT
      p."nombre",
      SUM(d."cantidad") AS unidades,
      SUM(d."subtotal") AS ingreso
    FROM "DetalleOrden" d
      JOIN "Plato" p ON p.id = d."platoId"
      JOIN "Orden" o ON o.id = d."ordenId"
      JOIN "Factura" f ON f."ordenId" = o.id
    GROUP BY p."nombre"
    ORDER BY unidades DESC
    LIMIT ${limite};
  `;

  return NextResponse.json(top.map(toPlain));
});
