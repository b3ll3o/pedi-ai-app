---
status: approved
type: minor
domain: app
created: 2026-05-27
updated: 2026-05-27
linked_prs: []
---

# Spec - Monitoramento e Infraestrutura do Ambiente VPS

## Domínio
Infraestrutura / DevOps (pedi-ai-app)

## Objetivo
Garantir estabilidade do ambiente de produção no VPS, evitando OOM kills no Next.js e configurando SSL/HTTPS corretamente.

## Contexto

O ambiente VPS (Ubuntu 24.04) rodando em `187.77.204.108` hospeda a API NestJS e o App Next.js. Problemas identificados em 2026-05-27:

1. **OOM Kill**: O processo Next.js era morto pelo sistema por falta de memória
2. **SSL não configurado**: NGINX só escutava na porta 80 (HTTP), sem HTTPS
3. **Deploy script desatualizado**: O systemd service usava `next start` incompatível com `output: standalone`

## Modelo de Domínio (Frontend)

### Tipos
- **VpsConfig**: Configuração do ambiente VPS
  - `apiUrl: string`
  - `appUrl: string`
  - `memoryLimit: number`

### Hooks de Domínio
- N/A (infraestrutura)

## Requisitos Funcionais (RF)

- RF-01: App Next.js deve rodar com `standalone output` via `node .next/standalone/server.js`
- RF-02: NGINX deve servir HTTPS na porta 443 com certificados Let's Encrypt
- RF-03: NGINX deve redirecionar HTTP (porta 80) para HTTPS
- RF-04: Sistema de deploy deve usar comando correto para Next.js standalone
- RF-05: Health check deve retornar 200 OK em `/health`

## Requisitos Não-Funcionais (RNF)

- RNF-01: Memory footprint do Next.js standalone deve ser < 100MB
- RNF-02: Health check deve retornar 200 OK em /health
- RNF-03: SSL deve usar ECC (ECDSA) via Let's Encrypt
- RNF-04: NGINX deve responder em HTTPS na porta 443

## Critérios de Aceitação

- [x] App Next.js inicia sem OOM kill
- [x] `https://andreazzi.tech` retorna HTTP 200
- [x] `https://andreazzi.tech/api/health` retorna health da API
- [x] NGINX redirect HTTP→HTTPS funciona
- [x] Memory usage estável < 100MB

## Decisões de Design

### 1. Comando de Start do Next.js

**Problema**: `next start` não funciona com `output: standalone`.

**Solução**: Usar `node .next/standalone/server.js` diretamente.

```ini
# ERRADO (no systemd service)
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000

# CORRETO
ExecStart=/usr/bin/node .next/standalone/server.js
```

### 2. Configuração NGINX SSL

O servidor tem certificados Let's Encrypt pré-configurados. A configuração atualizada:

```nginx
server {
    listen 80;
    server_name andreazzi.tech;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name andreazzi.tech;

    ssl_certificate /etc/letsencrypt/live/andreazzi.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/andreazzi.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

## Arquitetura Atual

```
                    ┌─────────────────┐
                    │   NGINX (443)   │
                    │   + SSL ECC     │
                    │   porta 80 → 443│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼────────┐
     │  Next.js App   │          │   NestJS API     │
     │  :三千 (local) │          │   :3001 (local)  │
     │  standalone    │          │                  │
     └─────────────────┘          └──────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      PostgreSQL :5432        │
              │      (Docker container)      │
              └─────────────────────────────┘
```

## Services systemd

### pedi-ai-app.service (CORRIGIDO)

Localização: `/etc/systemd/system/pedi-ai-app.service`

```ini
[Unit]
Description=Pedi-AI App (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/pedi-ai-app
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/root/pedi-ai-app/.env

[Install]
WantedBy=multi-user.target
```

## Tarefas de Monitoramento

- [ ] Verificar logs de OOM: `journalctl -u pedi-ai-app --no-pager`
- [ ] Monitorar memória: `free -h` ou `systemctl status pedi-ai-app`
- [ ] Health check: `curl https://andreazzi.tech/api/health`
- [ ] SSL check: `curl -I https://andreazzi.tech`

## Arquivos Corrigidos

| Arquivo | Correção |
|---------|----------|
| `/etc/systemd/system/pedi-ai-app.service` | ExecStart指了指standalone server |
| `/etc/nginx/sites-available/andreazzi.tech` | Adicionado listen 443 ssl e redirect HTTP→HTTPS |
| `deploy/pedi-ai-app.service` | ExecStart correto para standalone |
| `.github/workflows/ci-deploy.yml` | Detecta standalone mode e configura SSL no NGINX |

## Lições Aprendidas

1. **Next.js standalone**: `next start` com `output: standalone` não funciona; usar `node .next/standalone/server.js`
2. **NGINX SSL**: Lets Encrypt cria certificados em `/etc/letsencrypt/live/dominio/`
3. **OOM causes**: Memory leak ou spike de memória pode matar processos; standalone reduz footprint

## Estratégia de Testes

- E2E: Testar fluxo completo via Playwright:
  1. Acessar `https://andreazzi.tech`
  2. Verificar que redirect HTTP→HTTPS funciona
  3. Validar que health check da API responde

## Tasks

- [x] Corrigir systemd service para usar standalone server
- [x] Configurar NGINX com HTTPS (SSL ECC)
- [x] Configurar redirect HTTP→HTTPS
- [x] Atualizar `deploy/pedi-ai-app.service` no repositório
- [x] Atualizar workflow ci-deploy.yml para detectar standalone mode automaticamente
- [x] Atualizar workflow ci-deploy.yml para configurar SSL no NGINX
