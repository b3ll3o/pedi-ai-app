'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** id do título (aria-labelledby). Se não fornecido, usa-se o title como id. */
  titleId?: string;
  children: ReactNode;
  /** Largura máxima em classes Tailwind. Default: max-w-md */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Modal acessível:
 * - `role="dialog"` + `aria-modal="true"` para screen readers
 * - `aria-labelledby` apontando para o título
 * - Foco vai para o primeiro elemento focável ao abrir
 * - ESC fecha
 * - Click no backdrop fecha
 * - Body scroll travado enquanto aberto
 */
export function Modal({ open, onClose, title, titleId, children, size = 'md' }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedTitleId = titleId ?? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap: ao pressionar Tab dentro do modal, mantém o foco dentro
      // dos elementos focáveis do diálogo. Sem isso, Tab pode escapar para
      // elementos do background (ex: a sidebar do dashboard), quebrando a
      // navegação por teclado para usuários que dependem de leitor de tela.
      if (e.key === 'Tab') {
        const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"]), a[href]',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    // Trava scroll do body
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco no primeiro elemento focável
    const focusable = containerRef.current?.querySelector<HTMLElement>(
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"]), a[href]',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface rounded-2xl p-6 w-full ${sizeMap[size]} shadow-2xl border border-border`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id={resolvedTitleId} className="text-lg font-bold text-text-primary">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
