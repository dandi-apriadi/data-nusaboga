import { Review, User, Product } from "../models/index.js";
import db from "../config/Database.js";

// Helper: ensure legacy databases have status/moderation columns
const ensureReviewColumns = async () => {
  const qi = db.getQueryInterface();
  let schema;
  let added = [];
  try {
    schema = await qi.describeTable('reviews');
  } catch (e) {
    console.warn('[Reviews][SchemaDescribeWarn]', e.message);
    return { schema: null, added, missing: ['status','moderated_by','moderated_at'] };
  }
  const missing = [];
  if (!schema.status) missing.push('status');
  if (!schema.moderated_by) missing.push('moderated_by');
  if (!schema.moderated_at) missing.push('moderated_at');
  if (missing.length) {
    for (const col of missing) {
      try {
        if (col === 'status') {
          await db.query("ALTER TABLE `reviews` ADD COLUMN `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER `comment`");
        } else if (col === 'moderated_by') {
          await db.query("ALTER TABLE `reviews` ADD COLUMN `moderated_by` VARCHAR(191) NULL AFTER `status`");
        } else if (col === 'moderated_at') {
          await db.query("ALTER TABLE `reviews` ADD COLUMN `moderated_at` DATETIME NULL AFTER `moderated_by`");
        }
        added.push(col);
      } catch (e) {
        console.warn(`[Reviews][AddColumnWarn] ${col}:`, e.message);
      }
    }
  }
  console.log('[Reviews][SchemaCheck]', { missing, added, finalHasStatus: !missing.includes('status') });
  return { schema, missing, added };
};

export const adminListReviews = async (req, res) => {
  try {
  const { missing } = await ensureReviewColumns();
    const { status, product_id, user_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (product_id) where.product_id = product_id;
    if (user_id) where.user_id = user_id;
    
    let rows;
    const baseAttributes = ['review_id','product_id','user_id','order_id','rating','comment'];
    if (!missing.includes('status')) baseAttributes.push('status');
    if (!missing.includes('moderated_by')) baseAttributes.push('moderated_by');
    if (!missing.includes('moderated_at')) baseAttributes.push('moderated_at');

    try {
      rows = await Review.findAll({ 
        where,
        attributes: baseAttributes,
        include: [
          {
            model: User,
            attributes: ['user_id', 'fullname', 'email'],
            required: false
          },
          {
            model: Product,
            attributes: ['product_id', 'name', 'price'],
            required: false
          }
        ],
        order: [["created_at", "DESC"]] 
      });
    } catch (primaryErr) {
      console.error('[Reviews][AdminList][PrimaryError]', primaryErr.message);
      rows = await Review.findAll({ where, attributes: baseAttributes, order: [["created_at", "DESC"]] });
    }

    // Transform data untuk frontend
    const transformedRows = rows.map(review => ({
      id: review.review_id,
      user_id: review.user_id,
      user_name: review.User?.fullname || review.User?.email || 'Anonymous',
      product_id: review.product_id,
      product_name: review.Product?.name || 'Unknown Product',
      rating: review.rating,
      comment: review.comment,
      status: review.status || 'pending',
      moderated_by: review.moderated_by || null,
      moderated_at: review.moderated_at || null,
      created_at: review.created_at
    }));

    res.json({
      success: true,
      data: transformedRows
    });
  } catch (e) {
    res.status(500).json({ 
      success: false,
      message: "Gagal mengambil ulasan", 
      error: e.message 
    });
  }
};

export const approveReview = async (req, res) => {
  try {
    await ensureReviewColumns();
    const { id } = req.params;
    const moderator = req.session?.user_id || null;
    
    await Review.update(
      { 
        status: 'approved', 
        moderated_by: moderator, 
        moderated_at: new Date() 
      }, 
      { where: { review_id: id } }
    );
    
    const row = await Review.findOne({
      where: { review_id: id },
      include: [
        {
          model: User,
          attributes: ['user_id', 'fullname', 'email'],
          required: false
        },
        {
          model: Product,
          attributes: ['product_id', 'name', 'price'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: "Review berhasil disetujui",
      data: {
        id: row.review_id,
        status: row.status,
        moderated_at: row.moderated_at
      }
    });
  } catch (e) {
    res.status(400).json({ 
      success: false,
      message: "Gagal menyetujui ulasan", 
      error: e.message 
    });
  }
};

export const rejectReview = async (req, res) => {
  try {
    await ensureReviewColumns();
    const { id } = req.params;
    const moderator = req.session?.user_id || null;
    
    await Review.update(
      { 
        status: 'rejected', 
        moderated_by: moderator, 
        moderated_at: new Date() 
      }, 
      { where: { review_id: id } }
    );
    
    const row = await Review.findOne({
      where: { review_id: id },
      include: [
        {
          model: User,
          attributes: ['user_id', 'fullname', 'email'],
          required: false
        },
        {
          model: Product,
          attributes: ['product_id', 'name', 'price'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: "Review berhasil ditolak",
      data: {
        id: row.review_id,
        status: row.status,
        moderated_at: row.moderated_at
      }
    });
  } catch (e) {
    res.status(400).json({ 
      success: false,
      message: "Gagal menolak ulasan", 
      error: e.message 
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCount = await Review.destroy({ 
      where: { review_id: id } 
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Review tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "Review berhasil dihapus"
    });
  } catch (e) {
    res.status(400).json({ 
      success: false,
      message: "Gagal menghapus ulasan", 
      error: e.message 
    });
  }
};
