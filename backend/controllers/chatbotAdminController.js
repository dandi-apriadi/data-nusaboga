import { ChatSession, ChatMessage, ChatSessionEvent, ChatbotKnowledgeBase, ChatbotQuickReply } from "../models/index.js";

// Escalations: sessions with human handover
export const listEscalations = async (req, res) => {
  try {
    const { status } = req.query; // pending | in_progress | resolved (mapped)
    const where = { is_human_handover: true };
    if (status === 'resolved') where.status = 'closed';
    if (status === 'pending' || status === 'in_progress') where.status = 'active';
    const rows = await ChatSession.findAll({ where, order: [["last_message_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil eskalasi", error: e.message });
  }
};

export const replyToEscalation = async (req, res) => {
  try {
    const { id } = req.params; // chat_session_id
    const agent_id = req.session?.user_id || null;
    const { message_text } = req.body;
    if (!message_text) return res.status(400).json({ msg: "message_text wajib diisi" });
    const msg = await ChatMessage.create({ chat_session_id: id, sender_type: 'agent', sender_id: agent_id, message_text });
    await ChatSession.update({ last_message_at: new Date(), assigned_to: agent_id }, { where: { chat_session_id: id } });
    await ChatSessionEvent.create({ chat_session_id: id, type: 'agent_joined', payload_json: null });
    res.status(201).json(msg);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengirim balasan", error: e.message });
  }
};

export const resolveEscalation = async (req, res) => {
  try {
    const { id } = req.params; // chat_session_id
    await ChatSession.update({ status: 'closed', ended_at: new Date() }, { where: { chat_session_id: id } });
    await ChatSessionEvent.create({ chat_session_id: id, type: 'session_closed', payload_json: null });
    const row = await ChatSession.findByPk(id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal menyelesaikan eskalasi", error: e.message });
  }
};

// FAQ via knowledge base
export const listFaqs = async (req, res) => {
  try {
    const rows = await ChatbotKnowledgeBase.findAll({ where: { is_active: true }, order: [["updated_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil FAQ", error: e.message });
  }
};

export const createFaq = async (req, res) => {
  try {
    const row = await ChatbotKnowledgeBase.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat FAQ", error: e.message });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatbotKnowledgeBase.update(req.body, { where: { kb_id: id } });
    const row = await ChatbotKnowledgeBase.findByPk(id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah FAQ", error: e.message });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatbotKnowledgeBase.destroy({ where: { kb_id: id } });
    res.json({ msg: "FAQ dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus FAQ", error: e.message });
  }
};

// Quick Replies
export const listQuickReplies = async (req, res) => {
  try {
    const rows = await ChatbotQuickReply.findAll({ where: { is_active: true }, order: [["sort_order", "ASC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil quick replies", error: e.message });
  }
};

export const createQuickReply = async (req, res) => {
  try {
    const row = await ChatbotQuickReply.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat quick reply", error: e.message });
  }
};

export const updateQuickReply = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatbotQuickReply.update(req.body, { where: { quick_reply_id: id } });
    const row = await ChatbotQuickReply.findByPk(id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah quick reply", error: e.message });
  }
};

export const deleteQuickReply = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatbotQuickReply.destroy({ where: { quick_reply_id: id } });
    res.json({ msg: "Quick reply dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus quick reply", error: e.message });
  }
};
