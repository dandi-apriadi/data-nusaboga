-- Nusaboga Demo Seed Data
-- Caution: This inserts sample data into many tables. Review before running on production.
-- Recommended usage: development/staging with DB_SYNC_MODE=alter or after schema is in place.

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Payment & Shipping Methods
INSERT INTO payment_methods (payment_method_id, code, name, description, fee_type, fee_amount, active, created_at, updated_at) VALUES
('PM_BANK', 'bank_transfer', 'Transfer Bank', 'Pembayaran via transfer bank', 'none', 0.00, 1, NOW(), NOW()),
('PM_COD', 'cod', 'COD (Bayar di Tempat)', 'Bayar di tempat saat barang diterima', 'none', 0.00, 1, NOW(), NOW()),
('PM_QRIS', 'qris', 'QRIS', 'Pembayaran QRIS', 'none', 0.00, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), updated_at=VALUES(updated_at);

INSERT INTO shipping_methods (shipping_method_id, carrier, service_name, description, active, created_at, updated_at) VALUES
('SM_JNE_REG', 'JNE', 'REG', 'Layanan Reguler JNE', 1, NOW(), NOW()),
('SM_JNT_EZ', 'J&T', 'EZ', 'Layanan Ekonomis J&T', 1, NOW(), NOW()),
('SM_POS_KILAT', 'POS Indonesia', 'Kilat', 'POS Kilat Khusus', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name), description=VALUES(description), updated_at=VALUES(updated_at);

-- 2) Users (note: passwords here are placeholders; login may not work)
INSERT INTO users (user_id, fullname, role, gender, email, password, phone, department, avatar, is_active, created_at, updated_at)
VALUES
('USR_ADMIN', 'Admin Nusaboga', 'admin', 'male', 'admin@nusaboga.local', '$argon2id$v=19$m=65536,t=3,p=4$DEMO$PLACEHOLDER', '081200000001', 'Operations', NULL, 1, NOW(), NOW()),
('USR_CASHIER', 'Kasir Toko', 'admin', 'female', 'kasir@nusaboga.local', '$argon2id$v=19$m=65536,t=3,p=4$DEMO$PLACEHOLDER', '081200000002', 'Sales', NULL, 1, NOW(), NOW()),
('USR_BUDI', 'Budi Santoso', 'user', 'male', 'budi@demo.local', '$argon2id$v=19$m=65536,t=3,p=4$DEMO$PLACEHOLDER', '081234567890', NULL, NULL, 1, NOW(), NOW()),
('USR_SITI', 'Siti Nurhaliza', 'user', 'female', 'siti@demo.local', '$argon2id$v=19$m=65536,t=3,p=4$DEMO$PLACEHOLDER', '081234567891', NULL, NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE fullname=VALUES(fullname), updated_at=VALUES(updated_at);

-- 3) Addresses
INSERT INTO addresses (address_id, user_id, label, receiver_name, phone, address_detail, district, city, province, postal_code, is_default, created_at, updated_at) VALUES
('ADDR_BUDI_HOME', 'USR_BUDI', 'Rumah', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 123', 'Gambir', 'Jakarta Pusat', 'DKI Jakarta', '10110', 1, NOW(), NOW()),
('ADDR_SITI_HOME', 'USR_SITI', 'Rumah', 'Siti Nurhaliza', '081234567891', 'Jl. Sudirman No. 456', 'Coblong', 'Bandung', 'Jawa Barat', '40111', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE address_detail=VALUES(address_detail), updated_at=VALUES(updated_at);

-- 4) Product Categories
INSERT INTO categories (category_id, name, slug, description, created_at, updated_at) VALUES
('CAT_ABON', 'Abon Cakalang', 'abon-cakalang', 'Aneka abon cakalang', NOW(), NOW()),
('CAT_DENDENG', 'Dendeng Cakalang', 'dendeng-cakalang', 'Aneka dendeng cakalang', NOW(), NOW()),
('CAT_FUFU', 'Cakalang Fufu', 'cakalang-fufu', 'Cakalang asap/fufu', NOW(), NOW()),
('CAT_SAMBAL', 'Sambal Cakalang', 'sambal-cakalang', 'Aneka sambal cakalang', NOW(), NOW()),
('CAT_KERIPIK', 'Keripik Cakalang', 'keripik-cakalang', 'Keripik dan camilan', NOW(), NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description), updated_at=VALUES(updated_at);

-- 5) Products (20 items) — all use same image URL as requested
-- Common image URL
SET @IMG := '/uploads/products/1758416746828_WhatsApp_Image_2025-09-19_at_21.09.48_(1).jpeg';

