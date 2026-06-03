'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * Boundary de erro client-side. Pega exceções não tratadas em qualquer
 * rota dentro de /app. Sem este arquivo, uma exceção em qualquer página
 * derruba a árvore inteira do React e o usuário fica vendo uma tela em
 * branco até o navegador mostrar a fallback page nativa.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logar com contexto para correlacionar com reports de Sentry/Logs
    // quando forem adicionados. `digest` é o hash server-side que o Next
    // atribui para que logs cliente/servidor batam mesmo com mensagem
    // completa ofuscada em prod.
    console.error('[app:error]', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-error" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Algo deu errado</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página. Você pode tentar novamente ou voltar
          ao início.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border text-text-primary font-medium rounded-lg hover:bg-background transition-colors"
          >
            <Home size={18} aria-hidden="true" />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
