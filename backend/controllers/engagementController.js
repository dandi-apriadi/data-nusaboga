import { Review, Notification, LoyaltyPoint, Testimonial, NewsletterSubscriber } from "../models/index.js";

// Reviews
export const listReviews = async (req, res) => {
  try {
    const { product_id, user_id } = req.query;
    const where = {};
    if (product_id) where.product_id = product_id;
    if (user_id) where.user_id = user_id;
    const rows = await Review.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil ulasan", error: e.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const row = await Review.create({ ...req.body, user_id });
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat ulasan", error: e.message });
  }
};

// Notifications
export const listNotifications = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    console.log('[Engagement] listNotifications called for user_id:', user_id);
    const rows = await Notification.findAll({ where: { user_id }, order: [["created_at", "DESC"]] });
    console.log('[Engagement] listNotifications found:', rows.length);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil notifikasi", error: e.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { id } = req.params;
    console.log('[Engagement] markNotificationRead called for user_id:', user_id, 'notification_id:', id);
    const [updated] = await Notification.update({ is_read: true, read_at: new Date() }, { where: { notification_id: id, user_id } });
    console.log('[Engagement] markNotificationRead updated rows:', updated);
    res.json({ msg: 'Notifikasi ditandai dibaca' });
  } catch (e) {
    res.status(400).json({ msg: "Gagal update notifikasi", error: e.message });
  }
};

// Loyalty
export const listLoyalty = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const rows = await LoyaltyPoint.findAll({ where: { user_id }, order: [["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil poin", error: e.message });
  }
};

// Public testimonials
export const listTestimonialsPublic = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const lim = Math.min(parseInt(limit) || 6, 24);
    const rows = await Testimonial.findAll({ where: { active: true }, order: [['created_at','DESC']], limit: lim });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: 'Gagal mengambil testimoni', error: e.message });
  }
};

// Newsletter subscription
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ msg: 'Email tidak valid' });
    }
    const existing = await NewsletterSubscriber.findOne({ where: { email } });
    if (existing) {
      if (existing.status === 'active') return res.json({ msg: 'Sudah terdaftar' });
      await existing.update({ status: 'active' });
      return res.json({ msg: 'Berhasil re-aktivasi langganan' });
    }
    await NewsletterSubscriber.create({ email });
    res.status(201).json({ msg: 'Berhasil berlangganan' });
  } catch (e) {
    res.status(500).json({ msg: 'Gagal menyimpan langganan', error: e.message });
  }
};
