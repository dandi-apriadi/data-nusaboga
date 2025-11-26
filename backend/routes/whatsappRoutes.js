import { Router } from 'express';
import { sendWhatsappMessage } from '../utils/whatsappService.js';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';

const router = Router();

/**
 * POST /api/v1/whatsapp/send
 * Send WhatsApp message (admin only)
 * Body: { to: string, message: string }
 */
router.post('/send', verifyUser, adminOnly, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        msg: 'Nomor tujuan (to) dan pesan (message) wajib diisi'
      });
    }

    // Send WhatsApp message
    const result = await sendWhatsappMessage({ to, message });

    if (result.success) {
      return res.json({
        success: true,
        msg: 'Pesan WhatsApp berhasil dikirim',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: result.error || 'Gagal mengirim pesan WhatsApp',
        error: result.error
      });
    }
  } catch (error) {
    console.error('[WhatsApp Route] Error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan saat mengirim WhatsApp',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/whatsapp/status
 * Check WhatsApp service status
 */
router.get('/status', verifyUser, async (req, res) => {
  try {
    const enabled = process.env.WHATSAPP_ENABLED === 'true';
    const provider = process.env.WHATSAPP_PROVIDER || 'none';
    const token = process.env.FONNTE_TOKEN;

    return res.json({
      success: true,
      data: {
        enabled,
        provider,
        configured: enabled && !!token,
        message: enabled && token ? 'WhatsApp service aktif' : 'WhatsApp service tidak dikonfigurasi'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Gagal memeriksa status WhatsApp',
      error: error.message
    });
  }
});

export default router;
