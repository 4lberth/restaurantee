import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { toPlain } from '@/lib/toPlain';
import { NextResponse } from 'next/server';

export const GET = requireAuth(['admin'])(async () => {
  const rows = await prisma.$queryRaw`
    SELECT
      u."nombre" AS mozo,
      COUNT(o.id)       AS ordenes,
      SUM(f."totalFinal") AS ventas
    FROM "User" u
      JOIN "Orden"   o ON o."mozoId" = u.id
      JOIN "Factura" f ON f."ordenId" = o.id
    GROUP BY u."nombre"
    ORDER BY ventas DESC;
  `;
  return NextResponse.json(rows.map(toPlain));
});
