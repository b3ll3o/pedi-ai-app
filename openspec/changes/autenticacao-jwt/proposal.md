# Proposta - Autenticação Frontend JWT

## Resumo

Implementar autenticação JWT no frontend Next.js com login real via API.

## Problema

- Login atual ignora senha (fake login)
- Não há proteção de rotas
- Tokens não são gerenciados

## Solução

1. AuthContext com JWT real
2. ProtectedRoute component
3. API interceptor para Bearer token
4. Refresh token automático
