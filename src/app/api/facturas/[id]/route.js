import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// ─────── GET /api/facturas/[id]  (mozo • admin) ───────
export const GET = requireAuth(['mozo', 'admin'])(async (request, { params }) => {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: 'ID de factura requerido' }, { status: 400 });
  }

  try {
    const factura = await prisma.factura.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        orden: {
          include: {
            mesa: true,
            detalles: {
              include: {
                plato: {
                  include: {
                    categoria: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    return NextResponse.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});