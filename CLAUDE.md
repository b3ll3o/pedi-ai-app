# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in `pedi-ai-app`.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Client-side fetch

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

## Arquitetura DDD (Domain-Driven Design)

Este projeto utiliza **Domain-Driven Design** orientado a features com Next.js App Router. Cada domínio (bounded context) é uma feature isolada.

### Estrutura por Feature/Domínio

```
src/
└── features/                      # Features organizadas por domínio
    └── <dominio>/                 # Bounded Context (ex: autenticacao, cardapio)
        ├── domain/               # Modelo de domínio do frontend
        │   ├── entities/         # Entidades do domínio (tipos/classes)
        │   ├── types/            # Types e interfaces do domínio
        │   ├── hooks/            # Hooks de domínio (useUsuario, etc)
        │   └── services/         # Serviços de domínio (validação, etc)
        ├── application/          # Lógica de aplicação
        │   ├── hooks/            # Hooks de aplicação (useCriarPedido, etc)
        │   └── services/         # Serviços de aplicação
        ├── infrastructure/       # Implementações externas
        │   └── api/              # Chamadas à API (fetch, mutations)
        └── presentation/         # UI do domínio
            ├── components/       # Componentes específicos do domínio
            └── pages/            # Pages do domínio (se não usar app/)
```

### Estrutura Global

```
src/
├── features/               # Features DDD (autenticacao, cardapio, pedido, usuario)
├── components/
│   └── ui/                 # Componentes compartilhados (Button, Input, Card, Badge)
├── lib/                    # Utilitários compartilhados (api client, utils)
├── hooks/                  # Hooks globais
└── app/                    # App Router (layouts, pages, API routes)
```

### Domínios Identificados

| Domínio | Descrição | Feature Folder |
|---------|-----------|----------------|
| `autenticacao` | Autenticação e autorização | `features/autenticacao/` |
| `cardapio` | Cardápio e itens | `features/cardapio/` |
| `pedido` | Pedidos | `features/pedido/` |
| `usuario` | Usuários do sistema | `features/usuario/` |

### Terminologia DDD (Frontend)

| Conceito | Descrição | Implementação |
|----------|-----------|---------------|
| **Entity** | Modelo de dados do domínio | Types/Interfaces em `domain/types/` |
| **Domain Hook** | Lógica de domínio (validação, computação) | `domain/hooks/use*.ts` |
| **Application Hook** | Orchestrates use cases | `application/hooks/use*.ts` |
| **Infrastructure API** | Comunicação com backend | `infrastructure/api/*.ts` |
| **Presentation Component** | UI do domínio | `presentation/components/*.tsx` |

---

## OpenSpec-SDD Workflow

### Classificação por Impacto

