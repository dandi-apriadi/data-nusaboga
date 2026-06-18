// Unified image helper. Local uploads must be served by the backend, not the static frontend server.
const stripTrailingSlash = (value = '') => String(value).replace(/\/$/, '');
const stripApiSuffix = (value = '') => stripTrailingSlash(value).replace(/\/api(\/v\d+)?$/, '');
const configuredApiBase = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '';
const _IMAGE_BASE = (process.env.REACT_APP_IMAGE_BASE_URL || '/uploads').replace(/\/$/, '');

function defaultBackendOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const { protocol, hostname, port } = window.location;
  if (port === '3000' || port === '3001' || port === '5173') {
    return `${protocol}//${hostname}:5000`;
  }
  return '';
}

function apiAssetOrigin() {
  return stripApiSuffix(configuredApiBase || defaultBackendOrigin());
}
// Inline SVG placeholder (no network request, works in all environments)
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIHJ4PSIxMiIgZmlsbD0iI2UxZTNlOCIvPjxwYXRoIGQ9Ik0yMCA2NWgxMjB2MTBIMjB6IiBmaWxsPSIjY2NjIiBvcGFjaXR5PSIuNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0NTQ4NTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZiI+SW1hZ2U8L3RleHQ+PC9zdmc+';

export function buildImageUrl(path) {
  if (!path) return PLACEHOLDER;
  if (typeof path !== 'string') return PLACEHOLDER;
  const raw = path.trim();
  if (!raw) return PLACEHOLDER;
  if (raw.startsWith('data:')) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      // Avoid external placeholder domains that may fail DNS/firewall in prod
      if (/^(.+\.)?via\.placeholder\.com$/i.test(url.hostname)) return PLACEHOLDER;
      return raw;
    } catch { return PLACEHOLDER; }
  }
  let p = raw.replace(/^\/+/, '');
  if (!p.toLowerCase().startsWith('uploads/')) {
    const base = _IMAGE_BASE.replace(/^\/+/, '').replace(/\/$/, '');
    p = base + '/' + p;
  }
  p = '/' + p.replace(/^\/+/, '');
  const origin = apiAssetOrigin();
  return origin ? origin + p : p;
}

export function placeholderImage() { return PLACEHOLDER; }

export default buildImageUrl;

// -------------------------------------------------------------
// Backward compatibility layer for existing imports in POS, Wishlist, etc.
// (buildProductImageUrl, fallbackAvatar)
// Older components expect an avatar SVG fallback for products without images.
// -------------------------------------------------------------

function _hash(str) {
  let h = 0; if (!str) return h; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function _initials(name='P') { const parts = name.split(/\s+/).filter(Boolean).slice(0,2); return parts.map(p=>p[0].toUpperCase()).join('') || 'P'; }
function _pickColor(seed) {
  const palette = ['#6366F1','#4F46E5','#7C3AED','#4338CA','#6D28D9','#5850EC'];
  return palette[_hash(seed) % palette.length];
}
function _svgAvatar(name) {
  const bg = _pickColor(name||'Product');
  const text = _initials(name||'Product');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>`+
              `<rect width='160' height='160' rx='24' ry='24' fill='${bg}' />`+
              `<text x='50%' y='50%' font-family='Arial,Helvetica,sans-serif' font-size='56' dy='.35em' text-anchor='middle' fill='#FFFFFF'>${text}</text>`+
              `</svg>`;
  // btoa may fail in some SSR contexts – guard
  try { return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`; } catch { return PLACEHOLDER; }
}

export function buildProductImageUrl(path, name='Product') {
  if (!path) return _svgAvatar(name);
  // If we already have a data or absolute URL
  if (/^(data:|https?:)/i.test(path)) return path;
  // Delegate normalization to buildImageUrl but skip avatar logic
  return buildImageUrl(path);
}

export function fallbackAvatar(name='Product') { return _svgAvatar(name); }
