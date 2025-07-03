// src/app/api/mesas/route.js
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

// GET /api/mesas (admin • mozo)
export const GET = requireAuth(['admin', 'mozo'])(async (request) => {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: 'asc' }
    });
    return NextResponse.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

// POST /api/mesas (solo admin)
export const POST = requireAuth(['admin'])(async (request) => {
  try {
    const { numero } = await request.json();
    
    // Validar entrada
    if (!numero || numero <= 0) {
      return NextResponse.json(
        { error: 'Número de mesa debe ser un entero positivo' },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe una mesa con ese número
    const mesaExistente = await prisma.mesa.findFirst({
      where: { numero: Number(numero) }
    });
    
    if (mesaExistente) {
      return NextResponse.json(
        { error: `Ya existe una mesa con el número ${numero}` },
        { status: 409 }
      );
    }
    
    // Crear la nueva mesa
    const nueva = await prisma.mesa.create({ 
      data: { 
        numero: Number(numero),
        estado: 'libre' // Estado por defecto
      } 
    });
    
    // Registrar actividad (usando los nombres correctos de parámetros)
    await registrarActividad(
      'mesa_creada',
      `Mesa ${nueva.numero} creada`,
      request.user?.userId || request.user?.id // Intentar ambos posibles nombres
    );
    
    return NextResponse.json(nueva, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear mesa:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una mesa con este número' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});