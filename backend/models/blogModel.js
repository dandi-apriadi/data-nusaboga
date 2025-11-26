import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

const BlogCategory = db.define(
  "blog_categories",
  {
    category_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    slug: { type: DataTypes.STRING(160), unique: true },
    description: { type: DataTypes.TEXT },
    color: { type: DataTypes.STRING(20), defaultValue: '#6366f1' }, // untuk badge kategori
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { 
    freezeTableName: true, 
    timestamps: true, 
    createdAt: "created_at", 
    updatedAt: "updated_at",
    indexes: [
      { fields: ["slug"], unique: true },
      { fields: ["active"] }
    ]
  }
);

const BlogPost = db.define(
  "blog_posts",
  {
    post_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    category_id: { type: DataTypes.STRING, allowNull: true },
    author_id: { type: DataTypes.STRING, allowNull: false }, // user_id dari admin yang menulis
    title: { type: DataTypes.STRING(300), allowNull: false },
    slug: { type: DataTypes.STRING(350), unique: true },
    excerpt: { type: DataTypes.TEXT }, // ringkasan singkat
    content: { type: DataTypes.TEXT("long"), allowNull: false }, // konten penuh blog
    featured_image: { type: DataTypes.TEXT }, // URL gambar utama
    meta_title: { type: DataTypes.STRING(300) }, // SEO title
    meta_description: { type: DataTypes.TEXT }, // SEO description
    status: { 
      type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'), 
      defaultValue: 'DRAFT' 
    },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false }, // artikel unggulan
    views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    reading_time: { type: DataTypes.INTEGER }, // estimasi waktu baca dalam menit
    published_at: { type: DataTypes.DATE },
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
      { fields: ["author_id"] },
      { fields: ["slug"], unique: true },
      { fields: ["status"] },
      { fields: ["is_featured"] },
      { fields: ["published_at"] }
    ]
  }
);

const BlogTag = db.define(
  "blog_tags",
  {
    tag_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), unique: true },
    color: { type: DataTypes.STRING(20), defaultValue: '#64748b' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { 
    freezeTableName: true, 
    timestamps: true, 
    createdAt: "created_at", 
    updatedAt: "updated_at",
    indexes: [
      { fields: ["slug"], unique: true }
    ]
  }
);

// Junction table untuk many-to-many blog posts dan tags
const BlogPostTag = db.define(
  "blog_post_tags",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    post_id: { type: DataTypes.STRING, allowNull: false },
    tag_id: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { 
    freezeTableName: true, 
    timestamps: false,
    indexes: [
      { fields: ["post_id", "tag_id"], unique: true }
    ]
  }
);

// Blog Comment (untuk fase lanjutan)
const BlogComment = db.define(
  "blog_comments",
  {
    comment_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    post_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: true }, // bisa guest comment
    parent_id: { type: DataTypes.STRING, allowNull: true }, // untuk nested comments
    author_name: { type: DataTypes.STRING(150), allowNull: false },
    author_email: { type: DataTypes.STRING(200) },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { 
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'SPAM', 'REJECTED'), 
      defaultValue: 'PENDING' 
    },
    ip_address: { type: DataTypes.STRING(45) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["post_id"] },
      { fields: ["user_id"] },
      { fields: ["parent_id"] },
      { fields: ["status"] }
    ]
  }
);

// Associations
BlogPost.belongsTo(BlogCategory, { foreignKey: "category_id", as: "category" });
BlogCategory.hasMany(BlogPost, { foreignKey: "category_id", as: "posts" });

BlogPost.belongsToMany(BlogTag, { 
  through: BlogPostTag, 
  foreignKey: "post_id", 
  otherKey: "tag_id",
  as: "tags" 
});
BlogTag.belongsToMany(BlogPost, { 
  through: BlogPostTag, 
  foreignKey: "tag_id", 
  otherKey: "post_id",
  as: "posts" 
});

BlogComment.belongsTo(BlogPost, { foreignKey: "post_id", as: "post" });
BlogPost.hasMany(BlogComment, { foreignKey: "post_id", as: "comments" });

// Self-referencing untuk nested comments
BlogComment.belongsTo(BlogComment, { foreignKey: "parent_id", as: "parent" });
BlogComment.hasMany(BlogComment, { foreignKey: "parent_id", as: "replies" });

export { BlogCategory, BlogPost, BlogTag, BlogPostTag, BlogComment };