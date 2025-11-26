import db from "../config/Database.js";
import { Op } from "sequelize";
import {
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
  Product,
  ProductCategory,
  InventoryMovement,
  User,
  ReferralCode,
  ReferralBonusTransaction,
  LoyaltyPoint,
  PaymentProof,
} from "../models/index.js"; // Added User & referral models & LoyaltyPoint & PaymentProof & ProductCategory
import { v4 as uuidv4 } from "uuid";
import whatsappSvc, { sendWhatsappMessage, buildOrderStatusMessage } from "../utils/whatsappService.js";

// Admin WhatsApp number configurable via env (fallback to previous hardcoded value)
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '082297992691';

// Lightweight dev safeguard to auto-add referral_code column if missing (avoid crash in dev). 
// In production, prefer formal migration.
let orderReferralColumnChecked = false;
const ensureOrderReferralCodeColumn = async () => {
  if (orderReferralColumnChecked) return;
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM `orders` LIKE 'referral_code'");
    if (!rows || rows.length === 0) {
      await db.query("ALTER TABLE `orders` ADD COLUMN `referral_code` VARCHAR(20) NULL AFTER `tracking_number`");
      console.log('[Order] Auto-added missing column referral_code');
    }
  } catch (e) {
    console.warn('[Order] referral_code column check failed (non-fatal):', e.message);
  } finally {
    orderReferralColumnChecked = true;
  }
};

