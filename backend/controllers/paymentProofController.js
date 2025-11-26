import { PaymentProof, Order } from "../models/index.js";
import whatsappSvc, { sendWhatsappMessage } from "../utils/whatsappService.js";

const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '082297992691';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Guest upload payment proof (no login)
export const uploadPaymentProofGuest = async (req, res) => {
  try {
    // Diagnostic: log basic request metadata so we can debug why guest uploads may not reach this handler
    const contentType = req.headers['content-type'] || '';
    const bodyPreview = req.body ? (typeof req.body === 'string' ? req.body.slice(0, 200) : JSON.stringify(Object.keys(req.body || {}).slice(0,10))) : null;
    console.log('[PaymentProofGuest] Route hit', { path: req.path, method: req.method, contentType, bodyPreview });

    // Accept either JSON payload with `file_url` (data URL or path) OR multipart file under `req.files.file`
    const { order_id, file_url, mime_type, file_size } = req.body || {};
    // If multipart file present, map it into variables below for unified processing
    let multipartFile = null;
    if (req.files) {
      const fileKeys = Object.keys(req.files || {});
      if (fileKeys.length) multipartFile = req.files[fileKeys[0]]; // accept first file field (be flexible)
    }

    if (!order_id || (!file_url && !multipartFile)) {
      return res.status(400).json({ msg: "order_id dan file_url/file wajib diisi" });
    }

    console.log('[PaymentProofGuest] Incoming upload', { order_id, hasDataUrl: /^data:/.test(file_url || ''), mime_type, file_size, multipartFile: !!multipartFile });
    const order = await Order.findByPk(order_id);
    if (!order) {
      console.error('[PaymentProofGuest] Order not found', { order_id, body: req.body, headers: req.headers });
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }
    let storedPath = file_url;
    // Detect data URL base64 pattern
    const dataUrlMatch = /^data:(.+);base64,(.+)$/.exec(file_url || '');
    if (dataUrlMatch) {
      const detectedMime = dataUrlMatch[1];
      const b64 = dataUrlMatch[2];
      const buffer = Buffer.from(b64, 'base64');
      const safeMime = mime_type || detectedMime || 'application/octet-stream';
      const ext = safeMime.includes('jpeg') ? 'jpg' : (safeMime.split('/')[1] || 'dat');
      const fileName = `${Date.now()}_payment-${order_id}.${ext}`;
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'payment_proofs');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, fileName);
      await fs.promises.writeFile(fullPath, buffer);
      // Konversi ke webp jika gambar
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const sharp = (await import('sharp')).default || (await import('sharp'));
        const webpPath = fullPath.replace(/\.[^.]+$/, '.webp');
        await sharp(fullPath).webp({ quality: 80 }).toFile(webpPath);
        await fs.promises.unlink(fullPath);
        storedPath = `/uploads/payment_proofs/${path.basename(webpPath)}`;
        console.log('[PaymentProofGuest] Saved & converted to webp:', storedPath, 'size:', buffer.length);
      } else {
        storedPath = `/uploads/payment_proofs/${fileName}`;
        console.log('[PaymentProofGuest] Saved file:', storedPath, 'size:', buffer.length);
      }
    } else if (/^https?:\/\//i.test(file_url)) {
      // keep remote URL as-is
    } else if (multipartFile) {
      // Save multipart uploaded file
      const ext = (multipartFile.name || '').split('.').pop();
      const fileName = `${Date.now()}_payment-${order_id}.${ext || 'dat'}`;
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'payment_proofs');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, fileName);
      // express-fileupload provides mv() to move file
      if (typeof multipartFile.mv === 'function') {
        await new Promise((resolve, reject) => multipartFile.mv(fullPath, err => err ? reject(err) : resolve()));
      } else if (multipartFile.data) {
        await fs.promises.writeFile(fullPath, multipartFile.data);
      }
      // convert image to webp when appropriate
      const imageExt = (ext || '').toLowerCase();
      if (["jpg", "jpeg", "png"].includes(imageExt)) {
        const sharp = (await import('sharp')).default || (await import('sharp'));
        const webpPath = fullPath.replace(/\.[^.]+$/, '.webp');
        await sharp(fullPath).webp({ quality: 80 }).toFile(webpPath);
        await fs.promises.unlink(fullPath);
        storedPath = `/uploads/payment_proofs/${path.basename(webpPath)}`;
      } else {
        storedPath = `/uploads/payment_proofs/${fileName}`;
      }
    } else {
      let p = (file_url || '').trim();
      // strip leading ./ or public/
      p = p.replace(/^\.\//, '').replace(/^public\//i, '');
      // ensure no leading slashes for check
      p = p.replace(/^\/+/, '');
      if (!/^uploads\//i.test(p)) {
        p = `uploads/payment_proofs/${p}`;
      }
      storedPath = '/' + p.replace(/^\/+/, '');
    }
    let row;
    try {
      row = await PaymentProof.create({ order_id, file_url: storedPath, mime_type: mime_type, file_size });
    } catch (dbErr) {
      console.error('[PaymentProofGuest] Failed to create PaymentProof', { order_id, storedPath, mime_type, file_size, error: dbErr });
      return res.status(500).json({ msg: "Gagal menyimpan bukti pembayaran", error: dbErr.message });
    }
    res.status(201).json({ ...row.toJSON(), stored: storedPath });
    // Notify admin via WhatsApp about new payment proof (background)
    (async () => {
      try {
        const orderRec = order; // already loaded above
        let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
        if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
        const trackingUrl = base
          ? `${base}/auth/order-tracking/${orderRec.order_id}`
          : `https://lyviawarisanrasa.com/auth/order-tracking/${orderRec.order_id}`;
        const msg = `Bukti pembayaran baru diterima\n\nOrder: ${orderRec.order_number || order_id}\nFile: ${storedPath}\nStatus: pending review\n\nLihat: ${trackingUrl}`;
        const waResult = await sendWhatsappMessage({ to: ADMIN_WHATSAPP_NUMBER, message: msg });
        if (waResult?.ok) console.log('[PaymentProofGuest] Admin WA sent for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, '\nMessage:', msg, '\nStatus:', waResult.status || waResult.data || 'ok');
        else if (waResult?.skipped) console.log('[PaymentProofGuest] Admin WA skipped (disabled) for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER);
        else console.warn('[PaymentProofGuest] Admin WA send failed for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, waResult?.reason || waResult?.error || waResult);
      } catch (e) {
        console.warn('[PaymentProofGuest] Failed admin WA notify:', e?.message || e);
      }
    })();
  } catch (e) {
    console.error('[PaymentProofGuest] Upload failed:', e, { body: req.body, headers: req.headers });
    const code = /limit|size/i.test(e.message) ? 413 : 400;
    res.status(code).json({ msg: "Gagal upload bukti pembayaran", error: e.message });
  }
};

// User upload payment proof
export const uploadPaymentProof = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { order_id, file_url, mime_type, file_size } = req.body;
    if (!user_id) return res.status(401).json({ msg: "Harus login" });
    if (!order_id || !file_url) return res.status(400).json({ msg: "order_id dan file_url wajib diisi" });
    console.log('[PaymentProof] Incoming upload', { order_id, hasDataUrl: /^data:/.test(file_url), mime_type, file_size });
    const order = await Order.findByPk(order_id);
    if (!order) {
      console.error('[PaymentProof] Order not found', { order_id, user_id, body: req.body, headers: req.headers });
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }
    if (order.user_id && order.user_id !== user_id) return res.status(403).json({ msg: "Tidak boleh upload untuk order orang lain" });
    let storedPath = file_url;
    // Detect data URL base64 pattern
    const dataUrlMatch = /^data:(.+);base64,(.+)$/.exec(file_url || '');
    if (dataUrlMatch) {
      const detectedMime = dataUrlMatch[1];
      const b64 = dataUrlMatch[2];
      const buffer = Buffer.from(b64, 'base64');
      const safeMime = mime_type || detectedMime || 'application/octet-stream';
      const ext = safeMime.includes('jpeg') ? 'jpg' : (safeMime.split('/')[1] || 'dat');
      const fileName = `${Date.now()}_payment-${order_id}.${ext}`;
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'payment_proofs');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, fileName);
      await fs.promises.writeFile(fullPath, buffer);
      // Konversi ke webp jika gambar
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const sharp = (await import('sharp')).default || (await import('sharp'));
        const webpPath = fullPath.replace(/\.[^.]+$/, '.webp');
        await sharp(fullPath).webp({ quality: 80 }).toFile(webpPath);
        await fs.promises.unlink(fullPath);
        storedPath = `/uploads/payment_proofs/${path.basename(webpPath)}`;
        console.log('[PaymentProof] Saved & converted to webp:', storedPath, 'size:', buffer.length);
      } else {
        storedPath = `/uploads/payment_proofs/${fileName}`; // relative path served under /uploads
        console.log('[PaymentProof] Saved file:', storedPath, 'size:', buffer.length);
      }
    } else if (/^https?:\/\//i.test(file_url)) {
      // keep remote URL as-is
    } else {
      // Normalize any non-absolute path into /uploads/payment_proofs
      let p = (file_url || '').trim();
      // strip leading ./ or public/
      p = p.replace(/^\.\//, '').replace(/^public\//i, '');
      // ensure no leading slashes for check
      p = p.replace(/^\/+/, '');
      if (!/^uploads\//i.test(p)) {
        p = `uploads/payment_proofs/${p}`;
      }
      storedPath = '/' + p.replace(/^\/+/, '');
    }
    let row;
    try {
      row = await PaymentProof.create({ order_id, file_url: storedPath, mime_type: mime_type, file_size });
    } catch (dbErr) {
      console.error('[PaymentProof] Failed to create PaymentProof', { order_id, storedPath, mime_type, file_size, error: dbErr });
      return res.status(500).json({ msg: "Gagal menyimpan bukti pembayaran", error: dbErr.message });
    }
    res.status(201).json({ ...row.toJSON(), stored: storedPath });

    // Notify admin via WhatsApp about new payment proof (background)
    (async () => {
      try {
        const orderRec = order; // loaded above
        let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
        if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
        const trackingUrl = base
          ? `${base}/auth/order-tracking/${orderRec.order_id}`
          : `https://lyviawarisanrasa.com/auth/order-tracking/${orderRec.order_id}`;
        const msg = `Bukti pembayaran baru oleh user ${user_id}\n\nOrder: ${orderRec.order_number || order_id}\nFile: ${storedPath}\nStatus: pending review\n\nLihat: ${trackingUrl}`;
        const waResult = await sendWhatsappMessage({ to: ADMIN_WHATSAPP_NUMBER, message: msg });
        if (waResult?.ok) console.log('[PaymentProof] Admin WA sent for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, '\nMessage:', msg, '\nStatus:', waResult.status || waResult.data || 'ok');
        else if (waResult?.skipped) console.log('[PaymentProof] Admin WA skipped (disabled) for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER);
        else console.warn('[PaymentProof] Admin WA send failed for order:', orderRec.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, waResult?.reason || waResult?.error || waResult);
      } catch (e) {
        console.warn('[PaymentProof] Failed admin WA notify:', e?.message || e);
      }
    })();
  } catch (e) {
    console.error('[PaymentProof] Upload failed:', e, { body: req.body, headers: req.headers });
    const code = /limit|size/i.test(e.message) ? 413 : 400;
    res.status(code).json({ msg: "Gagal upload bukti pembayaran", error: e.message });
  }
};

// Admin review list
export const listPaymentProofs = async (req, res) => {
  try {
    const { status, order_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (order_id) where.order_id = order_id;
    const rows = await PaymentProof.findAll({ where, order: [["uploaded_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    console.error('[listPaymentProofs] Error fetching payment proofs', { query: req.query, error: e });
    res.status(500).json({ msg: "Gagal mengambil bukti pembayaran", error: e.message });
  }
};

export const moderatePaymentProof = async (req, res) => {
  const t = await PaymentProof.sequelize.transaction();
  try {
    const reviewer = req.session?.user_id || null;
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ msg: "action tidak valid" });
    const status = action === 'approve' ? 'approved' : 'rejected';
    const proof = await PaymentProof.findByPk(id, { transaction: t });
    if (!proof) { await t.rollback(); return res.status(404).json({ msg: 'Proof tidak ditemukan' }); }
    await PaymentProof.update({ status, reviewed_by: reviewer, reviewed_at: new Date() }, { where: { proof_id: id }, transaction: t });

    // Update order payment_status if approved
    const order = await Order.findByPk(proof.order_id, { transaction: t });
    if (order) {
      if (status === 'approved') {
        if (order.payment_status !== 'paid') {
          await order.update({ payment_status: 'paid', paid_at: order.paid_at || new Date() }, { transaction: t });
        }
      } else if (status === 'rejected') {
        // If all proofs rejected now, ensure payment_status returns to unpaid (unless already paid by other method)
        const others = await PaymentProof.findAll({ where: { order_id: order.order_id }, transaction: t });
        const anyApproved = others.some(p => p.status === 'approved');
        if (!anyApproved && order.payment_status === 'paid') {
          // Only downgrade if originally unpaid (heuristic: no paid_at?) -> We'll be conservative; skip downgrade if paid_at exists
          if (dataUrlMatch) {
            await order.update({ payment_status: 'unpaid' }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    const refreshed = await PaymentProof.findByPk(id);
    res.json(refreshed);
  } catch (e) {
    try { await t.rollback(); } catch (rbErr) { console.error('[moderatePaymentProof] rollback failed', rbErr); }
    console.error('[moderatePaymentProof] Error while moderating proof', { params: req.params, body: req.body, error: e });
    res.status(400).json({ msg: "Gagal memoderasi bukti pembayaran", error: e.message });
  }
};

// User scope: list proofs for orders belonging to current user
export const listMyPaymentProofs = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    if (!user_id) return res.status(401).json({ msg: 'Harus login' });
    const { order_id } = req.query;
    const orderWhere = { user_id };
    if (order_id) orderWhere.order_id = order_id;
    // Find user orders first (avoid exposing other users' proofs)
    const orders = await Order.findAll({ where: orderWhere, attributes: ['order_id'] });
    const orderIds = orders.map(o => o.order_id);
    if (!orderIds.length) return res.json([]);
    const proofWhere = { order_id: orderIds };
    if (order_id) proofWhere.order_id = order_id; // narrowed
    const rows = await PaymentProof.findAll({ where: proofWhere, order: [["uploaded_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    console.error('[listMyPaymentProofs] Error fetching user proofs', { user_id: req.session?.user_id, query: req.query, error: e });
    res.status(500).json({ msg: 'Gagal mengambil bukti pembayaran user', error: e.message });
  }
};
