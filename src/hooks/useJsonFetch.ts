import { useEffect, useState } from 'react';

export type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export const useJsonFetch = <T,>(url?: string, headers?: Record<string, string>): FetchState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      setError('Missing URL');
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, { cache: 'no-store', headers });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = (await response.json()) as T | { record?: T };
        const normalized =
          typeof json === 'object' && json !== null && 'record' in json
            ? (json as { record?: T }).record ?? null
            : (json as T);
        if (isMounted) {
          setData(normalized);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, headers]);

  return { data, loading, error };
};
