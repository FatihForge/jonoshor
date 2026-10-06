import { API_BASE } from '../../config/constants.js';

let csrfToken = null;

// Helper to extract cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      csrfToken = data.csrfToken;
    }
    return csrfToken;
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const reqHeaders = {
    ...headers,
  };

  if (!isFormData && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Add CSRF token for mutating methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    let token = csrfToken || getCookie('csrf_token');
    if (!token) {
      token = await fetchCsrfToken();
    }
    if (token) {
      reqHeaders['X-CSRF-Token'] = token;
    }
  }

  const options = {
    method,
    headers: reqHeaders,
    credentials: 'include',
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // If CSRF error (403), auto-fetch fresh CSRF token and retry once
    if (
      response.status === 403 &&
      (data?.error?.code === 'CSRF_ERROR' || data?.error?.message?.toLowerCase().includes('csrf'))
    ) {
      try {
        const freshCsrf = await fetchCsrfToken();
        if (freshCsrf) {
          reqHeaders['X-CSRF-Token'] = freshCsrf;
          const retryRes = await fetch(url, { ...options, headers: reqHeaders });
          const retryData = await retryRes.json().catch(() => null);
          if (retryRes.ok) {
            return retryData;
          }
        }
      } catch {
        // Fall through to error throwing
      }
    }

    // If access token expired (401), attempt silent token refresh once
    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh-token') &&
      !endpoint.includes('/auth/logout')
    ) {
      try {
        const refreshHeaders = { 'Content-Type': 'application/json' };
        const csrf = csrfToken || getCookie('csrf_token');
        if (csrf) refreshHeaders['X-CSRF-Token'] = csrf;

        const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
          method: 'POST',
          headers: refreshHeaders,
          credentials: 'include',
        });

        if (refreshRes.ok) {
          // Retry the original request with refreshed session
          const retryRes = await fetch(url, options);
          const retryData = await retryRes.json().catch(() => null);
          if (retryRes.ok) {
            return retryData;
          }
        }
      } catch {
        // Fall through to error throwing
      }
    }

    const err = new Error(data?.error?.message || `HTTP error ${response.status}`);
    err.status = response.status;
    err.code = data?.error?.code || 'UNKNOWN_ERROR';
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}
