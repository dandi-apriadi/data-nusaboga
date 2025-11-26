// Centralized API client
// Works for CRA environment with REACT_APP_API_BASE_URL or proxy fallback

const DEBUG = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_DEBUG === 'true') || (typeof window !== 'undefined' && window.__API_DEBUG__);

const resolveBase = () => {
  // Ambil nilai compile-time (CRA mengganti process.env.REACT_APP_*)
  const envBase = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) ? process.env.REACT_APP_API_BASE_URL : '';
  let base = envBase;
  if (!base && typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    base = process.env.REACT_APP_API_URL;
  }
  if (!base && typeof window !== 'undefined' && window.__API_BASE_URL__) {
    base = window.__API_BASE_URL__;
  }
  // Auto fallback: jika masih kosong dan berjalan di dev origin 3000, default ke 5000
  if (!base && typeof window !== 'undefined' && window.location?.port === '3000') {
    base = 'http://localhost:5000';
  }
  const finalBase = base ? base.replace(/\/$/, '') : '';
  if (DEBUG) {
    if (!finalBase) {
      console.warn('[apiClient] Base URL masih kosong, request akan gunakan relative path (proxy mode).');
    } else {
      console.log('[apiClient] Resolved base URL:', finalBase);
    }
  }
  return finalBase;
};

// Hapus caching module-level, selalu fresh resolve
// const API_BASE = resolveBase();

async function handleResponse(res, url, meta) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    const snippet = text.replace(/\s+/g,' ').slice(0,200);
    const err = new Error(`Non-JSON response from ${url}: status ${res.status}. Snippet: ${snippet}`);
    if (DEBUG) {
      console.error('[apiClient] ❌ Non-JSON', { url, status: res.status, snippet, meta });
    }
    throw err;
  }
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.msg || data?.error || `Request failed ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    if (DEBUG) {
      console.error('[apiClient] ❌ Error', { url, status: res.status, msg, meta, payload: data });
    }
    throw err;
  }
  if (DEBUG) {
    console.log('[apiClient] ✅ Success', { url, status: res.status, meta, size: (typeof data === 'object' ? JSON.stringify(data).length : 0) });
  }
  return data;
}

export async function apiGet(path, options = {}) {
  const base = resolveBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = base ? `${base}${cleanPath}` : cleanPath; // base selalu ada setelah refactor kecuali proxy fallback
  const started = performance.now();
  DEBUG && console.log('[apiClient] → GET', { url, path });
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const meta = { method: 'GET', ms: +(performance.now() - started).toFixed(1) };
  return handleResponse(res, url, meta);
}

async function apiRequest(method, path, body, options = {}) {
  const base = resolveBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = base ? `${base}${cleanPath}` : cleanPath;
  const init = {
    method,
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const started = performance.now();
  DEBUG && console.log('[apiClient] →', method, { url, path, body });
  const res = await fetch(url, init);
  const meta = { method, ms: +(performance.now() - started).toFixed(1) };
  return handleResponse(res, url, meta);
}

export const apiPost = (path, body, options) => apiRequest('POST', path, body, options);
export const apiPut = (path, body, options) => apiRequest('PUT', path, body, options);
export const apiPatch = (path, body, options) => apiRequest('PATCH', path, body, options);
export const apiDelete = (path, options) => apiRequest('DELETE', path, undefined, options);

export function getApiBase() { return resolveBase(); }

export function requireApiBase() {
  const base = resolveBase();
  if (!base) {
    throw new Error('API base URL tidak ditemukan. Set REACT_APP_API_BASE_URL di .env atau aktifkan proxy.');
  }
  return base;
}
