---
name: frontend-ui-engineering
description: Constrói interfaces de usuário no frontend Next.js 16. Use ao criar componente React, página, layout, ou hook. Use ao estilizar com Tailwind v4 ou implementar UX. Use antes de declarar feature de UI como pronta.
---

# Engenharia de UI no Frontend

## Visão Geral

Frontend bem feito combina **3 camadas**: UX clara, código manutenível, e performance mensurável. Esta skill implementa os padrões do PediAI (Next.js 16 + React 19 + Tailwind v4 + design tokens) e as verificações obrigatórias antes de merge.

## Quando Usar

- Ao criar componente React (mesmo "simples")
- Ao criar página ou rota
- Ao implementar hook customizado
- Ao estilizar com Tailwind
- Ao integrar com API
- Antes de declarar feature de UI como pronta
- Em revisão de PR de UI

## Princípios PediAI

### 1. Componentes primeiro

**SEMPRE use `src/components/ui/`** (Button, Input, Card, Badge, StatusBadge, Table). Nunca inputs/buttons HTML diretos.

Razão: design tokens, acessibilidade, e consistência já estão encapsulados.

```tsx
// ❌ Errado
<button className="bg-primary text-white px-4 py-2" onClick={...}>Salvar</button>

// ✅ Certo
<Button variant="primary" onClick={...}>Salvar</Button>
```

### 2. Design Tokens (Tailwind v4)

**SEMPRE use classes semânticas**, nunca cores hardcoded:

```tsx
// ❌ Errado
<div className="bg-teal-600 text-gray-100">

// ✅ Certo
<div className="bg-primary text-text-primary">
```

