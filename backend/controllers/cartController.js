import db from "../config/Database.js";
import { Cart, CartItem, Product } from "../models/index.js";

const ensureCart = async (user_id, session_id) => {
  let where = {};
  if (user_id) where.user_id = user_id; else where.session_id = session_id;
  where.status = 'active';
  let cart = await Cart.findOne({ where });
  if (!cart) {
    cart = await Cart.create({ user_id, session_id, status: 'active' });
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const user_id = req.session?.user_id || null;
    const session_id = req.sessionID;
    const cart = await ensureCart(user_id, session_id);
    const items = await CartItem.findAll({ where: { cart_id: cart.cart_id }, include: [{ model: Product }] });
    res.json({ cart, items });
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil keranjang", error: e.message });
  }
};

export const addItem = async (req, res) => {
  const t = await db.transaction();
  try {
    const user_id = req.session?.user_id || null;
    const session_id = req.sessionID;
    const cart = await ensureCart(user_id, session_id);
    const { product_id, quantity, price_at_add } = req.body;
    
    // Validasi input
    if (!product_id) {
      await t.rollback();
      return res.status(400).json({ msg: "product_id wajib diisi" });
    }
    if (!price_at_add || isNaN(parseFloat(price_at_add))) {
      await t.rollback();
      return res.status(400).json({ msg: "price_at_add wajib diisi dan harus berupa angka" });
    }
    
    // Cek apakah produk ada
    const product = await Product.findByPk(product_id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }
    
    // Cek apakah item sudah ada di cart
    const exists = await CartItem.findOne({ where: { cart_id: cart.cart_id, product_id } });
    if (exists) {
      const newQuantity = exists.quantity + Number(quantity || 1);
      await exists.update({ quantity: newQuantity }, { transaction: t });
      await t.commit();
      return res.json(exists);
    }
    
    // Buat item baru
    const item = await CartItem.create({ 
      cart_id: cart.cart_id, 
      product_id, 
      quantity: Number(quantity) || 1, 
      price_at_add: parseFloat(price_at_add) 
    }, { transaction: t });
    
    await t.commit();
    res.status(201).json(item);
  } catch (e) {
    await t.rollback();
    console.error('[addItem error]:', e);
    res.status(400).json({ msg: "Gagal menambah item", error: e.message, details: e.errors?.map(err => err.message) });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    await CartItem.update({ quantity }, { where: { cart_item_id: id } });
    const item = await CartItem.findByPk(id);
    res.json(item);
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengubah item", error: e.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    await CartItem.destroy({ where: { cart_item_id: id } });
    res.json({ msg: "Item dihapus" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus item", error: e.message });
  }
};
