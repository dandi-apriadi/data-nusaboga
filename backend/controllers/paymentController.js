import { PaymentMethod, Payment } from "../models/index.js";

export const listPaymentMethods = async (req, res) => {
  try {
    const rows = await PaymentMethod.findAll({ where: { active: true }, order: [["name", "ASC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil metode pembayaran", error: e.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const pay = await Payment.create(req.body);
    res.status(201).json(pay);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat pembayaran", error: e.message });
  }
};