Tokens disponíveis (definidos em `src/app/globals.css`):
- `primary`, `primary-dark`, `primary-light` (teal #0D9488)
- `secondary`, `secondary-dark` (navy #1E3A5F)
- `success`, `warning`, `error`
- `background`, `surface`
- `text-primary`, `text-secondary`
- `border`

### 3. Server vs Client Components

Next.js 16 (App Router) tem 2 tipos:

| Tipo | Quando | Diretriz |
|------|--------|----------|
| **Server Component** (default) | Fetch de dados, acesso a DB, sem interatividade | Default — use sempre que possível |
| **Client Component** (`'use client'`) | `useState`, `useEffect`, event handlers, hooks de contexto | Só quando precisar de interatividade |

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetch(...);
  return <List data={data} />;
}

// Client Component (apenas se precisar de estado)
'use client';
export default function Form() {
  const [name, setName] = useState('');
  return <input value={name} onChange={...} />;
}
```

**Regra:** minimize `'use client'`. Quanto mais server, mais rápido e simples.

### 4. Camadas de Proteção de Rota

PediAI tem 3 camadas (ver `pedi-ai-app/CLAUDE.md`):

1. **`src/proxy.ts`** (server-side) — redireciona sem cookie
2. **`ProtectedRoute`** (client-side) — redireciona se `!isAuthenticated`
3. **`AdminOnly`** (visual) — esconde UI se não-ADMIN

**Use todas apropriadamente:**

| Caso | Camada |
|------|--------|
| Toda a página autenticada | `ProtectedRoute` |
| Página só para ADMIN | `ProtectedRoute requiredRole="ADMIN"` + `AdminOnly` no Sidebar |
| Botão de admin dentro de página | `AdminOnly` em volta |
| API call que requer ADMIN | (sério, é RBAC no backend) |

### 5. Cliente API

**NUNCA use `fetch` direto.** Use `src/lib/api.ts` que tem auto-refresh em 401.

```tsx
// ❌ Errado
const res = await fetch('/api/restaurants', { headers: { Authorization: `Bearer ${token}` } });

// ✅ Certo
const restaurantes = await api.restaurantes.listarTodos();
```

O auto-refresh é parte do contrato. Quebrar isso = tokens não renovam = logout inesperado.

### 6. Roteamento Protegido (Next.js 16)

**`src/proxy.ts` substituiu `middleware.ts`** (Next.js 16). Matcher inclui `/dashboard/:path*` e `/restaurantes/:path*`.

**Antes de criar nova rota protegida, atualize o proxy.**

## Processo de Implementação de UI

### 1. SPEC primeiro

Antes de criar componente:
- Volte para `spec-driven-development`
- Defina UX (não apenas o que mostra, mas como interage)
- Liste estados: loading, error, empty, success

### 2. Componente base

- Identifique se já existe em `src/components/ui/`
- Se não, crie com:
  - Props tipadas (interface, não type alias para export)
  - Estados de loading/error/empty
  - Acessibilidade (aria-label, role, keyboard nav)
  - Responsividade (mobile-first)

### 3. Estilização

- Use design tokens, não cores hardcoded
- Mobile-first (base, depois `sm:`, `md:`, `lg:`)
- Estados: `hover`, `focus`, `active`, `disabled`
- Variantes via prop (ex: `variant="primary" | "secondary" | "danger"`)

### 4. Integração

- Server Component para fetch (default)
- Client Component se precisar de estado
- Use `api.*` para chamadas HTTP
- Trate loading (skeleton/spinner) e error (toast/mensagem)

### 5. Teste

- Unitário: Jest + Testing Library (em `__tests__/` ao lado)
- E2E: Playwright (em `pedi-ai-e2e/`)
- Manual: DevTools (ver skill `browser-testing-with-devtools`)

### 6. Validação pré-PR

- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95
- [ ] Mobile testado (375px, 768px, 1024px)
- [ ] Keyboard navigation funciona (Tab, Enter, Esc)
- [ ] Screen reader friendly (aria-labels, roles)
- [ ] Loading e error states visíveis
- [ ] Sem `console.log` ou `console.error` em prod
- [ ] Sem cor hardcoded
- [ ] Sem `fetch` direto
- [ ] Coverage ≥ 80% mantida

## Acessibilidade (A11y)

PediAI busca **WCAG AA** no mínimo:

| Critério | Implementação |
|----------|---------------|
| Contraste | ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande) |
| Foco visível | `outline` ou `ring` em todos os focusables |
| Labels | `<label htmlFor>` em todo input |
| Roles | `role="button"` em div clicável, `aria-label` em ícone |
| Tab order | Lógico (sem `tabindex > 0`) |
| Esc fecha | Modal, dropdown, menu |
| Alt text | Toda `<img>` com `alt` descritivo |

Use `accessibility-checklist.md` em `.claude/references/`.

## Performance

| Prática | Quando |
|---------|--------|
| `next/image` | Toda imagem (lazy, otimização automática) |
| `next/font` | Fontes customizadas (sem FOUT) |
| `React.lazy` + `Suspense` | Componentes pesados (gráficos, editor) |
| `useMemo`/`useCallback` | Cálculos pesados em hot path (após medir) |
| Virtual list (`react-window`) | Lista > 50 itens |
| Server Component | Default — evita JS no client |

**Não otimize prematuramente.** Meça com Lighthouse antes.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Botão HTML é mais simples" | Componente encapsula design, a11y, e estado. Repetir é débito. |
| "Cor hardcoded é mais rápida" | Hardcoded = inconsistência. Token = 1 lugar para mudar tema. |
| "Fetch direto resolve" | Fetch direto quebra o auto-refresh. Use `api.*`. |
| "Não precisa testar UI" | UI é o que usuário vê. Bug em UI = bug para usuário. |
| "Server Component é chato" | Server Component é mais rápido e simples. Client é a exceção. |
| "Sem tempo para a11y" | A11y retrofit é caro. Inclua desde o início. |
| "Mobile depois" | Mobile-first custa 0. Mobile depois custa refactor. |

## Red Flags

- `<button>` HTML direto
- Cor hardcoded (`bg-teal-600`, `text-gray-900`)
- `fetch` direto sem `api.*`
- `'use client'` sem necessidade
- Sem estado de loading
- Sem estado de error
- Sem tratamento de empty state
- Sem `aria-label` em botão só com ícone
- Imagem sem `alt`
- Sem label em input
- Console.log em produção
- Sem teste de componente

## Verificação

- [ ] Componente de `src/components/ui/` reutilizado (ou novo criado lá)
- [ ] Tokens semânticos usados (não cores hardcoded)
- [ ] Server Component por default, `'use client'` só se necessário
- [ ] `api.*` para HTTP (não `fetch` direto)
- [ ] Estados loading/error/empty implementados
- [ ] Acessibilidade: labels, roles, focus, contraste
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Teste Jest + Testing Library
- [ ] Lighthouse ≥ 90 (Performance), ≥ 95 (A11y)
- [ ] Coverage ≥ 80% mantida
- [ ] Sem `console.log` em prod
- [ ] Sem cor hardcoded, sem fetch direto