INSERT INTO products (product_id, category_id, name, slug, sku, barcode, description, price, original_price, cost_price, stock, weight_grams, image_url, active, rating_avg, reviews_count, created_at, updated_at) VALUES
('PRD_001','CAT_ABON','Abon Cakalang Premium 100g','abon-cakalang-premium-100g','ABN-PRE-100','899000000001','Abon cakalang premium, tekstur halus dan gurih',85000,95000,55000,120,100,@IMG,1,4.8,42,NOW(),NOW()),
('PRD_002','CAT_ABON','Abon Cakalang Original 100g','abon-cakalang-original-100g','ABN-ORI-100','899000000002','Abon original rasa khas Manado',80000,90000,52000,100,95,@IMG,1,4.6,37,NOW(),NOW()),
('PRD_003','CAT_ABON','Abon Cakalang Pedas 100g','abon-cakalang-pedas-100g','ABN-PED-100','899000000003','Abon pedas nikmat untuk pecinta pedas',82000,90000,53000,90,100,@IMG,1,4.5,28,NOW(),NOW()),
('PRD_004','CAT_DENDENG','Dendeng Cakalang Manis 150g','dendeng-cakalang-manis-150g','DEN-MAN-150','899000000004','Dendeng manis legit dengan bumbu spesial',90000,100000,60000,80,150,@IMG,1,4.7,19,NOW(),NOW()),
('PRD_005','CAT_DENDENG','Dendeng Cakalang Pedas 150g','dendeng-cakalang-pedas-150g','DEN-PED-150','899000000005','Dendeng pedas gurih menggugah selera',95000,105000,62000,85,150,@IMG,1,4.4,21,NOW(),NOW()),
('PRD_006','CAT_FUFU','Cakalang Fufu Asli 500g','cakalang-fufu-asli-500g','FUF-ORI-500','899000000006','Ikan cakalang asap khas, siap olah',120000,135000,80000,60,500,@IMG,1,4.6,33,NOW(),NOW()),
('PRD_007','CAT_FUFU','Cakalang Fufu Bumbu 500g','cakalang-fufu-bumbu-500g','FUF-BUM-500','899000000007','Fufu berbumbu siap saji',130000,145000,85000,55,500,@IMG,1,4.5,18,NOW(),NOW()),
('PRD_008','CAT_SAMBAL','Sambal Rica Cakalang 200g','sambal-rica-cakalang-200g','SBL-RIC-200','899000000008','Sambal rica pedas wangi khas',30000,35000,18000,200,200,@IMG,1,4.3,44,NOW(),NOW()),
('PRD_009','CAT_SAMBAL','Sambal Ijo Cakalang 200g','sambal-ijo-cakalang-200g','SBL-IJO-200','899000000009','Sambal ijo segar dengan cakalang',32000,36000,19000,180,200,@IMG,1,4.2,16,NOW(),NOW()),
('PRD_010','CAT_SAMBAL','Sambal Matah Cakalang 200g','sambal-matah-cakalang-200g','SBL-MAT-200','899000000010','Sambal matah aromatik',32000,36000,19000,175,200,@IMG,1,4.1,11,NOW(),NOW()),
('PRD_011','CAT_KERIPIK','Keripik Cakalang Original 100g','keripik-cakalang-original-100g','KRP-ORI-100','899000000011','Keripik cakalang rasa original',30000,34000,17000,220,100,@IMG,1,4.2,13,NOW(),NOW()),
('PRD_012','CAT_KERIPIK','Keripik Cakalang Balado 100g','keripik-cakalang-balado-100g','KRP-BAL-100','899000000012','Keripik balado pedas manis',32000,36000,18000,210,100,@IMG,1,4.4,15,NOW(),NOW()),
('PRD_013','CAT_KERIPIK','Keripik Cakalang Keju 100g','keripik-cakalang-keju-100g','KRP-KEJ-100','899000000013','Keripik rasa keju gurih',32000,36000,18000,200,100,@IMG,1,4.2,9,NOW(),NOW()),
('PRD_014','CAT_ABON','Abon Cakalang Premium 200g','abon-cakalang-premium-200g','ABN-PRE-200','899000000014','Kemasan lebih besar, kualitas sama',160000,175000,105000,70,200,@IMG,1,4.8,7,NOW(),NOW()),
('PRD_015','CAT_DENDENG','Dendeng Cakalang Manis 250g','dendeng-cakalang-manis-250g','DEN-MAN-250','899000000015','Manis legit kemasan 250g',150000,165000,95000,65,250,@IMG,1,4.6,6,NOW(),NOW()),
('PRD_016','CAT_FUFU','Cakalang Fufu Asli 1kg','cakalang-fufu-asli-1kg','FUF-ORI-1000','899000000016','Porsi keluarga 1kg',220000,240000,155000,40,1000,@IMG,1,4.7,4,NOW(),NOW()),
('PRD_017','CAT_SAMBAL','Sambal Rica Super Pedas 200g','sambal-rica-super-pedas-200g','SBL-RIC-SP-200','899000000017','Level pedas tinggi',35000,39000,21000,150,200,@IMG,1,4.0,5,NOW(),NOW()),
('PRD_018','CAT_KERIPIK','Keripik Cakalang Pedas 100g','keripik-cakalang-pedas-100g','KRP-PED-100','899000000018','Pedas renyah nagih',32000,36000,18000,195,100,@IMG,1,4.3,8,NOW(),NOW()),
('PRD_019','CAT_ABON','Abon Cakalang Smoke 100g','abon-cakalang-smoke-100g','ABN-SMK-100','899000000019','Aroma asap khas',87000,95000,56000,85,100,@IMG,1,4.5,3,NOW(),NOW()),
('PRD_020','CAT_DENDENG','Dendeng Cakalang Lada Hitam 150g','dendeng-cakalang-lada-hitam-150g','DEN-LDH-150','899000000020','Dendeng lada hitam',98000,110000,64000,75,150,@IMG,1,4.4,2,NOW(),NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description), price=VALUES(price), stock=VALUES(stock), updated_at=VALUES(updated_at);

