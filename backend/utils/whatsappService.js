import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load optional notificationSettings.json for backward compatibility/toggle
let settings = null;
try {
  const p = path.join(process.cwd(), 'backend', 'config', 'notificationSettings.json');
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf-8');
    settings = JSON.parse(raw);
  }
} catch (e) {
  // ignore
}

const isWhatsappEnabled = () => {
  if (process.env.WHATSAPP_ENABLED?.toLowerCase() === 'true') return true;
  if (settings?.methods?.whatsapp === true) return true;
  return false;
};

export const normalizePhone = (phone) => {
  if (!phone) return null;
  let wa = String(phone).replace(/[^+0-9]/g, '');
  if (wa.startsWith('0')) wa = '62' + wa.slice(1);
  if (wa.startsWith('+')) wa = wa.slice(1);
  return wa;
};

const sendViaGenericGateway = async (to, message) => {
  const url = process.env.WA_GATEWAY_URL;
  const token = process.env.WA_GATEWAY_TOKEN || process.env.WHATSAPP_TOKEN;
  if (!url || !token) {
    console.warn('[WhatsApp] WA_GATEWAY_URL or WA_GATEWAY_TOKEN not set');
    return { ok: false, reason: 'no-config' };
  }
  const headers = {
    'Content-Type': 'application/json',
  };
  // Allow custom header name/value for certain providers
  if (process.env.WA_GATEWAY_HEADER_NAME && process.env.WA_GATEWAY_HEADER_VALUE) {
    headers[process.env.WA_GATEWAY_HEADER_NAME] = process.env.WA_GATEWAY_HEADER_VALUE;
  } else {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const body = {
    to,
    message,
  };
  try {
    const resp = await axios.post(url, body, { headers, timeout: parseInt(process.env.WA_GATEWAY_TIMEOUT || '15000') });
    const ok = resp.status >= 200 && resp.status < 300;
    return { ok, status: resp.status, data: resp.data };
  } catch (e) {
    console.error('[WhatsApp][Generic] send failed:', e.response?.status, e.response?.data || e.message);
    return { ok: false, error: e.message, status: e.response?.status, data: e.response?.data };
  }
};

// Minimal Fonnte support as alternative provider
const sendViaFonnte = async (to, message) => {
  const url = process.env.FONNTE_URL || 'https://api.fonnte.com/send';
  const token = process.env.FONNTE_TOKEN || process.env.WA_GATEWAY_TOKEN || process.env.WHATSAPP_TOKEN;
  if (!token) {
    console.warn('[WhatsApp][Fonnte] token not set');
    return { ok: false, reason: 'no-token' };
  }
  try {
    const resp = await axios.post(url, { target: to, message }, {
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      timeout: parseInt(process.env.WA_GATEWAY_TIMEOUT || '15000')
    });
    const ok = resp.status >= 200 && resp.status < 300;
    return { ok, status: resp.status, data: resp.data };
  } catch (e) {
    console.error('[WhatsApp][Fonnte] send failed:', e.response?.status, e.response?.data || e.message);
    return { ok: false, error: e.message, status: e.response?.status, data: e.response?.data };
  }
};

export const sendWhatsappMessage = async ({ to, message }) => {
  if (!isWhatsappEnabled()) {
    console.log('[WhatsApp] Disabled by config');
    return { ok: false, skipped: true };
  }
  const phone = normalizePhone(to);
  if (!phone) return { ok: false, reason: 'no-phone' };

  const provider = (process.env.WHATSAPP_PROVIDER || process.env.WA_PROVIDER || 'generic').toLowerCase();
  if (provider === 'fonnte') return sendViaFonnte(phone, message);
  return sendViaGenericGateway(phone, message);
};

const idStatusMap = {
  pending: 'MENUNGGU',
  processing: 'DIPROSES',
  shipped: 'DIKIRIM',
  completed: 'SELESAI',
  cancelled: 'DIBATALKAN',
};

export const buildOrderStatusMessage = (order, newStatusEn, storeName = 'Lyvia Nusa Boga') => {
  const idLabel = idStatusMap[newStatusEn] || newStatusEn;
  const code = order?.order_number || order?.order_id;
  const orderId = order?.order_id;
  
  // Link tracking untuk pelanggan - use env-configured client origin or server url
  let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  const trackingUrl = base
    ? `${base}/auth/order-tracking/${orderId}`
    : `https://lyviawarisanrasa.com/auth/order-tracking/${orderId}`; // safe fallback
  
  // Return plain URL on its own line (preferred by most WA gateways)
  return `Halo, status pesanan Anda (${code}) telah diperbarui menjadi: ${idLabel}.\n\nLacak pesanan Anda di:\n${trackingUrl}\n\nTerima kasih telah berbelanja di ${storeName}.`;
};

export default {
  sendWhatsappMessage,
  buildOrderStatusMessage,
  normalizePhone,
};
