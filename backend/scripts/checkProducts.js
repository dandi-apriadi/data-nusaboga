import db from "../config/Database.js";
import { Product } from "../models/productModel.js";

async function checkExistingProducts() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    const products = await Product.findAll({
      attributes: ['name', 'description', 'rating_avg', 'reviews_count', 'price']
    });
    
    console.log(`\n📦 Found ${products.length} products in database:`);
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   Price: ${p.price}`);
      console.log(`   Rating: ${p.rating_avg}, Reviews: ${p.reviews_count}`);
      console.log(`   Description: ${p.description?.substring(0, 100)}...`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking products:", error);
    process.exit(1);
  }
}

checkExistingProducts();