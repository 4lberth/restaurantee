import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

// PUT (editar)  — admin
export const PUT = requireAuth(['admin'])(async (request, { params }) => {
  const { nombre } = await request.json();
  
  // Obtener nombre anterior
  const categoriaAnterior = await prisma.categoria.findUnique({
    where: { id: +params.id }
  });
  
  const cat = await prisma.categoria.update({
    where: { id: +params.id },
    data: { nombre },
  });
  
  // 🆕 Registrar actividad
  await registrarActividad(
    'categoria_actualizada',
    `Categoría "${categoriaAnterior.nombre}" renombrada a "${cat.nombre}"`,
    request.user?.userId
  );
  
  return NextResponse.json(cat);
});

// DELETE  — admin
export const DELETE = requireAuth(['admin'])(async (request, { params }) => {
  // Obtener datos antes de eliminar
  const categoria = await prisma.categoria.findUnique({
    where: { id: +params.id },
    include: { platos: true }
  });
  
  await prisma.categoria.delete({ where: { id: +params.id } });
  
  // 🆕 Registrar actividad
  await registrarActividad(
    'categoria_eliminada',
    `Categoría "${categoria.nombre}" eliminada (${categoria.platos.length} platos afectados)`,
    request.user?.userId
  );
  
  return NextResponse.json({ ok: true });
});
