import { Wishlist, WishlistItem, Product } from "../models/index.js";

// Ensure a wishlist exists for the current user
const getOrCreateWishlist = async (user_id) => {
  let wl = await Wishlist.findOne({ where: { user_id } });
  if (!wl) wl = await Wishlist.create({ user_id });
  return wl;
};

export const getWishlist = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    if (!user_id) return res.status(401).json({ msg: "Harus login" });
    const wishlist = await getOrCreateWishlist(user_id);
    const items = await WishlistItem.findAll({
      where: { wishlist_id: wishlist.wishlist_id },
      include: [
        { model: Product, attributes: ["product_id", "name", "price", "image_url", "stock"] },
      ],
      order: [["added_at", "DESC"]],
    });
    res.json({ wishlist_id: wishlist.wishlist_id, items });
  } catch (e) {
    res.status(500).json({ msg: "Gagal mengambil wishlist", error: e.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { product_id } = req.body;
    if (!user_id) return res.status(401).json({ msg: "Harus login" });
    if (!product_id) return res.status(400).json({ msg: "product_id wajib diisi" });
    const wishlist = await getOrCreateWishlist(user_id);
    const [item, created] = await WishlistItem.findOrCreate({
      where: { wishlist_id: wishlist.wishlist_id, product_id },
      defaults: { wishlist_id: wishlist.wishlist_id, product_id },
    });
    // Ambil ulang item dengan include Product agar front-end langsung punya detail lengkap
    const fullItem = await WishlistItem.findOne({
      where: { wishlist_item_id: item.wishlist_item_id },
      include: [{ model: Product, attributes: ["product_id", "name", "price", "image_url", "stock"] }],
    });
    res.status(created ? 201 : 200).json(fullItem);
  } catch (e) {
    res.status(400).json({ msg: "Gagal menambah ke wishlist", error: e.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    const { product_id } = req.params;
    if (!user_id) return res.status(401).json({ msg: "Harus login" });
    const wishlist = await getOrCreateWishlist(user_id);
    const deleted = await WishlistItem.destroy({ where: { wishlist_id: wishlist.wishlist_id, product_id } });
    res.json({ msg: deleted ? "Dihapus" : "Tidak ditemukan" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal menghapus dari wishlist", error: e.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const user_id = req.session?.user_id;
    if (!user_id) return res.status(401).json({ msg: "Harus login" });
    const wishlist = await getOrCreateWishlist(user_id);
    await WishlistItem.destroy({ where: { wishlist_id: wishlist.wishlist_id } });
    res.json({ msg: "Wishlist dikosongkan" });
  } catch (e) {
    res.status(400).json({ msg: "Gagal mengosongkan wishlist", error: e.message });
  }
};
