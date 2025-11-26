import db from "../config/Database.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import openai from "../config/openai.js";
import {
  ChatSession,
  ChatMessage,
  ChatContextVariable,
  ChatSessionEvent,
  ChatbotQuickReply,
} from "../models/index.js";
import {
  searchProducts,
  getProductCategories,
  getPopularProducts,
  getLowStockProducts,
  getOrderByNumber,
  getOrderStatistics,
  searchCustomers,
  getTopSellingProducts,
  getTopSellingProductsBySales,
  listActiveProducts
} from "../utils/databaseHelpers.js";

// Small helper
const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]).filter(([, v]) => v !== undefined));

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo"; // you may set to 'gpt-4o-mini' for better quality if available

// Advanced AI-powered bot reply with database context
const aiBotReply = async (text, sessionId = null) => {
  try {
    // Analisis intent dan extract keywords dari pesan user
    const keywords = extractKeywords(text);
    let contextData = {};

    // Gather relevant data from database based on keywords
  if (keywords.includes('produk') || keywords.includes('cakalang') || keywords.includes('abon')) {
      // Search for products using relevant keywords instead of full text
      const searchTerms = ['cakalang', 'abon', 'dendeng', 'sambal'].filter(term => 
        text.toLowerCase().includes(term)
      );
      const searchTerm = searchTerms.length > 0 ? searchTerms[0] : 'cakalang';
      
      contextData.products = await searchProducts(searchTerm, 5);
      contextData.categories = await getProductCategories();
      contextData.popularProducts = await getPopularProducts(3);
      // If no products found, provide some active products as fallback
      if (!contextData.products || contextData.products.length === 0) {
        contextData.defaultActiveProducts = await listActiveProducts(8);
      }
    }

    if (keywords.includes('pesanan') || keywords.includes('order') || /\b\d{6,}\b/.test(text)) {
      const orderNumber = text.match(/\b\d{6,}\b/)?.[0];
      if (orderNumber) {
        contextData.order = await getOrderByNumber(orderNumber);
      }
      contextData.orderStats = await getOrderStatistics(7);
    }

    if (keywords.includes('customer') || keywords.includes('pelanggan') || text.includes('@')) {
      const searchTerm = text.match(/\S+@\S+\.\S+/)?.[0] || text;
      contextData.customers = await searchCustomers(searchTerm, 3);
    }

    if (keywords.includes('laporan') || keywords.includes('report') || keywords.includes('statistik') || keywords.includes('top') || keywords.includes('laris')) {
      contextData.topProducts = await getTopSellingProducts(5);
      contextData.orderStats = await getOrderStatistics(30);
      contextData.lowStock = await getLowStockProducts(5);
      // Add sales-based top selling (last 30 days)
      contextData.topSellingSales = await getTopSellingProductsBySales(30, 8);
    }

    // Build a concise product snapshot to reduce hallucinations
    const collectProducts = [];
    const addItems = (arr) => {
      if (Array.isArray(arr)) {
        for (const p of arr) {
          if (!p || !p.name) continue;
          // Use a composite key to dedupe by name+price
          const key = `${p.name}__${p.price ?? ''}`;
          if (!collectProducts.find(x => x.key === key)) {
            collectProducts.push({ key, name: p.name, price: p.price });
          }
        }
      }
    };
    addItems(contextData.products);
    addItems(contextData.popularProducts);
    addItems(contextData.topProducts);
    addItems(contextData.defaultActiveProducts);
    if (Array.isArray(contextData.topSellingSales)) {
      for (const s of contextData.topSellingSales) {
        collectProducts.push({ key: `sales__${s.name}__${s.price ?? ''}`, name: s.name, price: s.price });
      }
    }
    const productSnapshot = collectProducts
      .slice(0, 12)
      .map(p => `- ${p.name} | harga: ${p.price !== undefined && p.price !== null ? `IDR ${p.price}` : 'tidak tersedia'}`)
      .join('\n');

    // Create system prompt with strict data-accuracy rules and correct contacts
  const systemPrompt = `Anda adalah asisten virtual untuk Lyvia Nusa Boga, marketplace UMKM olahan cakalang.

ATURAN PENTING (WAJIB DIIKUTI):
- Jawab hanya berdasarkan data yang tersedia dari sistem (context) dan jangan menebak.
- Jika harga/produk tidak ada di data, katakan dengan jujur bahwa data tidak ditemukan, lalu tawarkan bantuan lain.
- Saat menampilkan harga, gunakan nilai price dari data dan formatkan sebagai Rupiah secara sederhana (contoh: Rp 50.000).
- Jangan mengarang nomor kontak atau email.

KONTAK RESMI:
- Telepon/WhatsApp: +62 822-9799-2691
- Email: lyvianusaboga@gmail.com
- Jam operasional: 08:00–17:00 WIB (Senin–Sabtu)

DATA CONTEXT (JSON mentah):
${JSON.stringify(contextData, null, 2)}

RINGKASAN PRODUK (nama dan harga dari database):
${productSnapshot || '(tidak ada produk relevan ditemukan)'}

INSTRUKSI OUTPUT:
1) Jika user menanya produk/harga: tampilkan daftar dari data di atas saja (nama + harga). Jika kosong, minta kata kunci lebih spesifik.
2) Jika user menanya pesanan: jawab status/detail dari data context.
3) Jika user menanya hal lain: jawab ringkas sesuai data. Jika tidak ada data, arahkan ke kontak resmi di atas.
4) Maksimal ~180 kata, rapi dengan bullet jika cocok, dan bahasa Indonesia sopan.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    return completion.choices[0]?.message?.content || fallbackResponse(text);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return fallbackResponse(text);
  }
};

// Helper function to extract keywords
const extractKeywords = (text) => {
  const lowerText = text.toLowerCase();
  const keywords = [];
  
  const keywordMap = {
    'produk': ['produk', 'product', 'barang', 'cakalang', 'abon', 'dendeng', 'fufu', 'sambal'],
    'pesanan': ['pesanan', 'order', 'pesan', 'beli', 'transaksi'],
    'harga': ['harga', 'price', 'berapa', 'cost', 'tarif'],
    'customer': ['customer', 'pelanggan', 'user', 'pengguna'],
    'laporan': ['laporan', 'report', 'statistik', 'analisis', 'data', 'banyak dibeli', 'paling laris', 'terlaris', 'laris', 'top selling', 'banyak di beli'],
    'pengiriman': ['kirim', 'pengiriman', 'ongkir', 'shipping', 'delivery'],
    'kontak': ['kontak', 'hubungi', 'contact', 'customer service'],
  };

  for (const [category, words] of Object.entries(keywordMap)) {
    if (words.some(word => lowerText.includes(word))) {
      keywords.push(category);
    }
  }

  return keywords;
};

// Fallback response for when AI fails
const fallbackResponse = (text) => {
  const lower = text.toLowerCase().trim();
  
  if (lower.includes("halo") || lower.includes("hello") || lower.includes("hai")) {
    return "Halo! Selamat datang di Lyvia Nusa Boga! 👋 Saya adalah asisten virtual yang siap membantu Anda. Ada yang bisa saya bantu hari ini?";
  }
  
  if (lower === "test" || lower.includes("testing")) {
    return "Halo! Sistem chatbot berfungsi dengan baik. 🤖 Saya siap membantu Anda dengan informasi tentang produk, harga, pengiriman, atau pertanyaan lainnya. Silakan tanyakan apa yang Anda butuhkan!";
  }
  
  return "Terima kasih! Jika Anda butuh bantuan lanjut, silakan hubungi CS kami: Telepon/WhatsApp +62 822-9799-2691 atau email lyvianusaboga@gmail.com.";
};

// POST /chat/sessions - create or get active session
export const createOrGetSession = async (req, res) => {
  try {
    const userId = req.session?.user_id || null;
    const { session_token, source = "web", title, related_order_id } = req.body || {};

    const where = { status: "active" };
    if (userId) where.user_id = userId; else if (session_token) where.session_token = session_token;

    let session = null;
    if (where.user_id || where.session_token) {
      session = await ChatSession.findOne({ where, order: [["started_at", "DESC"]] });
    }

    if (!session) {
      const token = userId ? null : (session_token || uuidv4());
      session = await ChatSession.create({
        user_id: userId,
        session_token: token,
        source,
        status: "active",
        title,
        related_order_id,
        started_at: new Date(),
        last_message_at: new Date(),
      });

      await ChatSessionEvent.create({ chat_session_id: session.chat_session_id, type: "session_started", payload_json: null });
    }

    res.status(201).json({
      chat_session_id: session.chat_session_id,
      user_id: session.user_id,
      session_token: session.session_token,
      status: session.status,
      source: session.source,
      title: session.title,
      related_order_id: session.related_order_id,
      started_at: session.started_at,
    });
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat/mengambil sesi chat", error: e.message });
  }
};

// GET /chat/sessions/:id - get session detail (basic)
export const getSession = async (req, res) => {
  try {
    const s = await ChatSession.findByPk(req.params.id);
    if (!s) return res.status(404).json({ msg: "Sesi tidak ditemukan" });
    const messages_count = await ChatMessage.count({ where: { chat_session_id: s.chat_session_id } });
    res.json({ ...s.toJSON(), messages_count });
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil sesi", error: e.message });
  }
};

// POST /chat/sessions/:id/messages - append message and respond
export const postMessage = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const { message_text, message_type = "text" } = req.body || {};
    const s = await ChatSession.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) {
      await t.rollback();
      return res.status(404).json({ msg: "Sesi tidak ditemukan" });
    }
    if (s.status === "closed") {
      await t.rollback();
      return res.status(400).json({ msg: "Sesi sudah ditutup" });
    }

    const senderId = req.session?.user_id || null;
    const userMsg = await ChatMessage.create({
      chat_session_id: s.chat_session_id,
      sender_type: "user",
      sender_id: senderId,
      message_type,
      message_text,
    }, { transaction: t });

    // Simple reply now; replace with KB/Intent later
    const botText = await aiBotReply(message_text, s.chat_session_id);
    const botMsg = await ChatMessage.create({
      chat_session_id: s.chat_session_id,
      sender_type: "bot",
      message_type: "text",
      message_text: botText,
    }, { transaction: t });

    // Update session timestamps
    await ChatSession.update({ last_message_at: new Date() }, { where: { chat_session_id: s.chat_session_id }, transaction: t });

    await t.commit();
    res.status(201).json({ user: userMsg, bot: botMsg });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal mengirim pesan", error: e.message });
  }
};

// GET /chat/sessions/:id/messages?after=&limit=
export const listMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { after, limit = 50 } = req.query;
    const where = { chat_session_id: id };
    if (after) where.created_at = { [Op.gt]: new Date(after) };

    const rows = await ChatMessage.findAll({
      where,
      order: [["created_at", "ASC"]],
      limit: Math.min(parseInt(limit) || 50, 200),
    });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil pesan", error: e.message });
  }
};

// PATCH /chat/sessions/:id/close
export const closeSession = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const s = await ChatSession.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!s) {
      await t.rollback();
      return res.status(404).json({ msg: "Sesi tidak ditemukan" });
    }
    if (s.status === "closed") {
      await t.rollback();
      return res.json({ msg: "Sesi sudah ditutup" });
    }

    await ChatSession.update({ status: "closed", ended_at: new Date() }, { where: { chat_session_id: id }, transaction: t });
    await ChatSessionEvent.create({ chat_session_id: id, type: "session_closed", payload_json: null }, { transaction: t });

    await t.commit();
    res.json({ msg: "Sesi ditutup" });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal menutup sesi", error: e.message });
  }
};

// GET /chat/quick-replies
export const listQuickReplies = async (req, res) => {
  try {
    const items = await ChatbotQuickReply.findAll({ where: { is_active: true }, order: [["sort_order", "ASC"], ["label", "ASC"]] });
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil quick replies", error: e.message });
  }
};

// Optional: store/update context variables
// PUT /chat/sessions/:id/context
export const upsertContext = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const entries = Array.isArray(req.body) ? req.body : [req.body];
    for (const item of entries) {
      const { key, value_json, expires_at } = pick(item, ["key", "value_json", "expires_at"]);
      if (!key || value_json === undefined) continue;
      const [row] = await ChatContextVariable.upsert({
        chat_session_id: id,
        key,
        value_json,
        expires_at: expires_at ? new Date(expires_at) : null,
      }, { transaction: t });
    }
    await t.commit();
    res.json({ msg: "Context disimpan" });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal menyimpan context", error: e.message });
  }
};
