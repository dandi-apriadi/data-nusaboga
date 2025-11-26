import dotenv from 'dotenv';
dotenv.config();
import db from '../config/Database.js';

/*
  One-off migration script to add owner_user_id and bonus_percent columns to referral_codes table.
  Safe to run multiple times (checks existence before altering).
*/

const TABLE = 'referral_codes';

const columnChecks = {
  owner_user_id: "SHOW COLUMNS FROM `referral_codes` LIKE 'owner_user_id'",
  bonus_percent: "SHOW COLUMNS FROM `referral_codes` LIKE 'bonus_percent'"
};

async function columnExists(col) {
  const [rows] = await db.query(columnChecks[col]);
  return rows.length > 0;
}

async function addColumnOwner() {
  const sql = "ALTER TABLE `referral_codes` ADD COLUMN `owner_user_id` VARCHAR(191) NULL AFTER `usage_count`";
  await db.query(sql);
  console.log('Added column owner_user_id');
}

async function addColumnBonus() {
  const sql = "ALTER TABLE `referral_codes` ADD COLUMN `bonus_percent` DECIMAL(5,2) NULL AFTER `owner_user_id`";
  await db.query(sql);
  console.log('Added column bonus_percent');
}

async function run() {
  try {
    console.log('Checking / migrating table:', TABLE);

    if (!(await columnExists('owner_user_id'))) {
      await addColumnOwner();
    } else {
      console.log('Column owner_user_id already exists');
    }

    if (!(await columnExists('bonus_percent'))) {
      await addColumnBonus();
    } else {
      console.log('Column bonus_percent already exists');
    }

    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
