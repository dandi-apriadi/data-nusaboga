// Script untuk batch convert semua gambar di backend/public/uploads ke .webp

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const allowedExtensions = ['.jpg', '.jpeg', '.png'];
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

async function convertToWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExtensions.includes(ext)) return;
  const webpPath = filePath.replace(ext, '.webp');
  if (fs.existsSync(webpPath)) {
    console.log(`[SKIP] Sudah ada .webp: ${webpPath}`);
    return;
  }
  try {
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    fs.unlinkSync(filePath); // Hapus file asli
    console.log(`[OK] Converted: ${filePath} -> ${webpPath}`);
  } catch (err) {
    console.error(`[ERROR] Gagal convert ${filePath}:`, err);
  }
}

async function main() {
  const files = [];
  walkDir(uploadsDir, f => files.push(f));
  let converted = 0;
  let skipped = 0;
  let failed = 0;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const webpPath = file.replace(ext, '.webp');
    if (!allowedExtensions.includes(ext)) continue;
    if (fs.existsSync(webpPath)) {
      skipped++;
      continue;
    }
    try {
      await sharp(file).webp({ quality: 80 }).toFile(webpPath);
      fs.unlinkSync(file);
      converted++;
      console.log(`[OK] Converted: ${file} -> ${webpPath}`);
    } catch (err) {
      failed++;
      console.error(`[ERROR] Gagal convert ${file}:`, err);
    }
  }
  console.log(`Selesai batch convert: ${converted} file dikonversi, ${skipped} dilewati, ${failed} gagal.`);
}

main();
