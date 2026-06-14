---
name: infra
description: Domínio de infraestrutura e deploy do app no VPS — Next.js standalone, NGINX com SSL, systemd service, memory footprint, health check. Carregue ao mexer em deploy, CI/CD, configuração do servidor, NGINX, ou systemd.
type: domain
status: implemented
domain: infra
---

# Infraestrutura e Deploy (infra)

## Visão Geral

Domínio de DevOps/SRE do app: configuração do VPS (Ubuntu 24.04 em `187.77.204.108`), deploy via systemd + NGINX + SSL Let's Encrypt, comando de start do Next.js standalone, e health check.

## Quando Usar

- Mexer em `deploy/pedi-ai-app.service` (systemd)
- Configurar NGINX (`/etc/nginx/sites-available/andreazzi.tech`)
- Atualizar workflow `.github/workflows/ci-deploy.yml`
- Investigar OOM kill ou memory leak
- Renovar/configurar SSL
- Alterar porta, host, ou domínio

## Arquitetura Atual

```
                    ┌─────────────────┐
                    │   NGINX (443)   │
                    │   + SSL ECC     │
                    │   80 → 443      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼────────┐
     │  Next.js App   │          │   NestJS API     │
     │  :3000 (local) │          │   :3001 (local)  │
     │  standalone    │          │                  │
     └────────────────┘          └──────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      PostgreSQL :5432        │
              │      (Docker container)      │
              └─────────────────────────────┘
```

## Requisitos Funcionais (RF)

- RF-01: App Next.js roda com `standalone output` via `node .next/standalone/server.js`
- RF-02: NGINX serve HTTPS na porta 443 com certificados Let's Encrypt
- RF-03: NGINX redireciona HTTP (porta 80) para HTTPS
- RF-04: Deploy usa comando correto para Next.js standalone
- RF-05: Health check retorna 200 OK em `/health`

## Requisitos Não-Funcionais (RNF)

- RNF-01: Memory footprint do Next.js standalone < 100MB
- RNF-02: SSL usa ECC (ECDSA) via Let's Encrypt
- RNF-03: NGINX responde em HTTPS na porta 443
- RNF-04: NGINX redireciona HTTP→HTTPS sem perder query string
- RNF-05: Restart automático em falha (`Restart=always`, `RestartSec=5`)

## systemd Service (`pedi-ai-app.service`)

**Localização:** `/etc/systemd/system/pedi-ai-app.service`

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

## NGINX (`/etc/nginx/sites-available/andreazzi.tech`)

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

## Critérios de Aceitação

- [x] App Next.js inicia sem OOM kill
- [x] `https://andreazzi.tech` retorna HTTP 200
- [x] `https://andreazzi.tech/api/health` retorna health da API
- [x] NGINX redirect HTTP→HTTPS funciona
- [x] Memory usage estável < 100MB

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "`next start` funciona com `output: standalone`" | NÃO funciona. Usar `node .next/standalone/server.js` direto. |
| "HTTP é suficiente, sem precisar HTTPS" | Quebra SEO, navegadores marcam como inseguros, OAuth não funciona. |
| "Pode rodar como root, é dev" | Em prod, criar usuário dedicado reduz blast radius. Manter root por simplicidade no MVP. |
| "Restart=always sem RestartSec" | RestartSec=5 evita loop infinito de crash. |
| "NGINX ouvindo só 80 é mais simples" | Sem 443, NGINX não serve HTTPS. Porta 80 só pra redirect. |
| "Pode usar `pm2` em vez de systemd" | Systemd é built-in no Ubuntu. `pm2` adiciona camada. |

## Red Flags

- `ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000` (errado com standalone)
- `ssl_certificate` apontando para arquivo inexistente
- NGINX sem redirect HTTP→HTTPS
- `Restart=always` sem `RestartSec` (loop de crash)
- App rodando em porta != 3000 (interna) sem ajustar NGINX proxy_pass
- OOM killer no journal: `journalctl -u pedi-ai-app --no-pager` mostra `Out of memory`
- Workflow `ci-deploy.yml` não detecta standalone mode
- SSL usando RSA em vez de ECC (mais lento, mais memória)
- `proxy.ts` matcher não cobrindo `/dashboard/:path*` e `/restaurantes/:path*` (rotas desprotegidas)
- Server route `/api/auth/login` sem `Set-Cookie HttpOnly` no refresh (XSS de 7 dias)
- Server route `/api/auth/logout` sem `Set-Cookie max-age=0` para limpar cookies (logout incompleto)

## Verificação

- [ ] `systemctl status pedi-ai-app` → active (running)
- [ ] `journalctl -u pedi-ai-app --no-pager` sem OOM
- [ ] `curl -I https://andreazzi.tech` → 200
- [ ] `curl -I http://andreazzi.tech` → 301 (redirect)
- [ ] `curl https://andreazzi.tech/api/health` → 200 OK
- [ ] `free -h` → uso de memória do app < 100MB
- [ ] `systemctl status nginx` → active
- [ ] `nginx -t` → syntax ok
- [ ] Renovação SSL: `certbot renew --dry-run`
- [ ] `ls -la /root/pedi-ai-app/.next/standalone/server.js` → existe
- [ ] `curl -I https://andreazzi.tech/dashboard` sem cookie → 307/302 para `/login`
- [ ] Cookie `pedi_auth_refresh_token` no response de login tem flag `HttpOnly` (verificar com `curl -i` e checar `Set-Cookie`)
