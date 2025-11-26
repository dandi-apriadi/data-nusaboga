import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

// Wishlist
const Wishlist = db.define(
  "wishlists",
  {
    wishlist_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["user_id"] }] }
);

const WishlistItem = db.define(
  "wishlist_items",
  {
    wishlist_item_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    wishlist_id: { type: DataTypes.STRING, allowNull: false },
    product_id: { type: DataTypes.STRING, allowNull: false },
    added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { unique: true, fields: ["wishlist_id", "product_id"] },
      { fields: ["product_id"] },
    ],
  }
);

// Membership & Loyalty configuration
const LoyaltyProgram = db.define(
  "loyalty_programs",
  {
    program_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    points_per_rupiah: { type: DataTypes.DECIMAL(10, 6), allowNull: false, defaultValue: 0 },
    min_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const MembershipTier = db.define(
  "membership_tiers",
  {
    tier_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    program_id: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    min_points: { type: DataTypes.INTEGER, allowNull: false },
    discount_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    benefits: { type: DataTypes.TEXT },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const MembershipPromo = db.define(
  "membership_promos",
  {
    promo_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    program_id: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    discount_type: { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false },
    discount_value: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    target_tier_id: { type: DataTypes.STRING },
    valid_from: { type: DataTypes.DATE },
    valid_until: { type: DataTypes.DATE },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

// Notification templates and sending pipeline
const NotificationTemplate = db.define(
  "notification_templates",
  {
    template_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    channel: { type: DataTypes.ENUM("email", "sms", "push"), allowNull: false },
    title: { type: DataTypes.STRING(200) },
    content: { type: DataTypes.TEXT, allowNull: false },
    variables_json: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const NotificationJob = db.define(
  "notification_jobs",
  {
    job_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    template_id: { type: DataTypes.STRING },
    channel: { type: DataTypes.ENUM("email", "sms", "push"), allowNull: false },
    target_type: { type: DataTypes.ENUM("all", "specific", "segment"), allowNull: false, defaultValue: "all" },
    target_user_ids: { type: DataTypes.TEXT }, // CSV or JSON list
    filters_json: { type: DataTypes.TEXT },
    scheduled_at: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM("pending", "scheduled", "running", "sent", "failed"), defaultValue: "pending" },
    created_by: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const NotificationDelivery = db.define(
  "notification_deliveries",
  {
    delivery_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    job_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    channel: { type: DataTypes.ENUM("email", "sms", "push"), allowNull: false },
    status: { type: DataTypes.ENUM("pending", "sent", "failed"), defaultValue: "pending" },
    error_message: { type: DataTypes.TEXT },
    sent_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["job_id"] }, { fields: ["user_id"] }] }
);

// Payment proof uploads (for manual transfers)
const PaymentProof = db.define(
  "order_payment_proofs",
  {
    proof_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    order_id: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(100) },
    file_size: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
    reviewed_by: { type: DataTypes.STRING },
    reviewed_at: { type: DataTypes.DATE },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["order_id"] }] }
);

const defineAuxRelations = () => {
  // Relations will be wired in models/index.js to avoid circular deps
};

export {
  Wishlist,
  WishlistItem,
  LoyaltyProgram,
  MembershipTier,
  MembershipPromo,
  NotificationTemplate,
  NotificationJob,
  NotificationDelivery,
  PaymentProof,
  defineAuxRelations,
};
