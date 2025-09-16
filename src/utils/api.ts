const DEFAULT_API_BASE_URL = 'https://api.govividmedia.70-60.com';

const sanitizeBaseUrl = (url: string) => url.replace(/\/$/, '');

const resolveBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL;
  if (envValue && envValue.trim().length > 0) {
    return sanitizeBaseUrl(envValue);
  }
  return sanitizeBaseUrl(DEFAULT_API_BASE_URL);
};

export const API_BASE_URL = resolveBaseUrl();

export const buildApiUrl = (path: string) => {
  if (!path || path === '/') {
    return API_BASE_URL;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
