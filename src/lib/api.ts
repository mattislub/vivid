export const resolveApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = envBase && envBase.length > 0 ? envBase : undefined;

  const baseForUrl = base ?? (typeof window !== 'undefined' ? window.location.origin : undefined);

  if (baseForUrl) {
    try {
      return new URL(normalizedPath, baseForUrl).toString();
    } catch (error) {
      console.error('[api] Failed to resolve API URL', {
        path: normalizedPath,
        base: baseForUrl,
        error,
      });
    }
  }

  return normalizedPath;
};

export const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = resolveApiUrl(path);
  const headers = new Headers(init?.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}`);
  }

  return response.json() as Promise<T>;
};