-- 6) Product Images (primary)
INSERT INTO product_images (image_id, product_id, url, is_primary, created_at) VALUES
('IMG_001','PRD_001',@IMG,1,NOW()),('IMG_002','PRD_002',@IMG,1,NOW()),('IMG_003','PRD_003',@IMG,1,NOW()),('IMG_004','PRD_004',@IMG,1,NOW()),
('IMG_005','PRD_005',@IMG,1,NOW()),('IMG_006','PRD_006',@IMG,1,NOW()),('IMG_007','PRD_007',@IMG,1,NOW()),('IMG_008','PRD_008',@IMG,1,NOW()),
('IMG_009','PRD_009',@IMG,1,NOW()),('IMG_010','PRD_010',@IMG,1,NOW()),('IMG_011','PRD_011',@IMG,1,NOW()),('IMG_012','PRD_012',@IMG,1,NOW()),
('IMG_013','PRD_013',@IMG,1,NOW()),('IMG_014','PRD_014',@IMG,1,NOW()),('IMG_015','PRD_015',@IMG,1,NOW()),('IMG_016','PRD_016',@IMG,1,NOW()),
('IMG_017','PRD_017',@IMG,1,NOW()),('IMG_018','PRD_018',@IMG,1,NOW()),('IMG_019','PRD_019',@IMG,1,NOW()),('IMG_020','PRD_020',@IMG,1,NOW())
ON DUPLICATE KEY UPDATE url=VALUES(url);

