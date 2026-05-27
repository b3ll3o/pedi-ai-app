# Tasks de SEO — PediAI

## Tarefas de Implementação

### Fase 1: Metadata Global e Base

- [ ] **T-01**: Configurar `generateMetadata` no `layout.tsx` raiz com default title, description, OG tags
- [ ] **T-02**: Adicionar `@export const metadata` global com default Open Graph tags
- [ ] **T-03**: Criar `src/components/seo/Metadata.tsx` — utilitário para metadata incremental
- [ ] **T-04**: Adicionar canonical URL base no layout

### Fase 2: Páginas Públicas (Login, etc.)

- [ ] **T-05**: Configurar metadata da página de `/login` (title: "Login - PediAI", description, OG)
- [ ] **T-06**: Verificar hierarquia de headings na página de login

### Fase 3: Páginas Protegidas (Dashboard)

- [ ] **T-07**: Configurar metadata dinâmica por seção no `/dashboard`
- [ ] **T-08**: Adicionar JSON-LD Schema.org para WebApplication no layout do dashboard
- [ ] **T-09**: Adicionar Organization Schema.org JSON-LD

### Fase 4: Sitemap e Robots

- [ ] **T-10**: Criar `src/app/sitemap.ts` — sitemap dinâmico com todas rotas públicas
- [ ] **T-11**: Criar `src/app/robots.ts` — configuração otimizada de robots.txt
- [ ] **T-12**: Adicionar `/sitemap.xml` e `/robots.txt` às rotas públicas

### Fase 5: Performance e Imagens

- [ ] **T-13**: Auditar todas imagens e verificar se têm `alt` text
- [ ] **T-14**: Configurar `next/image` com lazy loading forçado por default
- [ ] **T-15**: Otimizar fontes (font-display: swap)

### Fase 6: Social Sharing

- [ ] **T-16**: Configurar OG image global (1200x630px)
- [ ] **T-17**: Configurar Twitter Card com `summary_large_image`
- [ ] **T-18**: Criar `src/app/api/og/route.tsx` — OG image gerada via Edge Runtime

### Fase 7: Testing e Validação

- [ ] **T-19**: Executar Lighthouse SEO audit — score >= 95
- [ ] **T-20**: Validar JSON-LD no Schema.org Validator
- [ ] **T-21**: Testar Mobile-Friendly Test
- [ ] **T-22**: Testar Open Graph via Facebook Debugger
- [ ] **T-23**: Testar Twitter Card Validator

### Prioridade de Execução

1. **Alta** — T-01, T-05, T-10, T-11 (impacto imediato em indexing)
2. **Média** — T-07, T-08, T-09 (dashboard)
3. **Média** — T-13, T-14, T-16, T-17 (performance e sharing)
4. **Baixa** — T-18, T-22, T-23 ( Polish)

## Estimativa de Esforço

| Fase | Complexidade | Estimativa |
|------|-------------|------------|
| Fase 1 | Baixa | 1-2h |
| Fase 2 | Baixa | 30min |
| Fase 3 | Média | 2-3h |
| Fase 4 | Baixa | 1h |
| Fase 5 | Média | 2h |
| Fase 6 | Média | 2-3h |
| Fase 7 | Baixa | 1h |
| **Total** | — | **10-13h** |

## Dependências

- T-01 requer Next.js 16 com App Router
- T-10 requer `next/sitemap` configurado
- T-18 requer Edge Runtime ( Next.js API routes)
