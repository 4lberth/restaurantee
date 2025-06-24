import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { registrarActividad } from '@/lib/actividad';
import { NextResponse } from 'next/server';

/* --- GET /api/platos?soloDisponibles=1 --- */
export const GET = async (req) => {
  const sp = new URL(req.url).searchParams;
  const soloDisp = sp.get('soloDisponibles') === '1';

  const cats = await prisma.categoria.findMany({
    include: {
      platos: {
        where: soloDisp ? { disponible: true } : undefined,
        orderBy: { nombre: 'asc' },
      },
    },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(cats);
};

/* --- POST /api/platos (solo admin) --- */
export const POST = requireAuth(['admin'])(async (request) => {
  const { nombre, descripcion, precio, categoriaId, disponible = true } =
    await request.json();

  const catId =
    categoriaId !== null && categoriaId !== undefined
      ? Number(categoriaId)
      : null;
  if (categoriaId && isNaN(catId))
    return NextResponse.json(
      { error: 'categoriaId debe ser entero' },
      { status: 400 },
    );

  const precioNum = Number(precio);
  if (isNaN(precioNum) || precioNum < 0)
    return NextResponse.json(
      { error: 'precio debe ser número positivo' },
      { status: 400 },
    );

  try {
    const nuevo = await prisma.plato.create({
      data: {
        nombre,
        descripcion,
        precio: precioNum,
        categoriaId: catId,
        disponible: Boolean(disponible),
      },
      include: { categoria: true } // Para obtener el nombre de la categoría
    });
    
    // 🆕 Registrar actividad
    await registrarActividad(
      'plato_creado',
      `Nuevo plato agregado: "${nuevo.nombre}" ${nuevo.categoria ? `(${nuevo.categoria.nombre})` : ''}`,
      request.user?.userId
    );
    
    return NextResponse.json(nuevo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo crear el plato' },
      { status: 500 },
    );
  }
});