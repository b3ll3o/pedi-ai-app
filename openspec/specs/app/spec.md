# Spec - pedi-ai-app

## Visão Geral

Interface web do sistema Pedi-AI. Aplicação React com Next.js 16.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Lucide React (ícones)

## Domínio

### Página Inicial (Landing)

Rota: `/`. Server Component que renderiza marketing da landing page.

#### Estrutura

- Navbar fixa no topo (logo + navegação + CTAs)
- Hero section (badge, título, subtítulo, CTAs, stats)
- Social proof bar
- Seção "Como Funciona" (id: `how-it-works`)
- Seção "Funcionalidades" (id: `features`)
- Seção "Depoimentos"
- Seção "Preços" (id: `pricing`)
- Seção "FAQ" (id: `faq`)
- CTA final
- Footer

#### Navegação (mobile-first)

A navegação pública fica em `src/components/landing/MobileNav.tsx`.
Estratégia:

- **Mobile (< 768px):** hamburger button (44×44 px) visível; nav inline
  oculto. Tocar no hamburger abre um drawer (overlay + painel lateral)
  com todos os links (Funcionalidades, Como Funciona, Preços) + CTAs
  (Entrar, Começar Grátis).
- **Desktop (≥ 768px):** nav inline visível; hamburger oculto.

#### Acessibilidade da navegação

- Hamburger: `aria-controls`, `aria-expanded`, `aria-label` em pt-BR
- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- ESC fecha o drawer
- Click no backdrop fecha o drawer
- Body scroll travado enquanto drawer está aberto
- Foco volta para o hamburger ao fechar
- Todos os touch targets ≥ 44×44 px

#### iOS / safe areas

- `min-height: 100dvh` (com fallback `100vh`) na página e hero
- `padding-top: env(safe-area-inset-top)` na nav fixa

#### CTAs principais

- "Entrar" (`/login`) — oculto em viewports < 480px
- "Começar Grátis" (`/usuarios/novo`) — sempre visível
- "Começar Gratuitamente" (CTA do hero) — sempre visível

### Dashboard

[Pendente de especificação]

### Pedidos

[Pendente de especificação]

### Usuários

[Pendente de especificação]

### Login

[Pendente de especificação]

## Componentes UI

### Button

Propriedades:

- variant: primary | secondary | ghost | danger
- size: sm | md | lg
- disabled: boolean
- loading: boolean
- children: React.ReactNode

### Input

Propriedades:

- name: string
- label: string (opcional)
- type: text | email | password | number
- error: string (opcional)
- placeholder: string

### Card

Propriedades:

- children: React.ReactNode
- className: string (opcional)

### Badge

Propriedades:

- children: React.ReactNode
- className: string (opcional)

### StatusBadge

Propriedades:

- status: string

### Table

Propriedades:

- columns: Array<{ key: string, label: string }>
- data: Array<Record<string, any>>
- onRowClick: function (opcional)

### MainLayout

Componente de layout com sidebar. Usado em páginas de dashboard.

### Sidebar

Navegação lateral com links para Dashboard, Pedidos, Usuários.

## Design Tokens

Cores via CSS variables em globals.css:

```css
--color-primary: #0d9488 --color-secondary: #1e3a5f --color-success: #059669
  --color-warning: #d97706 --color-error: #dc2626;
```

## Estrutura de Diretórios

```
src/
├── app/                    # Rotas (App Router)
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Landing
│   ├── dashboard/          # Dashboard
│   ├── pedidos/            # Lista de pedidos
│   ├── usuarios/           # Gestão de usuários
│   │   ├── page.tsx        # Lista
│   │   ├── novo/page.tsx   # Criar
│   │   └── [id]/page.tsx   # Editar
│   └── login/              # Login
├── components/
│   ├── ui/                 # Componentes reutilizáveis
│   └── MainLayout.tsx, Sidebar.tsx
└── lib/
    └── api.ts              # Cliente API
```

## API

Conexão com API via `NEXT_PUBLIC_API_URL` (padrão: http://localhost:3001).

## Estados de Interface

- Loading: spinner com animate-spin
- Empty state: ícone + mensagem + CTA
- Error: bg-error/10 border border-error/20 text-error