const generateOrderNumber = () => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NB-${y}${m}${d}-${rand}`;
};

// --- Runtime safeguard for optional new column order_items.image_snapshot ---
let imageSnapshotChecked = false;
let imageSnapshotAvailable = false;
let weightGramsChecked = false;
let weightGramsAvailable = false;

const ensureImageSnapshotColumn = async () => {
  if (imageSnapshotChecked) return imageSnapshotAvailable;
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM `order_items` LIKE 'image_snapshot'");
    imageSnapshotAvailable = Array.isArray(rows) && rows.length > 0;
    if (!imageSnapshotAvailable) {
      console.warn('[Order] Column order_items.image_snapshot missing – proceeding without it. Run migration script backend/scripts/add_image_snapshot_to_order_items.sql to add it.');
    }
  } catch (e) {
    console.warn('[Order] Failed checking image_snapshot column (non-fatal):', e.message);
    imageSnapshotAvailable = false;
  } finally {
    imageSnapshotChecked = true;
  }
  return imageSnapshotAvailable;
};

const ensureWeightGramsColumn = async () => {
  if (weightGramsChecked) {
    console.log('[ensureWeightGrams] Using cached result:', weightGramsAvailable);
    return weightGramsAvailable;
  }
  
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM `order_items` LIKE 'weight_grams'");
    
    // EXPLICIT: Only set true if rows exist and not empty
    const hasColumn = Array.isArray(rows) && rows.length > 0;
    weightGramsAvailable = hasColumn;
    
    console.log('[ensureWeightGrams] Check result:', {
      rowsType: typeof rows,
      isArray: Array.isArray(rows),
      rowsLength: rows?.length || 0,
      firstRow: rows?.[0] || null,
      finalDecision: weightGramsAvailable
    });
    
    if (!weightGramsAvailable) {
      console.warn('[ensureWeightGrams] ❌ Column NOT available – will skip in payload');
    } else {
      console.log('[ensureWeightGrams] ✅ Column IS available – will include in payload');
    }
  } catch (e) {
    console.error('[ensureWeightGrams] ⚠️ Query failed (assuming column missing):', e.message);
    weightGramsAvailable = false;
  } finally {
    weightGramsChecked = true;
  }
  
  return weightGramsAvailable;
};

// Helper function to calculate and award loyalty points
// Point ratio: 1 point for every Rp 1,000 spent
const awardLoyaltyPoints = async (userId, totalAmount, orderId, transaction = null) => {
  if (!userId || totalAmount <= 0) return 0;
  
  try {
    // Calculate points: Rp 1,000 = 1 point
    const pointsEarned = Math.floor(totalAmount / 1000);
    
    if (pointsEarned > 0) {
      await LoyaltyPoint.create({
        user_id: userId,
        points: pointsEarned,
        source: 'order',
        reference_id: orderId,
        note: `Points from order ${orderId}: Rp ${totalAmount.toLocaleString('id-ID')} = ${pointsEarned} points`
      }, { transaction });
      
      console.log(`✅ Awarded ${pointsEarned} loyalty points to user ${userId} for order ${orderId}`);
      return pointsEarned;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error awarding loyalty points:', error);
    return 0;
  }
};

export const placeOrder = async (req, res) => {
  // Force fresh check on every order (reset cache) - CRITICAL for detecting new columns
  weightGramsChecked = false;
  imageSnapshotChecked = false;
  
  await ensureOrderReferralCodeColumn();
  await ensureImageSnapshotColumn();
  const weightCheck = await ensureWeightGramsColumn();
  console.log('[placeOrder] ✅ Fresh column check completed:', { 
    weightCheck, 
    weightGramsAvailable,
    imageSnapshotAvailable 
  });
  const t = await db.transaction();
  try {
    const {
      channel = 'online',
      user_id, // optional, use session if not provided
      items,
      subtotal,
      discount_amount = 0,
      shipping_cost = 0,
      courier_name, // NEW: Nama ekspedisi (JNE, TIKI, dll)
      shipping_service, // NEW: Kode service (REG, YES, dll)
      shipping_service_name, // NEW: Nama lengkap service (Reguler, Yakin Esok Sampai, dll)
      shipping_etd, // NEW: Estimasi pengiriman (2-3, 1-2, dll)
      payment_method_id,
      payment_fee = 0,
      total,
      address_id,
      ship_snapshot, // optional legacy: { receiver_name, phone, address_detail, district, city, province, postal_code }
      manual_address, // new: same shape as ship_snapshot, preferred from frontend manual input
      customer_note,
      referral_code, // optional referral code string
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Items tidak boleh kosong" });
    }

    const order_number = generateOrderNumber();
    // Pre-calc referral discount & potential bonus
    let appliedReferral = null;
    let referralDiscount = 0;
    let referralOwnerBonus = null;
    if (referral_code) {
      try {
        const { ReferralCode } = await import('../models/index.js');
        appliedReferral = await ReferralCode.findOne({ where: { code: referral_code.toUpperCase(), is_active: true } });
        if (appliedReferral) {
          // Validity checks
          const now = new Date();
            if ((appliedReferral.valid_from && now < new Date(appliedReferral.valid_from)) || (appliedReferral.valid_until && now > new Date(appliedReferral.valid_until)) || (appliedReferral.usage_limit && appliedReferral.usage_count >= appliedReferral.usage_limit)) {
              appliedReferral = null; // treat as unusable
            }
        }
        if (appliedReferral) {
          // Compute discount if not already included
          if (!discount_amount) {
            if (appliedReferral.type === 'percent') {
              referralDiscount = Math.floor((subtotal * parseFloat(appliedReferral.value)) / 100);
            } else {
              referralDiscount = Math.min(parseFloat(appliedReferral.value), subtotal);
            }
          }
        }
      } catch (refErr) {
        console.warn('[Order][Referral] Failed applying referral_code:', refErr.message);
      }
    }

    // Normalize shipping address payload from manual_address or ship_snapshot into ship_* columns
    const addr = manual_address || ship_snapshot || null;
    const shippingFields = {};
    if (addr && typeof addr === 'object') {
      const trimStr = (v) => (typeof v === 'string' ? v.trim() : v);
      shippingFields.ship_receiver_name = trimStr(addr.receiver_name) || null;
      shippingFields.ship_phone = trimStr(addr.phone) || null;
      shippingFields.ship_address_detail = trimStr(addr.address_detail) || null;
      shippingFields.ship_district = trimStr(addr.district) || null;
      shippingFields.ship_city = trimStr(addr.city) || null;
      shippingFields.ship_province = trimStr(addr.province) || null;
      shippingFields.ship_postal_code = trimStr(addr.postal_code) || null;
    }

    const order = await Order.create(
      {
        order_number,
        channel,
        user_id: user_id || req.session?.user_id || null,
        status: 'pending',
        payment_method_id,
        subtotal,
        discount_amount: discount_amount || referralDiscount,
        shipping_cost,
        courier_name, // NEW
        shipping_service, // NEW
        shipping_service_name, // NEW
        shipping_etd, // NEW
        payment_fee,
        total: total != null ? total : (subtotal - (discount_amount || referralDiscount) + shipping_cost + payment_fee),
        // Prefer not linking address_id when manual address used
        address_id: manual_address ? null : (address_id || null),
        customer_note,
        // Only set referral_code if model column exists (after safeguard) and referral applied
        referral_code: appliedReferral ? appliedReferral.code : null,
        // Mapped shipping fields
        ...shippingFields,
      },
      { transaction: t }
    );
    // -------------------------------
    // STOCK HANDLING (Lock + Validate + Decrement)
    // -------------------------------
    // Aggregate quantities per product
    const aggregatedQty = {};
    for (const it of items) {
      if (!it.product_id) throw new Error('Item tanpa product_id');
      const qty = parseInt(it.quantity, 10);
      if (isNaN(qty) || qty <= 0) throw new Error('Quantity tidak valid');
      aggregatedQty[it.product_id] = (aggregatedQty[it.product_id] || 0) + qty;
    }

    const productIds = Object.keys(aggregatedQty);
    if (!productIds.length) throw new Error('Tidak ada product_id valid');

    // Lock rows (pessimistic) to avoid race condition
    const lockOpts = { transaction: t };
    if (t.LOCK && t.LOCK.UPDATE) lockOpts.lock = t.LOCK.UPDATE;
    const products = await Product.findAll({ where: { product_id: productIds }, ...lockOpts });
    if (products.length !== productIds.length) throw new Error('Beberapa produk tidak ditemukan');

    // Validate stock available
    for (const p of products) {
      const currentStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0;
      const needed = aggregatedQty[p.product_id];
      if (needed > currentStock) {
        throw new Error(`Stok tidak cukup untuk produk ${p.name}. Dibutuhkan ${needed}, tersedia ${currentStock}`);
      }
    }

    // Create items, inventory movements, and adjust stock
    for (const it of items) {
      const product = products.find(p => p.product_id === it.product_id);
      if (!product) throw new Error(`Produk ${it.product_id} tidak ditemukan (setelah lock)`);
      const price_unit = it.price_unit ?? product.price;
      const name_snapshot = it.name_snapshot ?? product.name;
      const quantity = parseInt(it.quantity, 10);
      const discount_line = it.discount_amount || 0;
      const subtotal_line = price_unit * quantity - discount_line;

      // Build base payload (always safe fields)
      const itemPayload = {
        order_id: order.order_id,
        product_id: product.product_id,
        name_snapshot,
        price_unit,
        quantity,
        discount_amount: discount_line,
        subtotal: subtotal_line,
        cost_at_sale: product.cost_price || null,
      };
      
      // IMPORTANT: Only add optional columns if explicitly confirmed available
      // This prevents "Unknown column" errors for optional fields
      console.log('[Order] Optional columns status:', {
        weightGramsAvailable,
        imageSnapshotAvailable
      });
      
      if (weightGramsAvailable === true) {
        itemPayload.weight_grams = product.weight_grams || 0;
        console.log('[Order] Added weight_grams:', itemPayload.weight_grams);
      } else {
        console.log('[Order] Skipping weight_grams (column not available)');
      }
      
      if (imageSnapshotAvailable === true) {
        itemPayload.image_snapshot = product.image_url || product.image || null;
        console.log('[Order] Added image_snapshot');
      } else {
        console.log('[Order] Skipping image_snapshot (column not available)');
      }
      
      console.log('[Order] Creating OrderItem with payload:', Object.keys(itemPayload));
      
      try {
        await OrderItem.create(itemPayload, { transaction: t });
        console.log('[Order] ✅ OrderItem created successfully');
      } catch (oiErr) {
        // If column error detected, identify and remove the problematic field
        if (oiErr?.parent?.sqlMessage?.includes('Unknown column')) {
          const errMsg = oiErr.parent.sqlMessage;
          console.error('[Order] ❌ Column error despite pre-check:', errMsg);
          
          // Extract column name from error message
          // Format: "Unknown column 'weight_grams' in 'field list'"
          const match = errMsg.match(/Unknown column '([^']+)'/);
          const problemColumn = match ? match[1] : null;
          
          if (problemColumn) {
            console.warn(`[Order] Emergency removal of column: ${problemColumn}`);
            delete itemPayload[problemColumn];
            
            // Mark as unavailable for future items
            if (problemColumn === 'weight_grams') {
              weightGramsAvailable = false;
            }
            if (problemColumn === 'image_snapshot') {
              imageSnapshotAvailable = false;
            }
            
            console.log(`[Order] Retrying without ${problemColumn}...`);
            await OrderItem.create(itemPayload, { transaction: t });
            console.log('[Order] ✅ Retry successful');
          } else {
            // Can't identify problem column, throw original error
            console.error('[Order] Cannot identify problem column, failing...');
            throw oiErr;
          }
        } else {
          // Not a column error, rethrow
          console.error('[Order] Non-column error:', oiErr.message);
          throw oiErr;
        }
      }

      await InventoryMovement.create({
        product_id: product.product_id,
        type: channel === 'pos' ? 'pos_sale' : 'sale',
        quantity: -Math.abs(quantity),
        unit_cost: product.cost_price || null,
        note: `Order ${order.order_number}`,
        reference_type: 'order',
        reference_id: order.order_id,
      }, { transaction: t });
    }

    // Decrement stock (single pass)
    for (const p of products) {
      const dec = aggregatedQty[p.product_id];
      const currentStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0;
      const newStock = currentStock - dec;
      p.stock = newStock < 0 ? 0 : newStock;
      await p.save({ transaction: t });
    }

    // If referral applied: increment usage & create bonus transaction
    if (appliedReferral) {
      try {
        await appliedReferral.increment('usage_count', { transaction: t });
        if (appliedReferral.owner_user_id && appliedReferral.bonus_percent) {
          const bonusPct = parseFloat(appliedReferral.bonus_percent);
          if (!isNaN(bonusPct) && bonusPct > 0) {
            const baseAmount = subtotal - (discount_amount || referralDiscount);
            const bonusAmount = Math.floor((baseAmount * bonusPct) / 100);
            const { ReferralBonusTransaction } = await import('../models/index.js');
            referralOwnerBonus = await ReferralBonusTransaction.create({
              referral_id: appliedReferral.referral_id,
              owner_user_id: appliedReferral.owner_user_id,
              order_id: order.order_id,
              bonus_percent: bonusPct,
              base_amount: baseAmount,
              bonus_amount: bonusAmount,
              status: 'granted',
              note: `Bonus referral untuk order ${order.order_number}`
            }, { transaction: t });
          }
        }
      } catch (bonusErr) {
        console.warn('[Order][ReferralBonus] Failed creating bonus transaction:', bonusErr.message);
      }
    }

    // Award loyalty points based on total spending (1 point per Rp 1,000)
    const finalUserId = user_id || req.session?.user_id;
    if (finalUserId && order.total > 0) {
      try {
        const pointsAwarded = await awardLoyaltyPoints(finalUserId, order.total, order.order_id, t);
        console.log(`📈 Order ${order.order_number}: Awarded ${pointsAwarded} loyalty points for Rp ${order.total.toLocaleString('id-ID')}`);
      } catch (pointsError) {
        console.warn('[Order][LoyaltyPoints] Failed awarding points:', pointsError.message);
        // Don't fail the order creation if points fail
      }
    }

    await t.commit();
    // Fire-and-forget: notify fixed WA number about new order
    (async () => {
      try {
        let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
        if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
        const trackingUrl = base
          ? `${base}/auth/order-tracking/${order.order_id}`
          : `https://lyviawarisanrasa.com/auth/order-tracking/${order.order_id}`;
        const msg = `Pesanan baru masuk\n\nNomor Pesanan: ${order.order_number}\nChannel: ${order.channel || 'online'}\nTotal: Rp ${order.total ? order.total.toLocaleString('id-ID') : '-'}\n\nLacak: ${trackingUrl}`;
        const waResult = await sendWhatsappMessage({ to: ADMIN_WHATSAPP_NUMBER, message: msg });
        if (waResult?.ok) {
          console.log('[Order] Admin WA sent for order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, '\nMessage:', msg, '\nStatus:', waResult.status || waResult.data || 'ok');
        } else if (waResult?.skipped) {
          console.log('[Order] Admin WA skipped (disabled in config) for order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER);
        } else {
          console.warn('[Order] Admin WA send failed for order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, waResult?.reason || waResult?.error || waResult);
        }
      } catch (waErr) {
        console.warn('[Order] Failed to notify admin WA:', waErr?.message || waErr);
      }
    })();

    res.status(201).json(order);
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal membuat order", error: e.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, estimated_delivery, cancel_reason } = req.body;
    
    // Validate status enum
    const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: "Status tidak valid", 
        error: `Status harus salah satu dari: ${validStatuses.join(', ')}. Received: ${status}`,
        validStatuses 
      });
    }
    
    // Update data object - only include defined fields
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (estimated_delivery !== undefined) updateData.estimated_delivery = estimated_delivery;
    if (cancel_reason !== undefined) updateData.cancel_reason = cancel_reason;
    
    // Add timestamps based on status
    if (status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date();
    }
    if (status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date();
    }
    if (status === 'cancelled' && !updateData.cancelled_at) {
      updateData.cancelled_at = new Date();
    }
    
    await Order.update(updateData, { where: { order_id: id } });
    
    // Fetch enriched order for notification needs (phone, number)
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'User', attributes: ['user_id','fullname','email','phone'] },
        { model: OrderItem, as: 'OrderItems', required: false }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }
    
    // Fire-and-forget WhatsApp notification (non-blocking response)
    (async () => {
      try {
        // Derive phone from several fields
        const parsePhoneFromNote = (note) => {
          if (!note) return null;
          const patterns = [
            /WA\s*[:\-]\s*([+0-9\s-]+)/i,
            /Whatsapp\s*[:\-]\s*([+0-9\s-]+)/i,
            /Telp(?:on)?\s*[:\-]\s*([+0-9\s-]+)/i,
            /HP\s*[:\-]\s*([+0-9\s-]+)/i,
            /Phone\s*[:\-]\s*([+0-9\s-]+)/i,
          ];
          for (const re of patterns) {
            const m = String(note).match(re);
            if (m && m[1]) return m[1].trim();
          }
          return null;
        };

        const phone = order?.User?.phone || order?.ship_phone || order?.guest_whatsapp || order?.guest_phone || parsePhoneFromNote(order?.customer_note);
        if (!phone) return; // no WA registered -> do nothing (frontend will alert)

        const message = buildOrderStatusMessage(order, status);
        await sendWhatsappMessage({ to: phone, message });
      } catch (e) {
        console.warn('[Order][WhatsApp] failed to send:', e.message);
      }
    })();

    res.json(order);
  } catch (e) {
    console.error('[updateOrderStatus] Error:', e);
    res.status(400).json({ msg: "Gagal mengubah status order", error: e.message });
  }
};

