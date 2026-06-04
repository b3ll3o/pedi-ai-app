# Proposal: Homepage Mobile-First

## Resumo

A homepage (`/`) é a porta de entrada pública do produto. Hoje, em viewports
< 768px, os links da barra de navegação — **Funcionalidades**, **Como
Funciona** e **Preços** — desaparecem sem oferecer nenhum substituto
(hamburger, drawer, bottom nav). Isso quebra a navegação mobile e força o
usuário a usar o footer ou rolar a página inteira para descobrir as seções.

Este change aplica boas práticas de **mobile-first** à homepage:

- Hamburger acessível no mobile que abre um drawer lateral com todos os
  links e CTAs de autenticação.
- Touch targets ≥ 44×44 px (WCAG 2.2 SC 2.5.5).
- Suporte a `100dvh` e `env(safe-area-inset-*)` para iOS.
- Estilos escritos mobile-first (base para mobile, `@media (min-width: …)`
  para progressive enhancement).
- Cobertura de testes unitários (Jest) e E2E (Playwright) em múltiplos
  viewports (375, 768, 1280, 1536).

## Motivação

- **Problema concreto:** usuário mobile não consegue acessar as seções
  principais da landing page pela navegação.
- **Risco:** leads abandonam a página sem descobrir o produto; impacta
  diretamente a taxa de conversão.
- **Conformidade:** WCAG 2.2 (touch target 44×44) e Apple HIG (44×44 pt)
  são violados em alguns CTAs.

## Escopo

### Dentro do escopo

- Novo componente `MobileNav` em `src/components/landing/`
- Substituição dos links inline no `<nav>` da homepage por `MobileNav`
- Ajustes em `page.module.css` (100dvh, safe-area, touch targets)
- Testes unitários do `MobileNav` (Jest + Testing Library)
- Testes E2E responsivos da homepage (Playwright, 3+ viewports)
- Atualização da spec `app` (seção "Página Inicial")

### Fora do escopo

- Refatoração global do design system
- Migração completa da homepage para Tailwind v4 utilities
- Mudanças em outras páginas (login, dashboard, etc.)
- Internacionalização

## Critérios de aceitação

1. Em viewports < 768px, o botão hamburger é visível e os links inline
   (`Funcionalidades`, `Como Funciona`, `Preços`) ficam ocultos.
2. Em viewports ≥ 768px, o botão hamburger fica oculto e os links inline
   aparecem.
3. Clicar no hamburger abre um drawer com `role="dialog"`,
   `aria-modal="true"`, contendo todos os links + CTAs.
4. Pressionar **ESC** fecha o drawer e devolve o foco para o hamburger.
5. Clicar no backdrop fecha o drawer.
6. O body scroll é travado enquanto o drawer está aberto.
7. Todos os touch targets interativos da homepage têm ≥ 44×44 px.
8. A homepage é renderizada sem overflow horizontal em 375 px de largura.
9. A suíte de testes passa: `npm test` (Jest) e `npm test` no `pedi-ai-e2e`
   (Playwright, com projeto `chromium`).
10. Cobertura mínima de 80% mantida (`npm run test:coverage`).

## Riscos

- **Quebra visual em viewports não testados** — mitigado por testes
  E2E em 4+ viewports diferentes.
- **Hydration mismatch** do drawer — mitigado por inicializar `open=false`
  e usar `useEffect` para manipular DOM (mesmo padrão usado em `Modal`).
- **Regressão em SEO** — drawer é client-side, mas todos os links existem
  no DOM do server-side (em `hidden`), então crawlers continuam enxergando.

## Rollback

Reverter o PR é suficiente. A homepage volta a renderizar os links inline
como antes. Nenhuma migration de banco ou contrato de API envolvido.
