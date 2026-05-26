'use client';

import Link from 'next/link';
import { Home, ArrowLeft, UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="text-xl font-bold text-text-primary">Pedi-AI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <Home size={18} aria-hidden="true" />
            <span>Página Inicial</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* 404 Visual */}
          <div className="relative inline-block mb-8">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="text-center">
                <p className="text-7xl font-bold text-primary leading-none">404</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-warning" aria-hidden="true" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            Página não encontrada
          </h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Ops! Esta página não existe ou foi movida.
            Volte ao início e continue navegando.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Home size={18} aria-hidden="true" />
              Voltar ao Início
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-text-secondary text-sm">
          © 2026 Pedi-AI. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
