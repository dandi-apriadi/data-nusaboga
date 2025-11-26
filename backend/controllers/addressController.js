import { Address } from "../models/index.js";

export const listAddresses = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const rows = await Address.findAll({ where: { user_id }, order: [["is_default", "DESC"], ["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil alamat", error: e.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const payload = { ...req.body, user_id };
    const addr = await Address.create(payload);
    res.status(201).json(addr);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat alamat", error: e.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { id } = req.params;
    await Address.update({ ...req.body }, { where: { address_id: id, user_id } });
    const addr = await Address.findByPk(id);
    res.json(addr);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah alamat", error: e.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { id } = req.params;
    await Address.destroy({ where: { address_id: id, user_id } });
    res.json({ msg: "Alamat dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus alamat", error: e.message });
  }
};
