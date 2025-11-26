import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const ProductCategory = db.define(
  "categories",
  {
    category_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    slug: { type: DataTypes.STRING(160) },
    description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const Product = db.define(
  "products",
  {
    product_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    category_id: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(240) },
    barcode: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    original_price: { type: DataTypes.DECIMAL(12, 2) },
    cost_price: { type: DataTypes.DECIMAL(12, 2) },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    weight_grams: { type: DataTypes.INTEGER },
    image_url: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating_avg: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
    reviews_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["category_id"] },
      // Keep indexes minimal to avoid exceeding MySQL key limits
      // Add additional indexes later with migrations if needed
    ],
  }
);

const ProductImage = db.define(
  "product_images",
  {
    image_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    product_id: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["product_id"] }] }
);

const InventoryMovement = db.define(
  "inventory_movements",
  {
    movement_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    product_id: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("purchase", "sale", "pos_sale", "adjustment", "return", "transfer"),
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_cost: { type: DataTypes.DECIMAL(12, 2) },
    note: { type: DataTypes.TEXT },
    reference_type: { type: DataTypes.STRING(30) },
    reference_id: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [{ fields: ["product_id", "created_at"] }],
  }
);

const defineProductRelations = () => {
  Product.belongsTo(ProductCategory, { foreignKey: "category_id" });
  ProductCategory.hasMany(Product, { foreignKey: "category_id" });

  ProductImage.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
  Product.hasMany(ProductImage, { foreignKey: "product_id" });

  InventoryMovement.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
  Product.hasMany(InventoryMovement, { foreignKey: "product_id" });
};

export { ProductCategory, Product, ProductImage, InventoryMovement, defineProductRelations };
