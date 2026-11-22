// Unified API Client for AssetOrbit
// Dynamically resolves production Vercel /api vs local development, attaching JWT auth tokens

const PROD_API = 'https://asset-orbit-app.vercel.app/api';

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

  // 3-second client-side timeout to prevent any async freeze or network lock
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    }).catch(() => null);

    // If local fetch failed or returned HTML/404 on localhost, seamlessly fallback to central cloud API
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if ((!response || !response.ok) && isLocalhost && !url.startsWith(PROD_API)) {
      const fallbackUrl = `${PROD_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      try {
        const cloudResponse = await fetch(fallbackUrl, {
          ...options,
          headers,
          signal: controller.signal
        });
        if (cloudResponse) {
          response = cloudResponse;
        }
      } catch (err) {}
    }

    if (!response) {
      return { ok: false, status: 0, offline: true, error: 'Network request failed' };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // In case an HTML error page was returned
      return { ok: false, status: response.status, offline: true, error: 'Non-JSON response' };
    }

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
