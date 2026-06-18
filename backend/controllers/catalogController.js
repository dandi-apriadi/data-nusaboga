import db from "../config/Database.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";
import {
  ProductCategory,
  Product,
  ProductImage,
  InventoryMovement,
  OrderItem,
  Order,
  Review,
} from "../models/index.js";

// Helpers
const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]).filter(([, v]) => v !== undefined));

// Categories
export const listCategories = async (req, res) => {
  try {
    // Return categories with aggregated product counts
    const [rows] = await db.query(`
      SELECT c.*, COALESCE(p.product_count, 0) AS product_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) AS product_count
        FROM products
        GROUP BY category_id
      ) p ON p.category_id = c.category_id
      ORDER BY c.name ASC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil kategori", error: e.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = pick(req.body, ["name", "slug", "description"]);
    const cat = await ProductCategory.create(data);
    res.status(201).json(cat);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat kategori", error: e.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = pick(req.body, ["name", "slug", "description"]);
    await ProductCategory.update(data, { where: { category_id: id } });
    const cat = await ProductCategory.findByPk(id);
    res.json(cat);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah kategori", error: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if category still has products
    const productCount = await Product.count({ where: { category_id: id } });
    if (productCount > 0) {
      return res.status(400).json({ msg: "Kategori tidak bisa dihapus karena masih memiliki produk", product_count: productCount });
    }
    const deleted = await ProductCategory.destroy({ where: { category_id: id } });
    if (!deleted) {
      return res.status(404).json({ msg: "Kategori tidak ditemukan" });
    }
    res.json({ msg: "Kategori dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus kategori", error: e.message });
  }
};

// Products
export const listProducts = async (req, res) => {
  try {
    const { q, category_id, active, page = 1, pageSize = 20 } = req.query;
    const where = {};
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (category_id) where.category_id = category_id;
    if (active !== undefined) where.active = active === "true";
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const result = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        { model: ProductImage },
        { model: ProductCategory, attributes: ["category_id", "name"] },
      ],
    });

    // Aggregate sold counts for returned product ids (statuses representing realized sales)
    const productIds = result.rows.map(p => p.product_id);
    let soldMap = new Map();
    if (productIds.length) {
      try {
        const [soldRows] = await db.query(`
          SELECT oi.product_id, COALESCE(SUM(oi.quantity),0) AS sold_qty
          FROM order_items oi
          JOIN orders o ON o.order_id = oi.order_id
          WHERE oi.product_id IN (:ids)
            AND o.status IN ('completed', 'shipped')
          GROUP BY oi.product_id
        `, { replacements: { ids: productIds } });
        soldMap = new Map(soldRows.map(r => [r.product_id, Number(r.sold_qty || 0)]));
      } catch (aggErr) {
        console.warn('Sold aggregation failed (non fatal):', aggErr.message);
      }
    }

    const withSold = result.rows.map(p => {
      // mutate dataValues to append sold_count
      p.dataValues.sold_count = soldMap.get(p.product_id) || 0;
      return p;
    });

    res.json({
      items: withSold,
      total: result.count,
      page: parseInt(page),
      pageSize: limit,
    });
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil produk", error: e.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const item = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage },
        { model: ProductCategory, attributes: ["category_id", "name"] },
      ],
    });
    if (!item) return res.status(404).json({ msg: "Produk tidak ditemukan" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil produk", error: e.message });
  }
};

// Helper functions for data processing
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};


export const createProduct = async (req, res) => {
  try {
    const data = pick(req.body, [
      "category_id",
      "name",
      "slug",
      "description",
      "price",
      "original_price",
      "cost_price",
      "stock",
      "weight_grams",
      "active",
    ]);

    // Data validation and defaults
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ msg: "Nama produk wajib diisi" });
    }

    // Always generate slug from name for consistency
    data.slug = generateSlug(data.name);


    // Set default values for numerical fields
    data.price = parseFloat(data.price) || 0;
    data.original_price = data.original_price ? parseFloat(data.original_price) : data.price;
    data.cost_price = data.cost_price ? parseFloat(data.cost_price) : data.price * 0.7; // Default 70% of selling price
    data.stock = parseInt(data.stock) || 0;
    data.weight_grams = parseInt(data.weight_grams) || 500; // Default 500g
    data.active = data.active !== undefined ? data.active : true;

    // Ensure description has a default
    if (!data.description || !data.description.trim()) {
      data.description = `Produk ${data.name} berkualitas tinggi`;
    }

    // Handle image upload
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'products', fileName);
      // Create directory if it doesn't exist
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      await imageFile.mv(uploadPath);
      // Konversi ke webp
      const sharp = (await import('sharp')).default || (await import('sharp'));
      const ext = path.extname(uploadPath).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const webpPath = uploadPath.replace(ext, ".webp");
        await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
        fs.unlinkSync(uploadPath);
        data.image_url = `/uploads/products/${path.basename(webpPath)}`;
      } else {
        data.image_url = `/uploads/products/${fileName}`;
      }
    }

    const p = await Product.create(data);
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ msg: "Gagal membuat produk", error: e.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = pick(req.body, [
      "category_id",
      "name",
      "slug",
      "description",
      "price",
      "original_price",
      "cost_price",
      "stock",
      "weight_grams",
      "active",
    ]);

    // Get current product for reference
    const currentProduct = await Product.findByPk(id);
    if (!currentProduct) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    // Data validation and defaults for update
    if (data.name && !data.name.trim()) {
      return res.status(400).json({ msg: "Nama produk tidak boleh kosong" });
    }

    // Always regenerate slug when name is provided for consistency
    if (data.name && data.name.trim()) {
      data.slug = generateSlug(data.name);
    }

    // Set proper types and defaults for numerical fields
    if (data.price !== undefined) data.price = parseFloat(data.price) || 0;
    if (data.original_price !== undefined) {
      data.original_price = data.original_price ? parseFloat(data.original_price) : (data.price || currentProduct.price);
    }
    if (data.cost_price !== undefined) {
      data.cost_price = data.cost_price ? parseFloat(data.cost_price) : ((data.price || currentProduct.price) * 0.7);
    }
    if (data.stock !== undefined) data.stock = parseInt(data.stock) || 0;
    if (data.weight_grams !== undefined) data.weight_grams = parseInt(data.weight_grams) || 500;

    // Handle image upload
    if (req.files && req.files.image) {
      // Delete old image if exists
      if (currentProduct.image_url) {
        // Important: strip leading slash so path.join doesn't ignore 'public'
        const rel = String(currentProduct.image_url).replace(/^\//, '');
        const oldImagePath = path.join(process.cwd(), 'public', rel);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      const imageFile = req.files.image;
      const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'products', fileName);
      // Create directory if it doesn't exist
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      await imageFile.mv(uploadPath);
      // Konversi ke webp
      const sharp = (await import('sharp')).default || (await import('sharp'));
      const ext = path.extname(uploadPath).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const webpPath = uploadPath.replace(ext, ".webp");
        await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
        fs.unlinkSync(uploadPath);
        data.image_url = `/uploads/products/${path.basename(webpPath)}`;
      } else {
        data.image_url = `/uploads/products/${fileName}`;
      }
    }

    await Product.update(data, { where: { product_id: id } });
    const p = await Product.findByPk(id);
    res.json(p);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah produk", error: e.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    // Ensure product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    if (!force || String(force).toLowerCase() !== 'true') {
      // Guard: prevent hard delete when product already has transactions
      const [[{ cnt: order_item_count }]] = await db.query(
        'SELECT COUNT(*) AS cnt FROM order_items WHERE product_id = :pid',
        { replacements: { pid: id } }
      );
      if (Number(order_item_count) > 0) {
        return res.status(400).json({
          msg: "Produk tidak bisa dihapus karena sudah memiliki transaksi. Nonaktifkan produk sebagai alternatif.",
          code: "HAS_DEPENDENCIES",
          order_item_count: Number(order_item_count)
        });
      }
    }

    // Optional: delete associated image file if stored locally
    try {
      if (product.image_url) {
        const rel = String(product.image_url).replace(/^\//, '');
        const p = path.join(process.cwd(), 'public', rel);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    } catch (fileErr) {
      // Non-fatal: log and continue deletion
      console.warn('Gagal menghapus file gambar produk:', fileErr.message);
    }

    await Product.destroy({ where: { product_id: id } });
    res.json({ msg: "Produk dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus produk", error: e.message });
  }
};

// Product images
export const addProductImage = async (req, res) => {
  try {
    const { product_id, url, is_primary } = req.body;
    // Normalize local URLs to always use /uploads/* mount; keep http(s)/data as-is
    const normalizeUrl = (u) => {
      if (!u) return u;
      if (/^(https?:|data:)/i.test(u)) return u;
      let p = String(u).trim();
      p = p.replace(/^\.\//, '').replace(/^public\//i, '');
      p = p.replace(/^\/+/, '');
      if (!/^uploads\//i.test(p)) p = 'uploads/' + p;
      return '/' + p.replace(/^\/+/, '');
    };
    const img = await ProductImage.create({ product_id, url: normalizeUrl(url), is_primary });
    res.status(201).json(img);
  } catch (e) {
    res.status(400).json({ msg: "Gagal menambah gambar", error: e.message });
  }
};

export const removeProductImage = async (req, res) => {
  try {
    await ProductImage.destroy({ where: { image_id: req.params.id } });
    res.json({ msg: "Gambar dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus gambar", error: e.message });
  }
};

// Inventory
export const listInventoryMovements = async (req, res) => {
  try {
    const { product_id } = req.query;
    const where = product_id ? { product_id } : {};
    const rows = await InventoryMovement.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil pergerakan stok", error: e.message });
  }
};

export const adjustInventory = async (req, res) => {
  const t = await db.transaction();
  try {
    const { product_id, quantity, unit_cost, note } = req.body;
    const row = await InventoryMovement.create(
      { product_id, type: "adjustment", quantity, unit_cost, note, reference_type: "manual" },
      { transaction: t }
    );

    // Optionally update product stock cache
    const sum = await InventoryMovement.sum("quantity", { where: { product_id }, transaction: t });
    await Product.update({ stock: sum || 0 }, { where: { product_id }, transaction: t });

    await t.commit();
    res.status(201).json(row);
  } catch (e) {
    await t.rollback();
    res.status(400).json({ msg: "Gagal melakukan penyesuaian stok", error: e.message });
  }
};

// Product sales / performance stats
export const getProductStats = async (req, res) => {
  try {
    const { id } = req.params; // product id
    // Ensure product exists (lightweight check)
    const product = await Product.findByPk(id, { attributes: ["product_id", "price", "cost_price"] });
    if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });

    // Aggregate sold quantity, revenue, and profit from completed / shipped orders
    // Treat "completed" and "shipped" as realized sales
    const realizedStatuses = ["completed", "shipped"];

    // Use a single raw query for efficiency (Sequelize aggregate with join)
    const [rows] = await db.query(
      `SELECT 
         COALESCE(SUM(oi.quantity), 0) AS sold_quantity,
         COALESCE(SUM(oi.subtotal), 0) AS revenue_amount,
         COALESCE(SUM( (oi.price_unit - COALESCE(oi.cost_at_sale, :fallbackCost)) * oi.quantity ), 0) AS profit_amount
       FROM order_items oi
       JOIN orders o ON o.order_id = oi.order_id
       WHERE oi.product_id = :pid AND o.status IN (:statuses)`,
      {
        replacements: {
          pid: id,
          statuses: realizedStatuses,
          fallbackCost: Number(product.cost_price || 0),
        },
      }
    );

    const sold = Number(rows[0]?.sold_quantity || 0);
    const revenue = Number(rows[0]?.revenue_amount || 0);
    const total_profit = Number(rows[0]?.profit_amount || 0);
    const profit_per_unit = sold > 0 ? total_profit / sold : (Number(product.price || 0) - Number(product.cost_price || 0));

    return res.json({
      product_id: id,
      sold,
      revenue,
      total_profit,
      profit_per_unit,
      margin_percent: revenue > 0 ? (total_profit / revenue) * 100 : 0,
    });
  } catch (e) {
    return res.status(500).json({ msg: "Gagal mengambil statistik produk", error: e.message });
  }
};

// ============= PUBLIC HOMEPAGE SUPPORT ENDPOINTS ============= //
// Lightweight public top-products (no auth) for homepage / landing usage
export const listTopProductsPublic = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const lim = Math.min(parseInt(limit) || 4, 12);
    // Aggregate sold + avg rating
    // FIXED: Filter only completed/shipped orders (realized sales)
    const [rows] = await db.query(`
      SELECT p.product_id,
             p.name,
             p.description,
             p.price,
             COALESCE(NULLIF(p.image_url, ''), pi.primary_url, pi.first_url) AS image_url,
             p.stock,
             p.active,
             p.weight_grams,
             COALESCE(SUM(CASE WHEN o.status IN ('completed', 'shipped') THEN oi.quantity ELSE 0 END), 0) AS sold_count,
             (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.product_id = p.product_id) AS avg_rating
      FROM products p
      LEFT JOIN (
        SELECT product_id,
               MAX(CASE WHEN is_primary = 1 THEN url ELSE NULL END) AS primary_url,
               MIN(url) AS first_url
        FROM product_images
        GROUP BY product_id
      ) pi ON pi.product_id = p.product_id
      LEFT JOIN order_items oi ON oi.product_id = p.product_id
      LEFT JOIN orders o ON o.order_id = oi.order_id
      WHERE p.active = 1
      GROUP BY p.product_id, p.name, p.description, p.price, p.image_url, pi.primary_url, pi.first_url, p.stock, p.active, p.weight_grams
      ORDER BY sold_count DESC
      LIMIT :lim;
    `, { replacements: { lim } });
    res.json(rows.map(r => ({
      product_id: r.product_id,
      name: r.name,
      description: r.description,
      price: Number(r.price) || 0,
      image_url: r.image_url,
      stock: r.stock,
      active: r.active,
      weight_grams: r.weight_grams,
      sold_count: Number(r.sold_count)||0,
      avg_rating: r.avg_rating ? Number(r.avg_rating) : null,
    })));
  } catch (e) {
    res.status(500).json({ msg: 'Gagal mengambil produk terlaris publik', error: e.message });
  }
};

// Public stats for homepage (non-sensitive aggregate)
export const getPublicStats = async (_req, res) => {
  try {
    const [[{ product_total }]] = await db.query('SELECT COUNT(*) AS product_total FROM products');
    const [[{ customer_total }]] = await db.query('SELECT COUNT(*) AS customer_total FROM users');
    const [[{ avg_rating }]] = await db.query('SELECT ROUND(AVG(rating),1) AS avg_rating FROM reviews');
    res.json({
      product_total: Number(product_total)||0,
      customer_total: Number(customer_total)||0,
      avg_rating: avg_rating ? Number(avg_rating) : 0,
    });
  } catch (e) {
    res.status(500).json({ msg: 'Gagal mengambil statistik publik', error: e.message });
  }
};
