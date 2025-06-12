import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC = [
  '/login',
  '/register',
  '/api/login',
  '/api/register',
  '/favicon.ico',
  '/_next',          // estáticos de Next
  '/mozo/:path*',
];

function isPublic(path) {
  return PUBLIC.some((p) => path.startsWith(p));
}

async function verify(token) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return payload;                 // { userId, rol, iat, exp }
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  /* 1. Tiene cookie ? */
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  /* 2. Token válido ? */
  const payload = await verify(token);
  if (!payload) return NextResponse.redirect(new URL('/login', req.url));

  /* 3. Check de rol vs ruta */
  if (pathname.startsWith('/admin')  && payload.rol !== 'admin')
    return NextResponse.redirect(new URL('/', req.url));

  if (pathname.startsWith('/cocina') && payload.rol !== 'cocina')
    return NextResponse.redirect(new URL('/', req.url));

  if (pathname.startsWith('/mozo') && payload.rol !== 'mozo')
    return NextResponse.redirect(new URL('/', req.url));


  /* mozo (opcional)
  if (pathname.startsWith('/mozo')   && payload.rol !== 'mozo')
    return NextResponse.redirect(new URL('/', req.url));
  */

  // todo correcto → continua
  return NextResponse.next();
}

/* Solo intercepta lo necesario */
export const config = {
  matcher: [
    '/admin/:path*',
    '/cocina/:path*',
    // '/mozo/:path*'         // si más adelante creas vista de mozo
  ],
};
