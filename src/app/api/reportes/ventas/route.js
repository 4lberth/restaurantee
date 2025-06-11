// src/app/api/reportes/ventas/route.js

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const GET = requireAuth(['admin'])(async (request) => {
  const { searchParams } = new URL(request.url);
  const desdeRaw = searchParams.get('desde');
  const hastaRaw = searchParams.get('hasta');

  if (!desdeRaw || !hastaRaw) {
    return NextResponse.json(
      { error: 'Parámetros "desde" y "hasta" requeridos' },
      { status: 400 }
    );
  }

  // 1️⃣ Construir fechas UTC completas
  const desde = new Date(`${desdeRaw}T00:00:00.000Z`);
  const hasta = new Date(`${hastaRaw}T23:59:59.999Z`);

  // 2️⃣ Agrupar facturas por día
  const ventas = await prisma.factura.groupBy({
    by: ['creadoEn'],
    _sum: { totalFinal: true },
    where: {
      creadoEn: {
        gte: desde,
        lte: hasta,
      },
    },
    orderBy: { creadoEn: 'asc' },
  });

  // 3️⃣ Dar formato JSON-friendly
  const resultado = ventas.map((v) => ({
    fecha:    v.creadoEn.toISOString().substring(0, 10),
    total:    Number(v._sum.totalFinal ?? 0),
  }));

  return NextResponse.json(resultado);
});
