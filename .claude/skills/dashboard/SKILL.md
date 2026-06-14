---
name: dashboard
description: Domínio de rotas autenticadas em `/dashboard/*` — AuthenticatedLayout com Sidebar, navegação mobile (bottom nav, não hamburger), redirect 301 das rotas antigas, integração com `lib/page-meta.ts` para resolver adminOnly a partir do pathname. Carregue ao criar página em `/dashboard`, mexer em AuthenticatedLayout/Sidebar, ou alterar a estrutura de rotas autenticadas.
type: domain
status: implemented
domain: dashboard
---

# Dashboard (dashboard)

## Visão Geral

Domínio que agrupa todas as rotas autenticadas sob o prefixo `/dashboard/`, com layout próprio (`AuthenticatedLayout` envolvendo Sidebar + main) e comportamento responsivo (bottom nav em mobile, sidebar fixa em desktop). Substituiu a estrutura legada `(authenticated)/` e o antigo `DashboardLayout` (agora `AuthenticatedLayout`).

## Quando Usar

- Criar nova página em `/dashboard/*`
- Adicionar item à Sidebar
- Alterar AuthenticatedLayout ou Sidebar
- Modificar breakpoints / comportamento responsivo
- Adicionar novo redirect 301 de rota legada
- Marcar uma rota como admin-only em `lib/page-meta.ts`

## Modelo de Domínio

### Estrutura de Rotas

```
src/app/
└── dashboard/                          # Grupo de rotas autenticadas
    ├── layout.tsx                      # Wrap com <AuthenticatedLayout>
    ├── page.tsx                        # Redirect → /dashboard/usuarios
    ├── usuarios/
    │   ├── page.tsx                    # /dashboard/usuarios
    │   ├── [id]/page.tsx               # /dashboard/usuarios/[id]
    │   └── novo/page.tsx               # /dashboard/usuarios/novo
    ├── perfis/
    │   ├── page.tsx                    # /dashboard/perfis
    │   └── [id]/page.tsx               # /dashboard/perfis/[id]
    └── permissoes/
        ├── page.tsx                    # /dashboard/permissoes
        └── [id]/page.tsx               # /dashboard/permissoes/[id]
```

`/restaurantes/*` também usa `<AuthenticatedLayout>` no seu `layout.tsx` (exceção histórica fora de `/dashboard`, mas com mesma proteção).

### Componentes

**`AuthenticatedLayout`** (`src/components/auth/AuthenticatedLayout.tsx`):
- Wrapper com Sidebar + main
- Faz checagem de auth (cliente) **e** checa `adminOnly` resolvido a partir do pathname
- Resolve a flag `adminOnly` chamando `isAdminOnlyPath(pathname)` de `lib/page-meta.ts`
- Se `!isAuthenticated` → `router.push('/login')`
- Se adminOnly e user não é ADMIN → `router.push(ADMIN_HOME)` (= `/dashboard`)
- Mostra spinner com `role="status"` enquanto `isLoading`

**`Sidebar`** (`src/components/dashboard/Sidebar.tsx`):
- **Mobile:** bottom nav fixa com 4-5 itens (Dashboard, Restaurantes, + menu admin via AdminOnly, Sair)
- **Desktop:** sidebar fixa à esquerda, mesma estrutura
- Avatar do usuário logado + botão logout
- Item ativo: `aria-current="page"` + bg-primary

### Exceção Histórica: `/restaurantes`

A rota `/restaurantes` está **fora** de `/dashboard` por decisão histórica, mas é protegida pelo `proxy.ts` com matcher `/restaurantes/:path*` e usa `<AuthenticatedLayout>` no seu próprio `layout.tsx`. **Não migrar sem combinar** — gera redirect chain.

### `lib/page-meta.ts`

Resolve metadata (título, breadcrumb, ícone, `adminOnly`) a partir do pathname:

```typescript
const PAGE_META: Array<[string, PageMeta]> = [
  ['/dashboard/usuarios', { title: 'Usuários', adminOnly: true, ... }],
  ['/dashboard/perfis',   { title: 'Perfis', adminOnly: true, ... }],
  ['/dashboard/permissoes', { title: 'Permissões', adminOnly: true, ... }],
  ['/restaurantes',       { title: 'Restaurantes', adminOnly: false, ... }],
  ['/dashboard',          { title: 'Dashboard', adminOnly: false, ... }],
];

export function isAdminOnlyPath(pathname: string): boolean { ... }
export function getPageMeta(pathname: string): PageMeta { ... }
```

**Ordem importa:** prefixos mais específicos vêm antes dos genéricos. Adicionar nova rota admin-only: inserir antes de `/dashboard`.

## Requisitos Funcionais (RF)

