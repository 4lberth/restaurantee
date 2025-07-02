import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function requireAuth(roles = []) {
  return (handler) => async (request, context) => {
    /* 1️⃣  Cookie httpOnly (navegador web) */
    let token = request.cookies.get('token')?.value;

    /* 2️⃣  Header Authorization (Flutter, Postman, etc.) */
    if (!token) {
      const auth =
        request.headers.get('authorization') ??
        request.headers.get('Authorization');
      if (auth?.startsWith('Bearer ')) token = auth.slice(7);
    }

    /* 3️⃣  Sin token: 401 */
    if (!token)
      return NextResponse.json({ error: 'Sin token' }, { status: 401 });

    /* 4️⃣  Verificar JWT */
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      /* 5️⃣  Chequeo de rol */
      if (roles.length && !roles.includes(payload.rol))
        return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

      /* 6️⃣  Inyecta usuario en request */
      request.user = { userId: payload.userId, rol: payload.rol };

      return handler(request, context);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  };
}