-- 7) Inventory Movements (seed stock history)
INSERT INTO inventory_movements (movement_id, product_id, type, quantity, unit_cost, note, reference_type, reference_id, created_at) VALUES
('MOV_001','PRD_001','purchase',120,55000,'Initial stock','seed',NULL,NOW()),
('MOV_002','PRD_002','purchase',100,52000,'Initial stock','seed',NULL,NOW()),
('MOV_003','PRD_003','purchase',90,53000,'Initial stock','seed',NULL,NOW()),
('MOV_004','PRD_004','purchase',80,60000,'Initial stock','seed',NULL,NOW()),
('MOV_005','PRD_005','purchase',85,62000,'Initial stock','seed',NULL,NOW()),
('MOV_006','PRD_006','purchase',60,80000,'Initial stock','seed',NULL,NOW()),
('MOV_007','PRD_007','purchase',55,85000,'Initial stock','seed',NULL,NOW()),
('MOV_008','PRD_008','purchase',200,18000,'Initial stock','seed',NULL,NOW()),
('MOV_009','PRD_009','purchase',180,19000,'Initial stock','seed',NULL,NOW()),
('MOV_010','PRD_010','purchase',175,19000,'Initial stock','seed',NULL,NOW()),
('MOV_011','PRD_011','purchase',220,17000,'Initial stock','seed',NULL,NOW()),
('MOV_012','PRD_012','purchase',210,18000,'Initial stock','seed',NULL,NOW()),
('MOV_013','PRD_013','purchase',200,18000,'Initial stock','seed',NULL,NOW()),
('MOV_014','PRD_014','purchase',70,105000,'Initial stock','seed',NULL,NOW()),
('MOV_015','PRD_015','purchase',65,95000,'Initial stock','seed',NULL,NOW()),
('MOV_016','PRD_016','purchase',40,155000,'Initial stock','seed',NULL,NOW()),
('MOV_017','PRD_017','purchase',150,21000,'Initial stock','seed',NULL,NOW()),
('MOV_018','PRD_018','purchase',195,18000,'Initial stock','seed',NULL,NOW()),
('MOV_019','PRD_019','purchase',85,56000,'Initial stock','seed',NULL,NOW()),
('MOV_020','PRD_020','purchase',75,64000,'Initial stock','seed',NULL,NOW())
ON DUPLICATE KEY UPDATE note=VALUES(note);

-- 8) Referral Codes
INSERT INTO referral_codes (referral_id, code, type, value, description, is_active, valid_from, valid_until, usage_limit, usage_count, min_order_amount, created_at, updated_at) VALUES
('REF_10OFF','NUSA10','percent',10.00,'Diskon 10% semua produk',1,NOW(),DATE_ADD(NOW(), INTERVAL 180 DAY),NULL,0,100000.00,NOW(),NOW()),
('REF_30K','HEMAT30K','fixed',30000.00,'Potongan Rp30.000 minimal belanja 200rb',1,NOW(),DATE_ADD(NOW(), INTERVAL 180 DAY),NULL,0,200000.00,NOW(),NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description), updated_at=VALUES(updated_at);

-- 9) Blog basics
INSERT INTO blog_categories (category_id, name, slug, description, color, active, created_at, updated_at) VALUES
('BLC_FOOD','Kuliner','kuliner','Tips & info kuliner','#6366f1',1,NOW(),NOW()),
('BLC_TIPS','Tips Dapur','tips-dapur','Tips memasak dan penyimpanan','#10b981',1,NOW(),NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description), updated_at=VALUES(updated_at);

INSERT INTO blog_tags (tag_id, name, slug, color, created_at, updated_at) VALUES
('BLT_RESEP','Resep','resep','#64748b',NOW(),NOW()),
('BLT_TIPS','Tips','tips','#64748b',NOW(),NOW()),
('BLT_INFO','Info','info','#64748b',NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=VALUES(updated_at);

INSERT INTO blog_posts (post_id, category_id, author_id, title, slug, excerpt, content, featured_image, meta_title, meta_description, status, is_featured, views_count, likes_count, reading_time, published_at, created_at, updated_at) VALUES
('BLP_001','BLC_FOOD','USR_ADMIN','5 Olahan Cakalang Favorit Keluarga','5-olahan-cakalang-favorit',
 'Kumpulan resep sederhana olahan cakalang untuk keluarga.',
 'Konten panjang resep dan tips...','/uploads/blog/sample.jpg','Olahan Cakalang Favorit','Resep cakalang', 'PUBLISHED', 1, 120, 15, 6, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title), updated_at=VALUES(updated_at);

INSERT INTO blog_post_tags (post_id, tag_id, created_at) VALUES
('BLP_001','BLT_RESEP',NOW()),('BLP_001','BLT_TIPS',NOW())
ON DUPLICATE KEY UPDATE post_id=VALUES(post_id);

INSERT INTO blog_comments (comment_id, post_id, user_id, parent_id, author_name, author_email, content, status, ip_address, created_at, updated_at) VALUES
('BLCMT_001','BLP_001',NULL,NULL,'Pengunjung','visitor@example.com','Terima kasih resepnya!','APPROVED','127.0.0.1',NOW(),NOW())
ON DUPLICATE KEY UPDATE content=VALUES(content), status=VALUES(status), updated_at=VALUES(updated_at);

-- 10) Wishlist
INSERT INTO wishlists (wishlist_id, user_id, created_at) VALUES ('WL_BUDI','USR_BUDI',NOW())
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

