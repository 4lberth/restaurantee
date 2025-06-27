import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return NextResponse.json({ error: 'Contraseña inválida' }, { status: 401 });

    const token = jwt.sign(
      { userId: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const res = NextResponse.json({
      ok: true,
      rol: user.rol,
      token, 
    });

    // Para web: sigue usando la cookie httpOnly
    res.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (err) {
    console.error('Error en /api/login:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
