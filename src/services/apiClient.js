// Unified API Client for AssetOrbit
// Dynamically resolves production Vercel /api vs local development, attaching JWT auth tokens

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    // In production Vercel or same-origin deployment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/api`;
    }
  }
  return '/api';
};

export const API_BASE = getBaseUrl();

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('assetorbit_session_token') || localStorage.getItem('assetorbit_token') || null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2.5-second client-side timeout to prevent any async freeze or network lock
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data: data.data !== undefined ? data.data : data,
      raw: data
    };
  } catch (error) {
    console.warn(`[AssetOrbit API] Request notice for ${endpoint}:`, error.message);
    return {
      ok: false,
      status: 0,
      offline: true,
      error: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
