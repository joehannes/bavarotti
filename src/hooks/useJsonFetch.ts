import { useEffect, useState } from 'react';

export type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type JsonBinEnvelope<T> = {
  record?: T;
};

const unwrapJsonBinRecord = <T,>(payload: unknown): T => {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'record' in payload &&
    (payload as JsonBinEnvelope<T>).record !== undefined
  ) {
    return (payload as JsonBinEnvelope<T>).record as T;
  }

  return payload as T;
};

export const useJsonFetch = <T,>(url?: string): FetchState<T> => {
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
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const rawJson = (await response.json()) as unknown;
        const json = unwrapJsonBinRecord<T>(rawJson);
        if (isMounted) {
          setData(json);
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
  }, [url]);

  return { data, loading, error };
};