INSERT INTO wishlist_items (wishlist_item_id, wishlist_id, product_id, added_at) VALUES
('WLIT_001','WL_BUDI','PRD_001',NOW()),('WLIT_002','WL_BUDI','PRD_008',NOW()),('WLIT_003','WL_BUDI','PRD_012',NOW())
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id);

-- 11) Loyalty Program
INSERT INTO loyalty_programs (program_id, name, points_per_rupiah, min_transaction, is_active, created_at, updated_at) VALUES
('LOY_PROG','Nusaboga Loyalty',0.01,0.00,1,NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=VALUES(updated_at);

INSERT INTO membership_tiers (tier_id, program_id, name, min_points, discount_percentage, benefits, sort_order, created_at, updated_at) VALUES
('TIER_BRONZE','LOY_PROG','Bronze',0,0.00,'Member dasar',1,NOW(),NOW()),
('TIER_SILVER','LOY_PROG','Silver',1000,2.50,'Diskon member silver',2,NOW(),NOW()),
('TIER_GOLD','LOY_PROG','Gold',5000,5.00,'Diskon member gold',3,NOW(),NOW())
ON DUPLICATE KEY UPDATE discount_percentage=VALUES(discount_percentage), updated_at=VALUES(updated_at);

INSERT INTO membership_promos (promo_id, program_id, name, discount_type, discount_value, target_tier_id, valid_from, valid_until, is_active, created_at, updated_at) VALUES
('LOY_PROMO1','LOY_PROG','Welcome Bonus','fixed',10000.00,'TIER_BRONZE',NOW(),DATE_ADD(NOW(), INTERVAL 90 DAY),1,NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), discount_value=VALUES(discount_value), updated_at=VALUES(updated_at);

-- 12) Notification Templates
INSERT INTO notification_templates (template_id, name, channel, title, content, variables_json, is_active, created_at, updated_at) VALUES
('NTM_ORDER_CONF','Order Confirmation','email','Pesanan Diterima','Halo {{name}}, pesanan {{order_number}} kami terima.','{"vars":["name","order_number"]}',1,NOW(),NOW()),
('NTM_PROMO','Promo Mingguan','push','Diskon Spesial','Nikmati promo spesial minggu ini!','{"vars":[]}',1,NOW(),NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), updated_at=VALUES(updated_at);

-- 13) Chatbot minimal
INSERT INTO chatbot_intents (intent_id, name, description, is_active, created_at, updated_at) VALUES
('INTENT_CEK_PESANAN','cek_pesanan','Pengguna menanyakan status pesanan',1,NOW(),NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description), updated_at=VALUES(updated_at);

INSERT INTO chatbot_intent_training_phrases (phrase_id, intent_id, phrase, locale, created_at) VALUES
('PHR_001','INTENT_CEK_PESANAN','cek pesanan saya','id',NOW()),
('PHR_002','INTENT_CEK_PESANAN','status order saya','id',NOW())
ON DUPLICATE KEY UPDATE phrase=VALUES(phrase);

INSERT INTO chatbot_responses (response_id, intent_id, response, is_rich_content, payload_json, created_at, updated_at) VALUES
('RESP_001','INTENT_CEK_PESANAN','Silakan masukkan nomor pesanan Anda.',0,NULL,NOW(),NOW())
ON DUPLICATE KEY UPDATE response=VALUES(response), updated_at=VALUES(updated_at);

INSERT INTO chatbot_quick_replies (quick_reply_id, label, payload_text, locale, is_active, sort_order, created_at, updated_at) VALUES
('QR_001','Lacak Pesanan','lacak pesanan','id',1,1,NOW(),NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), updated_at=VALUES(updated_at);

-- 14) Orders + Items + Payments (+ status history, payment proof)
-- Helper: create some order numbers
SET @ONUM1 := 'NB-250901-ABCD';
SET @ONUM2 := 'NB-250902-EFGH';
SET @ONUM3 := 'NB-250903-IJKL';
SET @ONUM4 := 'NB-250904-MNOP';
SET @ONUM5 := 'NB-250905-QRST';

