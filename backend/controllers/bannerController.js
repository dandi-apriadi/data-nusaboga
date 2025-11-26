// Banner Controller
import Banner from '../models/bannerModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bannerController = {
  // ...existing methods...
  async reorderBanners(req, res) {
    // Expects: { order: [id1, id2, id3, ...] }
    try {
      const { order } = req.body;
      if (!Array.isArray(order)) {
        console.log('[reorderBanners] Invalid payload:', req.body);
        return res.status(400).json({ success: false, message: 'Payload order harus array.' });
      }
      // Ambil semua banner yang id-nya ada di order
      const banners = await Banner.findAll({ where: { id: order } });
      // Map id ke banner instance
      const bannerMap = {};
      banners.forEach(b => { bannerMap[b.id] = b; });
      // Update order satu per satu
      for (let i = 0; i < order.length; i++) {
        const id = order[i];
        if (bannerMap[id]) {
          await bannerMap[id].update({ order: i + 1 });
        }
      }
      const response = { success: true, message: 'Urutan banner diperbarui.' };
      console.log('[reorderBanners] Response:', response);
      res.json(response);
    } catch (err) {
      console.error('[reorderBanners] Error:', err);
      res.status(500).json({ success: false, message: 'Gagal update urutan banner', error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const banners = await Banner.findAll({ order: [['order', 'ASC']] });
      res.json({ success: true, data: banners });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gagal mengambil data banner', error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const banner = await Banner.findByPk(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner tidak ditemukan' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Gagal mengambil data banner', error: err.message });
    }
  },
  async create(req, res) {
    try {
      console.log('POST /api/v1/banners payload:', {
        body: req.body,
        files: req.files
      });
      let { description, is_active, title } = req.body;
      if (!title) title = '-';
      let image_url = req.body.image_url;
      // express-fileupload: file ada di req.files.image
      if (req.files && req.files.image) {
        const imageFile = req.files.image;
        const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
        const uploadDir = path.join(__dirname, '../public/uploads/banners');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path.join(uploadDir, fileName);
        try {
          await imageFile.mv(uploadPath);
          // Konversi ke webp
          const sharp = (await import('sharp')).default || (await import('sharp'));
          const ext = path.extname(uploadPath).toLowerCase();
          if ([".jpg", ".jpeg", ".png"].includes(ext)) {
            const webpPath = uploadPath.replace(ext, ".webp");
            await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
            fs.unlinkSync(uploadPath);
            image_url = '/uploads/banners/' + path.basename(webpPath);
            console.log('Banner image converted to webp:', webpPath);
          } else {
            image_url = '/uploads/banners/' + fileName;
            console.log('Banner image saved to:', uploadPath);
          }
        } catch (err) {
          console.error('Gagal simpan/convert file banner:', err);
          return res.status(500).json({ success: false, message: 'Gagal menyimpan file gambar banner', error: err.message });
        }
      }
      // Validasi minimal: gambar wajib. Title column removed; rely on description for display.
      if (!image_url) {
        console.log('VALIDATION ERROR: missing image_url');
        return res.status(400).json({ success: false, message: 'Gambar banner wajib diisi.' });
      }
      // Otomatisasi order: ambil max order lalu +1
      let order = 1;
      const lastBanner = await Banner.findOne({ order: [['order', 'DESC']] });
      if (lastBanner && typeof lastBanner.order === 'number') {
        order = lastBanner.order + 1;
      }
      const banner = await Banner.create({ description, image_url, is_active, order, title });
      res.status(201).json({ success: true, data: banner });
    } catch (err) {
      console.error('CREATE BANNER ERROR:', err);
      res.status(400).json({ success: false, message: 'Gagal membuat banner', error: err.message });
    }
  },
  async update(req, res) {
    try {
      const { description, is_active } = req.body;
      let image_url = req.body.image_url;
      const banner = await Banner.findByPk(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner tidak ditemukan' });
      // express-fileupload: file ada di req.files.image
      if (req.files && req.files.image) {
        // Hapus gambar lama jika ada
        if (banner.image_url) {
          const rel = String(banner.image_url).replace(/^\//, '');
          const oldImagePath = path.join(__dirname, '..', rel);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        const imageFile = req.files.image;
        const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
        const uploadDir = path.join(__dirname, '../public/uploads/banners');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path.join(uploadDir, fileName);
        try {
          await imageFile.mv(uploadPath);
          // Konversi ke webp
          const sharp = (await import('sharp')).default || (await import('sharp'));
          const ext = path.extname(uploadPath).toLowerCase();
          if ([".jpg", ".jpeg", ".png"].includes(ext)) {
            const webpPath = uploadPath.replace(ext, ".webp");
            await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
            fs.unlinkSync(uploadPath);
            image_url = '/uploads/banners/' + path.basename(webpPath);
            console.log('Banner image converted to webp:', webpPath);
          } else {
            image_url = '/uploads/banners/' + fileName;
            console.log('Banner image saved to:', uploadPath);
          }
        } catch (err) {
          console.error('Gagal simpan/convert file banner:', err);
          return res.status(500).json({ success: false, message: 'Gagal menyimpan file gambar banner', error: err.message });
        }
      }
      await banner.update({ description, image_url, is_active });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Gagal update banner', error: err.message });
    }
  },
  async remove(req, res) {
    try {
      const banner = await Banner.findByPk(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner tidak ditemukan' });
      await banner.destroy();
      res.json({ success: true, message: 'Banner dihapus' });
    } catch (err) {
      res.status(400).json({ success: false, message: 'Gagal hapus banner', error: err.message });
    }
  },
};

export default bannerController;
