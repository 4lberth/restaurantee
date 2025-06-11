import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET  /api/clientes        (admin • mozo) – lista todos
export const GET = requireAuth(['admin', 'mozo'])(async () => {
  const clientes = await prisma.cliente.findMany();
  return NextResponse.json(clientes);
});

// POST /api/clientes        (admin • mozo) – crear
export const POST = requireAuth(['admin', 'mozo'])(async (request) => {
  const data = await request.json();        // { nombre, dni, telefono }
  const nuevo = await prisma.cliente.create({ data });
  return NextResponse.json(nuevo, { status: 201 });
});