// Update payment status only (admin use)
export const updatePaymentStatus = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params; // order_id
    const { payment_status } = req.body;
    const allowed = ['unpaid','paid','refunded','partial'];
    if (!allowed.includes(payment_status)) {
      await t.rollback();
      return res.status(400).json({ msg: 'payment_status tidak valid', allowed });
    }
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: 'Order tidak ditemukan' });
    }

    const updateData = { payment_status };
    if (payment_status === 'paid' && !order.paid_at) {
      updateData.paid_at = new Date();
    }
    if (payment_status === 'refunded') {
      updateData.refunded_at = new Date(); // if column exists; ignored otherwise
    }
    
    await Order.update(updateData, { where: { order_id: id }, transaction: t });

    // Auto-approve all pending payment proofs when payment_status changed to 'paid'
    if (payment_status === 'paid') {
      const reviewer = req.session?.user_id || null;
      await PaymentProof.update(
        { 
          status: 'approved', 
          reviewed_by: reviewer, 
          reviewed_at: new Date() 
        },
        { 
          where: { 
            order_id: id, 
            status: 'pending' 
          },
          transaction: t 
        }
      );
    }

    await t.commit();
    const refreshed = await Order.findByPk(id);
    res.json({ msg: 'Payment status updated', order: refreshed });
  } catch (e) {
    try { await t.rollback(); } catch {}
    res.status(400).json({ msg: 'Gagal mengubah payment status', error: e.message });
  }
};

export const addPayment = async (req, res) => {
  const t = await db.transaction();
  try {
    const { order_id, payment_method_id, amount, fee_amount = 0, reference_code, metadata_json } = req.body;
    const pm = await PaymentMethod.findByPk(payment_method_id);
    if (!pm) return res.status(400).json({ msg: "Payment method tidak valid" });

    const payment = await Payment.create(
      { order_id, payment_method_id, amount, fee_amount, reference_code, metadata_json, status: 'paid', paid_at: new Date() },
      { transaction: t }
    );

    await Order.update({ payment_status: 'paid', paid_at: new Date() }, { where: { order_id }, transaction: t });
    await t.commit();
    res.status(201).json(payment);
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal menambah pembayaran", error: e.message });
  }
};

