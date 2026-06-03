import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const IS_PROD = process.env.NODE_ENV === 'production';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias, alinhado com o backend

const REFRESH_COOKIE = 'pedi_auth_refresh_token';
const ACCESS_COOKIE = 'pedi_auth_access_token';

/**
 * POST /api/auth/login
 *
 * Server-side proxy para o login do backend. Existe para permitir que o
 * refresh token seja definido como cookie httpOnly — o que o browser
 * recusa quando feito via `document.cookie` no cliente. Apenas o access
 * token (TTL curto) é retornado no body; o refresh fica preso no cookie.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; senha?: string };
  try {
    body = (await req.json()) as { email?: string; senha?: string };
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 });
  }

  if (!body.email || !body.senha) {
    return NextResponse.json({ message: 'Email e senha obrigatórios' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, senha: body.senha }),
    });
  } catch {
    return NextResponse.json({ message: 'Falha ao contatar API de autenticação' }, { status: 502 });
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Credenciais inválidas' }));
    return NextResponse.json(errorBody, { status: res.status });
  }

  const tokens = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  const response = NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    tokenType: 'Bearer',
  });

  // httpOnly: o browser recusa expor este cookie a JS — defesa contra XSS.
  // sameSite=lax: protege contra CSRF em requisições cross-site.
  const cookieFlags = `path=/; max-age=${REFRESH_MAX_AGE}; samesite=lax; httponly${IS_PROD ? '; secure' : ''}`;
  response.headers.append('Set-Cookie', `${REFRESH_COOKIE}=${tokens.refreshToken}; ${cookieFlags}`);

  // Access token fica num cookie separado (não httpOnly) para que o proxy.ts
  // consiga ler server-side; o cliente também usa do localStorage para o
  // header Authorization, e mesmo que seja exfiltrado via XSS tem TTL de 15min.
  const accessFlags = `path=/; max-age=${tokens.expiresIn}; samesite=lax${IS_PROD ? '; secure' : ''}`;
  response.headers.append('Set-Cookie', `${ACCESS_COOKIE}=${tokens.accessToken}; ${accessFlags}`);

  return response;
}
