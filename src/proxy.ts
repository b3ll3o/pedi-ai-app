import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/restaurantes'];
const COOKIE_NAME = 'pedi_auth_access_token';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get(COOKIE_NAME);

  // If no token and trying to access protected path, redirect to login
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    // Só repassa redirect se for path relativo começando com / e sem protocolo —
    // evita open redirect (ex: ?redirect=https://evil.com).
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/restaurantes/:path*'],
};
