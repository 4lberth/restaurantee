import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function requireAuth(roles = []) {
  return (handler) => async (request, context) => {
    const token = request.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json({ error: 'Sin token' }, { status: 401 });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(payload.rol))
        return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

      request.user = { userId: payload.userId, rol: payload.rol };

      return handler(request, context);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  };
}
