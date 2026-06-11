---
name: dashboard
description: Domínio de rotas autenticadas em `/dashboard/*` — reorganização de rotas, DashboardLayout com Sidebar, breakpoints responsivos, redirect 301 das rotas antigas. Carregue ao criar página em `/dashboard`, mexer em Sidebar/DashboardLayout, ou alterar a estrutura de rotas autenticadas.
type: domain
status: implemented
domain: dashboard
---

# Dashboard (dashboard)

## Visão Geral

Domínio que agrupa todas as rotas autenticadas sob o prefixo `/dashboard/`, com layout próprio (Sidebar + Header) e comportamento responsivo (hamburger em mobile, fixa em desktop). Substituiu a estrutura legada `(authenticated)/`.

## Quando Usar

- Criar nova página em `/dashboard/*`
- Adicionar item à Sidebar
- Alterar DashboardLayout ou Sidebar
- Modificar breakpoints / comportamento responsivo
- Adicionar novo redirect 301 de rota legada

## Modelo de Domínio

### Estrutura de Rotas

```
src/app/
└── dashboard/                          # Grupo de rotas autenticadas
    ├── layout.tsx                      # Layout com sidebar
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

### Componentes

**`DashboardLayout`** (`src/components/dashboard/DashboardLayout.tsx`):
- Wrapper com Header + Sidebar
- Recebe `children` e `title`
- Sidebar fixa à esquerda
- Header com título e ações

**`Sidebar`** (`src/components/dashboard/Sidebar.tsx`):
- Itens: Dashboard (Home), Usuários, Perfis, Permissões
- Avatar do usuário logado
- Botão de logout
- Responsivo: hamburger em mobile (overlay), fixa em desktop

### Exceção Histórica: `/restaurantes`

A rota `/restaurantes` está **fora** de `/dashboard` por decisão histórica, mas é protegida pelo `proxy.ts` com matcher `/restaurantes/:path*`. **Não migrar sem combinar** — gera redirect chain.

## Requisitos Funcionais (RF)

- RF-01: `/dashboard` acessível apenas para autenticados
- RF-02: Sidebar funcional em mobile (hamburger + overlay) e desktop (fixa)
- RF-03: Navegação entre páginas mantém estado de auth
- RF-04: Logout via Sidebar limpa sessão
- RF-05: Rotas antigas (`/usuarios`, `/perfis`, `/permissoes`) redirecionam 301 para `/dashboard/*`
- RF-06: Avatar e nome do usuário na Sidebar

## Requisitos Não-Funcionais (RNF)

- RNF-01: Breakpoints — Mobile < 768px, Tablet 768-1024px, Desktop > 1024px
- RNF-02: Mobile — Sidebar escondida por padrão, hamburger no header, overlay com backdrop
- RNF-03: Click fora do overlay fecha Sidebar
- RNF-04: Foco gerenciado (foco volta ao hamburger ao fechar)
- RNF-05: Páginas testadas em 3 viewports: 375px, 768px, 1280px
- RNF-06: Acessibilidade — `aria-expanded`, `aria-controls`, ESC para fechar

## Redirecionamentos

| Origem (antiga) | Destino (nova) | Tipo |
|-----------------|----------------|------|
| `/usuarios` | `/dashboard/usuarios` | 301 |
| `/usuarios/[id]` | `/dashboard/usuarios/[id]` | 301 |
| `/perfis` | `/dashboard/perfis` | 301 |
| `/perfis/[id]` | `/dashboard/perfis/[id]` | 301 |
| `/permissoes` | `/dashboard/permissoes` | 301 |
| `/permissoes/[id]` | `/dashboard/permissoes/[id]` | 301 |

## Critérios de Aceitação

- [x] Rotas antigas redirecionam para novas (301)
- [x] `/dashboard` acessível só para autenticados
- [x] Sidebar funcional em mobile e desktop
- [x] Navegação mantém estado de auth
- [x] Páginas testadas em 375px, 768px, 1280px

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Sidebar sempre visível é mais simples" | Em mobile consome tela inteira. Hamburger é padrão de mercado. |
| "Não precisa de 301 — já ninguém usa rota antiga" | Sem redirect, links externos e SEO quebram. Manter. |
| "Pode usar (authenticated)/ route group de novo" | Group route não afeta URL. Para URL visível com prefixo, é diretório. |
| "Reaproveitar layout raiz é mais simples" | Layout raiz não tem Sidebar. Cada grupo pode ter seu próprio. |
| "Adicionar item à Sidebar é trivial" | Se mudar o menu, tem que atualizar matcher do `proxy.ts` se criar nova rota. |
| "Mobile pode abrir a Sidebar por default" | UX ruim. Sempre escondida em mobile, abre por ação. |

## Red Flags

- Sidebar com `position: fixed` sem gerenciar scroll do body
- Hamburger sem `aria-expanded` ou `aria-controls`
- Foco não volta ao hamburger ao fechar overlay
- Breakpoints hardcoded (`@media (max-width: 767px)`) em vez de variáveis
- Link interno usando `<a>` em vez de `<Link>` do Next.js
- Adicionar nova rota `/dashboard/nova` sem atualizar matcher do `proxy.ts`
- Esquecer de testar em 375px (iPhone SE)
- 301 redirect ausente em rota antiga após renomear

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] E2E (Playwright): login → `/dashboard` carrega
- [ ] E2E: navegar para cada item da Sidebar → 2xx
- [ ] E2E: viewport 375px → hamburger visível, Sidebar escondida
- [ ] E2E: viewport 1280px → Sidebar fixa visível, hamburger oculto
- [ ] E2E: `/usuarios` (antiga) → 301 para `/dashboard/usuarios`
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Navegação por teclado (Tab, Enter, Esc) testada
