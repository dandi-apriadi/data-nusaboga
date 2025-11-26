import db from '../config/Database.js';

async function addWeightGramsColumn() {
  try {
    console.log('🔧 Adding weight_grams column to order_items table...\n');
    
    // Check if column already exists
    const [existing] = await db.query("SHOW COLUMNS FROM order_items LIKE 'weight_grams'");
    
    if (existing.length > 0) {
      console.log('✅ Column weight_grams already exists!');
      console.log('   No action needed.');
      await db.close();
      process.exit(0);
      return;
    }
    
    // Add the column
    console.log('📝 Executing: ALTER TABLE order_items ADD COLUMN weight_grams INT NULL DEFAULT NULL AFTER image_snapshot;');
    await db.query('ALTER TABLE order_items ADD COLUMN weight_grams INT NULL DEFAULT NULL AFTER image_snapshot');
    console.log('✅ Column added successfully!\n');
    
    // Backfill from products table
    console.log('🔄 Backfilling weight data from products table...');
    const [result] = await db.query(`
      UPDATE order_items oi
      INNER JOIN products p ON oi.product_id = p.product_id
      SET oi.weight_grams = p.weight_grams
      WHERE oi.weight_grams IS NULL AND p.weight_grams IS NOT NULL
    `);
    console.log(`✅ Updated ${result.affectedRows || 0} existing order items with weight data\n`);
    
    // Verify
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN weight_grams IS NOT NULL THEN 1 ELSE 0 END) as items_with_weight,
        SUM(CASE WHEN weight_grams IS NULL THEN 1 ELSE 0 END) as items_without_weight
      FROM order_items
    `);
    
    console.log('📊 Final Statistics:');
    console.log('─'.repeat(50));
    console.log(`   Total order items: ${stats[0].total_items}`);
    console.log(`   With weight data: ${stats[0].items_with_weight}`);
    console.log(`   Without weight: ${stats[0].items_without_weight}`);
    console.log('─'.repeat(50));
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Try checkout again - it should work now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nIf error persists, try running this SQL manually:');
    console.error('ALTER TABLE order_items ADD COLUMN weight_grams INT NULL DEFAULT NULL AFTER image_snapshot;');
  } finally {
    await db.close();
    process.exit(0);
  }
}

addWeightGramsColumn();
