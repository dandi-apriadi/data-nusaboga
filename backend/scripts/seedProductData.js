import db from "../config/Database.js";
import { Product, ProductCategory } from "../models/productModel.js";

const productImages = {
  "abon-cakalang-premium-250g": "/uploads/products/1762223978282_WhatsApp_Image_2025-09-19_at_21.09.46_(1).webp",
  "abon-cakalang-premium-500g": "/uploads/products/1762223978282_WhatsApp_Image_2025-09-19_at_21.09.46_(1).webp",
  "dendeng-cakalang-pedas-200g": "/uploads/products/1762224574584_Fufu_Rintek.webp",
  "cakalang-fufu-asap-300g": "/uploads/products/1762224574584_Fufu_Rintek.webp",
  "sambal-cakalang-pedas-150g": "/uploads/products/1762224913062_Sambal_cakalang.webp",
  "sambal-cakalang-extra-pedas-150g": "/uploads/products/1763295654904_WhatsApp_Image_2025-09-19_at_21.06.15.webp",
  "paket-hemat-cakalang-mix": "/uploads/products/1762224574584_Fufu_Rintek.webp"
};

const productCategoryBySlug = {
  "abon-cakalang-premium-250g": "abon-cakalang",
  "abon-cakalang-premium-500g": "abon-cakalang",
  "dendeng-cakalang-pedas-200g": "dendeng-cakalang",
  "cakalang-fufu-asap-300g": "cakalang-fufu",
  "sambal-cakalang-pedas-150g": "sambal-cakalang",
  "sambal-cakalang-extra-pedas-150g": "sambal-cakalang",
  "paket-hemat-cakalang-mix": "cakalang-fufu"
};

const categories = [
  {
    name: "Abon Cakalang",
    slug: "abon-cakalang",
    description: "Abon cakalang premium dengan cita rasa tradisional"
  },
  {
    name: "Dendeng Cakalang", 
    slug: "dendeng-cakalang",
    description: "Dendeng cakalang kering dengan bumbu rempah pilihan"
  },
  {
    name: "Cakalang Fufu",
    slug: "cakalang-fufu", 
    description: "Cakalang fufu asap dengan aroma khas"
  },
  {
    name: "Sambal Cakalang",
    slug: "sambal-cakalang",
    description: "Sambal cakalang pedas dengan ikan cakalang suwir"
  }
];

