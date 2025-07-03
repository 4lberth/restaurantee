// src/app/api/mesas/[id]/estado/route.js
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

// PUT /api/mesas/[id]/estado (admin • mozo)
export const PUT = requireAuth(['admin', 'mozo'])(async (request, { params }) => {
  try {
    const { estado } = await request.json();
    const { id } = params;
    
    // Validar entrada
    if (!estado || !['libre', 'ocupada'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado debe ser "libre" o "ocupada"' },
        { status: 400 }
      );
    }
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'ID de mesa inválido' },
        { status: 400 }
      );
    }
    
    // Verificar que la mesa existe antes de actualizar
    const mesaExistente = await prisma.mesa.findUnique({
      where: { id: Number(id) }
    });
    
    if (!mesaExistente) {
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      );
    }
    
    // Actualizar el estado
    const mesa = await prisma.mesa.update({
      where: { id: Number(id) },
      data: { estado },
    });
    
    // Registrar actividad (usando los nombres correctos de parámetros)
    await registrarActividad(
      estado === 'libre' ? 'mesa_liberada' : 'mesa_ocupada',
      `Mesa ${mesa.numero} ${estado === 'libre' ? 'liberada' : 'ocupada'}`,
      request.user?.userId || request.user?.id // Intentar ambos posibles nombres
    );
    
    return NextResponse.json(mesa);
    
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});
