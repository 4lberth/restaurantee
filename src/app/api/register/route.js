// src/app/api/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { nombre, email, password } = await req.json();

  if (!nombre || !email || !password)
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

  if (await prisma.user.findUnique({ where: { email } }))
    return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { nombre, email, password: hash, rol: 'mozo' }   //  👈 rol por defecto
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
