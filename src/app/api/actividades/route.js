import { requireAuth } from '@/lib/auth';
import { obtenerActividadesRecientes } from '@/lib/actividad';
import { NextResponse } from 'next/server';

// GET /api/actividades - Obtener actividades recientes
export const GET = requireAuth(['admin', 'mozo', 'cocina'])(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite')) || 20;
    
    const actividades = await obtenerActividadesRecientes(limite);
    
    return NextResponse.json(actividades);
  } catch (error) {
    console.error('Error en GET /api/actividades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});