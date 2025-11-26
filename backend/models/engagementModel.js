import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const Review = db.define(
  "reviews",
  {
    review_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    product_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    order_id: { type: DataTypes.STRING },
    rating: { type: DataTypes.TINYINT, allowNull: false },
    comment: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
    moderated_by: { type: DataTypes.STRING },
    moderated_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["product_id"] }] }
);

const Notification = db.define(
  "notifications",
  {
    notification_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("order", "promo", "system"), defaultValue: "order" },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    read_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["user_id"] }] }
);

const LoyaltyPoint = db.define(
  "loyalty_points",
  {
    point_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    source: { type: DataTypes.ENUM("order", "promo", "manual"), allowNull: false },
    reference_id: { type: DataTypes.STRING },
    note: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["user_id"] }] }
);

const defineEngagementRelations = () => {
  // Will be wired in index.js to avoid circular deps
};

export { Review, Notification, LoyaltyPoint, defineEngagementRelations };
