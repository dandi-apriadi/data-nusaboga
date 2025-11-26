// Banner model for homepage banners
// Fields: id, title, image_url, link_url, is_active, order, created_at, updated_at

import { DataTypes } from 'sequelize';
import db from '../config/Database.js';

const Banner = db.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true, // allowNull true agar bisa create tanpa gambar jika diizinkan
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Banner;
