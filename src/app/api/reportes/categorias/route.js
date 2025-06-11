import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { toPlain } from '@/lib/toPlain';
import { NextResponse } from 'next/server';

export const GET = requireAuth(['admin'])(async (req) => {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');

  if (!desde || !hasta)
    return NextResponse.json({ error: 'desde y hasta requeridos' }, { status: 400 });

  const rows = await prisma.$queryRaw`
    SELECT
      c."nombre"      AS categoria,
      SUM(d."subtotal") AS total
    FROM "DetalleOrden" d
      JOIN "Orden"   o ON o.id = d."ordenId"
      JOIN "Factura" f ON f."ordenId" = o.id
      JOIN "Plato"   p ON p.id = d."platoId"
      JOIN "Categoria" c ON c.id = p."categoriaId"
    WHERE f."creadoEn" >= ${desde}::date
      AND f."creadoEn" <= ${hasta}::date
    GROUP BY c."nombre"
    ORDER BY total DESC;
  `;

  return NextResponse.json(rows.map(toPlain));
});
