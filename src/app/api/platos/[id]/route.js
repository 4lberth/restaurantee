import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad'; // ✅ AGREGADO
import { NextResponse } from 'next/server';

/* PUT ─ editar plato (nombre, precio, disponible, etc.) */
export const PUT = requireAuth(['admin'])(async (request, { params }) => {
  const data = await request.json();
  const id = Number(params.id);

  try {
    // Obtener datos anteriores para el mensaje
    const platoAnterior = await prisma.plato.findUnique({
      where: { id },
      include: { categoria: true }
    });

    const plato = await prisma.plato.update({ 
      where: { id }, 
      data,
      include: { categoria: true }
    });
    
    // 🆕 Registrar actividad
    let mensaje = `Plato "${plato.nombre}" actualizado`;
    
    // Detalles específicos de los cambios
    if (data.disponible !== undefined && data.disponible !== platoAnterior.disponible) {
      mensaje += ` - ${data.disponible ? 'Disponible' : 'No disponible'}`;
    }
    if (data.precio !== undefined && data.precio !== platoAnterior.precio) {
      mensaje += ` - Precio: S/${data.precio}`;
    }
    
    await registrarActividad(
      'plato_actualizado',
      mensaje,
      request.user?.userId
    );
    
    return NextResponse.json(plato);
  } catch {
    return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
  }
});

/* DELETE ─ eliminar plato */
export const DELETE = requireAuth(['admin'])(async (request, { params }) => {
  const id = Number(params.id);

  try {
    // Obtener datos antes de eliminar
    const plato = await prisma.plato.findUnique({
      where: { id },
      include: { categoria: true }
    });

    await prisma.plato.delete({ where: { id } });
    
    // 🆕 Registrar actividad
    await registrarActividad(
      'plato_eliminado',
      `Plato "${plato.nombre}" eliminado`,
      request.user?.userId
    );
    
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
  }
});