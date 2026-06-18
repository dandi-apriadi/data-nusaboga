import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/Database.js";
import { Product, ProductCategory, ProductImage } from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

const catalogBySlug = {
  "abon-cakalang-premium-250g": {
    categorySlug: "abon-cakalang",
    imageUrl: "/uploads/products/1762223978282_WhatsApp_Image_2025-09-19_at_21.09.46_(1).webp"
  },
  "abon-cakalang-premium-500g": {
    categorySlug: "abon-cakalang",
    imageUrl: "/uploads/products/1762223978282_WhatsApp_Image_2025-09-19_at_21.09.46_(1).webp"
  },
  "dendeng-cakalang-pedas-200g": {
    categorySlug: "dendeng-cakalang",
    imageUrl: "/uploads/products/1762224574584_Fufu_Rintek.webp"
  },
  "cakalang-fufu-asap-300g": {
    categorySlug: "cakalang-fufu",
    imageUrl: "/uploads/products/1762224574584_Fufu_Rintek.webp"
  },
  "sambal-cakalang-pedas-150g": {
    categorySlug: "sambal-cakalang",
    imageUrl: "/uploads/products/1762224913062_Sambal_cakalang.webp"
  },
  "sambal-cakalang-extra-pedas-150g": {
    categorySlug: "sambal-cakalang",
    imageUrl: "/uploads/products/1763295654904_WhatsApp_Image_2025-09-19_at_21.06.15.webp"
  },
  "paket-hemat-cakalang-mix": {
    categorySlug: "cakalang-fufu",
    imageUrl: "/uploads/products/1762224574584_Fufu_Rintek.webp"
  }
};

const force = process.argv.includes("--force");

function assertLocalUploadExists(url) {
  const relativePath = String(url).replace(/^\/+/, "");
  const absolutePath = path.join(backendRoot, "public", relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File gambar tidak ditemukan: ${absolutePath}`);
  }
}

async function upsertPrimaryImage(product, url) {
  const existingPrimary = await ProductImage.findOne({
    where: { product_id: product.product_id, is_primary: true }
  });

  if (existingPrimary) {
    if (force || !existingPrimary.url) {
      await existingPrimary.update({ url });
      return "updated-primary";
    }
    return "kept-primary";
  }

  await ProductImage.create({
    product_id: product.product_id,
    url,
    is_primary: true
  });
  return "created-primary";
}

async function repairProductImages() {
  await db.authenticate();

  const results = [];
  for (const [slug, config] of Object.entries(catalogBySlug)) {
    const url = config.imageUrl;
    assertLocalUploadExists(url);

    const product = await Product.findOne({ where: { slug } });
    if (!product) {
      results.push({ slug, status: "missing-product" });
      continue;
    }

    const shouldUpdateProduct = force || !product.image_url;
    if (shouldUpdateProduct) {
      await product.update({ image_url: url });
    }

    const category = await ProductCategory.findOne({ where: { slug: config.categorySlug } });
    let categoryStatus = "missing-category";
    if (category) {
      const shouldUpdateCategory = force || product.category_id !== category.category_id;
      if (shouldUpdateCategory) {
        await product.update({ category_id: category.category_id });
        categoryStatus = "updated";
      } else {
        categoryStatus = "kept";
      }
    }

    const imageStatus = await upsertPrimaryImage(product, url);
    results.push({
      slug,
      image_url: shouldUpdateProduct ? "updated" : "kept",
      category: categoryStatus,
      product_image: imageStatus
    });
  }

  console.table(results);
}

repairProductImages()
  .then(() => db.close())
  .catch((error) => {
    console.error("Gagal memperbaiki gambar produk:", error);
    db.close().finally(() => process.exit(1));
  });
