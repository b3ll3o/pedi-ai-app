# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in `pedi-ai-app`.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Client-side fetch

## Estrutura de Diretórios

```
src/
├── app/              # Rotas (App Router)
├── components/
│   ├── ui/           # Button, Input, Card, Badge, StatusBadge, Table
│   └── MainLayout.tsx, Sidebar.tsx
└── lib/api.ts        # Cliente API
```

**Design Tokens (CSS):**
- Primary: `#0D9488` (teal)
- Secondary: `#1E3A5F` (navy)
- Success: `#059669`
- Warning: `#D97706`
- Error: `#DC2626`

**UI Components:** Usar componentes em `components/ui/` — nunca inputs HTML diretos

---

## Comandos

```bash
npm run dev           # Next.js dev
npm run build         # Build produção
npm run lint          # ESLint
npm test              # Jest
npm run test:coverage # Com cobertura
```

---

## OpenSpec-SDD Workflow

### Classificação por Impacto

| Tipo       | Escopo                                | Artefatos necessários                                |
|------------|---------------------------------------|------------------------------------------------------|
| `minor`    | Bug fix, refactor interno             | spec.md atualizada                                   |
| `standard` | Nova feature, mudança moderada        | proposal + spec + tasks                              |
| `major`    | Mudança arquitetural, multi-pacote    | proposal + design + tasks + review formal            |

### Estados de Spec

| Estado     | Descrição                                                              |
|------------|-----------------------------------------------------------------------|
| `draft`    | Em elaboração                                                          |
| `review`   | Em revisão (stakeholders, team)                                        |
| `approved` | Aprovada, pronta para implementação                                     |
| `implemented` | Código shipped e testado                                         |
| `archived` | Movida para archive/ (não mais ativa)                                  |

### Fluxo Completo

```
1. Criar spec (draft)
2. Classificar (minor/standard/major)
3. Revisar (review → approved)
4. Implementar (tasks.md, código)
5. Validar (testes, coverage 80%+)
6. Vincular (PR/commit → spec)
7. Arquivar (move to archive/YYYY-MM/)
```

### Regras Obrigatórias

1. **Spec first** — ANTES de escrever código, a especificação DEVE existir em `openspec/specs/`
2. **Classificação** — Toda spec DEVE ter tipo (minor/standard/major) e estado definido
3. **Proposta** — Mudanças `standard` e `major` DEVEM ter proposta em `openspec/changes/<feature>/proposal.md`
4. **Design** — Mudanças `major` DEVEM ter design documentado em `openspec/changes/<feature>/design.md`
5. **Tasks** — Implementação QUEBRADA em tarefas em `openspec/changes/<feature>/tasks.md`
6. **Idioma** — TODO código e documentação em **Português Brasileiro (pt-BR)**
7. **Testes** — Cobertura mínima 80%
8. **Aceitação** — Implementação SÓ pode começar APÓS spec ter estado `approved`
9. **Arquivamento** — Changes concluídas DEVEM ser movidas para `openspec/archive/<YYYY-MM>/` com `_summary.md`

### Checklist de Quality Gate

Para uma spec ser considerada válida (estado `approved`), DEVE conter:

- [ ] **Objetivo**: O que resolve, para quem
- [ ] **Contexto**: Situação atual, problema
- [ ] **Requisitos**: RF e RNF numerados (RF-01, RF-02...)
- [ ] **Critérios de aceitação**: Mensuráveis e testáveis
- [ ] **Decisões de design**: Links para design.md se aplicável
- [ ] **Estratégia de testes**: Como validar que está pronto
- [ ] **Tasks vinculadas**: tasks.md criada e linkada
- [ ] **Revisão aprovada**: Pelo menos 1 reviewer sign-off

### Template de Spec

```markdown
---
status: draft|review|approved|implemented|archived
type: minor|standard|major
created: YYYY-MM-DD
updated: YYYY-MM-DD
linked_prs: [PR #...]
---

# <Nome da Spec>

## Objetivo
O que resolve, para quem.

## Contexto
Situação atual, problema.

## Requisitos Funcionais (RF)
- RF-01: ...
- RF-02: ...

## Requisitos Não-Funcionais (RNF)
- RNF-01: ...

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

## Decisões de Design
- [Design](design.md) - se aplicável

## Estratégia de Testes
- Unitários: ...
- E2E: ...

## Tasks
- [Tasks](tasks.md)
```

### Traceability

Commits e PRs DEVEM referenciar a spec que implementam:

```
commit: <hash>
spec: openspec/specs/<domain>/spec.md
```

No PR description:
```
## Spec
- Implementa: openspec/specs/<domain>/spec.md
```

### Automação CI

```
- PR não pode ser mergeado se código muda domínio X
  sem que a spec correspondente tenha status "approved"
- Commits DEVEM referenciar spec (commit msg ou PR description)
- Coverage mínimo 80% enforced no CI
```

### Estrutura OpenSpec

```
openspec/
├── config.yaml          # Configuração do projeto
├── specs/               # Especificações de domínio
│   └── <domain>/
│       └── spec.md
└── changes/             # Propostas de mudança
    └── <feature>/
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/
└── archive/             # Changes concluídas (arquivadas por mês)
    └── <YYYY-MM>/
        └── _summary.md  # Liga specs e decisions principais
```

---

## Padrões de Código

- Usar App Router (`src/app/`)
- Server Components por padrão; Client Components só quando necessário
- Todos componentes de UI em `components/ui/`
- Design tokens via CSS custom properties
- Responsividade mobile-first

---

## Testes

- **Cobertura mínima:** 80%
- Testes DEVEM ser escritos ANTES ou DURANTE a implementação
- Code review DEVE verificar conformidade com spec
- Testar fluxos de usuário completos, não só componentes isolados