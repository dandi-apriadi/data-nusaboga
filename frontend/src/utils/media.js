// Utility helpers for media / image URL handling
// Ensures that relative paths (e.g. /uploads/products/abc.jpg) are resolved against the backend origin
// and not the frontend dev server. This avoids broken images when frontend runs on a different port.

// Strip trailing slash helper
const stripTrailingSlash = (s = '') => s.replace(/\/$/, '');

// Remove any /api or /api/v{n} suffix so we can access static assets directly.
const stripApiSuffix = (s = '') => s.replace(/\/api(\/v\d+)?$/, '');

export const buildImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const baseEnv = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '';
  let origin = stripApiSuffix(stripTrailingSlash(baseEnv));
  if (!origin && typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port === '3000' || port === '3001' || port === '5173') {
      origin = `${protocol}//${hostname}:5000`;
    }
  }
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  return origin ? origin + normalizedPath : normalizedPath;
};

// Optionally expose a placeholder constant (single source of truth)
export const PRODUCT_PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

export default buildImageUrl;
