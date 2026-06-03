import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const IS_PROD = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE = 'pedi_auth_refresh_token';
const ACCESS_COOKIE = 'pedi_auth_access_token';

/**
 * POST /api/auth/logout
 *
 * Chama o backend /auth/logout para invalidar o refresh token no banco e
 * limpa os cookies. Aceita o access token no body (o cliente tem em
 * localStorage; cookies httpOnly não são visíveis ao JS para enviar via
 * header).
 */
export async function POST(req: NextRequest) {
  let body: { accessToken?: string };
  try {
    body = (await req.json()) as { accessToken?: string };
  } catch {
    body = {};
  }

  if (body.accessToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${body.accessToken}`,
        },
      });
    } catch {
      // Ignora erros do backend — ainda vamos limpar os cookies
    }
  }

  const response = NextResponse.json({ success: true });

  const clearFlags = `path=/; max-age=0; samesite=lax${IS_PROD ? '; secure' : ''}`;
  response.headers.append('Set-Cookie', `${REFRESH_COOKIE}=; ${clearFlags}; httponly`);
  response.headers.append('Set-Cookie', `${ACCESS_COOKIE}=; ${clearFlags}`);

  return response;
}
