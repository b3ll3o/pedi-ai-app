# SPEC.md - Dashboard

## 1. Visão Geral

- **Domínio:** dashboard
- **Tipo:** reorganização de rotas
- **Resumo:** Mover todas as rotas autenticadas de `(authenticated)/` para `/dashboard/` criando uma estrutura de URLs consistente com o prefixo `/dashboard`
- **Motivação:** Organizar URLs autenticadas sob prefixo `/dashboard`, melhor navegação e alinhamento com convenções de dashboards admin

---

## 2. Estrutura de Rotas

### Antes (atual)
```
/usuarios
/usuarios/[id]
/perfis
/perfis/[id]
/permissoes
/permissoes/[id]
```

### Depois (novo)
```
/dashboard
/dashboard/usuarios
/dashboard/usuarios/[id]
/dashboard/perfis
/dashboard/perfis/[id]
/dashboard/permissoes
/dashboard/permissoes/[id]
```

---

## 3. Arquitetura

### 3.1 Nova Estrutura de Diretórios

```
src/app/
├── (authenticated)/           # REMOVIDO
├── dashboard/                 # NOVO - Grupo de rotas autenticadas
│   ├── layout.tsx            # Layout com sidebar
│   ├── page.tsx              # Redirect to /dashboard/usuarios
│   ├── usuarios/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── perfis/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── permissoes/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
└── login/
    └── page.tsx
```

### 3.2 Componentes de Layout

**DashboardLayout** (`src/components/dashboard/DashboardLayout.tsx`):
- Wrapper com Header + Sidebar
- Recebe `children` e `title`
- Sidebar fixa à esquerda com navegação
- Header com título da página e ações

**Sidebar** (`src/components/dashboard/Sidebar.tsx`):
- Navegação lateral com ícones
- Itens: Dashboard (Home), Usuários, Perfis, Permissões
- Avatar do usuário logado
- Botão de logout
- Responsivo: hamburger em mobile

---

## 4. Navegação e Redirecionamento

| Situação | Comportamento |
|----------|--------------|
| Acesso a `/usuarios` (antigo) | 301 redirect para `/dashboard/usuarios` |
| Login com sucesso | Redirect para `/dashboard` |
| Logout | Redirect para `/login` |
| Acesso a rota autenticada sem auth | Redirect para `/login` |

---

## 5. Responsividade

### Breakpoints
- **Mobile:** < 768px (hamburger menu, sidebar overlay)
- **Tablet:** 768px - 1024px (sidebar colapsável)
- **Desktop:** > 1024px (sidebar fixa)

### Comportamento Mobile
- Sidebar escondida por padrão
- Botão hamburger no header
- Sidebar abre como overlay com backdrop
- Click fora fecha sidebar

---

## 6. Critérios de Aceitação

- [ ] Rotas antigas redirecionam para novas (301)
- [ ] `/dashboard` é acessível apenas para usuários autenticados
- [ ] Sidebar funciona em mobile (hamburger + overlay)
- [ ] Sidebar funciona em desktop (fixa)
- [ ] Navegação entre páginas mantém estado de auth
- [ ] Todas as páginas testadas em 3 tamanhos: 375px, 768px, 1280px

---

## 7. Tarefas

1. Criar `src/app/dashboard/` com estrutura de diretórios
2. Mover componentes de `(authenticated)/` para `dashboard/`
3. Criar `DashboardLayout` com Sidebar integrada
4. Criar `src/components/dashboard/Sidebar.tsx`
5. Criar redirect 301 das rotas antigas para novas
6. Atualizar `auth-context.tsx` para redirect para `/dashboard`
7. Atualizar `Sidebar.tsx` links para novas rotas
8. Testar responsividade com Playwright (375px, 768px, 1280px)

---

## 8. Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/app/(authenticated)/layout.tsx` | DELETE |
| `src/app/(authenticated)/usuarios/page.tsx` | MOVE para `dashboard/` |
| `src/app/(authenticated)/usuarios/[id]/page.tsx` | MOVE para `dashboard/` |
| `src/app/(authenticated)/perfis/page.tsx` | MOVE para `dashboard/` |
| `src/app/(authenticated)/perfis/[id]/page.tsx` | MOVE para `dashboard/` |
| `src/app/(authenticated)/permissoes/page.tsx` | MOVE para `dashboard/` |
| `src/app/(authenticated)/permissoes/[id]/page.tsx` | MOVE para `dashboard/` |
| `src/lib/auth-context.tsx` | UPDATE redirect para `/dashboard` |
| `src/components/Sidebar.tsx` | UPDATE links para `/dashboard/*` |
| `src/components/auth/ProtectedRoute.tsx` | UPDATE paths |
