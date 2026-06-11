---
name: seo
description: Domínio de SEO do app — metadata dinâmica, sitemap, robots, Open Graph, Twitter Cards, Schema.org JSON-LD, canonical tags, Core Web Vitals. Carregue ao otimizar SEO, adicionar metadata, criar sitemap, ou melhorar Lighthouse SEO.
type: domain
status: draft
domain: seo
---

# SEO (seo)

## Visão Geral

Domínio de otimização para motores de busca do app: metadata dinâmica via `next/metadata`, sitemap dinâmico, robots.txt, Open Graph, Twitter Cards, Schema.org JSON-LD, canonical tags, e Core Web Vitals.

## Quando Usar

- Adicionar metadata a nova rota
- Criar/alterar `sitemap.ts` ou `robots.ts`
- Implementar Schema.org JSON-LD
- Adicionar Open Graph ou Twitter Card
- Investigar Lighthouse SEO baixo
- Adicionar hreflang (i18n)
- Criar nova página pública indexável

## Stack Técnica

| Item | Solução |
|------|---------|
| Metadata dinâmica | `next/metadata` API (Next.js 16) |
| Schema.org | `script type="application/ld+json"` via `next/script` |
| Sitemap | `next-sitemap` ou `app/sitemap.ts` |
| Robots.txt | `app/robots.ts` |
| Open Graph | `next/metadata` API |
| Twitter Cards | `next/metadata` API |

## Requisitos Funcionais (RF)

- RF-01: Title e meta description únicos por página (< 60 chars para title, 150-160 para description)
- RF-02: Open Graph tags em todas as páginas (`og:title`, `og:description`, `og:image`, `og:url`)
- RF-03: Twitter Card configurado
- RF-04: Hierarquia semântica de headings (1× H1 por página, depois H2/H3)
- RF-05: `alt` text em todas as imagens
- RF-06: `robots.txt` otimizado
- RF-07: `sitemap.xml` dinâmico com todas as páginas públicas
- RF-08: Schema.org JSON-LD para web app e organização
- RF-09: Canonical tags em todas as páginas
- RF-10: `hreflang` para pt-BR

## Requisitos Não-Funcionais (RNF)

- RNF-01: Lighthouse SEO ≥ 95
- RNF-02: LCP < 2.5s
- RNF-03: FID < 100ms
- RNF-04: CLS < 0.1
- RNF-05: TTI < 3.8s
- RNF-06: Mobile-Friendly Test passa
- RNF-07: `hreflang` para pt-BR

## Estrutura de Arquivos

```
src/app/
├── layout.tsx          # Metadata global, OG defaults
├── sitemap.ts          # Gerador de sitemap dinâmico
├── robots.ts           # Configuração robots.txt
└── [locale]/
    └── layout.tsx      # SEO metadata por locale
src/components/seo/
├── JsonLd.tsx          # Componente Schema.org
└── SocialShare.tsx     # Componente para OG image
```

## Critérios de Aceitação

- [ ] Title tag único em cada página (< 60 chars)
- [ ] Meta description única (150-160 chars)
- [ ] OG:title, OG:description, OG:image, OG:url configurados
- [ ] Twitter Card configurado
- [ ] Schema.org JSON-LD
- [ ] Sitemap.xml lista todas as páginas públicas
- [ ] robots.txt permite crawlers e bloqueia arquivos desnecessários
- [ ] Hierarquia de headings correta
- [ ] Nenhuma imagem sem `alt`
- [ ] Lighthouse SEO ≥ 95
- [ ] Core Web Vitals verde

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Sitemap estático está ok" | Sitemap dinâmico escala melhor e reflete o estado real do app. |
| "Open Graph só para blog" | OG também é usado em Slack, WhatsApp, LinkedIn previews. |
| "robots.txt padrão é suficiente" | Bloquear `/api/`, `/admin/`, `/_next/` é padrão. Default do Next.js não cobre tudo. |
| "Canonical é só para conteúdo duplicado" | Em SPA/Next.js, rotas com/sem trailing slash, com/sem query params geram duplicatas. |
| "JSON-LD é decorativo" | Google usa para rich snippets. Sem ele, perde destaque nos resultados. |
| "H1 não importa" | 1 H1 por página é boa prática de a11y e SEO. |

## Red Flags

- Title duplicado entre páginas
- Meta description > 160 chars (Google trunca)
- Imagem sem `alt` (ou `alt=""` em imagem não-decorativa)
- Heading pulando nível (H1 → H3)
- Mais de 1 H1 por página
- Sitemap com URLs quebradas (404)
- `robots.txt` bloqueando rotas públicas indexáveis
- OG image 404 ou muito pequena (< 1200×630)
- JSON-LD com sintaxe inválida (validar em https://validator.schema.org/)
- Lighthouse SEO < 90

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run build` completa sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] Lighthouse SEO ≥ 95 em cada rota pública
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] `curl https://andreazzi.tech/sitemap.xml` retorna XML válido
- [ ] `curl https://andreazzi.tech/robots.txt` retorna texto válido
- [ ] Cada página tem `og:title` e `og:description` distintos
- [ ] Open Graph Debugger (Facebook) valida previews
- [ ] Twitter Card Validator valida
- [ ] Schema.org Validator aceita JSON-LD
- [ ] Google Search Console sem erros de cobertura
- [ ] Mobile-Friendly Test passa
