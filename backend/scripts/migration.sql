-- Quick Migration: Add Shipping Columns
USE lyvianusaboga;

-- Add columns
ALTER TABLE orders ADD COLUMN courier_name VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN shipping_service VARCHAR(50) NULL;
ALTER TABLE orders ADD COLUMN shipping_service_name VARCHAR(200) NULL;
ALTER TABLE orders ADD COLUMN shipping_etd VARCHAR(20) NULL;

-- Show result
DESCRIBE orders;