export const listOrders = async (req, res) => {
  await ensureOrderReferralCodeColumn();
  // Ensure optional column existence to avoid SELECT failures on older DBs
  const hasImageSnapshot = await ensureImageSnapshotColumn();
  const startedAt = Date.now();
  const debugPayload = { t: new Date().toISOString() };
  try {
    const { status, channel, page = 1, pageSize = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;
    // Filter ONLY orders belonging to the logged-in user unless admin role
    if (req.role !== 'admin') {
      where.user_id = req.user_id;
      debugPayload.userRestricted = true;
      debugPayload.user_id = req.user_id;
    } else {
      debugPayload.userRestricted = false;
    }
    debugPayload.query = { where, page, pageSize };

    let result;
    try {
      result = await Order.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [["created_at", "DESC"]],
        attributes: {
          exclude: [
            // large text fields we don't need in the list (keep payload small)
            'cancel_reason'
          ]
        },
        include: [
          {
            model: OrderItem,
            as: 'OrderItems',
            required: false, // LEFT JOIN instead of INNER JOIN
            // Avoid selecting image_snapshot when the column doesn't exist
            ...(hasImageSnapshot
              ? {}
              : {
                  attributes: [
                    'order_item_id',
                    'order_id',
                    'product_id',
                    'name_snapshot',
                    // 'weight_grams', // TEMPORARILY DISABLED - column not yet added to DB
                    'price_unit',
                    'quantity',
                    'discount_amount',
                    'subtotal',
                    'created_at'
                  ],
                }),
            // Include Product to get weight_grams and other product details
            include: [
              {
                model: Product,
                required: false,
                attributes: ['product_id', 'name', 'image_url', 'weight_grams', 'price', 'category_id']
              }
            ]
          },
          {
            model: Payment,
            required: false,
            include: [{ model: PaymentMethod, required: false }],
          },
          {
            model: User,
            as: 'User',
            required: false,
            attributes: ['user_id', 'fullname', 'email', 'phone', 'role'],
          },
          {
            model: User,
            as: 'cashier',
            required: false,
            attributes: ['user_id', 'fullname', 'email', 'role'],
          },
        ],
      });
    } catch (primaryErr) {
      // Log and retry without include to detect association/root cause
      console.error('[Orders][PrimaryQueryError]', primaryErr.message);
      debugPayload.primaryError = primaryErr.message;
      try {
        result = await Order.findAndCountAll({
          where,
          limit: parseInt(pageSize),
          offset: (parseInt(page) - 1) * parseInt(pageSize),
          order: [["created_at", "DESC"]],
        });
        debugPayload.fallback = 'success_without_include';
      } catch (fallbackErr) {
        console.error('[Orders][FallbackQueryError]', fallbackErr.message);
        debugPayload.fallbackError = fallbackErr.message;
        throw primaryErr; // rethrow original
      }
    }

    // Enrich with payment_proof_summary (single batch fetch + group)
    let proofs = [];
    const ids = (result.rows || []).map(r => r.order_id);
    if (ids.length) {
      try {
        proofs = await PaymentProof.findAll({ where: { order_id: ids }, order: [["uploaded_at","DESC"]] });
      } catch (pfErr) {
        console.warn('[Orders] Failed fetching payment proofs:', pfErr.message);
        debugPayload.proofFetchError = pfErr.message;
      }
    }
    const grouped = proofs.reduce((acc,p)=>{ (acc[p.order_id] = acc[p.order_id] || []).push(p); return acc; }, {});
    // Manual fetch OrderItems for orders that don't have them included (and avoid selecting image_snapshot if missing)
    const orderIds = result.rows.map(r => r.order_id);
    let orderItemsMap = {};
    
    if (orderIds.length > 0) {
      try {
        const allOrderItems = await OrderItem.findAll({
          where: { order_id: orderIds },
          order: [[ 'created_at', 'ASC' ]],
          ...(hasImageSnapshot
            ? {}
            : {
                attributes: [
                  'order_item_id',
                  'order_id',
                  'product_id',
                  'name_snapshot',
                  // 'weight_grams', // TEMPORARILY DISABLED - column not yet added to DB
                  'price_unit',
                  'quantity',
                  'discount_amount',
                  'subtotal',
                  'created_at'
                ],
              }),
          // Include Product to get weight_grams
          include: [
            {
              model: Product,
              required: false,
              attributes: ['product_id', 'name', 'image_url', 'weight_grams', 'price', 'category_id']
            }
          ]
        });
        
        // Group by order_id
        orderItemsMap = allOrderItems.reduce((acc, item) => {
          if (!acc[item.order_id]) acc[item.order_id] = [];
          acc[item.order_id].push(item);
          return acc;
        }, {});
        
        console.log(`[DEBUG] Manual OrderItems fetch: ${allOrderItems.length} items for ${orderIds.length} orders (hasImageSnapshot=${hasImageSnapshot})`);
        console.log(`[DEBUG] Order IDs being fetched:`, orderIds);
        console.log(`[DEBUG] Sample OrderItem:`, allOrderItems[0] ? {
          order_id: allOrderItems[0].order_id,
          name_snapshot: allOrderItems[0].name_snapshot,
          price_unit: allOrderItems[0].price_unit,
          quantity: allOrderItems[0].quantity
        } : 'No items found');
      } catch (itemErr) {
        console.error('[Orders] Failed to manually fetch OrderItems:', itemErr.message);
      }
    }

    const items = result.rows.map(r => {
      const json = r.toJSON ? r.toJSON() : r;
      
      // If OrderItems not included, add from manual fetch
      if (!json.OrderItems && orderItemsMap[json.order_id]) {
        json.OrderItems = orderItemsMap[json.order_id].map(item => item.toJSON ? item.toJSON() : item);
      }
      
      // DEBUG: Log structure of each order to understand data format
      if (json.order_number === 'NB-250923-4COF') {
        console.log(`[CRITICAL DEBUG] Order ${json.order_number} detailed analysis:`);
        console.log('- Raw JSON keys:', Object.keys(json));
        console.log('- OrderItems present:', !!json.OrderItems);
        console.log('- OrderItems value:', json.OrderItems);
        console.log('- Manual fetch result for this order:', orderItemsMap[json.order_id]);
        
        // Check if manual fetch caught this order
        if (orderItemsMap[json.order_id]) {
          console.log('- Manual fetch SUCCESS for this order:', orderItemsMap[json.order_id].length, 'items');
          console.log('- First manual item:', {
            name_snapshot: orderItemsMap[json.order_id][0].name_snapshot,
            price_unit: orderItemsMap[json.order_id][0].price_unit,
            quantity: orderItemsMap[json.order_id][0].quantity
          });
        } else {
          console.log('- Manual fetch FAILED - no items found for this order_id');
        }
      }
      
      console.log(`[DEBUG] Order ${json.order_number} structure:`, {
        order_id: json.order_id,
        order_number: json.order_number,
        channel: json.channel,
        OrderItems: json.OrderItems ? json.OrderItems.length + ' items' : 'NO OrderItems',
        orderItems_keys: json.OrderItems ? Object.keys(json.OrderItems[0] || {}) : 'N/A',
        first_item_sample: json.OrderItems?.[0] ? {
          name_snapshot: json.OrderItems[0].name_snapshot,
          price_unit: json.OrderItems[0].price_unit,
          quantity: json.OrderItems[0].quantity,
          Product: json.OrderItems[0].Product ? {
            product_id: json.OrderItems[0].Product.product_id,
            weight_grams: json.OrderItems[0].Product.weight_grams,
            name: json.OrderItems[0].Product.name
          } : 'NO PRODUCT'
        } : 'No first item'
      });
      
      const list = grouped[r.order_id] || [];
      if (list.length) {
        const latest = list[0];
        const counts = list.reduce((c,pp)=>{ c[pp.status] = (c[pp.status]||0)+1; return c; }, {});
        json.payment_proof_summary = {
          count: list.length,
          latest_status: latest.status,
          latest_file_url: latest.file_url,
          latest_uploaded_at: latest.uploaded_at,
          counts,
        };
      } else {
        json.payment_proof_summary = {
          count: 0,
          latest_status: null,
          latest_file_url: null,
          latest_uploaded_at: null,
          counts: {},
        };
      }
      json.has_payment_proof = json.payment_proof_summary.count > 0;
      json.payment_proof_count = json.payment_proof_summary.count;
      return json;
    });

    res.json({
  items,
      total: result.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      latency_ms: Date.now() - startedAt,
      debug: process.env.NODE_ENV === 'production' ? undefined : debugPayload,
    });
  } catch (e) {
    console.error('[Orders][ListUnhandled]', e);
    res.status(500).json({
      msg: "Gagal mengambil order",
      error: e.message,
      debug: process.env.NODE_ENV === 'production' ? undefined : debugPayload,
    });
  }
};

