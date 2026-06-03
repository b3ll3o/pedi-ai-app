import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Proxy chamadas /api/* para o backend. Útil para evitar CORS em
      // ambientes onde o cliente não pode chamar a API direto (ex: cookies
      // httpOnly cross-origin). O `lib/api.ts` continua usando a URL absoluta
      // via NEXT_PUBLIC_API_URL por compatibilidade.
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
