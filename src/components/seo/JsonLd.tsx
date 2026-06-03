'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, unknown>;
  /**
   * id do `<script>` no DOM. Default 'json-ld' é OK para uma única instância
   * por página, mas múltiplas (ex: breadcrumb + organization na home) entram
   * em conflito — Next/Script pode descartar uma delas silenciosamente.
   * Cada caller deve passar um id único e estável.
   */
  id?: string;
}

/**
 * Renderiza JSON-LD via `<Script type="application/ld+json">`.
 *
 * `JSON.stringify` sozinho NÃO é seguro: se `data` contiver a string
 * `</script>` (ou a sequência case-insensitive `</SCRIPT>`), o browser fecha
 * o bloco de script atual e injeta markup arbitrário. Aplicamos o escape
 * canônico `</` → `<\/` dentro de tags script para fechar o vetor sem
 * alterar o JSON semanticamente (o JSON parser trata `\/` como `/`).
 */
export function JsonLd({ data, id = 'json-ld' }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/<\/(script)/gi, '<\\/$1');
  return <Script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