// DEBUG: Temporary endpoint to check OrderItems for specific order
export const debugOrderItems = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    // Find order by number
    const order = await Order.findOne({ where: { order_number: orderNumber } });
    if (!order) return res.status(404).json({ msg: "Order not found" });
    
    // Direct fetch OrderItems
    const orderItems = await OrderItem.findAll({ where: { order_id: order.order_id } });
    
    return res.json({
      order: {
        order_id: order.order_id,
        order_number: order.order_number,
        channel: order.channel,
        status: order.status
      },
      orderItems: orderItems.map(item => ({
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        name_snapshot: item.name_snapshot,
        price_unit: item.price_unit,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      itemCount: orderItems.length
    });
  } catch (e) {
    console.error('[DEBUG] Error fetching order items:', e);
    res.status(500).json({ msg: "Server error", error: e.message });
  }
};

export const getOrder = async (req, res) => {
  await ensureOrderReferralCodeColumn();
  const id = req.params.id;
  const debug = { id, t: new Date().toISOString() };
  try {
    let order;
    try {
      order = await Order.findByPk(id, {
        include: [
          { model: OrderItem, as: 'OrderItems' },
          { model: Payment, include: [{ model: PaymentMethod }] },
          { model: User, as: 'User', attributes: ['user_id','fullname','email','phone','role'] },
          { model: User, as: 'cashier', attributes: ['user_id','fullname','email','role'] },
          { model: PaymentProof },
        ],
      });
      debug.primary = 'success';
    } catch (primaryErr) {
      debug.primary = 'failed';
      debug.primaryError = primaryErr.message;
      console.error('[Order][Get][PrimaryError]', primaryErr.message);
      // Fallback without includes (maybe association or enum mismatch)
      try {
        order = await Order.findByPk(id);
        debug.fallback = order ? 'success_without_include' : 'not_found_without_include';
      } catch (fbErr) {
        debug.fallback = 'failed';
        debug.fallbackError = fbErr.message;
        console.error('[Order][Get][FallbackError]', fbErr.message);
        throw primaryErr; // propagate original
      }
    }

    if (!order) {
      return res.status(404).json({ msg: 'Order tidak ditemukan', debug: process.env.NODE_ENV === 'production' ? undefined : debug });
    }

    // If fallback used, we can lazily fetch items & payments separately (non-blocking if desired)
    if (!order.order_items && debug.primary === 'failed') {
      try {
        const items = await OrderItem.findAll({ where: { order_id: order.order_id } });
        order.setDataValue('order_items', items);
        const payments = await Payment.findAll({ where: { order_id: order.order_id } });
        order.setDataValue('payments', payments);
        debug.lazyHydrated = true;
      } catch (hydrateErr) {
        debug.lazyHydrated = false;
        debug.hydrateError = hydrateErr.message;
      }
    }

    // Append payment proof count/flag and always include payment_proofs array
    try {
      // Always fetch all payment proofs for this order
      let paymentProofs = [];
      try {
        paymentProofs = await PaymentProof.findAll({ where: { order_id: id }, order: [["uploaded_at","DESC"]] });
        console.log(`[Order][PaymentProofs] order_id=${id} found=${paymentProofs.length}`);
        if (paymentProofs.length) console.log('[Order][PaymentProofs] sample:', paymentProofs[0]);
      } catch (pfErr) {
        debug.paymentProofsError = pfErr.message;
        paymentProofs = [];
      }
      const [rowsCounts] = await db.query(
        `SELECT COUNT(*) AS cnt FROM order_payment_proofs WHERE order_id = :id`,
        { replacements: { id } }
      );
      const cnt = rowsCounts && rowsCounts[0] ? parseInt(rowsCounts[0].cnt, 10) || 0 : 0;
      debug.paymentProofCount = cnt;
      const json = order.toJSON ? order.toJSON() : order;
      json.has_payment_proof = cnt > 0;
      json.payment_proof_count = cnt;
      json.payment_proofs = Array.isArray(paymentProofs) ? paymentProofs.map(p => p.toJSON ? p.toJSON() : p) : [];
      const responseObj = {
        ...json,
        debug: process.env.NODE_ENV === 'production' ? undefined : debug,
      };
      console.log('[Order][GetOrder][RESPONSE]', JSON.stringify(responseObj, null, 2));
      return res.json(responseObj);
    } catch (cntErr) {
      debug.paymentProofCountError = cntErr.message;
      const responseObj = {
        ...(order.toJSON ? order.toJSON() : order),
        has_payment_proof: false,
        payment_proof_count: 0,
        payment_proofs: [],
        debug: process.env.NODE_ENV === 'production' ? undefined : debug,
      };
      console.log('[Order][GetOrder][RESPONSE]', JSON.stringify(responseObj, null, 2));
      return res.json(responseObj);
    }
  } catch (e) {
    console.error('[Order][Get][Unhandled]', e);
    return res.status(500).json({
      msg: 'Gagal mengambil order',
      error: e.message,
      debug: process.env.NODE_ENV === 'production' ? undefined : debug,
    });
  }
};

// POS quick create (cash/qr/card)
export const posCheckout = async (req, res) => {
  const t = await db.transaction();
  let committed = false;
  try {
    await ensureImageSnapshotColumn();
    await ensureWeightGramsColumn();
    const {
      items,
      payment_method_id,
      customer_note,
      referral_code, // optional referral code (string)
      courier_name, // NEW: Nama ekspedisi
      shipping_service, // NEW: Kode service
      shipping_service_name, // NEW: Nama lengkap service
      shipping_etd, // NEW: Estimasi pengiriman
    } = req.body;

    // Sanitize numerics (fallback to 0)
    const toNum = (v) => {
      const n = parseFloat(v); return Number.isFinite(n) ? n : 0;
    };

  let discount_amount = toNum(req.body?.discount_amount); // may be overridden by referral
    let shipping_cost = toNum(req.body?.shipping_cost);
    let payment_fee = toNum(req.body?.payment_fee);
    let received_amount = req.body?.received_amount != null ? toNum(req.body.received_amount) : null;
    let change_amount = req.body?.change_amount != null ? toNum(req.body.change_amount) : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ msg: "Items tidak boleh kosong" });
    }

    // Compute subtotal from items and validate
    let subtotalCalc = 0;
    const cleanItems = [];
    for (const it of items) {
      const qty = Math.max(0, parseInt(it.quantity));
      if (!qty) continue;
      cleanItems.push({
        product_id: it.product_id,
        quantity: qty,
        price_unit: toNum(it.price_unit),
        name_snapshot: it.name_snapshot,
        discount_amount: toNum(it.discount_amount),
      });
    }
    if (cleanItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ msg: "Items tidak boleh kosong" });
    }
    for (const it of cleanItems) {
      subtotalCalc += (it.price_unit * it.quantity) - (it.discount_amount || 0);
    }
    if (subtotalCalc < 0) subtotalCalc = 0;
    // Prepare referral application (only if no manual discount provided)
    let appliedReferral = null;
    let referralComputedDiscount = 0;
    if (referral_code) {
      try {
        appliedReferral = await ReferralCode.findOne({ where: { code: referral_code.toUpperCase(), is_active: true }, transaction: t });
        if (appliedReferral) {
          const now = new Date();
          if ((appliedReferral.valid_from && now < new Date(appliedReferral.valid_from)) ||
              (appliedReferral.valid_until && now > new Date(appliedReferral.valid_until)) ||
              (appliedReferral.usage_limit && appliedReferral.usage_count >= appliedReferral.usage_limit)) {
            appliedReferral = null; // invalid due to period / limit
          }
        }
        // Jika referral_code diberikan tapi tidak valid -> blokir
        if (!appliedReferral) {
          await t.rollback();
          return res.status(400).json({ msg: 'Referral code tidak valid atau sudah tidak dapat digunakan' });
        }
        if (appliedReferral && !discount_amount) {
          if (appliedReferral.type === 'percent') {
            referralComputedDiscount = Math.floor((subtotalCalc * parseFloat(appliedReferral.value)) / 100);
          } else {
            referralComputedDiscount = Math.min(parseFloat(appliedReferral.value), subtotalCalc);
          }
          discount_amount = referralComputedDiscount; // override only if no manual discount provided
        }
      } catch (refErr) {
        console.warn('[POS][Referral] Gagal memproses referral_code:', refErr.message);
        await t.rollback();
        return res.status(400).json({ msg: 'Gagal memproses referral code', error: refErr.message });
      }
    }

    const totalCalc = Math.max(0, subtotalCalc - discount_amount + shipping_cost + payment_fee);

    // Aggregate quantities per product for stock validation
    const aggregatedQty = {};
    for (const it of cleanItems) {
      aggregatedQty[it.product_id] = (aggregatedQty[it.product_id] || 0) + it.quantity;
    }

    // Lock product rows for update to ensure consistent stock (pessimistic concurrency control)
    const productIdsToLock = Object.keys(aggregatedQty);
    const lockOptions = { transaction: t };
    if (t.LOCK && t.LOCK.UPDATE) lockOptions.lock = t.LOCK.UPDATE;
    const productsToUpdate = await Product.findAll({ where: { product_id: productIdsToLock }, ...lockOptions });

    if (productsToUpdate.length !== productIdsToLock.length) {
      await t.rollback();
      return res.status(400).json({ msg: 'Beberapa produk tidak ditemukan untuk POS checkout' });
    }

    // Validate available stock
    for (const p of productsToUpdate) {
      const needed = aggregatedQty[p.product_id];
      const currentStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0;
      if (needed > currentStock) {
        await t.rollback();
        return res.status(400).json({ msg: `Stok tidak cukup untuk produk ${p.name}. Dibutuhkan ${needed}, tersedia ${currentStock}` });
      }
    }

  // Create order (include referral_code if applied)
    const order_number = generateOrderNumber();
    let profit_amount = 0;

    // Insert with a conservative status first (pending) to survive older enum sets
    let initialStatus = 'completed';
    let safeStatus = 'completed';
    // Fallback if DB enum might miss 'completed'
    if (['completed','processing','pending'].every(s => true)) { /* placeholder */ }
    // We'll try 'completed'; if it fails on enum we'll retry with 'pending'
    let order;
    try {
      order = await Order.create(
        {
          order_number,
          channel: 'pos',
          user_id: null,
          status: safeStatus,
          payment_method_id,
          payment_status: 'paid',
          subtotal: subtotalCalc,
          discount_amount,
          shipping_cost,
          courier_name, // NEW
          shipping_service, // NEW
          shipping_service_name, // NEW
          shipping_etd, // NEW
          payment_fee,
          total: totalCalc,
          received_amount,
          change_amount,
          cashier_id: req.session?.user_id || null,
          customer_note,
          referral_code: appliedReferral ? appliedReferral.code : null,
          completed_at: new Date(),
          paid_at: new Date(),
        },
        { transaction: t }
      );
    } catch (errCreate) {
      // If enum error, fallback to 'pending'
      if (errCreate?.parent?.sqlMessage?.includes('enum')) {
        console.warn('[POS] Enum mismatch for status, retrying with pending:', errCreate.parent.sqlMessage);
        order = await Order.create(
          {
            order_number,
            channel: 'pos',
            user_id: null,
            status: 'pending',
            payment_method_id,
            payment_status: 'paid',
            subtotal: subtotalCalc,
            discount_amount,
            shipping_cost,
            courier_name, // NEW
            shipping_service, // NEW
            shipping_service_name, // NEW
            shipping_etd, // NEW
            payment_fee,
            total: totalCalc,
            received_amount,
            change_amount,
            cashier_id: req.session?.user_id || null,
            customer_note,
            referral_code: appliedReferral ? appliedReferral.code : null,
            paid_at: new Date(),
          },
          { transaction: t }
        );
      } else {
        throw errCreate;
      }
    }

    // Map products for quick access
    const productMap = productsToUpdate.reduce((acc, p) => { acc[p.product_id] = p; return acc; }, {});

    // Create items + inventory movements + compute profit (use locked products)
    for (const it of cleanItems) {
      const product = productMap[it.product_id];
      if (!product) throw new Error(`Produk ${it.product_id} tidak ditemukan`);
      const price_unit = it.price_unit ?? parseFloat(product.price);
      const name_snapshot = it.name_snapshot ?? product.name;
      const quantity = it.quantity;
      const line_discount = it.discount_amount || 0;
      const subtotal_line = price_unit * quantity - line_discount;

      const posItemPayload = {
        order_id: order.order_id,
        product_id: product.product_id,
        name_snapshot,
        price_unit,
        quantity,
        discount_amount: line_discount,
        subtotal: subtotal_line,
        cost_at_sale: product.cost_price || null,
      };
      // Conditionally add weight_grams only if column exists
      if (weightGramsAvailable !== false) {
        posItemPayload.weight_grams = product.weight_grams || 0;
      }
      if (imageSnapshotAvailable) posItemPayload.image_snapshot = product.image_url || product.image || null;
      try {
        await OrderItem.create(posItemPayload, { transaction: t });
      } catch (oiErr) {
        if (oiErr?.parent?.sqlMessage?.includes('Unknown column')) {
          console.warn('[POS] Retry OrderItem.create - column missing:', oiErr.parent.sqlMessage);
          if (imageSnapshotAvailable && oiErr.parent.sqlMessage.includes('image_snapshot')) {
            delete posItemPayload.image_snapshot;
            imageSnapshotAvailable = false;
          }
          if (oiErr.parent.sqlMessage.includes('weight_grams')) {
            delete posItemPayload.weight_grams;
            weightGramsAvailable = false;
          }
          await OrderItem.create(posItemPayload, { transaction: t });
        } else {
          throw oiErr;
        }
      }

      // Profit = (price - cost) * qty - discount per line
      const unitCost = product.cost_price ? parseFloat(product.cost_price) : 0;
      profit_amount += (price_unit - unitCost) * quantity - line_discount;

      // inventory movement (pos_sale)
      // Try inventory movement with 'pos_sale'; if enum not present fallback to 'sale'
      try {
        await InventoryMovement.create(
          {
            product_id: product.product_id,
            type: 'pos_sale',
            quantity: -Math.abs(quantity),
            unit_cost: product.cost_price || null,
            note: `POS ${order.order_number}`,
            reference_type: 'order',
            reference_id: order.order_id,
          },
          { transaction: t }
        );
      } catch (mvErr) {
        if (mvErr?.parent?.sqlMessage?.includes('enum')) {
          console.warn('[POS] Enum mismatch for inventory_movements.type; retry with sale');
          await InventoryMovement.create(
            {
              product_id: product.product_id,
              type: 'sale',
              quantity: -Math.abs(quantity),
              unit_cost: product.cost_price || null,
              note: `POS ${order.order_number}`,
              reference_type: 'order',
              reference_id: order.order_id,
            },
            { transaction: t }
          );
        } else {
          throw mvErr;
        }
      }
    }

    // Update product stock directly (avoid recompute from movement sum which requires baseline movements)
    for (const p of productsToUpdate) {
      const dec = aggregatedQty[p.product_id] || 0;
      const currentStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0;
      const newStock = currentStock - dec;
      p.stock = newStock < 0 ? 0 : newStock; // guard against negative
      await p.save({ transaction: t });
    }

    // If referral applied create bonus transaction & increment usage
    if (appliedReferral) {
      try {
        await appliedReferral.increment('usage_count', { transaction: t });
        if (appliedReferral.owner_user_id && appliedReferral.bonus_percent) {
          const bonusPct = parseFloat(appliedReferral.bonus_percent);
            if (!isNaN(bonusPct) && bonusPct > 0) {
              const baseAmount = subtotalCalc - discount_amount;
              const bonusAmount = Math.floor((baseAmount * bonusPct) / 100);
              await ReferralBonusTransaction.create({
                referral_id: appliedReferral.referral_id,
                owner_user_id: appliedReferral.owner_user_id,
                order_id: order.order_id,
                bonus_percent: bonusPct,
                base_amount: baseAmount,
                bonus_amount: bonusAmount,
                status: 'granted',
                note: `Bonus referral POS untuk order ${order.order_number}`,
              }, { transaction: t });
            }
        }
      } catch (bonusErr) {
        console.warn('[POS][ReferralBonus] Gagal membuat bonus referral:', bonusErr.message);
      }
    }

    // Update profit on order
  await Order.update({ profit_amount, revenue_amount: totalCalc }, { where: { order_id: order.order_id }, transaction: t });

    // Create payment record
    if (payment_method_id && totalCalc > 0) {
      await Payment.create(
        {
          order_id: order.order_id,
          payment_method_id,
          amount: totalCalc,
          fee_amount: payment_fee || 0,
          status: 'paid',
          paid_at: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    committed = true;

    // Return the created order with items and payments (post-commit). If this fetch fails, still report success.
    try {
      const created = await Order.findByPk(order.order_id, { include: [{ model: OrderItem, as: 'OrderItems' }, { model: Payment }] });
      if (created) {
        const jsonData = created.toJSON();
        // DEBUG: Log POS order structure
        console.log(`[DEBUG] POS Created Order ${jsonData.order_id}:`, {
          order_number: jsonData.order_number,
          channel: jsonData.channel,
          OrderItems: jsonData.OrderItems ? jsonData.OrderItems.length + ' items' : 'NO OrderItems',
          items_sample: jsonData.OrderItems?.slice(0, 2).map(item => ({
            name_snapshot: item.name_snapshot,
            price_unit: item.price_unit,
            quantity: item.quantity
          })) || 'No items'
        });
        // Notify fixed WA number about POS order (background)
        (async () => {
          try {
            let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
            if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
            const trackingUrl = base
              ? `${base}/auth/order-tracking/${created.order_id}`
              : `https://lyviawarisanrasa.com/auth/order-tracking/${created.order_id}`;
            const msg = `POS - Pesanan baru dibuat\n\nNomor Pesanan: ${created.order_number}\nTotal: Rp ${created.total ? created.total.toLocaleString('id-ID') : '-'}\n\nLacak: ${trackingUrl}`;
            const waResult = await sendWhatsappMessage({ to: ADMIN_WHATSAPP_NUMBER, message: msg });
            if (waResult?.ok) {
              console.log('[POS] Admin WA sent for POS order:', created.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, '\nMessage:', msg, '\nStatus:', waResult.status || waResult.data || 'ok');
            } else if (waResult?.skipped) {
              console.log('[POS] Admin WA skipped (disabled in config) for POS order:', created.order_number, 'to:', ADMIN_WHATSAPP_NUMBER);
            } else {
              console.warn('[POS] Admin WA send failed for POS order:', created.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, waResult?.reason || waResult?.error || waResult);
            }
          } catch (waErr) {
            console.warn('[POS] Failed to notify admin WA:', waErr?.message || waErr);
          }
        })();

        return res.status(201).json({ ...jsonData, fallback: created.status !== 'completed' });
      }
      // Fallback: created not found immediately (rare replication lag) – return minimal payload
      return res.status(201).json({ order_id: order.order_id, order_number: order.order_number, fallback: order.status !== 'completed' });
    } catch (postErr) {
      console.error('[POS] Post-commit fetch failed:', postErr.message);
      return res.status(201).json({ order_id: order.order_id, order_number: order.order_number, warning: 'Order created but detail fetch failed', fallback: order.status !== 'completed' });
    }
  } catch (e) {
    if (!committed) {
      try { await t.rollback(); } catch (rbErr) { console.error('[POS] Rollback failed (already finished?):', rbErr.message); }
    }
    res.status(400).json({ msg: "Gagal membuat POS order", error: e.message, sql: e?.parent?.sqlMessage });
  }
};

// Guest checkout (tanpa perlu login)
export const guestCheckout = async (req, res) => {
  const t = await db.transaction();
  let committed = false;
  try {
    await ensureImageSnapshotColumn();
    
    const {
      items,
      payment_method_id,
      customer_note,
      referral_code,
      courier_name, // NEW: Nama ekspedisi
      shipping_service, // NEW: Kode service
      shipping_service_name, // NEW: Nama lengkap service
      shipping_etd, // NEW: Estimasi pengiriman
    } = req.body;

    // Guest info dari middleware verifyGuestCheckout
    const { nama, alamat, whatsapp } = req.guest_info;

    // Sanitize numerics (fallback to 0)
    const toNum = (v) => {
      const n = parseFloat(v); return Number.isFinite(n) ? n : 0;
    };

    let discount_amount = toNum(req.body?.discount_amount); // may be overridden by referral
    let shipping_cost = toNum(req.body?.shipping_cost);
    let payment_fee = toNum(req.body?.payment_fee);
    let received_amount = req.body?.received_amount != null ? toNum(req.body.received_amount) : null;
    let change_amount = req.body?.change_amount != null ? toNum(req.body.change_amount) : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ msg: "Items tidak boleh kosong" });
    }

    // Compute subtotal from items and validate
    let subtotalCalc = 0;
    const cleanItems = [];
    for (const it of items) {
      const qty = Math.max(0, parseInt(it.quantity));
      if (!qty) continue;
      cleanItems.push({
        product_id: it.product_id,
        quantity: qty,
        price_unit: toNum(it.price_unit),
        name_snapshot: it.name_snapshot,
        discount_amount: toNum(it.discount_amount),
      });
    }
    if (cleanItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ msg: "Items tidak boleh kosong" });
    }
    for (const it of cleanItems) {
      subtotalCalc += (it.price_unit * it.quantity) - (it.discount_amount || 0);
    }
    if (subtotalCalc < 0) subtotalCalc = 0;

    // Prepare referral application (only if no manual discount provided)
    let appliedReferral = null;
    let referralComputedDiscount = 0;
    if (referral_code) {
      try {
        appliedReferral = await ReferralCode.findOne({ where: { code: referral_code.toUpperCase(), is_active: true }, transaction: t });
        if (appliedReferral) {
          const now = new Date();
          if ((appliedReferral.valid_from && now < new Date(appliedReferral.valid_from)) ||
              (appliedReferral.valid_until && now > new Date(appliedReferral.valid_until)) ||
              (appliedReferral.usage_limit && appliedReferral.usage_count >= appliedReferral.usage_limit)) {
            appliedReferral = null; // invalid due to period / limit
          }
        }
        if (referral_code && !appliedReferral) {
          // Referral code diberikan tapi tidak valid -> warning saja, jangan blokir
          console.warn('[Guest] Referral code tidak valid atau sudah tidak dapat digunakan:', referral_code);
        }
        if (appliedReferral && !discount_amount) {
          if (appliedReferral.type === 'percent') {
            referralComputedDiscount = Math.floor((subtotalCalc * parseFloat(appliedReferral.value)) / 100);
          } else {
            referralComputedDiscount = Math.min(parseFloat(appliedReferral.value), subtotalCalc);
          }
          discount_amount = referralComputedDiscount;
        }
      } catch (refErr) {
        console.warn('[Guest][Referral] Gagal memproses referral_code:', refErr.message);
        // Don't block the transaction, just warn
      }
    }

    const totalCalc = Math.max(0, subtotalCalc - discount_amount + shipping_cost + payment_fee);

    // Aggregate quantities per product for stock validation
    const aggregatedQty = {};
    for (const it of cleanItems) {
      aggregatedQty[it.product_id] = (aggregatedQty[it.product_id] || 0) + it.quantity;
    }

    // Lock product rows for update to ensure consistent stock (pessimistic concurrency control)
    const productIdsToLock = Object.keys(aggregatedQty);
    const lockOptions = { transaction: t };
    if (t.LOCK && t.LOCK.UPDATE) lockOptions.lock = t.LOCK.UPDATE;
    const productsToUpdate = await Product.findAll({ where: { product_id: productIdsToLock }, ...lockOptions });

    if (productsToUpdate.length !== productIdsToLock.length) {
      await t.rollback();
      return res.status(400).json({ msg: 'Beberapa produk tidak ditemukan untuk guest checkout' });
    }

    // Validate available stock
    for (const p of productsToUpdate) {
      const needed = aggregatedQty[p.product_id];
      const currentStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock) || 0;
      if (needed > currentStock) {
        await t.rollback();
        return res.status(400).json({ msg: `Stok tidak cukup untuk produk ${p.name}. Dibutuhkan ${needed}, tersedia ${currentStock}` });
      }
    }

    // Create order
    const order_number = generateOrderNumber();
    let profit_amount = 0;

    let order;
    try {
      order = await Order.create(
        {
          order_number,
          channel: 'guest',
          user_id: null,
          status: 'pending',
          payment_method_id,
          // IMPORTANT: align with DB ENUM values for orders.payment_status
          // Allowed: 'unpaid' | 'paid' | 'refunded' | 'partial'
          // For guest checkout, default to 'unpaid' until admin confirms payment
          payment_status: 'unpaid',
          subtotal: subtotalCalc,
          discount_amount,
          shipping_cost,
          courier_name, // NEW
          shipping_service, // NEW
          shipping_service_name, // NEW
          shipping_etd, // NEW
          payment_fee,
          total: totalCalc,
          received_amount,
          change_amount,
          cashier_id: null,
          customer_note,
          referral_code: appliedReferral ? appliedReferral.code : null,
          // Simpan guest info di kolom existing shipping snapshot agar selalu tampil
          ship_receiver_name: nama,
          ship_phone: whatsapp,
          ship_address_detail: alamat,
          // Simpan juga ke kolom guest_* jika tersedia di DB
          guest_nama: nama,
          guest_alamat: alamat,
          guest_whatsapp: whatsapp,
        },
        { transaction: t }
      );
    } catch (errCreate) {
      console.error('[Guest] Error creating order:', errCreate.message);
      if (errCreate?.parent?.sqlMessage?.includes('Unknown column')) {
        // Columns guest_nama, guest_alamat, guest_whatsapp belum ada di DB
        // Buat tanpa guest info terlebih dahulu
        order = await Order.create(
          {
            order_number,
            channel: 'guest',
            user_id: null,
            status: 'pending',
            payment_method_id,
            // Fallback path must also respect the same ENUM
            payment_status: 'unpaid',
            subtotal: subtotalCalc,
            discount_amount,
            shipping_cost,
            courier_name, // NEW
            shipping_service, // NEW
            shipping_service_name, // NEW
            shipping_etd, // NEW
            payment_fee,
            total: totalCalc,
            received_amount,
            change_amount,
            cashier_id: null,
            // Tulis guest info ke customer_note untuk jejak, dan isi kolom ship_* agar selalu terbaca front-end
            customer_note: `[GUEST] Nama: ${nama}, WA: ${whatsapp}, Alamat: ${alamat}\n${customer_note || ''}`,
            ship_receiver_name: nama,
            ship_phone: whatsapp,
            ship_address_detail: alamat,
            referral_code: appliedReferral ? appliedReferral.code : null,
          },
          { transaction: t }
        );
      } else {
        throw errCreate;
      }
    }

    // Map products for quick access
    const productMap = new Map(productsToUpdate.map(p => [p.product_id, p]));

    // Create order items, inventory movements, and calculate profit
    for (const it of cleanItems) {
      const product = productMap.get(it.product_id);
      if (!product) throw new Error(`Produk ${it.product_id} tidak ditemukan (setelah lock)`);

      const price_unit = it.price_unit;
      const name_snapshot = it.name_snapshot || product.name;
      const quantity = it.quantity;
      const discount_line = it.discount_amount || 0;
      const subtotal_line = price_unit * quantity - discount_line;
      const cost_per_unit = product.cost_price || 0;
      const profit_line = (price_unit - cost_per_unit) * quantity - discount_line;

      profit_amount += profit_line;

      const itemPayload = {
        order_id: order.order_id,
        product_id: product.product_id,
        name_snapshot,
        price_unit,
        quantity,
        discount_amount: discount_line,
        subtotal: subtotal_line,
        cost_at_sale: cost_per_unit,
      };

      if (imageSnapshotAvailable) {
        itemPayload.image_snapshot = product.image_url || product.image || null;
      }

      try {
        await OrderItem.create(itemPayload, { transaction: t });
      } catch (oiErr) {
        if (imageSnapshotAvailable && oiErr?.parent?.sqlMessage?.includes('Unknown column')) {
          console.warn('[Guest] Retry OrderItem.create without image_snapshot (column missing)');
          delete itemPayload.image_snapshot;
          imageSnapshotAvailable = false;
          await OrderItem.create(itemPayload, { transaction: t });
        } else {
          throw oiErr;
        }
      }

      // Create inventory movement
      await InventoryMovement.create({
        product_id: product.product_id,
        type: 'guest_sale',
        quantity: -Math.abs(quantity),
        unit_cost: cost_per_unit,
        note: `Order ${order.order_number} (Guest)`,
        reference_type: 'order',
        reference_id: order.order_id,
      }, { transaction: t });

      // Decrement stock
      await Product.update(
        { stock: db.literal(`stock - ${Math.abs(quantity)}`) },
        { where: { product_id: it.product_id }, transaction: t }
      );
    }

    // Update profit on order
    await Order.update({ profit_amount, revenue_amount: totalCalc }, { where: { order_id: order.order_id }, transaction: t });

    // Create payment record (if payment method provided)
    if (payment_method_id && totalCalc > 0) {
      await Payment.create(
        {
          order_id: order.order_id,
          payment_method_id,
          amount: totalCalc,
          fee_amount: payment_fee || 0,
          status: 'pending',
          created_at: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    committed = true;

    // Kirim notifikasi WhatsApp kepada pelanggan dengan link tracking
    try {
      // Use configured client origin (frontend domain) or fallback; ensure scheme for clickability
      let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
      if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
      const trackingUrl = base
        ? `${base}/auth/order-tracking/${order.order_id}`
        : `https://lyviawarisanrasa.com/auth/order-tracking/${order.order_id}`;
      const message = `Terima kasih atas pesanan Anda!\n\n` +
                       `Nomor Pesanan: ${order.order_number}\n` +
                       `Total: Rp ${totalCalc.toLocaleString('id-ID')}\n\n` +
             `Lacak pesanan Anda di:\n${trackingUrl}\n\n` +
                       `Terima kasih telah berbelanja di Lyvia Nusa Boga.`;
      
      await sendWhatsappMessage({ to: whatsapp, message });
      console.log('[Guest] WhatsApp notification sent to:', whatsapp);
    } catch (waErr) {
      console.warn('[Guest] Failed to send WhatsApp notification to customer:', waErr.message || waErr);
    }

    // Additionally notify fixed admin WA number about the guest order (background)
    (async () => {
      try {
        let base = (process.env.CLIENT_ORIGIN || process.env.SERVER_URL || '').trim().replace(/\/$/, '');
        if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
        const trackingUrl = base
          ? `${base}/auth/order-tracking/${order.order_id}`
          : `https://lyviawarisanrasa.com/auth/order-tracking/${order.order_id}`;
        const adminMsg = `Guest Pesanan baru\n\nNomor Pesanan: ${order.order_number}\nNama: ${nama || '-'}\nWA Pelanggan: ${whatsapp || '-'}\nTotal: Rp ${totalCalc.toLocaleString('id-ID')}\n\nLacak: ${trackingUrl}`;
        const waResult = await sendWhatsappMessage({ to: ADMIN_WHATSAPP_NUMBER, message: adminMsg });
        if (waResult?.ok) {
          console.log('[Guest] Admin WA sent for guest order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, '\nMessage:', adminMsg, '\nStatus:', waResult.status || waResult.data || 'ok');
        } else if (waResult?.skipped) {
          console.log('[Guest] Admin WA skipped (disabled in config) for guest order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER);
        } else {
          console.warn('[Guest] Admin WA send failed for guest order:', order.order_number, 'to:', ADMIN_WHATSAPP_NUMBER, waResult?.reason || waResult?.error || waResult);
        }
      } catch (waErr) {
        console.warn('[Guest] Failed to notify admin WA:', waErr?.message || waErr);
      }
    })();

    // Return the created order
    try {
      const created = await Order.findByPk(order.order_id, { include: [{ model: OrderItem, as: 'OrderItems' }, { model: Payment }] });
      if (created) {
        const jsonData = created.toJSON();
        return res.status(201).json({ 
          success: true,
          message: 'Order guest berhasil dibuat',
          ...jsonData,
          guest_info: { nama, alamat, whatsapp }
        });
      }
      return res.status(201).json({ 
        success: true,
        message: 'Order guest berhasil dibuat',
        order_id: order.order_id, 
        order_number: order.order_number,
        guest_info: { nama, alamat, whatsapp }
      });
    } catch (postErr) {
      console.error('[Guest] Post-commit fetch failed:', postErr.message);
      return res.status(201).json({ 
        success: true,
        message: 'Order guest berhasil dibuat',
        order_id: order.order_id, 
        order_number: order.order_number,
        warning: 'Order created but detail fetch failed',
        guest_info: { nama, alamat, whatsapp }
      });
    }
  } catch (e) {
    if (!committed) {
      try { await t.rollback(); } catch (rbErr) { console.error('[Guest] Rollback failed:', rbErr.message); }
    }
    console.error('[Guest] Error:', e);
    res.status(400).json({ 
      success: false,
      msg: "Gagal membuat order guest", 
      error: e.message 
    });
  }
};

/**
 * Track order by ID - Public endpoint (no authentication required)
 * Direct access via order_id (for WhatsApp links)
 */
export const trackOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID tidak valid'
      });
    }

    const order = await Order.findOne({
      where: { order_id: id },
      include: [
        {
          model: OrderItem,
          as: 'OrderItems',
          required: false,
          include: [
            {
              model: Product,
              attributes: ['product_id', 'name', 'image_url', 'price', 'category_id'],
              include: [
                {
                  model: ProductCategory,
                  attributes: ['category_id', 'name', 'slug']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'User',
          attributes: ['user_id', 'fullname', 'email', 'phone'],
          required: false
        },
        {
          model: PaymentMethod,
          attributes: ['payment_method_id', 'name', 'code']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('[trackOrderById] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melacak pesanan',
      error: error.message
    });
  }
};

/**
 * Track order - Public endpoint (no authentication required)
 * Search by order_number, email, or phone
 */
export const trackOrder = async (req, res) => {
  try {
    const { order_number, email, phone } = req.query;

    // Validate that at least one search parameter is provided
    if (!order_number && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Harap masukkan nomor pesanan, email, atau nomor telepon'
      });
    }

    let orders = [];
    let isSingleSearch = false;

    // Search by phone number - dapat mengembalikan multiple orders
    if (phone && !order_number && !email) {
      console.log('[trackOrder] Searching by phone:', phone);
      orders = await Order.findAll({
        where: {
          ship_phone: phone
        },
        include: [
          {
            model: OrderItem,
            as: 'OrderItems',
            required: false,
            include: [
              {
                model: Product,
                attributes: ['product_id', 'name', 'image_url', 'price', 'category_id'],
                include: [
                  {
                    model: ProductCategory,
                    attributes: ['category_id', 'name', 'slug']
                  }
                ]
              }
            ]
          },
          {
            model: User,
            as: 'User',
            attributes: ['user_id', 'fullname', 'email', 'phone'],
            required: false
          },
          {
            model: PaymentMethod,
            attributes: ['payment_method_id', 'name', 'code']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      console.log('[trackOrder] Phone search found orders:', orders.length);
    } 
    // Search by order_number or email - single result expected
    else {
      isSingleSearch = true;
      const whereClause = {};
      const userWhere = {};
      
      if (order_number) {
        // Check if it's a UUID format (order_id) or order_number format (NB-YYMMDD-XXXX)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order_number);
        
        if (isUUID) {
          whereClause.order_id = order_number;
        } else {
          whereClause.order_number = order_number;
        }
      }
      
      if (email) {
        userWhere.email = email;
      }

      // Only search if we have valid criteria
      if (Object.keys(whereClause).length > 0 || Object.keys(userWhere).length > 0) {
        const singleOrder = await Order.findOne({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          include: [
            {
              model: OrderItem,
              as: 'OrderItems',
              required: false,
              include: [
                {
                  model: Product,
                  attributes: ['product_id', 'name', 'image_url', 'price', 'category_id'],
                  include: [
                    {
                      model: ProductCategory,
                      attributes: ['category_id', 'name', 'slug']
                    }
                  ]
                }
              ]
            },
            {
              model: User,
              as: 'User',
              attributes: ['user_id', 'fullname', 'email', 'phone'],
              where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
              required: Object.keys(userWhere).length > 0
            },
            {
              model: PaymentMethod,
              attributes: ['payment_method_id', 'name', 'code']
            }
          ]
        });
        
        if (singleOrder) {
          orders = [singleOrder];
        }
      }
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan. Periksa kembali nomor pesanan, email, atau nomor telepon Anda.'
      });
    }

    // Return response dengan format yang konsisten
    // Untuk phone search: selalu return array (bisa 1 atau lebih)
    // Untuk order_number/email: return single object
    res.json({
      success: true,
      data: isSingleSearch ? orders[0] : orders,
      count: orders.length,
      isMultiple: orders.length > 1,
      searchType: phone ? 'phone' : (order_number ? 'order_number' : 'email')
    });

  } catch (error) {
    console.error('[trackOrder] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat melacak pesanan',
      error: error.message
    });
  }
};

