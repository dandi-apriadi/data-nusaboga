import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'backend/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default function uploadBannerFormidable(req, res, next) {
  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => {
      return [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ].includes(mimetype);
    },
    filename: (name, ext, part, form) => {
      const extname = path.extname(part.originalFilename || '');
      return 'banner_' + Date.now() + extname;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    req.body = fields;
    req.files = files;
    // Konversi otomatis ke .webp
    const sharp = (await import('sharp')).default || (await import('sharp'));
    for (const key in files) {
      const file = files[key];
      const filePath = file.filepath || file.path;
      const ext = path.extname(filePath).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const webpPath = filePath.replace(ext, ".webp");
        try {
          await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
          fs.unlinkSync(filePath); // Hapus file asli
          // Update path file ke webp
          file.filepath = webpPath;
          file.newFilename = path.basename(webpPath);
        } catch (e) {
          console.error("Gagal konversi ke webp:", e);
        }
      }
    }
    next();
  });
}
