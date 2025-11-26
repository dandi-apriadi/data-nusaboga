import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const Order = db.define(
  "orders",
  {
    order_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    order_number: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    user_id: { type: DataTypes.STRING },
    channel: { type: DataTypes.ENUM("online", "pos"), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "completed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
    priority: { type: DataTypes.ENUM("normal", "high"), defaultValue: "normal" },
    payment_method_id: { type: DataTypes.STRING },
    payment_status: { type: DataTypes.ENUM("unpaid", "paid", "refunded", "partial"), defaultValue: "unpaid" },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    // tax_amount temporarily disabled to match current DB schema (uncomment when column exists)
    // tax_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    shipping_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    courier_name: { type: DataTypes.STRING(100) }, // NEW: Nama ekspedisi (JNE, TIKI, dll)
    shipping_service: { type: DataTypes.STRING(50) }, // NEW: Kode service (REG, YES, dll)
    shipping_service_name: { type: DataTypes.STRING(200) }, // NEW: Nama lengkap service
    shipping_etd: { type: DataTypes.STRING(20) }, // NEW: Estimasi pengiriman (2-3, 1-2, dll)
    payment_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    revenue_amount: { type: DataTypes.DECIMAL(12, 2) },
    profit_amount: { type: DataTypes.DECIMAL(12, 2) },
    customer_note: { type: DataTypes.TEXT },
    cancel_reason: { type: DataTypes.TEXT },
    tracking_number: { type: DataTypes.STRING(120) },
  // New: store applied referral code for reporting / auditing (separate from bonus tx)
  // NOTE: If database column belum ada, jalankan migration manual:
  // ALTER TABLE `orders` ADD COLUMN `referral_code` VARCHAR(20) NULL AFTER `tracking_number`;
  referral_code: { type: DataTypes.STRING(20) },
    // invoice_number temporarily disabled (DB column missing). Re-enable after migration adds column.
    // invoice_number: { type: DataTypes.STRING(60) },
    // shipping_insurance temporarily disabled to match current DB schema (uncomment when column exists)
    // shipping_insurance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    estimated_delivery: { type: DataTypes.DATE },
    address_id: { type: DataTypes.STRING },
    ship_receiver_name: { type: DataTypes.STRING(150) },
    ship_phone: { type: DataTypes.STRING(20) },
    ship_address_detail: { type: DataTypes.TEXT },
    ship_district: { type: DataTypes.STRING(100) },
    ship_city: { type: DataTypes.STRING(100) },
    ship_province: { type: DataTypes.STRING(100) },
    ship_postal_code: { type: DataTypes.STRING(10) },
    cashier_id: { type: DataTypes.STRING },
    received_amount: { type: DataTypes.DECIMAL(12, 2) },
    change_amount: { type: DataTypes.DECIMAL(12, 2) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    paid_at: { type: DataTypes.DATE },
    shipped_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    cancelled_at: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["order_number"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
      { fields: ["referral_code"] },
    ],
  }
);

const OrderItem = db.define(
  "order_items",
  {
    order_item_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    order_id: { type: DataTypes.STRING, allowNull: false },
    product_id: { type: DataTypes.STRING, allowNull: false },
    name_snapshot: { type: DataTypes.STRING(200), allowNull: false },
    // New: store product image at time of sale to preserve historical context even if product image later changes.
    // NOTE: This column is OPTIONAL - if not exists in DB, controller will skip it
    image_snapshot: { type: DataTypes.STRING(255), allowNull: true },
    // New: store product weight at time of sale (snapshot)
    // NOTE: This column is OPTIONAL - if not exists in DB, controller will skip it
    // To add column: ALTER TABLE order_items ADD COLUMN weight_grams INT DEFAULT 0;
    weight_grams: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    price_unit: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    cost_at_sale: { type: DataTypes.DECIMAL(12, 2) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["order_id"] }] }
);

const Payment = db.define(
  "payments",
  {
    payment_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    order_id: { type: DataTypes.STRING, allowNull: false },
    payment_method_id: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    fee_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    status: { type: DataTypes.ENUM("pending", "paid", "failed", "refunded"), defaultValue: "pending" },
    reference_code: { type: DataTypes.STRING(120) },
    metadata_json: { type: DataTypes.TEXT },
    paid_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["order_id"] }] }
);

const OrderStatusHistory = db.define(
  "order_status_history",
  {
    status_history_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    order_id: { type: DataTypes.STRING, allowNull: false },
    from_status: { type: DataTypes.STRING(30) },
    to_status: { type: DataTypes.STRING(30), allowNull: false },
    note: { type: DataTypes.TEXT },
    changed_by: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false }
);

const defineOrderRelations = () => {
  // Associations will be completed in models/index to avoid circular imports.
};

export { Order, OrderItem, Payment, OrderStatusHistory, defineOrderRelations };
