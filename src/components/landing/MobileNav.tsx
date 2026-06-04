'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import styles from './MobileNav.module.css';

interface NavItem {
  href: string;
  label: string;
  /** In-page anchor (starts with #) — scroll then close drawer. */
  anchor?: boolean;
}

const navItems: NavItem[] = [
  { href: '#features', label: 'Funcionalidades', anchor: true },
  { href: '#how-it-works', label: 'Como Funciona', anchor: true },
  { href: '#pricing', label: 'Preços', anchor: true },
];

/**
 * MobileNav — barra de navegação mobile-first.
 *
 * Estratégia:
 * - Mobile (< 768px): hamburger button visível; nav inline oculto.
 *   Ao tocar no hamburger, abre um drawer (overlay + painel lateral)
 *   com os mesmos links + CTAs "Entrar" e "Começar Grátis".
 * - Desktop (>= 768px): nav inline visível; hamburger oculto.
 *
 * Acessibilidade:
 * - Hamburger: `aria-controls`, `aria-expanded`, `aria-label` (pt-BR).
 * - Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
 * - ESC fecha o drawer.
 * - Click no backdrop fecha o drawer.
 * - Body scroll travado enquanto o drawer está aberto.
 * - Foco volta para o hamburger ao fechar.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = triggerRef.current;

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  // Fecha o drawer automaticamente se a viewport cruzar para >= 768px
  // (evita body scroll travado e drawer "fantasma" no desktop).
  // useEffect só roda no browser, então window está sempre definido aqui.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 48em)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Atualiza a URL com o anchor (sem disparar navegação) para permitir
      // compartilhamento do link direto à seção.
      window.history.pushState(null, '', href);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: hamburger trigger (visible < md) */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.hamburger}
        aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {/* Desktop: inline nav links (visible >= md) */}
      <nav aria-label="Navegação principal" className={styles.navInline}>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className={styles.navInlineLink}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Drawer (visible only when open and on mobile) */}
      {open && (
        <div className={styles.drawerBackdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        className={styles.drawer}
        data-open={open}
        hidden={!open}
      >
        <button
          type="button"
          className={styles.drawerClose}
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        >
          <X size={24} aria-hidden="true" />
        </button>
        <h2 id={`${dialogId}-title`} className="sr-only">
          Menu de navegação
        </h2>
        <nav aria-label="Navegação mobile">
          <ul className={styles.drawerList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className={styles.drawerLink}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className={styles.drawerDivider} aria-hidden="true" />
            <li>
              <Link
                href="/login"
                className={`${styles.drawerLink} ${styles.drawerLinkSecondary}`}
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            </li>
            <li>
              <Link
                href="/usuarios/novo"
                className={styles.drawerCta}
                onClick={() => setOpen(false)}
              >
                Começar Grátis
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
