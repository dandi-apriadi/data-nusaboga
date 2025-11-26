import db from '../config/Database.js';

async function checkOrderItemsStructure() {
  try {
    console.log('🔍 Checking order_items table structure...\n');
    
    // Get table structure
    const [columns] = await db.query("DESCRIBE order_items");
    
    console.log('📋 Current columns in order_items:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null.padEnd(5)} ${col.Key.padEnd(5)} ${col.Default || 'NULL'}`);
    });
    console.log('─'.repeat(80));
    
    // Check for weight_grams specifically
    const hasWeightGrams = columns.some(col => col.Field === 'weight_grams');
    const hasImageSnapshot = columns.some(col => col.Field === 'image_snapshot');
    
    console.log('\n✅ Column Check Results:');
    console.log(`   weight_grams: ${hasWeightGrams ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   image_snapshot: ${hasImageSnapshot ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasWeightGrams) {
      console.log('\n⚠️  weight_grams column is MISSING!');
      console.log('   This is causing the "Unknown column" error.');
      console.log('\n📝 To fix, run one of these commands:');
      console.log('   1. npm run add-weight-column (if script exists)');
      console.log('   2. mysql -u root nusaboga < ADD_WEIGHT_COLUMN.sql');
      console.log('   3. Or run this SQL manually:');
      console.log('      ALTER TABLE order_items ADD COLUMN weight_grams INT NULL DEFAULT NULL AFTER image_snapshot;');
    }
    
    if (!hasImageSnapshot) {
      console.log('\n⚠️  image_snapshot column is also MISSING!');
      console.log('   Add it with:');
      console.log('      ALTER TABLE order_items ADD COLUMN image_snapshot VARCHAR(255) NULL AFTER name_snapshot;');
    }
    
    if (hasWeightGrams && hasImageSnapshot) {
      console.log('\n🎉 All optional columns are present! System should work perfectly.');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    await db.close();
    process.exit(0);
  }
}

checkOrderItemsStructure();