- RF-01: `/dashboard` acessível apenas para autenticados
- RF-02: Sidebar funcional em mobile (bottom nav) e desktop (fixa à esquerda)
- RF-03: Navegação entre páginas mantém estado de auth
- RF-04: Logout via Sidebar limpa sessão (storage + cookies via server route)
- RF-05: Rotas antigas (`/usuarios`, `/perfis`, `/permissoes`) redirecionam 301 para `/dashboard/*`
- RF-06: Avatar e nome do usuário na Sidebar (desktop)
- RF-07: Rotas admin-only (resolvidas via `isAdminOnlyPath`) redirecionam user não-ADMIN para `/dashboard`

## Requisitos Não-Funcionais (RNF)

- RNF-01: Breakpoints — Mobile < 1024px (Tailwind `lg:`), Desktop ≥ 1024px
- RNF-02: Mobile — bottom nav fixa com `safe-area-bottom` (iOS); desktop sidebar `lg:w-64`
- RNF-03: Item ativo com `aria-current="page"` (anunciável por screen reader)
- RNF-04: Páginas testadas em 3 viewports: 375px, 768px, 1280px
- RNF-05: Acessibilidade — `aria-label` no botão de logout (só ícone), `aria-hidden` nos ícones decorativos

## Redirecionamentos

| Origem (antiga) | Destino (nova) | Tipo |
| --- | --- | --- |
| `/usuarios` | `/dashboard/usuarios` | 301 |
| `/usuarios/[id]` | `/dashboard/usuarios/[id]` | 301 |
| `/perfis` | `/dashboard/perfis` | 301 |
| `/perfis/[id]` | `/dashboard/perfis/[id]` | 301 |
| `/permissoes` | `/dashboard/permissoes` | 301 |
| `/permissoes/[id]` | `/dashboard/permissoes/[id]` | 301 |

## Critérios de Aceitação

- [x] Rotas antigas redirecionam para novas (301)
- [x] `/dashboard` acessível só para autenticados
- [x] Sidebar funcional em mobile (bottom nav) e desktop (fixa)
- [x] Navegação mantém estado de auth
- [x] Páginas testadas em 375px, 768px, 1280px
- [x] AdminOnly esconde menu admin para não-ADMIN
- [x] AuthenticatedLayout checa adminOnly via `isAdminOnlyPath`

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Sidebar sempre visível é mais simples" | Em mobile consome tela inteira. Bottom nav é o padrão de mercado atual (Instagram, Twitter, etc). |
| "Não precisa de 301 — já ninguém usa rota antiga" | Sem redirect, links externos e SEO quebram. Manter. |
| "Pode usar (authenticated)/ route group de novo" | Group route não afeta URL. Para URL visível com prefixo, é diretório. |
| "Reaproveitar layout raiz é mais simples" | Layout raiz não tem Sidebar. Cada grupo pode ter seu próprio. |
| "Adicionar item à Sidebar é trivial" | Se mudar o menu, tem que atualizar matcher do `proxy.ts` se criar nova rota. |
| "Marcar admin-only com `requiredRole` no JSX" | AuthenticatedLayout resolve via `isAdminOnlyPath(pathname)` (lê de `PAGE_META`). Mais consistente, evita repetição. |
| "Hamburger em mobile é mais clean" | Bottom nav com até 5 itens é o padrão de mercado 2025+ (Tailwind/Next mobile-first). |

## Red Flags

- Sidebar com `position: fixed` sem gerenciar scroll do body em mobile
- Link interno usando `<a>` em vez de `<Link>` do Next.js
- Adicionar nova rota `/dashboard/nova` sem atualizar matcher do `proxy.ts`
- Esquecer de testar em 375px (iPhone SE)
- 301 redirect ausente em rota antiga após renomear
- Adicionar rota admin-only direto no `AuthenticatedLayout` (em vez de em `PAGE_META`)
- `requiredRole` hardcoded no JSX (usar `PAGE_META` + `isAdminOnlyPath`)
- Bottom nav sem `safe-area-bottom` (iOS notch/home indicator)
- Item de menu ativo sem `aria-current="page"`

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] E2E (Playwright): login → `/dashboard` carrega
- [ ] E2E: navegar para cada item da Sidebar → 2xx
- [ ] E2E: viewport 375px → bottom nav visível, sidebar desktop oculta
- [ ] E2E: viewport 1280px → sidebar fixa visível, bottom nav oculto
- [ ] E2E: user não-ADMIN acessando `/dashboard/usuarios` → redirect para `/dashboard`
- [ ] E2E: `/usuarios` (antiga) → 301 para `/dashboard/usuarios`
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Navegação por teclado (Tab, Enter, Esc) testada
