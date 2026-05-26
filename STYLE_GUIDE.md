# Style Guide - Pedi-AI App

## Design Tokens (CSS Variables)

### Cores (definidas em globals.css)
```css
--color-primary: #0D9488;        /* Teal - principal */
--color-primary-dark: #0F766E;
--color-primary-light: #14B8A6;
--color-secondary: #1E3A5F;      /* Navy - sidebar */
--color-secondary-dark: #152A45;
--color-secondary-light: #2A4A73;
--color-success: #059669;
--color-warning: #D97706;
--color-error: #DC2626;
--color-background: #F8FAFC;
--color-surface: #FFFFFF;
--color-text-primary: #0F172A;
--color-text-secondary: #475569;
--color-border: #E2E8F0;
```

## Regras de Estilização

### 1. Componentes UI
**Sempre usar:**
- `Button` component para botões
- `Input` component para campos de formulário
- `Badge` component para badges simples
- `StatusBadge` component para status
- `Card` component para cards
- `MainLayout` para páginas com sidebar

### 2. Cores
**Usar variáveis CSS:**
- `text-primary` → `text-text-primary`
- `text-secondary` → `text-text-secondary`
- `bg-primary` → `bg-primary`
- `bg-error` → `bg-error`
- Evitar cores hardcoded como `gray-100`, `gray-700`

### 3. Spacing
- Usar padding consistente: `p-4`, `px-4 py-3`
- Cards: `rounded-2xl` ou `rounded-xl` com `border border-border`
- Modais: `bg-surface rounded-2xl p-6 shadow-2xl`

### 4. Estados
- Loading: spinner com `animate-spin`
- Empty state: ícone + mensagem + CTA
- Errors: `bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg`

### 5. Ícones
- Usar `lucide-react`
- Tamanhos: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- Siempre usar `aria-hidden="true"` em ícones decorativos

---

## Issues Corrigidos

### 2026-05-25

1. **Badge.tsx** - Removido uso de `gray-100` e `gray-700` hardcoded
   - Agora usa `bg-background`, `text-text-secondary`, `border border-border`

2. **StatusBadge.tsx** - Removido uso de cores hardcoded
   - `fechado` status agora usa CSS variables

3. **usuarios/novo/page.tsx** - Estilização inconsistente
   - Adicionado `MainLayout`
   - Substituído inputs HTML por componente `Input`
   - Substituído botões HTML por componente `Button`
   - Adicionado ícone e header style consistente

4. **usuarios/[id]/page.tsx** - Estilização inconsistente
   - Adicionado `MainLayout`
   - Substituído inputs HTML por componente `Input`
   - Substituído botões HTML por componente `Button`
   - Adicionado loading state e ícone consistente

5. **UsuarioList.tsx** - Botões manuais
   - Substituído botões HTML por componente `Button`
   - Adicionado empty state com ícone
   - Estilo de tabela consistente com outras páginas

6. **Testes atualizados**
   - Badge.test.tsx - atualizado para novas classes CSS
   - StatusBadge.test.tsx - atualizado para novas classes CSS