INSERT INTO orders (order_id, order_number, user_id, channel, status, priority, payment_method_id, payment_status, subtotal, discount_amount, tax_amount, shipping_cost, payment_fee, total, revenue_amount, profit_amount, customer_note, cancel_reason, tracking_number, invoice_number, shipping_insurance, estimated_delivery, address_id, ship_receiver_name, ship_phone, ship_address_detail, ship_district, ship_city, ship_province, ship_postal_code, cashier_id, received_amount, change_amount, created_at, updated_at, paid_at, shipped_at, completed_at, cancelled_at) VALUES
('ORD_0001', @ONUM1, 'USR_BUDI', 'online', 'completed', 'normal', 'PM_BANK', 'paid', 185000.00, 0.00, 0.00, 15000.00, 0.00, 200000.00, 185000.00, 65000.00, 'Tolong bubble wrap', NULL, 'JNE123456789', 'INV-0001', 0.00, DATE_ADD(NOW(), INTERVAL 3 DAY), 'ADDR_BUDI_HOME', 'Budi Santoso','081234567890','Jl. Merdeka No. 123','Gambir','Jakarta Pusat','DKI Jakarta','10110', NULL, NULL, NULL, NOW(), NOW(), NOW(), NOW(), NOW(), NULL),
('ORD_0002', @ONUM2, 'USR_SITI', 'online', 'processing', 'high', 'PM_COD', 'unpaid', 250000.00, 0.00, 0.00, 20000.00, 0.00, 270000.00, 250000.00, 90000.00, NULL, NULL, NULL, 'INV-0002', 0.00, DATE_ADD(NOW(), INTERVAL 2 DAY), 'ADDR_SITI_HOME', 'Siti Nurhaliza','081234567891','Jl. Sudirman No. 456','Coblong','Bandung','Jawa Barat','40111', NULL, NULL, NULL, NOW(), NOW(), NULL, NULL, NULL, NULL),
('ORD_0003', @ONUM3, 'USR_BUDI', 'online', 'shipped', 'normal', 'PM_BANK', 'paid', 320000.00, 0.00, 0.00, 25000.00, 0.00, 345000.00, 320000.00, 110000.00, 'Kirim pagi hari', NULL, 'JNE987654321', 'INV-0003', 0.00, DATE_ADD(NOW(), INTERVAL 2 DAY), 'ADDR_BUDI_HOME','Budi Santoso','081234567890','Jl. Merdeka No. 123','Gambir','Jakarta Pusat','DKI Jakarta','10110', NULL, NULL, NULL, NOW(), NOW(), NOW(), NOW(), NULL, NULL),
('ORD_0004', @ONUM4, NULL, 'pos', 'completed', 'normal', 'PM_QRIS', 'paid', 150000.00, 0.00, 0.00, 0.00, 0.00, 150000.00, 150000.00, 50000.00, NULL, NULL, NULL, 'INV-0004', 0.00, NULL, NULL, 'Walk-in Customer','081200000009','Toko Nusaboga','Wanea','Manado','Sulawesi Utara','95119','USR_CASHIER', 150000.00, 0.00, NOW(), NOW(), NOW(), NULL, NOW(), NULL),
('ORD_0005', @ONUM5, 'USR_SITI', 'online', 'cancelled', 'normal', 'PM_BANK', 'unpaid', 95000.00, 0.00, 0.00, 15000.00, 0.00, 110000.00, 0.00, 0.00, NULL, 'Pelanggan batal', NULL, 'INV-0005', 0.00, NULL, 'ADDR_SITI_HOME', 'Siti Nurhaliza','081234567891','Jl. Sudirman No. 456','Coblong','Bandung','Jawa Barat','40111', NULL, NULL, NULL, NOW(), NOW(), NULL, NULL, NULL, NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status), updated_at=VALUES(updated_at);

