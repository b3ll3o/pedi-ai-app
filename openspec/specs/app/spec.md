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

[Pendente de especificação]

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
--color-primary: #0D9488
--color-secondary: #1E3A5F
--color-success: #059669
--color-warning: #D97706
--color-error: #DC2626
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
