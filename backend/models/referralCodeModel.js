import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const ReferralCode = db.define(
  "referral_codes",
  {
    referral_id: {
      type: DataTypes.STRING,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: false,
      defaultValue: 'percent',
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Percentage (0-100) or fixed amount',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Max number of uses, null = unlimited',
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    owner_user_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'User (referrer) who will receive the bonus for this code',
    },
    bonus_percent: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true,
      comment: 'Percentage bonus granted to the owner when code used',
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Minimum order amount to use this code',
    },
    // Payout account (optional) for referral owner settlement
    payout_bank_name: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'Bank name for owner payout',
    },
    payout_account_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Account number for owner payout',
    },
    payout_account_holder: {
      type: DataTypes.STRING(120),
      allowNull: true,
      comment: 'Account holder name for owner payout',
    },
    // Payment status fields for referral bonus payout
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'pending', 'paid'),
      defaultValue: 'unpaid',
      comment: 'Payment status of referral bonus',
    },
    payment_proof: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Uploaded payment proof file path',
    },
    paid_to_account: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Account number where payment was sent',
    },
    paid_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when payment was made',
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      comment: 'Amount paid to referral owner',
    },
    payment_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes for payment',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["code"] },
      { fields: ["is_active"] },
    ],
  }
);

export { ReferralCode };