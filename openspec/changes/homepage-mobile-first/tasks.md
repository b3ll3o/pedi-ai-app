# Tasks: Homepage Mobile-First

## 1. Componente MobileNav

- [x] 1.1. Criar `src/components/landing/MobileNav.tsx` (client component)
- [x] 1.2. Criar `src/components/landing/MobileNav.module.css` com
      estilos mobile-first
- [x] 1.3. Implementar hamburger trigger (44×44 px, ARIA correto)
- [x] 1.4. Implementar nav inline (visible >= 768px)
- [x] 1.5. Implementar drawer (visible < 768px, hidden no SSR)
- [x] 1.6. Implementar body scroll lock quando drawer abre
- [x] 1.7. Implementar handler de ESC + click-outside
- [x] 1.8. Implementar scroll suave para âncoras + fechar drawer

## 2. Integração na homepage

- [x] 2.1. Importar `MobileNav` em `src/app/page.tsx`
- [x] 2.2. Substituir o `<div className={styles.navLinks}>` pelos
      links inline pelo `<MobileNav />`
- [x] 2.3. Remover `display: none` do `.navLinks` (wrapper) para que
      o `MobileNav` controle sua própria visibilidade
- [x] 2.4. Esconder o link "Entrar" em viewports < 480px para liberar
      espaço para o hamburger + CTA principal

## 3. Mobile-first CSS

- [x] 3.1. Trocar `min-height: 100vh` por `100dvh` (com fallback 100vh)
      em `.page` e `.hero`
- [x] 3.2. Adicionar `padding-top: env(safe-area-inset-top)` em `.nav`
- [x] 3.3. Garantir que o hamburger tenha 44×44 px (touch target)

## 4. Configuração de testes

- [x] 4.1. Adicionar mock de CSS modules em
      `pedi-ai-app/__mocks__/styleMock.js`
- [x] 4.2. Atualizar `jest.config.js` com
      `'\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js'`

## 5. Testes unitários

- [x] 5.1. Criar `src/components/landing/__tests__/MobileNav.test.tsx`
- [x] 5.2. Testar ARIA: `aria-expanded`, `aria-controls`,
      `role="dialog"`, `aria-modal`
- [x] 5.3. Testar abrir/fechar (botão, ESC, backdrop)
- [x] 5.4. Testar body scroll lock
- [x] 5.5. Testar scroll suave de âncoras (`scrollIntoView` mockado)
- [x] 5.6. Testar foco de volta no hamburger ao fechar

## 6. Testes E2E (Playwright)

- [x] 6.1. Atualizar `pedi-ai-e2e/playwright.config.ts` com projetos por
      viewport (`mobile-375`, `mobile-390`, `tablet-768`, `laptop-1280`,
      `desktop-1536`)
- [x] 6.2. Criar `pedi-ai-e2e/tests/ui/responsivo/homepage.spec.ts`
- [x] 6.3. Testar hamburger visible < 768px, hidden >= 768px
- [x] 6.4. Testar nav links visible >= 768px, hidden < 768px
- [x] 6.5. Testar touch targets >= 44×44 px no mobile
- [x] 6.6. Testar abertura do drawer (clicar hamburger)
- [x] 6.7. Testar fechamento do drawer (ESC, backdrop, link)
- [x] 6.8. Testar scroll suave de âncoras
- [x] 6.9. Testar sem horizontal overflow em 375px

## 7. Documentação

- [x] 7.1. Criar `proposal.md` (resumo, motivação, escopo)
- [x] 7.2. Criar `design.md` (decisões, alternativas, layout)
- [x] 7.3. Criar `tasks.md` (este arquivo)
- [x] 7.4. Atualizar `openspec/specs/app/spec.md` com a seção
      "Página Inicial" (mobile-first, breakpoints, drawer, touch
      targets)
- [x] 7.5. Adicionar CHANGELOG (se existir) com a feature

## 8. Quality gate

- [x] 8.1. `npm test` — 151/151 passando (era 146, +5 testes MobileNav)
- [x] 8.2. `npm run lint` — 0 erros
- [x] 8.3. `npm run build` — completa com sucesso
- [x] 8.4. `npm run test:coverage` — MobileNav 95% stmts, 83% branches
      (acima dos 80%); geral 96.46% stmts
- [x] 8.5. `pedi-ai-e2e` suite passa — 32 passed, 22 skipped, 0 failed
      (9 cenários × 6 viewports = 54, com skip condicional)
- [ ] 8.6. Lighthouse mobile ≥ 90 (manual ou CI) — fora do escopo deste
      PR; medido em deploy
