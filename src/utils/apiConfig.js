const DEFAULT_API_URL = 'http://localhost:5000';

export const getApiBaseUrl = () => {
  // 1. Check localStorage for manual override (useful for quick fixes on any device)
  const override = localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  // 2. Check environment variable (Standard production way)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // 3. Fallback to localhost
  return DEFAULT_API_URL;
};

export const setApiOverride = (url) => {
  if (!url) {
    localStorage.removeItem('VITE_API_URL_OVERRIDE');
  } else {
    // Ensure no trailing slash
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    localStorage.setItem('VITE_API_URL_OVERRIDE', formattedUrl);
  }
  // Reload to apply changes across the app
  window.location.reload();
};
