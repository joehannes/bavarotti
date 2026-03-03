const jsonBinHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-Master-Key'] = apiKey;
  }

  return headers;
};

export const updateJsonBin = async <T,>(url: string, apiKey: string, payload: T): Promise<T> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: jsonBinHeaders(apiKey),
    body: JSON.stringify(payload, null, 2),
  });

  if (!response.ok) {
    throw new Error(`Update failed: ${response.status}`);
  }

  const json = (await response.json()) as { record?: T } | T;

  if (typeof json === 'object' && json !== null && 'record' in json) {
    return (json as { record: T }).record;
  }

  return json as T;
};
