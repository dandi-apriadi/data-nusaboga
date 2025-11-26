import { ReferralCode, User, ReferralBonusTransaction } from "../models/index.js";
import db from "../config/Database.js";
import path from "path";
import fs from "fs";

// Lightweight safeguard: ensure new columns exist (dev convenience). In production prefer proper migrations.
let referralColumnsChecked = false;
const ensureReferralExtraColumns = async () => {
  if (referralColumnsChecked) return;
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM `referral_codes` WHERE Field IN ('owner_user_id','bonus_percent','payout_bank_name','payout_account_number','payout_account_holder','payment_status','payment_proof','paid_to_account','paid_date','paid_amount','payment_notes')");
    const existing = rows.map(r => r.Field);
    const statements = [];
    if (!existing.includes('owner_user_id')) {
      statements.push("ADD COLUMN `owner_user_id` VARCHAR(191) NULL AFTER `usage_count`");
    }
    if (!existing.includes('bonus_percent')) {
      statements.push("ADD COLUMN `bonus_percent` DECIMAL(5,2) NULL AFTER `owner_user_id`");
    }
    if (!existing.includes('payout_bank_name')) {
      statements.push("ADD COLUMN `payout_bank_name` VARCHAR(80) NULL AFTER `min_order_amount`");
    }
    if (!existing.includes('payout_account_number')) {
      statements.push("ADD COLUMN `payout_account_number` VARCHAR(50) NULL AFTER `payout_bank_name`");
    }
    if (!existing.includes('payout_account_holder')) {
      statements.push("ADD COLUMN `payout_account_holder` VARCHAR(120) NULL AFTER `payout_account_number`");
    }
    if (!existing.includes('payment_status')) {
      statements.push("ADD COLUMN `payment_status` ENUM('unpaid','pending','paid') DEFAULT 'unpaid' AFTER `payout_account_holder`");
    }
    if (!existing.includes('payment_proof')) {
      statements.push("ADD COLUMN `payment_proof` VARCHAR(255) NULL AFTER `payment_status`");
    }
    if (!existing.includes('paid_to_account')) {
      statements.push("ADD COLUMN `paid_to_account` VARCHAR(100) NULL AFTER `payment_proof`");
    }
    if (!existing.includes('paid_date')) {
      statements.push("ADD COLUMN `paid_date` DATETIME NULL AFTER `paid_to_account`");
    }
    if (!existing.includes('paid_amount')) {
      statements.push("ADD COLUMN `paid_amount` DECIMAL(12,2) NULL AFTER `paid_date`");
    }
    if (!existing.includes('payment_notes')) {
      statements.push("ADD COLUMN `payment_notes` TEXT NULL AFTER `paid_amount`");
    }
    if (statements.length) {
      const alter = `ALTER TABLE \`referral_codes\` ${statements.join(', ')}`;
      await db.query(alter);
      console.log('[Referral] Auto-added missing columns:', statements.join(', '));
    }
    referralColumnsChecked = true;
  } catch (e) {
    console.warn('[Referral] Column check failed (non-fatal):', e.message);
  }
};

export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ msg: "Kode referal diperlukan" });
    }

    const referral = await ReferralCode.findOne({ 
      where: { 
        code: code.toUpperCase(),
        is_active: true 
      } 
    });

    if (!referral) {
      return res.status(404).json({ msg: "Kode referal tidak valid" });
    }

    // Check validity period
    const now = new Date();
    if (referral.valid_from && now < new Date(referral.valid_from)) {
      return res.status(400).json({ msg: "Kode referal belum berlaku" });
    }
    if (referral.valid_until && now > new Date(referral.valid_until)) {
      return res.status(400).json({ msg: "Kode referal sudah kadaluarsa" });
    }

    // Check usage limit
    if (referral.usage_limit && referral.usage_count >= referral.usage_limit) {
      return res.status(400).json({ msg: "Kode referal sudah mencapai batas penggunaan" });
    }

    res.json({
      code: referral.code,
      type: referral.type,
      value: parseFloat(referral.value),
      description: referral.description,
      min_order_amount: referral.min_order_amount ? parseFloat(referral.min_order_amount) : null,
      msg: `Kode referal valid. Diskon ${referral.type === 'percent' ? referral.value + '%' : 'Rp' + new Intl.NumberFormat('id-ID').format(referral.value)} akan diterapkan.`
    });
  } catch (error) {
    console.error("Validate referral error:", error);
    res.status(500).json({ msg: "Gagal memvalidasi kode referal" });
  }
};

