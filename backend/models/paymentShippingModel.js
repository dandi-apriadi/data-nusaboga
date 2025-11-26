import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const PaymentMethod = db.define(
  "payment_methods",
  {
    payment_method_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT },
    fee_type: { type: DataTypes.ENUM("none", "flat", "percent"), defaultValue: "none" },
    fee_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const ShippingMethod = db.define(
  "shipping_methods",
  {
    shipping_method_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    carrier: { type: DataTypes.STRING(100), allowNull: false },
    service_name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

export { PaymentMethod, ShippingMethod };
