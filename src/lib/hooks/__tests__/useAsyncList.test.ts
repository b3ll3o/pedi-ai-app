import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncList } from '../useAsyncList';

describe('useAsyncList', () => {
  it('starts with loading=true and empty data', () => {
    const fetcher = jest.fn().mockResolvedValue([{ id: 1 }]);
    const { result } = renderHook(() => useAsyncList(fetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('populates data after fetcher resolves', async () => {
    const fetcher = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.error).toBeNull();
  });

  it('captures error from fetcher', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('boom');
    expect(result.current.data).toEqual([]);
  });

  it('uses generic message when error is not an Error instance', async () => {
    const fetcher = jest.fn().mockRejectedValue('string-error');
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao carregar');
    });
  });

  it('exposes setData to mutate list', async () => {
    const fetcher = jest
      .fn<Promise<{ id: number }[]>, [AbortSignal]>()
      .mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });

    result.current.setData((prev) => prev.filter((item) => item.id !== 1));

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 2 }]);
    });
  });

  it('reloads when reload is called', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }]);
    const { result } = renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1 }]);
    });

    await result.current.reload();

    expect(fetcher).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 2 }]);
    });
  });

  it('passes AbortSignal to fetcher', async () => {
    const fetcher = jest.fn().mockResolvedValue([]);
    renderHook(() => useAsyncList(fetcher));

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalled();
    });

    const signal = fetcher.mock.calls[0][0];
    expect(signal).toBeInstanceOf(AbortSignal);
  });
});
