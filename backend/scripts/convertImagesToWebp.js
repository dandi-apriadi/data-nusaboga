// Script untuk batch convert semua gambar di backend/public/uploads ke .webp
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const allowedExtensions = ['.jpg', '.jpeg', '.png'];
const uploadsDir = path.join(__dirname, '../public/uploads');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function convertToWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExtensions.includes(ext)) return;
  const webpPath = filePath.replace(ext, '.webp');
  if (fs.existsSync(webpPath)) return; // Skip jika sudah ada .webp
  sharp(filePath)
    .webp({ quality: 80 })
    .toFile(webpPath)
    .then(() => {
      console.log(`Converted: ${filePath} -> ${webpPath}`);
    })
    .catch(err => {
      console.error(`Error converting ${filePath}:`, err);
    });
}

walkDir(uploadsDir, convertToWebp);