INSERT INTO order_items (order_item_id, order_id, product_id, name_snapshot, price_unit, quantity, discount_amount, subtotal, cost_at_sale, created_at) VALUES
('OIT_0001','ORD_0001','PRD_001','Abon Cakalang Premium 100g',85000.00,2,0.00,170000.00,55000.00,NOW()),
('OIT_0002','ORD_0001','PRD_008','Sambal Rica Cakalang 200g',15000.00,1,0.00,15000.00,18000.00,NOW()),
('OIT_0003','ORD_0002','PRD_005','Dendeng Cakalang Pedas 150g',95000.00,2,0.00,190000.00,62000.00,NOW()),
('OIT_0004','ORD_0002','PRD_011','Keripik Cakalang Original 100g',30000.00,2,0.00,60000.00,17000.00,NOW()),
('OIT_0005','ORD_0003','PRD_006','Cakalang Fufu Asli 500g',120000.00,2,0.00,240000.00,80000.00,NOW()),
('OIT_0006','ORD_0003','PRD_002','Abon Cakalang Original 100g',80000.00,1,0.00,80000.00,52000.00,NOW()),
('OIT_0007','ORD_0004','PRD_008','Sambal Rica Cakalang 200g',30000.00,3,0.00,90000.00,18000.00,NOW()),
('OIT_0008','ORD_0004','PRD_012','Keripik Cakalang Balado 100g',60000.00,1,0.00,60000.00,18000.00,NOW()),
('OIT_0009','ORD_0005','PRD_005','Dendeng Cakalang Pedas 150g',95000.00,1,0.00,95000.00,62000.00,NOW())
ON DUPLICATE KEY UPDATE subtotal=VALUES(subtotal);

INSERT INTO payments (payment_id, order_id, payment_method_id, amount, fee_amount, status, reference_code, metadata_json, paid_at, created_at) VALUES
('PAY_0001','ORD_0001','PM_BANK',200000.00,0.00,'paid','TRX-0001',NULL,NOW(),NOW()),
('PAY_0002','ORD_0003','PM_BANK',345000.00,0.00,'paid','TRX-0003',NULL,NOW(),NOW()),
('PAY_0003','ORD_0004','PM_QRIS',150000.00,0.00,'paid','TRX-0004',NULL,NOW(),NOW())
ON DUPLICATE KEY UPDATE amount=VALUES(amount), status=VALUES(status);

INSERT INTO order_status_history (status_history_id, order_id, from_status, to_status, note, changed_by, created_at) VALUES
('OHS_0001','ORD_0001','pending','processing','Order diproses','USR_ADMIN',NOW()),
('OHS_0002','ORD_0001','processing','shipped','Order dikirim','USR_ADMIN',NOW()),
('OHS_0003','ORD_0001','shipped','completed','Pesanan selesai','USR_ADMIN',NOW())
ON DUPLICATE KEY UPDATE to_status=VALUES(to_status);

INSERT INTO order_payment_proofs (proof_id, order_id, file_url, mime_type, file_size, status, reviewed_by, reviewed_at, uploaded_at) VALUES
('PPF_0001','ORD_0001','/uploads/payment-proofs/demo1.jpg','image/jpeg',234567,'approved','USR_ADMIN',NOW(),NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status), reviewed_by=VALUES(reviewed_by), reviewed_at=VALUES(reviewed_at);

-- 15) Reviews
INSERT INTO reviews (review_id, product_id, user_id, order_id, rating, comment, status, moderated_by, moderated_at, created_at) VALUES
('REV_0001','PRD_001','USR_BUDI','ORD_0001',5,'Enak banget abon premium!', 'approved','USR_ADMIN',NOW(),NOW()),
('REV_0002','PRD_008','USR_BUDI','ORD_0001',4,'Sambalnya pedas pas.', 'approved','USR_ADMIN',NOW(),NOW()),
('REV_0003','PRD_006','USR_BUDI','ORD_0003',5,'Fufu asli mantap.', 'approved','USR_ADMIN',NOW(),NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status), moderated_by=VALUES(moderated_by), moderated_at=VALUES(moderated_at);

-- 16) Notifications & Loyalty Points
INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, read_at, created_at) VALUES
('NOTIF_0001','USR_BUDI','order','Order Diterima','Pesanan Anda telah kami terima.',1,NOW(),NOW()),
('NOTIF_0002','USR_BUDI','order','Order Dikirim','Pesanan Anda dalam pengiriman.',0,NULL,NOW()),
('NOTIF_0003','USR_SITI','promo','Promo Minggu Ini','Cek diskon spesial!',0,NULL,NOW())
ON DUPLICATE KEY UPDATE message=VALUES(message), is_read=VALUES(is_read), read_at=VALUES(read_at);

INSERT INTO loyalty_points (point_id, user_id, points, source, reference_id, note, created_at) VALUES
('LP_0001','USR_BUDI',2000,'order','ORD_0001','Point dari transaksi',NOW()),
('LP_0002','USR_BUDI',3450,'order','ORD_0003','Point dari transaksi',NOW())
ON DUPLICATE KEY UPDATE points=VALUES(points);

SET FOREIGN_KEY_CHECKS = 1;

-- End of seed
