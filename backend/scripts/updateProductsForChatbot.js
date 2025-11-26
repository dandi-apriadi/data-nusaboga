import db from "../config/Database.js";
import { Product } from "../models/productModel.js";

async function updateProductsForChatbot() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    // Update existing products to be cakalang-related
    const updates = [
      {
        name: "Abon Cakalang Premium",
        description: "Abon cakalang premium yang terbuat dari ikan cakalang segar pilihan. Diolah dengan resep tradisional dan bumbu rempah berkualitas tinggi. Cocok untuk lauk pendamping nasi atau isian roti.",
        price: 45000,
        rating_avg: 4.8,
        reviews_count: 125
      },
      {
        name: "Dendeng Cakalang Pedas",
        description: "Dendeng cakalang dengan bumbu pedas khas Indonesia. Proses pengeringan sempurna dengan tekstur yang pas. Camilan sehat tinggi protein dari ikan cakalang berkualitas.",
        price: 35000,
        rating_avg: 4.6,
        reviews_count: 89
      },
      {
        name: "Sambal Cakalang Asli",
        description: "Sambal cakalang dengan level kepedasan sedang. Terbuat dari cakalang suwir yang dicampur dengan cabai pilihan dan bumbu tradisional khas Nusantara.",
        price: 25000,
        rating_avg: 4.5,
        reviews_count: 156
      }
    ];

    const products = await Product.findAll();
    
    for (let i = 0; i < Math.min(products.length, updates.length); i++) {
      await Product.update(updates[i], {
        where: { product_id: products[i].product_id }
      });
      console.log(`✅ Updated product: ${updates[i].name}`);
    }

    console.log("\n🎉 Products updated successfully for chatbot testing!");
    
    // Verify updates
    const updatedProducts = await Product.findAll({
      attributes: ['name', 'description', 'rating_avg', 'reviews_count', 'price']
    });
    
    console.log(`\n📦 Updated products in database:`);
    updatedProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - Rp ${p.price} (${p.rating_avg}⭐, ${p.reviews_count} reviews)`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating products:", error);
    process.exit(1);
  }
}

updateProductsForChatbot();