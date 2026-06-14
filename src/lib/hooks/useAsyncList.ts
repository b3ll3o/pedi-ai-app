'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncListResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: (updater: T[] | ((prev: T[]) => T[])) => void;
}

/**
 * Hook genérico para listas carregadas de uma API.
 *
 * Encapsula o padrão repetido em todas as páginas CRUD:
 * - `useState(true)` para loading inicial
 * - `useEffect` que dispara o fetcher e gerencia cleanup
 * - `try/catch` que converte `Error` em string
 * - `AbortController` para cancelar a request quando o componente desmonta
 *   ou quando `reload()` é chamado antes da anterior terminar
 *
 * @param fetcher Função que retorna uma Promise com a lista. Recebe um
 *   `AbortSignal` para que a chamada possa ser cancelada (a função
 *   precisa passá-lo para o `fetch`).
 *
 * @example
 * ```ts
 * const { data, loading, error, reload } = useAsyncList((signal) =>
 *   api.usuarios.listarTodos(signal),
 * );
 * ```
 */
export function useAsyncList<T>(
  fetcher: (signal: AbortSignal) => Promise<T[]>,
): UseAsyncListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancela request em voo antes de iniciar outra
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
