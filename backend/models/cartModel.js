import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const Cart = db.define(
  "carts",
  {
    cart_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.STRING },
    session_id: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM("active", "converted", "abandoned"), defaultValue: "active" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["user_id"] }, { fields: ["session_id"] }],
  }
);

const CartItem = db.define(
  "cart_items",
  {
    cart_item_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    cart_id: { type: DataTypes.STRING, allowNull: false },
    product_id: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price_at_add: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["cart_id"] }],
  }
);

const defineCartRelations = () => {
  Cart.hasMany(CartItem, { foreignKey: "cart_id", onDelete: "CASCADE" });
  CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
};

export { Cart, CartItem, defineCartRelations };
