# Pedi-AI - Cardápio Digital para Restaurantes

Sistema de cardápio digital com funcionamento offline, pedidos em tempo real e gerenciamento completo para restaurantes.

## Stack

- **Next.js 16** - Framework React com App Router
- **Tailwind CSS v4** - Estilização com design system tokens
- **TypeScript** - Tipagem estática
- **Lucide React** - Ícones

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Verificar código
```

## Estrutura

```
src/
├── app/                    # Rotas (App Router)
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Layout raiz
│   ├── dashboard/          # Dashboard
│   ├── pedidos/            # Lista de pedidos
│   ├── usuarios/           # Gestão de usuários
│   └── login/              # Página de login
├── components/
│   ├── ui/                 # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── MainLayout.tsx      # Layout principal com sidebar
│   └── Sidebar.tsx         # Navegação lateral
└── lib/
    └── api.ts              # Cliente API ( Placeholder)
```

## Design System

**Cores (via CSS variables):**
- Primary: `#0D9488` (teal)
- Secondary: `#1E3A5F` (navy)
- Success: `#059669`
- Warning: `#D97706`
- Error: `#DC2626`

## Desenvolvimento

### Estado atual

O projeto está em fase inicial com as seguintes páginas funcionais:

- `/` - Landing page com informações do produto
- `/dashboard` - Dashboard com métricas e pedidos
- `/pedidos` - Lista de pedidos
- `/usuarios` - Gestão de usuários
- `/login` - Página de login (placeholder)

### API

A API está configurada para conectar em `http://localhost:3001` via `NEXT_PUBLIC_API_URL`. Currently usando dados mockados/placeholder.