| Tipo       | Escopo                                | Artefatos necessários                                |
|------------|---------------------------------------|------------------------------------------------------|
| `minor`    | Bug fix, refactor interno             | spec.md atualizada                                   |
| `standard` | Nova feature, mudança moderada        | proposal + spec + tasks                              |
| `major`    | Mudança arquitetural, multi-domínio   | proposal + design + tasks + review formal            |

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
1. Criar spec (draft) em openspec/specs/<dominio>/
2. Classificar (minor/standard/major)
3. Identificar domínio (bounded context)
4. Revisar (review → approved)
5. Implementar (DDD: feature/domain, feature/infrastructure, feature/presentation)
6. Validar (testes, coverage 80%+)
7. Vincular (PR/commit → spec)
8. Arquivar (move to archive/YYYY-MM/)
```

### Regras Obrigatórias

1. **Spec first** — ANTES de escrever código, a especificação DEVE existir em `openspec/specs/`
2. **DDD** — TODO código DEVE seguir Domain-Driven Design organizado por features
3. **Classificação** — Toda spec DEVE ter tipo (minor/standard/major) e estado definido
4. **Proposta** — Mudanças `standard` e `major` DEVEM ter proposta em `openspec/changes/<feature>/proposal.md`
5. **Design** — Mudanças `major` DEVEM ter design documentado em `openspec/changes/<feature>/design.md`
6. **Tasks** — Implementação QUEBRADA em tarefas em `openspec/changes/<feature>/tasks.md`
7. **Idioma** — TODO código e documentação em **Português Brasileiro (pt-BR)**
8. **Testes** — Cobertura mínima 80%
9. **Aceitação** — Implementação SÓ pode começar APÓS spec ter estado `approved`
10. **Arquivamento** — Changes concluídas DEVEM ser movidas para `openspec/archive/<YYYY-MM>/` com `_summary.md`

### Checklist de Quality Gate

Para uma spec ser considerada válida (estado `approved`), DEVE conter:

- [ ] **Objetivo**: O que resolve, para quem
- [ ] **Domínio**: Bounded context identificado
- [ ] **Contexto**: Situação atual, problema
- [ ] **Modelo de Domínio**: Entidades, types, hooks definidos
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
domain: <bounded-context>
created: YYYY-MM-DD
updated: YYYY-MM-DD
linked_prs: [PR #...]
---

# <Nome da Spec>

## Domínio
<Bounded Context>

## Objetivo
O que resolve, para quem.

## Contexto
Situação atual, problema.

## Modelo de Domínio (Frontend)

### Entidades (Types)
- **Entidade1**: descrição, atributos principais
- **Entidade2**: descrição, atributos principais

### Hooks de Domínio
- **useEntidade1**: comportamento e estado da entidade
- **useEntidade2**: comportamento e estado da entidade

### Serviços de Domínio
- **servico1**: responsabilidade, regras de validação

## Requisitos Funcionais (RF)
- RF-01: ...
- RF-02: ...

## Requisitos Não-Funcionais (RNF)
- RNF-01: ...

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

## Estrutura de Arquivos

```
features/<dominio>/
├── domain/
│   ├── types/              # Entidades (types/interfaces)
│   ├── hooks/              # Hooks de domínio
│   └── services/           # Serviços de domínio
├── application/
│   ├── hooks/              # Hooks de aplicação
│   └── services/           # Serviços de aplicação
├── infrastructure/
│   └── api/                # Chamadas à API
└── presentation/
    └── components/         # Componentes UI do domínio
```

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
spec: openspec/specs/<dominio>/spec.md
domain: <bounded-context>
```

No PR description:
```
## Spec
- Implementa: openspec/specs/<dominio>/spec.md
- Domínio: <bounded-context>
```

### Automação CI

```
- PR não pode ser mergeado se código muda domínio X
  sem que a spec correspondente tenha status "approved"
- Commits DEVEM referenciar spec (commit msg ou PR description)
- Coverage mínimo 80% enforced no CI
- TypeScript check passes
```

### Estrutura OpenSpec

```
openspec/
├── config.yaml          # Configuração do projeto
├── specs/               # Especificações de domínio
│   └── <dominio>/
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

## Design Tokens (CSS)

```css
:root {
  --color-primary: #0D9488;     /* teal */
  --color-secondary: #1E3A5F;   /* navy */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
}
```

---

## Padrões de Código

### Features
-命名: kebab-case (ex: autenticacao, cardapio, pedido)
- Structure: `domain/`, `application/`, `infrastructure/`, `presentation/`
- Imports via feature barrel exports (index.ts)

### Components
-命名: PascalCase
- Localizados em `presentation/components/`
- Devem usar componentes de `components/ui/`

### Hooks
-命名: camelCase, prefix `use`
- Domain hooks: `use<Entidade>` (ex: useUsuario)
- Application hooks: `use<CasoDeUso>` (ex: useCriarPedido)

### Types/Entities
-命名: PascalCase
- Definidos em `domain/types/`
- Exportados via `domain/types/index.ts`

---

## Testes

- **Cobertura mínima:** 80%
- Testes DEVEM ser escritos ANTES ou DURANTE a implementação
- Code review DEVE verificar conformidade com spec e DDD
- Testar fluxos de usuário completos, não só componentes isolados

---

## UI Components

**Sempre usar** componentes em `components/ui/`:
- Button
- Input
- Card
- Badge
- StatusBadge
- Table

**Nunca** usar inputs HTML diretos ou elementos estilizados inline.

---

## Responsabilidades por Camada

| Camada | Responsabilidade | Não fazer |
|--------|-----------------|-----------|
| `domain` | Tipos, hooks de domínio, lógica de domínio pura | Acesso a API, side effects |
| `application` | Orchestrates use cases, hook de aplicação | Regras de negócio diretas |
| `infrastructure` | Chamadas à API, cache, storage | Lógica de negócio |
| `presentation` | UI components, pages | Lógica de negócio |