export const applyReferralCode = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    
    if (!code || !order_amount) {
      return res.status(400).json({ msg: "Kode referal dan jumlah pesanan diperlukan" });
    }

    const referral = await ReferralCode.findOne({ 
      where: { 
        code: code.toUpperCase(),
        is_active: true 
      } 
    });

    if (!referral) {
      return res.status(404).json({ msg: "Kode referal tidak valid" });
    }

    // Check minimum order amount
    if (referral.min_order_amount && order_amount < parseFloat(referral.min_order_amount)) {
      return res.status(400).json({ 
        msg: `Minimal pembelian Rp${new Intl.NumberFormat('id-ID').format(referral.min_order_amount)} untuk menggunakan kode ini` 
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (referral.type === 'percent') {
      discount_amount = Math.floor((order_amount * parseFloat(referral.value)) / 100);
    } else {
      discount_amount = Math.min(parseFloat(referral.value), order_amount);
    }

    // Increment usage count
    await referral.increment('usage_count');

    res.json({
      code: referral.code,
      type: referral.type,
      value: parseFloat(referral.value),
      discount_amount,
      final_amount: Math.max(0, order_amount - discount_amount),
      msg: `Diskon ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(discount_amount)} berhasil diterapkan`
    });
  } catch (error) {
    console.error("Apply referral error:", error);
    res.status(500).json({ msg: "Gagal menerapkan kode referal" });
  }
};

// Admin functions
export const listReferralCodes = async (req, res) => {
  try {
    await ensureReferralExtraColumns();
    const codes = await ReferralCode.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'owner', attributes: ['user_id','fullname','email'] }
      ]
    });
    let bonusMap = {};
    if (codes.length) {
      const ids = codes.map(c => `'${c.referral_id.replace(/'/g, "''")}'`).join(',');
      try {
        // Use raw SQL for efficient aggregation (avoids pulling all rows) and handle missing table
        const [rows] = await db.query(`
          SELECT referral_id, SUM(bonus_amount) AS total_bonus
          FROM referral_bonus_transactions
          WHERE referral_id IN (${ids})
          GROUP BY referral_id
        `);
        for (const r of rows) {
          bonusMap[r.referral_id] = parseFloat(r.total_bonus) || 0;
        }
      } catch (sqlErr) {
        // If table doesn't exist yet, just log (ER_NO_SUCH_TABLE code 1146)
        console.warn('[Referral][AggregateBonus][Skip]', sqlErr.code || sqlErr.message);
      }
    }
    res.json(codes.map(c => ({
      ...c.toJSON(),
      total_bonus_amount: bonusMap[c.referral_id] || 0
    })));
  } catch (error) {
    console.error("List referral codes error:", error);
    res.status(500).json({ msg: "Gagal mengambil daftar kode referal" });
  }
};

export const createReferralCode = async (req, res) => {
  try {
    const code = await ReferralCode.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
      owner_user_id: req.body.owner_user_id || null,
      bonus_percent: req.body.bonus_percent || null,
      payout_bank_name: req.body.payout_bank_name || null,
      payout_account_number: req.body.payout_account_number || null,
      payout_account_holder: req.body.payout_account_holder || null,
    });
    res.status(201).json(code);
  } catch (error) {
    console.error("Create referral code error:", error);
    res.status(400).json({ msg: "Gagal membuat kode referal", error: error.message });
  }
};

export const updateReferralCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = { ...req.body };
    if (updatePayload.code) updatePayload.code = updatePayload.code.toUpperCase();
    // Normalize empty strings to null for payout fields
    ['payout_bank_name','payout_account_number','payout_account_holder','owner_user_id','bonus_percent'].forEach(f => {
      if (updatePayload[f] === '') updatePayload[f] = null;
    });
    await ReferralCode.update(updatePayload, { where: { referral_id: id } });
    const code = await ReferralCode.findByPk(id);
    res.json(code);
  } catch (error) {
    console.error("Update referral code error:", error);
    res.status(400).json({ msg: "Gagal mengubah kode referal", error: error.message });
  }
};

export const deleteReferralCode = async (req, res) => {
  try {
    const { id } = req.params;
    await ReferralCode.destroy({ where: { referral_id: id } });
    res.json({ msg: "Kode referal dihapus" });
  } catch (error) {
    console.error("Delete referral code error:", error);
    res.status(400).json({ msg: "Gagal menghapus kode referal", error: error.message });
  }
};

