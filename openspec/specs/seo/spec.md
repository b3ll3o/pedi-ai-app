---
status: draft
type: standard
domain: seo
created: 2026-05-27
updated: 2026-05-27
linked_prs: []
---

# Plano de SEO para o PediAI

## Domínio
`seo` — Otimização para Motores de Busca

## Objetivo
Melhorar o SEO das páginas do PediAI para aumentar visibilidade orgânica, melhorar ranking e proporcionar melhor experiência de、性能 para usuários.

## Diagnóstico Atual

### HEAD tags ausentes ou otimizáveis
- [ ] Title tag duplicada ou curta nas páginas
- [ ] Meta description ausente ou não otimizada
- [ ] Canonical tags faltando
- [ ] Open Graph tags incompletas
- [ ] Twitter Card tags faltando
- [ ] Estrutura de Heading tags (H1, H2) pode não seguir hierarquia

### Performance e infraestrutura
- [ ] Imagens sem lazy loading
- [ ] Imagens sem atributos `alt`
- [ ] Links sem `rel="nofollow"` em contextos adequados
- [ ] JavaScript bloqueia renderização (pode ser melhorado)
- [ ] Tempo de carregamento inicial

### Indexação e crawl
- [ ] Sitemap.xml ausente
- [ ] Robots.txt suboptimal
- [ ] Schema.org/JSON-LD não implementado
- [ ] Core Web Vitals podem precisar melhoria

## Requisitos Funcionais (RF)

- RF-01: Implementar título e meta description únicos por página
- RF-02: Adicionar Open Graph tags para compartilhamento em redes sociais
- RF-03: Adicionar Twitter Card tags para visualização otimizada
- RF-04: Implementar estrutura semântica de headings (H1 > H2 > H3)
- RF-05: Adicionar alt text em todas imagens
- RF-06: Criar robots.txt otimizado
- RF-07: Criar sitemap.xml dinâmico
- RF-08: Implementar Schema.org via JSON-LD
- RF-09: Adicionar canonical tags em todas páginas

## Requisitos Não-Funcionais (RNF)

- RNF-01: Score Lighthouse SEO >= 95
- RNF-02: Largest Contentful Paint (LCP) < 2.5s
- RNF-03: First Input Delay (FID) < 100ms
- RNF-04: Cumulative Layout Shift (CLS) < 0.1
- RNF-05: Time to Interactive (TTI) < 3.8s
- RNF-06: Todas páginas devem passar em Mobile-Friendly Test
- RNF-07: implementar hreflang para pt-BR

## Critérios de Aceitação

- [ ] Title tag único em cada página (< 60 caracteres)
- [ ] Meta description única por página (150-160 caracteres)
- [ ] OG:title, OG:description, OG:image, OG:url configurados
- [ ] Twitter Card configurado com card type
- [ ] Schema.org JSON-LD para aplicações web e organização
- [ ] Sitemap.xml gera lista de todas páginas publicas
- [ ] robots.txt permite crawlers e bloqueia arquivos desnecessários
- [ ] Hierarquia de headings correta (1 H1 por página)
- [ ]Nenhuma imagem sem alt text
- [ ] Lighthouse SEO score >= 95
- [ ] Todos Core Web Vitals verde (aprovado)

## Stack Técnica

| Item | Solução |
|------|--------|
| Metadata dinâmica | next/metadata API (Next.js 16) |
| Schema.org | script type="application/ld+json" via next/script |
| Sitemap | next/sitemap |
| Robots.txt | app/robots.ts |
| Open Graph | next/metadata API |
| Twitter Cards | next/metadata API |

## Estrutura de Arquivos para Implementação

```
pedi-ai-app/
└── src/
    └── app/
        ├── layout.tsx          # Metadata global, OG defaults
        ├── sitemap.ts          # Gerador de sitemap dinâmico
        ├── robots.ts           # Configuração robots.txt
        ├── [locale]/
        │   └── layout.tsx      # SEO metadata por locale
    └── components/
        └── seo/
            ├── JsonLd.tsx      # Componente Schema.org
            └── SocialShare.tsx # Componente para OG image
```

## Tarefas
- [ ] Tasks: `tasks.md` a ser criado

## Estratégia de Testes
- Lighthouse Audit SEO (Chrome DevTools)
- Google Search Console (verificar indexing)
- Schema.org Validator (https://validator.schema.org/)
- Mobile-Friendly Test (Google)
- Open Graph Debugger (Facebook)
- Twitter Card Validator
