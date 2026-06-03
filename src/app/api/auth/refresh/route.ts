import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const IS_PROD = process.env.NODE_ENV === 'production';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

const REFRESH_COOKIE = 'pedi_auth_refresh_token';
const ACCESS_COOKIE = 'pedi_auth_access_token';

/**
 * POST /api/auth/refresh
 *
 * Lê o refresh token do cookie httpOnly (não pode ser lido por JS) e chama o
 * backend. Devolve o novo par de tokens; o cliente atualiza o localStorage do
 * access token e o cookie httpOnly é reescrito com o novo refresh (rotação).
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token ausente' }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json({ message: 'Falha ao contatar API de autenticação' }, { status: 502 });
  }

  if (!res.ok) {
    // Refresh falhou — limpar cookie httpOnly e devolver 401 para o cliente
    // disparar logout.
    const response = NextResponse.json(
      { message: 'Refresh token inválido ou expirado' },
      { status: 401 },
    );
    response.headers.append(
      'Set-Cookie',
      `${REFRESH_COOKIE}=; path=/; max-age=0; samesite=lax; httponly${IS_PROD ? '; secure' : ''}`,
    );
    return response;
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

  const cookieFlags = `path=/; max-age=${REFRESH_MAX_AGE}; samesite=lax; httponly${IS_PROD ? '; secure' : ''}`;
  response.headers.append('Set-Cookie', `${REFRESH_COOKIE}=${tokens.refreshToken}; ${cookieFlags}`);

  const accessFlags = `path=/; max-age=${tokens.expiresIn}; samesite=lax${IS_PROD ? '; secure' : ''}`;
  response.headers.append('Set-Cookie', `${ACCESS_COOKIE}=${tokens.accessToken}; ${accessFlags}`);

  return response;
}
