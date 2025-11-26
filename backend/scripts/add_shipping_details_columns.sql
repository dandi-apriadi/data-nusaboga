-- Migration Script: Add Shipping Details Columns to Orders Table
-- Date: 2024-11-03
-- Purpose: Add courier and shipping service information to orders

-- Check if columns exist before adding
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `courier_name` VARCHAR(100) NULL COMMENT 'Nama ekspedisi (JNE, TIKI, POS, dll)' AFTER `shipping_cost`,
ADD COLUMN IF NOT EXISTS `shipping_service` VARCHAR(50) NULL COMMENT 'Kode service (REG, YES, ONS, dll)' AFTER `courier_name`,
ADD COLUMN IF NOT EXISTS `shipping_service_name` VARCHAR(200) NULL COMMENT 'Nama lengkap layanan (Reguler, Yakin Esok Sampai, dll)' AFTER `shipping_service`,
ADD COLUMN IF NOT EXISTS `shipping_etd` VARCHAR(20) NULL COMMENT 'Estimasi pengiriman dalam hari (2-3, 1-2, dll)' AFTER `shipping_service_name`;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_courier_name` ON `orders` (`courier_name`);
CREATE INDEX IF NOT EXISTS `idx_shipping_service` ON `orders` (`shipping_service`);

-- Verify columns added
DESCRIBE `orders`;

-- Sample query to check new structure
SELECT 
  order_id, 
  order_number, 
  courier_name, 
  shipping_service, 
  shipping_service_name, 
  shipping_etd,
  shipping_cost,
  created_at
FROM `orders`
WHERE courier_name IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
