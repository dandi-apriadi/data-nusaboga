import { DataTypes } from 'sequelize';
import db from '../config/Database.js';

export const Testimonial = db.define('testimonial', {
  testimonial_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  location: { type: DataTypes.STRING(120) },
  rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  text: { type: DataTypes.TEXT, allowNull: false },
  avatar_url: { type: DataTypes.STRING(400) },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'testimonials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const NewsletterSubscriber = db.define('newsletter_subscriber', {
  subscriber_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('active','unsubscribed'), defaultValue: 'active' }
}, {
  tableName: 'newsletter_subscribers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
