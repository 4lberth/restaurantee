// GET  /api/usuarios           (solo admin)
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// ─────────── LISTAR ───────────
export const GET = requireAuth(['admin'])(async () => {
  const users = await prisma.user.findMany({
    select: { id:true, nombre:true, email:true, rol:true }
  });
  return NextResponse.json(users);
});

// ─────────── CREAR ───────────
export const POST = requireAuth(['admin'])(async (req) => {
  const { nombre, email, password, rol } = await req.json();

  if (!nombre || !email || !password || !rol)
    return NextResponse.json({ error:'Faltan datos' }, { status:400 });

  if (await prisma.user.findUnique({ where:{ email } }))
    return NextResponse.json({ error:'Email ya registrado' }, { status:409 });

  const hash = await bcrypt.hash(password, 10);

  const nuevo = await prisma.user.create({
    data:{ nombre, email, password:hash, rol }
  });

  return NextResponse.json(
    { id:nuevo.id, nombre, email, rol },
    { status:201 }
  );
});
