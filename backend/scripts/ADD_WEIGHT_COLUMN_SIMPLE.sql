-- ========================================
-- ADD weight_grams COLUMN TO order_items
-- ========================================
-- Run this script to add weight_grams column to order_items table
-- This is OPTIONAL - system works without it (weight fetched from products table)
-- But having it improves performance and preserves weight at time of sale

-- Check if column exists first (safe to run multiple times)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'order_items'
    AND COLUMN_NAME = 'weight_grams'
);

-- Add column only if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `order_items` ADD COLUMN `weight_grams` INT NULL DEFAULT NULL AFTER `image_snapshot`;',
    'SELECT "Column weight_grams already exists" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill existing records with product weight (optional)
UPDATE order_items oi
INNER JOIN products p ON oi.product_id = p.product_id
SET oi.weight_grams = p.weight_grams
WHERE oi.weight_grams IS NULL AND p.weight_grams IS NOT NULL;

-- Show result
SELECT 
    'weight_grams column added/verified successfully!' AS status,
    COUNT(*) AS total_order_items,
    SUM(CASE WHEN weight_grams IS NOT NULL THEN 1 ELSE 0 END) AS items_with_weight,
    SUM(CASE WHEN weight_grams IS NULL THEN 1 ELSE 0 END) AS items_without_weight
FROM order_items;

-- ========================================
-- DONE!
-- ========================================
-- Next steps:
-- 1. Restart backend server
-- 2. New orders will automatically include weight_grams
-- 3. Orders page will show weight correctly
