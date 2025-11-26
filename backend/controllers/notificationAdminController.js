import { NotificationTemplate, NotificationJob, NotificationDelivery, User } from "../models/index.js";

// Templates CRUD
export const listTemplates = async (req, res) => {
  try {
    const rows = await NotificationTemplate.findAll({ order: [["updated_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil template", error: e.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const row = await NotificationTemplate.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat template", error: e.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationTemplate.update(req.body, { where: { template_id: id } });
    const row = await NotificationTemplate.findByPk(id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah template", error: e.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationTemplate.destroy({ where: { template_id: id } });
    res.json({ msg: "Template dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus template", error: e.message });
  }
};

// Jobs (send)
export const listJobs = async (req, res) => {
  try {
    const rows = await NotificationJob.findAll({ order: [["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil jobs", error: e.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const created_by = req.session?.user_id || null;
    const payload = { ...req.body, created_by };
    // Target validation shortcut (optional)
    if (payload.target_type === 'specific' && !payload.target_user_ids) {
      return res.status(400).json({ msg: "target_user_ids wajib untuk target_type specific" });
    }
    const row = await NotificationJob.create(payload);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat job", error: e.message });
  }
};

export const getJobDeliveries = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await NotificationDelivery.findAll({ where: { job_id: id }, order: [["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil delivery", error: e.message });
  }
};

// Note: actual sending should be handled by a worker/cron; this API only creates jobs
