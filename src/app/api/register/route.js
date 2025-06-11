import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { nombre, email, password, rol } = await req.json();
  if (!nombre || !email || !password || !rol)
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe)
    return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { nombre, email, password: hash, rol } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
