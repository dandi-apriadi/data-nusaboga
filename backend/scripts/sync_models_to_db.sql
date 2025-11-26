-- Sync DB schema to match Sequelize models (idempotent)
-- Safe to run multiple times; uses INFORMATION_SCHEMA guards
-- Target DB: current DATABASE() in session

-- ===== ORDERS: add referral_code and shipping detail columns =====
-- referral_code
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'referral_code'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `referral_code` VARCHAR(20) NULL AFTER `tracking_number`',
  'SELECT "orders.referral_code already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- courier_name
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'courier_name'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `courier_name` VARCHAR(100) NULL AFTER `shipping_cost`',
  'SELECT "orders.courier_name already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- shipping_service
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_service'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `shipping_service` VARCHAR(50) NULL AFTER `courier_name`',
  'SELECT "orders.shipping_service already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- shipping_service_name
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_service_name'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `shipping_service_name` VARCHAR(200) NULL AFTER `shipping_service`',
  'SELECT "orders.shipping_service_name already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- shipping_etd
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'shipping_etd'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `shipping_etd` VARCHAR(20) NULL AFTER `shipping_service_name`',
  'SELECT "orders.shipping_etd already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- helpful indexes for shipping fields
SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_courier_name'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `idx_orders_courier_name` ON `orders` (`courier_name`)',
  'SELECT "idx_orders_courier_name already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_shipping_service'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `idx_orders_shipping_service` ON `orders` (`shipping_service`)',
  'SELECT "idx_orders_shipping_service already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===== ORDER_ITEMS: add image_snapshot and weight_grams =====
-- image_snapshot
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'image_snapshot'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `order_items` ADD COLUMN `image_snapshot` VARCHAR(255) NULL AFTER `name_snapshot`',
  'SELECT "order_items.image_snapshot already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weight_grams
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'weight_grams'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `order_items` ADD COLUMN `weight_grams` INT NULL DEFAULT NULL AFTER `image_snapshot`',
  'SELECT "order_items.weight_grams already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- backfill from products if null
UPDATE order_items oi
JOIN products p ON p.product_id = oi.product_id
SET oi.weight_grams = p.weight_grams
WHERE oi.weight_grams IS NULL AND p.weight_grams IS NOT NULL;

-- ===== REFERRAL_CODES: add payout/payment columns and extend enum =====
-- Ensure payment_status column exists (older DBs might miss it)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payment_status'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `payment_status` ENUM("unpaid","pending","paid") DEFAULT "unpaid" AFTER `payout_account_holder`',
  'SELECT "referral_codes.payment_status exists or will be updated next" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Align enum values to include pending
SET @has_col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payment_status'
);
SET @sql := IF(@has_col = 1,
  'ALTER TABLE `referral_codes` MODIFY COLUMN `payment_status` ENUM("unpaid","pending","paid") DEFAULT "unpaid"',
  'SELECT "referral_codes.payment_status not present; skipped modify" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- payout_bank_name
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payout_bank_name'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `payout_bank_name` VARCHAR(80) NULL AFTER `min_order_amount`',
  'SELECT "referral_codes.payout_bank_name already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- payout_account_number
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payout_account_number'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `payout_account_number` VARCHAR(50) NULL AFTER `payout_bank_name`',
  'SELECT "referral_codes.payout_account_number already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- payout_account_holder
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payout_account_holder'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `payout_account_holder` VARCHAR(120) NULL AFTER `payout_account_number`',
  'SELECT "referral_codes.payout_account_holder already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- paid_to_account
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'paid_to_account'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `paid_to_account` VARCHAR(100) NULL AFTER `payment_proof`',
  'SELECT "referral_codes.paid_to_account already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- paid_date
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'paid_date'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `paid_date` DATETIME NULL AFTER `paid_to_account`',
  'SELECT "referral_codes.paid_date already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- paid_amount
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'paid_amount'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `paid_amount` DECIMAL(12,2) NULL AFTER `paid_date`',
  'SELECT "referral_codes.paid_amount already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- payment_notes
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND COLUMN_NAME = 'payment_notes'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `referral_codes` ADD COLUMN `payment_notes` TEXT NULL AFTER `paid_amount`',
  'SELECT "referral_codes.payment_notes already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- optional indexes
SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'referral_codes' AND INDEX_NAME = 'idx_referral_codes_is_active'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `idx_referral_codes_is_active` ON `referral_codes` (`is_active`)',
  'SELECT "idx_referral_codes_is_active already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===== ADDRESSES: helpful search indexes =====
SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'addresses' AND INDEX_NAME = 'idx_addresses_city'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `idx_addresses_city` ON `addresses` (`city`)',
  'SELECT "idx_addresses_city already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'addresses' AND INDEX_NAME = 'idx_addresses_province'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `idx_addresses_province` ON `addresses` (`province`)',
  'SELECT "idx_addresses_province already exists" as info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===== END =====
SELECT 'Schema sync completed (idempotent checks applied)' AS status;