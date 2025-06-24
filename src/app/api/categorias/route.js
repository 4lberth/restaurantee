import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

// (GET) listar todas
export const GET = async () => {
  const cats = await prisma.categoria.findMany({ include: { platos: true } });
  return NextResponse.json(cats);
};

// (POST) crear  — solo admin
export const POST = requireAuth(['admin'])(async (request) => {
  const { nombre } = await request.json();
  
  const cat = await prisma.categoria.create({ data: { nombre } });
  
  // 🆕 Registrar actividad
  await registrarActividad(
    'categoria_creada',
    `Nueva categoría creada: "${cat.nombre}"`,
    request.user?.userId
  );
  
  return NextResponse.json(cat, { status: 201 });
});