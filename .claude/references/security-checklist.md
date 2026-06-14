---
name: security-checklist
description: Checklist de segurança OWASP + PediAI. Carregue quando persona `security-auditor` revisar código de auth, ou antes de release.
---

# Checklist de Segurança

## OWASP Top 10 (2021) — PediAI

### A01 — Broken Access Control

- [ ] Todo endpoint não-público com `JwtAuthGuard`
- [ ] Endpoints admin com `RolesAuthGuard` + `@RolesDecorators(Roles.ADMIN)`
- [ ] Endpoints autenticados: `GET /auth/me`, `POST /auth/logout`, `GET /auth/refresh`
- [ ] Endpoints públicos (4 apenas): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/register`, `GET /health`
- [ ] Verificação de role no use case (defense in depth), não só no controller
- [ ] CORS com `ALLOWED_ORIGINS` configurado (sem wildcard)
- [ ] Nenhum endpoint bypassa auth por erro de decorator

### A02 — Cryptographic Failures

- [ ] bcrypt com salt rounds ≥ 12
- [ ] JWT com `algorithm` explícito (nunca `none`)
- [ ] `JWT_SECRET` ≥ 256 bits, em env var (não no código)
- [ ] HTTPS em produção
- [ ] Senha nunca em log, response, ou URL
- [ ] Senha nunca persistida em plain text
- [ ] Refresh token armazenado hashed no banco
- [ ] Senha em `.env.example` marcada como placeholder (não valor real)

### A03 — Injection

- [ ] Prisma por padrão (queries parametrizadas)
- [ ] Nenhum `prisma.$queryRaw` com string template ou concatenação
- [ ] Se usar `queryRaw`, usar `Prisma.sql\`...\`` (template tag)
- [ ] DTOs com `class-validator` em todos os endpoints
- [ ] `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`
- [ ] Campos extras rejeitados (não ignorados)
- [ ] Validação de CNPJ por dígitos verificadores (não só formato)
- [ ] Validação de email como RFC 5322
- [ ] Sem `eval` / `new Function` em qualquer lugar

### A04 — Insecure Design

- [ ] Spec de domínio com invariantes de segurança (RF explícito)
- [ ] Threat model atualizado por feature nova de auth/authz
- [ ] Limite de tentativas de login (rate limit)
- [ ] Mensagens de erro genéricas em auth (não revelar se email existe)

### A05 — Security Misconfiguration

- [ ] CORS allowlist restritivo (`ALLOWED_ORIGINS`)
- [ ] Sem `*` em CORS em prod
- [ ] Sem debug endpoints em prod (`/debug`, `/admin`)
- [ ] Sem stack trace em response de erro em prod
- [ ] Helmet ou similar (se aplicável)
- [ ] Variáveis de ambiente sensíveis documentadas em `.env.example` (sem valores)

### A06 — Vulnerable Components

- [ ] `npm audit` sem vulnerabilidades high/critical
- [ ] Dependências com maintenance ativo (último commit < 6 meses)
- [ ] Lockfile commitado (`package-lock.json`)
- [ ] Sem dependências com licença incompatível

### A07 — Auth Failures

- [ ] Rate limiting em `POST /auth/login` (5/60s default)
- [ ] Refresh token rotation implementado (server route `/api/auth/refresh` rotaciona o cookie httpOnly a cada refresh)
- [ ] Logout invalida refresh token **e persiste o `jti` do access token em `revoked_jtis`** (backend)
- [ ] Access token TTL ≤ 15 min
- [ ] Refresh token TTL ≤ 7 dias
- [ ] Tentativas falhas de login logadas (sem expor senha)
- [ ] Senha mínima de 8 caracteres
- [ ] Política de complexidade ou HIBP check
- [ ] Refresh token em cookie **httpOnly** (defesa XSS), nunca em localStorage
- [ ] Server route `/api/auth/login` seta `Set-Cookie` com flag `HttpOnly` para o refresh
- [ ] Server route `/api/auth/logout` faz `Set-Cookie max-age=0` para limpar ambos os cookies

### A08 — Software/Data Integrity

- [ ] Validar `alg` do JWT (nunca `none`) — `algorithms: ['HS256']` no `passport-jwt` do backend
- [ ] Validar assinatura do JWT (responsabilidade do backend; `proxy.ts` no app só valida formato + `exp`)
- [ ] Validar `iss`, `aud`, `exp` quando aplicável
- [ ] `jti` presente no payload (necessário para revogação por logout via `revoked_jtis` no backend)
- [ ] `proxy.ts` (no app) faz validação estrutural inline antes do backend (formato + `exp`)
- [ ] Sem deserialização de dados não-confiáveis
- [ ] Migrations Prisma revisadas antes de aplicar em prod

### A09 — Logging Failures

- [ ] Erros de auth logados (com timestamp, IP, userId)
- [ ] PII fora de logs (email pode estar; CPF nunca)
- [ ] Senha nunca em log
- [ ] Logs não expostos ao usuário final
- [ ] Nível de log apropriado (info, warn, error)
- [ ] Sem log de payload completo em prod

### A10 — SSRF

- [ ] Não aplicável (PediAI não faz fetch de URL arbitrária)
- [ ] Se vier a fazer, validar URL contra allowlist

## PediAI — Endpoints Públicos (whitelist)

Apenas 4 endpoints públicos (todos os outros exigem JWT):

1. `POST /auth/login` — login
2. `POST /auth/refresh` — refresh token
3. `POST /auth/register` — registro
4. `GET /health` — health check

## PediAI — Cookies (pedi-ai-app)

| Cookie | httpOnly | secure | sameSite | Por quê |
| --- | --- | --- | --- | --- |
| `pedi_auth_access_token` (proxy) | false | true (prod) | Lax | Lido server-side pelo `src/proxy.ts` para validar JWT inline (formato + `exp`) |
| `pedi_auth_refresh_token` (server route) | **true** | true (prod) | Lax | Defesa contra XSS: o browser recusa expor este cookie a JS; TTL 7 dias |
| localStorage `pedi_auth_access_token` | - | - | - | Mantido para uso client-side pelo AuthProvider (espelha o cookie para o header `Authorization: Bearer`) |
| localStorage `pedi_auth_user` | - | - | - | Cache do user para evitar fetch em `/auth/me` no boot |

**Atenção:** o `httpOnly: false` no cookie do access token é a configuração atual (necessária para o proxy server-side). O `proxy.ts` valida o JWT inline (formato + `exp`) antes de liberar render, mas a validação de assinatura é responsabilidade do backend. Em outros contextos sem proxy, mantenha `httpOnly: true`.

**Atenção 2:** o refresh token **NÃO** é persistido em localStorage. Versões anteriores guardavam; o `clearAuthStorage()` em `auth-context.tsx` remove a chave legacy `pedi_auth_refresh_token` na próxima hidratação para evitar reutilização.

## Checklist Pré-Deploy

- [ ] `npm audit` limpo
- [ ] Nenhum secret commitado
- [ ] `.env.example` atualizado
- [ ] CORS restritivo em prod
- [ ] HTTPS forçado
- [ ] Rate limit configurado
- [ ] Logs de auth habilitados
- [ ] Health check respondendo
- [ ] Senha de admin padrão rotacionada
- [ ] Migrations aplicadas

## Checklist Pós-Incidente

- [ ] Token de admin rotacionado
- [ ] Senhas afetadas invalidadas
- [ ] Logs de auditoria revisados
- [ ] CVE documentado em ADR
- [ ] Hotfix deployed
- [ ] Comunicação a usuários (se PII afetada)
