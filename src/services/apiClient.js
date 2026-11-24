// Unified API Client for AssetOrbit
// Dynamically resolves production Vercel /api vs local development, attaching JWT auth tokens

export const PROD_API = 'https://asset-orbit-app.vercel.app/api';

export const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    // 1. Check if running inside Capacitor Android/iOS Native Webview or mobile app
    const isNativeMobile = Boolean(
      window.Capacitor || 
      window.Android || 
      window.location.protocol === 'capacitor:' || 
      window.location.protocol === 'ionic:' ||
      (window.location.hostname === 'localhost' && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent))
    );
    if (isNativeMobile) {
      return PROD_API;
    }

    // 2. In production Vercel or custom domain deployment
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
  const currentBase = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${currentBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 6-second client-side timeout to prevent any async freeze or network lock
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    }).catch(() => null);

    // If local fetch failed or returned HTML/404 on localhost, seamlessly fallback to central cloud API with fresh controller
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if ((!response || !response.ok) && isLocalhost && !url.startsWith(PROD_API)) {
      const fallbackUrl = `${PROD_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      try {
        const fallbackCtrl = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackCtrl.abort(), 6000);
        const cloudResponse = await fetch(fallbackUrl, {
          ...options,
          headers,
          signal: fallbackCtrl.signal
        });
        clearTimeout(fallbackTimeout);
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
