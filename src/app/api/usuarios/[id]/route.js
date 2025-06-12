import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// id llega como string → convertir a número
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
export const PUT = requireAuth(['admin'])(async (req,{ params }) => {
  const { nombre, rol } = await req.json();
  try {
    const upd = await prisma.user.update({
      where:{ id:idNum(params) },
      data:{ nombre, rol },
      select:{ id:true, nombre:true, email:true, rol:true }
    });
    return NextResponse.json(upd);
  } catch {
    return NextResponse.json({ error:'No encontrado' },{ status:404 });
  }
});

// ─── DELETE /api/usuarios/:id ─── (solo admin)
export const DELETE = requireAuth(['admin'])(async (_req,{ params }) => {
  try {
    await prisma.user.delete({ where:{ id:idNum(params) } });
    return NextResponse.json({ ok:true });
  } catch {
    return NextResponse.json({ error:'No encontrado' },{ status:404 });
  }
});
