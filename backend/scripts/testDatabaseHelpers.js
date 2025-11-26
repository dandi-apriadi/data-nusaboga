import db from "../config/Database.js";
import {
  searchProducts,
  getProductCategories,
  getPopularProducts,
  getLowStockProducts,
  getOrderStatistics,
  searchCustomers,
  getTopSellingProducts
} from "../utils/databaseHelpers.js";

async function testDatabaseHelpers() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    console.log("\n🔍 Testing searchProducts with 'cakalang':");
    const products = await searchProducts('cakalang');
    console.log(`Found ${products.length} products:`);
    products.forEach(p => console.log(`  - ${p.name} (${p.price})`));

    console.log("\n📂 Testing getProductCategories:");
    const categories = await getProductCategories();
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(c => console.log(`  - ${c.name}`));

    console.log("\n⭐ Testing getPopularProducts:");
    const popularProducts = await getPopularProducts(3);
    console.log(`Found ${popularProducts.length} popular products:`);
    popularProducts.forEach(p => console.log(`  - ${p.name} (rating: ${p.rating_avg})`));

    console.log("\n📦 Testing getLowStockProducts:");
    const lowStockProducts = await getLowStockProducts(50);
    console.log(`Found ${lowStockProducts.length} low stock products:`);
    lowStockProducts.forEach(p => console.log(`  - ${p.name} (stock: ${p.stock})`));

    console.log("\n🏆 Testing getTopSellingProducts:");
    const topProducts = await getTopSellingProducts(3);
    console.log(`Found ${topProducts.length} top selling products:`);
    topProducts.forEach(p => console.log(`  - ${p.name} (reviews: ${p.reviews_count})`));

    console.log("\n📊 Testing getOrderStatistics:");
    const orderStats = await getOrderStatistics(30);
    console.log(`Found ${orderStats.length} order statistics:`);
    orderStats.forEach(s => console.log(`  - Status: ${s.status}, Count: ${s.count}, Total: ${s.total_amount}`));

    console.log("\n🎉 All database helper tests completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error testing database helpers:", error);
    process.exit(1);
  }
}

testDatabaseHelpers();