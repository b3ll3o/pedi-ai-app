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
  const accessToken = request.cookies.get(COOKIE_NAME)?.value;

  // Se não tem cookie, redireciona para login.
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    // Só repassa redirect se for path relativo começando com / e sem protocolo —
    // evita open redirect (ex: ?redirect=https://evil.com).
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Defesa em profundidade: antes de deixar a request passar para o React,
  // validamos o formato do JWT e o claim `exp` inline. Sem isso, um cookie
  // forjado (ex: `garbage.yyyy.zzzz`) seria aceito e o backend faria 401 só
  // no primeiro fetch de dados — depois de já ter baixado o bundle JS.
  //
  // Esta validação NÃO substitui a verificação de assinatura do backend
  // (o proxy não tem acesso ao JWT_SECRET). Mas filtra tokens expirados e
  // malformados antes do trabalho caro de render.
  if (!isJwtStructurallyValid(accessToken)) {
    const loginUrl = new URL('/login', request.url);
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Verifica formato JWT (3 segmentos base64) e checagem de `exp` no payload.
 * Não valida assinatura — isso é responsabilidade do backend (que tem o
 * JWT_SECRET). O ponto aqui é cortar cedo tokens obviamente inválidos.
 */
function isJwtStructurallyValid(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Decodifica o payload (base64url). Não usamos `Buffer` em ambiente browser;
    // `atob` aceita base64 padrão mas JWT usa base64url (`-`/`_` em vez de `+`/`/`).
    // Convertemos para base64 padrão antes de decodificar.
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Adiciona padding se necessário
    const padded = payloadB64 + '='.repeat((4 - (payloadB64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    // exp é em segundos (RFC 7519); Date.now() em milissegundos
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/restaurantes/:path*'],
};