// Detail bonus transactions per referral code
export const listReferralBonuses = async (req, res) => {
  try {
    const { id } = req.params; // referral_id
    const code = await ReferralCode.findByPk(id, { include: [{ model: User, as: 'owner', attributes: ['user_id','fullname','email'] }] });
    if (!code) return res.status(404).json({ msg: 'Referral tidak ditemukan' });
    const bonuses = await ReferralBonusTransaction.findAll({
      where: { referral_id: id },
      order: [['created_at','DESC']]
    });
    const aggregate = bonuses.reduce((acc,b) => {
      const amt = parseFloat(b.bonus_amount)||0; const base = parseFloat(b.base_amount)||0; acc.totalBonus+=amt; acc.totalBase+=base; acc.count++; return acc; }, { totalBonus:0,totalBase:0,count:0 });
    res.json({
      success: true,
      referral: {
        id: code.referral_id,
        code: code.code,
        owner: code.owner,
        bonus_percent: code.bonus_percent,
        total_bonus_amount: aggregate.totalBonus,
        total_base_amount: aggregate.totalBase,
        transactions_count: aggregate.count
      },
      transactions: bonuses
    });
  } catch (error) {
    console.error('[Referral][ListBonuses] error', error);
    res.status(500).json({ msg: 'Gagal mengambil data bonus referral', error: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_number } = req.body;
    
    // Get referral data first
    const referral = await ReferralCode.findOne({
      where: { referral_id: id }
    });
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        msg: 'Kode referral tidak ditemukan'
      });
    }

    // Handle file upload if exists (using express-fileupload)
    let paymentProofPath = null;
    if (req.files && req.files.paymentProof) {
      const paymentProofFile = req.files.paymentProof;
      const fileName = Date.now() + '_' + paymentProofFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'payment_proofs', fileName);
      
      // Create directory if it doesn't exist
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      await paymentProofFile.mv(uploadPath);
      paymentProofPath = `/uploads/payment_proofs/${fileName}`;
    }

    // Update referral code with payment info
    const updateData = {
      payment_status: 'paid',
      account_number: account_number || referral.payout_account_number || '',
      paid_date: new Date()
    };

    if (paymentProofPath) {
      updateData.payment_proof = paymentProofPath;
    }

    const [updated] = await ReferralCode.update(updateData, {
      where: { 
        referral_id: id,
        payment_status: 'unpaid' // Only allow update if currently unpaid
      }
    });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Kode referral tidak ditemukan atau sudah dibayar'
      });
    }

    const updatedReferral = await ReferralCode.findOne({
      where: { referral_id: id }
    });

    res.status(200).json({
      success: true,
      msg: 'Bukti pembayaran berhasil diupload',
      data: updatedReferral
    });
  } catch (error) {
    console.error('[Referral][UploadPaymentProof] error', error);
    res.status(500).json({
      success: false,
      msg: 'Gagal mengupload bukti pembayaran', 
      error: error.message
    });
  }
};

// Update payment status (for admin confirmation)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // referral_id
    const { payment_status, payment_notes } = req.body;

    if (!['unpaid', 'pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({ msg: 'Status pembayaran tidak valid' });
    }

    const referral = await ReferralCode.findOne({
      where: { referral_id: id }
    });
    if (!referral) {
      return res.status(404).json({ msg: 'Kode referral tidak ditemukan' });
    }

    const updateData = { payment_status };
    if (payment_notes !== undefined) {
      updateData.payment_notes = payment_notes;
    }

    // If status is being set to paid and no paid_date exists, set it
    if (payment_status === 'paid' && !referral.paid_date) {
      updateData.paid_date = new Date();
    }

    await ReferralCode.update(updateData, { 
      where: { referral_id: id } 
    });

    const updatedReferral = await ReferralCode.findOne({
      where: { referral_id: id },
      include: [{ model: User, as: 'owner', attributes: ['user_id','fullname','email'] }]
    });

    res.json({
      success: true,
      msg: 'Status pembayaran berhasil diupdate',
      referral: updatedReferral
    });
  } catch (error) {
    console.error('[Referral][UpdatePaymentStatus] error', error);
    res.status(500).json({ 
      success: false,
      msg: 'Gagal mengupdate status pembayaran', 
      error: error.message 
    });
  }
};