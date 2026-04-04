const jsonBinHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-Master-Key'] = apiKey;
  }

  return headers;
};

const jsonBinIdPattern = /^[a-z0-9]{24}$/i;

export const resolveJsonBinUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (jsonBinIdPattern.test(trimmed)) {
    return `https://api.jsonbin.io/v3/b/${trimmed}/latest`;
  }

  return undefined;
};

export const jsonBinReadHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {};
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
