import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT /api/mesas/:id/estado   (admin • mozo)
export const PUT = requireAuth(['admin', 'mozo'])(async (request, { params }) => {
  const { estado } = await request.json();  // "libre" | "ocupada"
  
  const mesa = await prisma.mesa.update({
    where: { id: Number(params.id) },
    data:  { estado },
  });
  
  // 🆕 Registrar actividad
  await registrarActividad(
    estado === 'libre' ? 'mesa_liberada' : 'mesa_ocupada',
    `Mesa ${mesa.numero} ${estado === 'libre' ? 'liberada' : 'ocupada'}`,
    request.user?.userId
  );
  
  return NextResponse.json(mesa);
});
