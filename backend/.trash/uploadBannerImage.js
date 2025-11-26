import multer from 'multer';
import path from 'path';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const maxSize = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), 'backend/public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = 'banner_' + Date.now() + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung'), false);
  }
};

const uploadBannerImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize }
});

export const convertToWebpAfterUpload = async (req, res, next) => {
  const sharp = (await import('sharp')).default || (await import('sharp'));
  if (!req.file) return next();
  const filePath = req.file.path;
  const ext = path.extname(filePath).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    const webpPath = filePath.replace(ext, ".webp");
    try {
      await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
      fs.unlinkSync(filePath); // Hapus file asli
      req.file.path = webpPath;
      req.file.filename = path.basename(webpPath);
    } catch (e) {
      console.error("Gagal konversi ke webp:", e);
    }
  }
  next();
};
export default uploadBannerImage;
