# Pedi-AI App

Aplicação Frontend do sistema PediAI - Cardápio Digital para Restaurantes.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Client-side fetch
- **State:** React Context (Auth)

## Comandos

```bash
npm run dev           # Next.js dev (localhost:3000)
npm run build         # Build produção
npm run lint          # ESLint
npm test              # Jest
npm run test:coverage # Com cobertura
```

## Visão Geral

Interface web para gerenciamento de restaurantes, pedidos, usuários e cardápios. autenticação JWT com refresh token automático.

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login de usuário |
| `/dashboard` | Dashboard principal |
| `/usuarios` | Gerenciamento de usuários |
| `/perfis` | Gerenciamento de perfis |
| `/permissoes` | Gerenciamento de permissões |
| `/restaurantes` | Listagem de restaurantes |
| `/restaurantes/novo` | Criar restaurante |
| `/restaurantes/[id]` | Editar restaurante |

## Arquitetura

```
src/
├── app/                    # App Router (rotas)
│   ├── login/              # Página de login
│   ├── dashboard/          # Dashboard
│   ├── usuarios/           # Gestão de usuários
│   ├── perfis/             # Gestão de perfis
│   ├── permissoes/         # Gestão de permissões
│   ├── restaurantes/       # Gestão de restaurantes
│   └── layout.tsx          # Layout raiz
├── components/
│   ├── ui/                 # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Table.tsx
│   │   └── ...
│   ├── auth/               # ProtectedRoute, AuthProvider
│   ├── dashboard/          # Sidebar, DashboardLayout
│   └── MainLayout.tsx      # Layout principal
├── lib/
│   ├── api.ts              # Cliente API REST
│   ├── auth-context.tsx     # Context de autenticação
│   └── utils.ts            # Utilitários
└── features/               # Domínios DDD (novos)
    └── <dominio>/
        ├── domain/         # Types e hooks
        ├── application/   # Lógica de aplicação
        ├── infrastructure/ # Chamadas à API
        └── presentation/  # UI do domínio
```

## Design Tokens

```css
:root {
  --color-primary: #0D9488;     /* teal */
  --color-secondary: #1E3A5F;  /* navy */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
}
```

## Autenticação

O sistema usa JWT com refresh token:

- Access token armazenado em `localStorage` (`pedi_auth_access_token`)
- Refresh token em `pedi_auth_refresh_token`
- Context `AuthProvider` gerencia estado de autenticação
- `ProtectedRoute` redireciona para `/login` se não autenticado

## Integração com API

A API está configurada via `NEXT_PUBLIC_API_URL`:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

## OpenSpec-SDD

Este projeto segue a metodologia **OpenSpec / Specification-Driven Development**:

- Specs em `openspec/specs/<dominio>/spec.md`
- Changes em `openspec/changes/<feature>/`
- Workflow: draft → review → approved → implemented → archived

## Testes E2E

Os testes E2E estão no projeto `pedi-ai-e2e/`:

```bash
cd ../pedi-ai-e2e
npm test                   # Todos os testes
npm run test:ui            # Apenas UI
```

## Deploy

O deploy usa standalone output do Next.js:

```bash
npm run build
# Resultado: .next/standalone/server.js
```

VPS em `187.77.204.108` com SSL ECC via Let's Encrypt.