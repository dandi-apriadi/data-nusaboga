import db from '../config/Database.js';

async function addPaymentReferralColumns() {
  try {
    console.log('Adding payment columns to referral_codes table...');
    
    // Check if columns already exist
    const [columns] = await db.query("SHOW COLUMNS FROM referral_codes");
    const existingColumns = columns.map(col => col.Field);
    
    console.log('Existing columns:', existingColumns);
    
    const columnsToAdd = [
      {
        name: 'payment_status',
        sql: "ALTER TABLE referral_codes ADD COLUMN payment_status ENUM('unpaid', 'pending', 'paid') DEFAULT 'unpaid' AFTER usage_limit"
      },
      {
        name: 'payment_proof',
        sql: "ALTER TABLE referral_codes ADD COLUMN payment_proof VARCHAR(500) NULL AFTER payment_status"
      },
      {
        name: 'account_number',
        sql: "ALTER TABLE referral_codes ADD COLUMN account_number VARCHAR(50) NULL AFTER payment_proof"
      },
      {
        name: 'paid_date',
        sql: "ALTER TABLE referral_codes ADD COLUMN paid_date DATETIME NULL AFTER account_number"
      },
      {
        name: 'payment_notes',
        sql: "ALTER TABLE referral_codes ADD COLUMN payment_notes TEXT NULL AFTER paid_date"
      }
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await db.query(column.sql);
        console.log(`✓ Column ${column.name} added successfully`);
      } else {
        console.log(`✓ Column ${column.name} already exists, skipping`);
      }
    }

    console.log('\nAll payment columns have been processed successfully!');
    console.log('You can now use the payment feature for referral codes.');
    
    // Show final table structure
    const [finalColumns] = await db.query("SHOW COLUMNS FROM referral_codes");
    console.log('\nFinal table structure:');
    finalColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

  } catch (error) {
    console.error('Error adding payment columns:', error);
    process.exit(1);
  } finally {
    await db.close();
    process.exit(0);
  }
}

addPaymentReferralColumns();