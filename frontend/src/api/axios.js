import axios from 'axios';

// Build a stable API base URL without duplicating path segments.
// Rules:
// 1. REACT_APP_API_BASE_URL should point to server origin (e.g. http://localhost:5000 or http://api.example.com)
// 2. We append '/api' only if the provided base does NOT already end with /api or /api/v1
// 3. Future versioning: if backend migrates to /api/v1, just set REACT_APP_API_BASE_URL to origin and adjust VERSION_PATH below.
const ORIGIN = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
const VERSION_PATH = '/v1'; // Backend uses /api/v1

let base = ORIGIN || '';
if (!/\/api(\/v\d+)?$/.test(base)) {
  base = base + '/api';
}
// Append version path if defined and not already there
if (VERSION_PATH && !base.endsWith(VERSION_PATH)) {
  base = base + VERSION_PATH;
}

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
});

export default api;
