-- Migration script to add payment-related columns to referral_codes table
-- Run this script to update the database structure for referral payment functionality

-- Add payment-related columns if they don't exist
ALTER TABLE `referral_codes` 
ADD COLUMN IF NOT EXISTS `payment_status` ENUM('unpaid', 'paid') DEFAULT 'unpaid' COMMENT 'Status pembayaran referral',
ADD COLUMN IF NOT EXISTS `payment_proof` VARCHAR(255) NULL COMMENT 'Path file bukti pembayaran',
ADD COLUMN IF NOT EXISTS `account_number` VARCHAR(50) NULL COMMENT 'Nomor rekening yang dibayar',
ADD COLUMN IF NOT EXISTS `paid_date` DATETIME NULL COMMENT 'Tanggal pembayaran dilakukan';

-- Add index for payment status for better query performance
CREATE INDEX IF NOT EXISTS `idx_payment_status` ON `referral_codes` (`payment_status`);

-- Display current table structure
DESCRIBE `referral_codes`;

-- Display updated rows count
SELECT 
    COUNT(*) as total_referrals,
    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_referrals,
    SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_referrals
FROM `referral_codes`;