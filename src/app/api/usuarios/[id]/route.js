import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad'; // ✅ AGREGADO
import { NextResponse } from 'next/server';

/// id llega como string → convertir a número
const idNum = (p) => Number(p.id);

// ─── GET /api/usuarios/:id ─── (solo admin, opcional)
export const GET = requireAuth(['admin'])(async (_req,{ params }) => {
  const user = await prisma.user.findUnique({
    where:{ id:idNum(params) },
    select:{ id:true, nombre:true, email:true, rol:true }
  });
  if (!user) return NextResponse.json({ error:'No encontrado' },{ status:404 });
  return NextResponse.json(user);
});

// ─── PUT /api/usuarios/:id ─── (solo admin)
export const PUT = requireAuth(['admin'])(async (request,{ params }) => {
  const { nombre, rol } = await request.json();
  
  try {
    // Obtener datos anteriores
    const usuarioAnterior = await prisma.user.findUnique({
      where: { id: idNum(params) },
      select: { nombre: true, rol: true }
    });

    const upd = await prisma.user.update({
      where:{ id:idNum(params) },
      data:{ nombre, rol },
      select:{ id:true, nombre:true, email:true, rol:true }
    });
    
    // 🆕 Registrar actividad
    let cambios = [];
    if (nombre !== usuarioAnterior.nombre) cambios.push(`nombre: "${nombre}"`);
    if (rol !== usuarioAnterior.rol) cambios.push(`rol: ${rol}`);
    
    await registrarActividad(
      'usuario_actualizado',
      `Usuario "${upd.nombre}" actualizado${cambios.length ? ` (${cambios.join(', ')})` : ''}`,
      request.user?.userId
    );
    
    return NextResponse.json(upd);
  } catch {
    return NextResponse.json({ error:'No encontrado' },{ status:404 });
  }
});

// ─── DELETE /api/usuarios/:id ─── (solo admin)
export const DELETE = requireAuth(['admin'])(async (request,{ params }) => {
  try {
    // Obtener datos antes de eliminar
    const usuario = await prisma.user.findUnique({
      where: { id: idNum(params) },
      select: { nombre: true, rol: true }
    });

    await prisma.user.delete({ where:{ id:idNum(params) } });
    
    // 🆕 Registrar actividad
    await registrarActividad(
      'usuario_eliminado',
      `Usuario "${usuario.nombre}" (${usuario.rol}) eliminado`,
      request.user?.userId
    );
    
    return NextResponse.json({ ok:true });
  } catch {
    return NextResponse.json({ error:'No encontrado' },{ status:404 });
  }
});