const products = [
  {
    name: "Abon Cakalang Premium 250g",
    slug: "abon-cakalang-premium-250g",
    category_slug: productCategoryBySlug["abon-cakalang-premium-250g"],
    description: "Abon cakalang premium yang terbuat dari ikan cakalang segar pilihan. Diolah dengan resep tradisional dan bumbu rempah berkualitas tinggi. Cocok untuk lauk pendamping nasi atau isian roti.",
    price: 45000,
    original_price: 50000,
    cost_price: 30000,
    stock: 100,
    weight_grams: 250,
    image_url: productImages["abon-cakalang-premium-250g"],
    active: true,
    rating_avg: 4.8,
    reviews_count: 125
  },
  {
    name: "Abon Cakalang Premium 500g",
    slug: "abon-cakalang-premium-500g", 
    category_slug: productCategoryBySlug["abon-cakalang-premium-500g"],
    description: "Abon cakalang premium ukuran ekonomis 500g. Terbuat dari ikan cakalang segar dengan proses pengolahan higienis. Tahan lama dan praktis untuk kebutuhan keluarga.",
    price: 85000,
    original_price: 95000,
    cost_price: 55000,
    stock: 75,
    weight_grams: 500,
    image_url: productImages["abon-cakalang-premium-500g"],
    active: true,
    rating_avg: 4.9,
    reviews_count: 89
  },
  {
    name: "Dendeng Cakalang Pedas 200g",
    slug: "dendeng-cakalang-pedas-200g",
    category_slug: productCategoryBySlug["dendeng-cakalang-pedas-200g"],
    description: "Dendeng cakalang dengan bumbu pedas khas Indonesia. Proses pengeringan sempurna dengan tekstur yang pas. Camilan sehat tinggi protein.",
    price: 35000,
    original_price: 40000,
    cost_price: 22000,
    stock: 80,
    weight_grams: 200,
    image_url: productImages["dendeng-cakalang-pedas-200g"],
    active: true,
    rating_avg: 4.6,
    reviews_count: 67
  },
  {
    name: "Cakalang Fufu Asap 300g",
    slug: "cakalang-fufu-asap-300g",
    category_slug: productCategoryBySlug["cakalang-fufu-asap-300g"],
    description: "Cakalang fufu asap tradisional dengan aroma khas yang menggugah selera. Diproses dengan teknik pengasapan alami menggunakan kayu berkualitas.",
    price: 55000,
    original_price: 60000,
    cost_price: 35000,
    stock: 60,
    weight_grams: 300,
    image_url: productImages["cakalang-fufu-asap-300g"],
    active: true,
    rating_avg: 4.7,
    reviews_count: 95
  },
  {
    name: "Sambal Cakalang Pedas 150g",
    slug: "sambal-cakalang-pedas-150g",
    category_slug: productCategoryBySlug["sambal-cakalang-pedas-150g"],
    description: "Sambal cakalang dengan level kepedasan sedang. Terbuat dari cakalang suwir yang dicampur dengan cabai pilihan dan bumbu tradisional.",
    price: 25000,
    original_price: 28000,
    cost_price: 15000,
    stock: 120,
    weight_grams: 150,
    image_url: productImages["sambal-cakalang-pedas-150g"],
    active: true,
    rating_avg: 4.5,
    reviews_count: 156
  },
  {
    name: "Sambal Cakalang Extra Pedas 150g",
    slug: "sambal-cakalang-extra-pedas-150g",
    category_slug: productCategoryBySlug["sambal-cakalang-extra-pedas-150g"],
    description: "Sambal cakalang dengan level kepedasan tinggi untuk pecinta pedas sejati. Menggunakan cabai rawit super dan bumbu rahasia.",
    price: 28000,
    original_price: 32000,
    cost_price: 18000,
    stock: 90,
    weight_grams: 150,
    image_url: productImages["sambal-cakalang-extra-pedas-150g"],
    active: true,
    rating_avg: 4.4,
    reviews_count: 78
  },
  {
    name: "Paket Hemat Cakalang Mix",
    slug: "paket-hemat-cakalang-mix",
    category_slug: productCategoryBySlug["paket-hemat-cakalang-mix"],
    description: "Paket hemat berisi abon cakalang 250g, dendeng cakalang 200g, dan sambal cakalang 150g. Cocok untuk gift atau kebutuhan keluarga.",
    price: 95000,
    original_price: 108000,
    cost_price: 65000,
    stock: 45,
    weight_grams: 600,
    image_url: productImages["paket-hemat-cakalang-mix"],
    active: true,
    rating_avg: 4.9,
    reviews_count: 234
  }
];

async function seedProductData() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    // Check if products already exist
    const existingProducts = await Product.count();
    console.log(`📊 Current products in database: ${existingProducts}`);

    if (existingProducts > 0) {
      console.log("✅ Products already exist in database, skipping seed");
      process.exit(0);
    }

    // Create categories
    const createdCategories = [];
    for (const category of categories) {
      const [createdCategory, created] = await ProductCategory.findOrCreate({
        where: { slug: category.slug },
        defaults: category
      });
      createdCategories.push(createdCategory);
      console.log(`✅ ${created ? 'Created' : 'Found'} category: ${category.name}`);
    }

    // Create products and assign to categories
    const categoriesBySlug = new Map(createdCategories.map(category => [category.slug, category]));
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const category = categoriesBySlug.get(product.category_slug);
      product.category_id = category?.category_id;
      delete product.category_slug;
      
      const [createdProduct, created] = await Product.findOrCreate({
        where: { slug: product.slug },
        defaults: product
      });
      console.log(`✅ ${created ? 'Created' : 'Found'} product: ${product.name}`);
    }

    console.log("🎉 Sample product data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding product data:", error);
    process.exit(1);
  }
}

seedProductData();
