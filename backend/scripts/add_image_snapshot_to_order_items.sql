-- Migration: add image_snapshot column to order_items if not exists
ALTER TABLE `order_items`
  ADD COLUMN `image_snapshot` VARCHAR(255) NULL AFTER `name_snapshot`;

-- Idempotent guard (MySQL doesn't support IF NOT EXISTS for add column universally pre-8.0 in all modes);
-- If running second time it will error; acceptable for manual one-off migration.