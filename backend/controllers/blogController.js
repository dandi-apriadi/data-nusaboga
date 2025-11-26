import db from "../config/Database.js";
import { BlogPost, BlogCategory, BlogTag, BlogPostTag, BlogComment } from "../models/blogModel.js";
import fs from 'fs';
import path from 'path';
import { User } from "../models/userModel.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Utility function untuk generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // hapus karakter spesial
    .replace(/\s+/g, '-') // ganti spasi dengan dash
    .replace(/-+/g, '-') // hapus multiple dash
    .trim();
};

// Utility function untuk estimasi reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// ==================== BLOG POSTS ====================

export const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category_id,
      search,
      is_featured,
      author_id,
      tag,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter berdasarkan status
    if (status) {
      whereClause.status = status;
    }

    // Filter berdasarkan kategori
    if (category_id) {
      whereClause.category_id = category_id;
    }

    // Filter berdasarkan featured
    if (is_featured !== undefined) {
      whereClause.is_featured = is_featured === 'true';
    }

    // Filter berdasarkan author
    if (author_id) {
      whereClause.author_id = author_id;
    }

    // Search di title dan content
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } }
      ];
    }

    let include = [
      {
        model: BlogCategory,
        as: 'category',
        attributes: ['category_id', 'name', 'slug', 'color']
      },
      {
        model: BlogTag,
        as: 'tags',
        attributes: ['tag_id', 'name', 'slug', 'color'],
        through: { attributes: [] }
      }
    ];

    // Include tag filter jika ada
    if (tag) {
      include[1].where = {
        [Op.or]: [
          { name: { [Op.like]: `%${tag}%` } },
          { slug: tag }
        ]
      };
    }

    const { count, rows } = await BlogPost.findAndCountAll({
      where: whereClause,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort_by, sort_order.toUpperCase()]],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        posts: rows,
        total: count,
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data blog posts',
      error: error.message
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment_views = false } = req.query;

    const post = await BlogPost.findByPk(id, {
      include: [
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['category_id', 'name', 'slug', 'color']
        },
        {
          model: BlogTag,
          as: 'tags',
          attributes: ['tag_id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        },
        {
          model: BlogComment,
          as: 'comments',
          where: { status: 'APPROVED', parent_id: null },
          required: false,
          include: [{
            model: BlogComment,
            as: 'replies',
            where: { status: 'APPROVED' },
            required: false
          }]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post tidak ditemukan'
      });
    }

    // Increment views jika diminta (biasanya dari frontend customer)
    if (increment_views === 'true') {
      await BlogPost.update(
        { views_count: post.views_count + 1 },
        { where: { post_id: id } }
      );
      post.views_count += 1;
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error getting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data blog post',
      error: error.message
    });
  }
};

export const createPost = async (req, res) => {
  // ...existing code...
  // Konversi featured_image ke webp jika upload file
  if (req.files && req.files.featured_image) {
    const imageFile = req.files.featured_image;
    const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, fileName);
    await imageFile.mv(uploadPath);
    const sharp = (await import('sharp')).default || (await import('sharp'));
    const ext = path.extname(uploadPath).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      const webpPath = uploadPath.replace(ext, ".webp");
      await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
      fs.unlinkSync(uploadPath);
      featured_image = `/uploads/blog/${path.basename(webpPath)}`;
    } else {
      featured_image = `/uploads/blog/${fileName}`;
    }
  }
  const t = await db.transaction();
  try {
    const {
      category_id,
      title,
      excerpt,
      content,
      featured_image,
      meta_title,
      meta_description,
      status = 'DRAFT',
      is_featured = false,
      tags = [] // array of tag names or IDs
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title dan content wajib diisi'
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Check if slug already exists and modify if necessary
    const existingPost = await BlogPost.findOne({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time
    const reading_time = calculateReadingTime(content);

    // Set published_at jika status PUBLISHED
    const published_at = status === 'PUBLISHED' ? new Date() : null;

    // Validate category_id (must exist in blog_categories) else set null
    let validCategoryId = null;
    let incomingCategoryId = category_id?.trim() || null;
    // Legacy mapping cat-1..cat-5 -> new static IDs
    const legacyMap = {
      'cat-1': 'BLC_RESEP',
      'cat-2': 'BLC_TIPS',
      'cat-3': 'BLC_NUTRISI',
      'cat-4': 'BLC_BUDAYA',
      'cat-5': 'BLC_PRODUK'
    };
    if (legacyMap[incomingCategoryId]) {
      if (process.env.DEBUG_BLOG === 'true') {
        console.log('[BLOG][createPost] Mapping legacy category id', incomingCategoryId, '->', legacyMap[incomingCategoryId]);
      }
      incomingCategoryId = legacyMap[incomingCategoryId];
    }

    if (incomingCategoryId) {
      if (process.env.DEBUG_BLOG === 'true') {
        console.log('[BLOG][createPost] Incoming category_id:', incomingCategoryId);
      }
      // IMPORTANT: use incomingCategoryId (after legacy mapping) for lookup
      let existingCategory = await BlogCategory.findOne({ where: { category_id: incomingCategoryId } });
      if (!existingCategory) {
        // Attempt to auto-create from static config if present
        try {
          const staticPath = path.join(process.cwd(), 'backend', 'config', 'blogStaticCategories.json');
          if (fs.existsSync(staticPath)) {
            const raw = fs.readFileSync(staticPath, 'utf-8');
            const staticCats = JSON.parse(raw);
            const match = staticCats.find(c => c.category_id === incomingCategoryId);
            if (match) {
              try {
                existingCategory = await BlogCategory.create(match, { transaction: t });
                if (process.env.DEBUG_BLOG === 'true') {
                  console.log('[BLOG][createPost] Auto-created static category', match.category_id);
                }
              } catch (createErr) {
                // Possible race or unique slug conflict – try refetch
                if (process.env.DEBUG_BLOG === 'true') {
                  console.warn('[BLOG][createPost] Create failed, retry fetch:', createErr.message);
                }
                existingCategory = await BlogCategory.findOne({ where: { category_id: incomingCategoryId } });
              }
            } else if (process.env.DEBUG_BLOG === 'true') {
              console.log('[BLOG][createPost] No static match for category id', incomingCategoryId);
            }
          }
        } catch (e) {
          console.warn('Auto-create static category failed:', e.message);
        }
        // Fallback: attempt minimal create if still not found & ID pattern BLC_
        if (!existingCategory && /^BLC_[A-Z0-9]+/.test(incomingCategoryId)) {
          try {
            const fallbackName = incomingCategoryId.replace(/^BLC_/, '').toLowerCase().replace(/_/g, ' ');
            existingCategory = await BlogCategory.create({
              category_id: incomingCategoryId,
              name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
              slug: generateSlug(fallbackName)
            }, { transaction: t });
            if (process.env.DEBUG_BLOG === 'true') {
              console.log('[BLOG][createPost] Fallback-created minimal category', incomingCategoryId);
            }
          } catch (fallbackErr) {
            if (process.env.DEBUG_BLOG === 'true') {
              console.warn('[BLOG][createPost] Fallback create failed:', fallbackErr.message);
            }
          }
        }
      }
      if (!existingCategory) {
        if (process.env.DEBUG_BLOG === 'true') {
          console.error('[BLOG][createPost] FINAL: category still not found, aborting', incomingCategoryId);
        }
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak ditemukan (invalid category_id)',
          code: 'INVALID_CATEGORY'
        });
      }
      validCategoryId = incomingCategoryId;
    }

    const post = await BlogPost.create({
      category_id: validCategoryId,
      author_id: req.session?.user_id || req.user?.user_id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt,
      status,
      is_featured,
      reading_time,
      published_at
    }, { transaction: t });

    // Handle tags
    if (tags && tags.length > 0) {
      const tagIds = [];
      
      for (const tagInput of tags) {
        let tag;
        
        if (typeof tagInput === 'string') {
          // Create or find tag by name
          const tagSlug = generateSlug(tagInput);
          [tag] = await BlogTag.findOrCreate({
            where: { slug: tagSlug },
            defaults: {
              name: tagInput,
              slug: tagSlug
            },
            transaction: t
          });
        } else if (tagInput.tag_id) {
          // Find existing tag by ID
          tag = await BlogTag.findByPk(tagInput.tag_id, { transaction: t });
        }
        
        if (tag) {
          tagIds.push(tag.tag_id);
        }
      }

      // Create post-tag associations
      if (tagIds.length > 0) {
        const postTagData = tagIds.map(tag_id => ({
          post_id: post.post_id,
          tag_id
        }));
        
        await BlogPostTag.bulkCreate(postTagData, { transaction: t });
      }
    }

    await t.commit();

    // Fetch complete post data with associations
    const completePost = await BlogPost.findByPk(post.post_id, {
      include: [
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['category_id', 'name', 'slug', 'color']
        },
        {
          model: BlogTag,
          as: 'tags',
          attributes: ['tag_id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Blog post berhasil dibuat',
      data: completePost
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat blog post',
      error: error.message
    });
  }
};

export const updatePost = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const {
      category_id,
      title,
      excerpt,
      content,
      featured_image,
      meta_title,
      meta_description,
      status,
      is_featured,
      tags = []
    } = req.body;

    const post = await BlogPost.findByPk(id, { transaction: t });
    if (!post) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Blog post tidak ditemukan'
      });
    }

    const updateData = {};
    
    if (title !== undefined) {
      updateData.title = title;
      // Update slug hanya jika title berubah
      if (title !== post.title) {
        let newSlug = generateSlug(title);
        const existingPost = await BlogPost.findOne({ 
          where: { slug: newSlug, post_id: { [Op.ne]: id } } 
        });
        if (existingPost) {
          newSlug = `${newSlug}-${Date.now()}`;
        }
        updateData.slug = newSlug;
      }
    }

    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) {
      updateData.content = content;
      updateData.reading_time = calculateReadingTime(content);
    }
    // Konversi featured_image ke webp jika upload file
    if (req.files && req.files.featured_image) {
      const imageFile = req.files.featured_image;
      const fileName = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uploadPath = path.join(uploadDir, fileName);
      await imageFile.mv(uploadPath);
      const sharp = (await import('sharp')).default || (await import('sharp'));
      const ext = path.extname(uploadPath).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const webpPath = uploadPath.replace(ext, ".webp");
        await sharp(uploadPath).webp({ quality: 80 }).toFile(webpPath);
        fs.unlinkSync(uploadPath);
        updateData.featured_image = `/uploads/blog/${path.basename(webpPath)}`;
      } else {
        updateData.featured_image = `/uploads/blog/${fileName}`;
      }
    }
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (category_id !== undefined) updateData.category_id = category_id;

    // Handle status change
    if (status !== undefined) {
      updateData.status = status;
      // Set published_at jika status berubah ke PUBLISHED
      if (status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
        updateData.published_at = new Date();
      }
    }

    await BlogPost.update(updateData, {
      where: { post_id: id },
      transaction: t
    });

    // Handle tags update
    if (tags.length >= 0) {
      // Delete existing associations
      await BlogPostTag.destroy({
        where: { post_id: id },
        transaction: t
      });

      // Create new associations
      if (tags.length > 0) {
        const tagIds = [];
        
        for (const tagInput of tags) {
          let tag;
          
          if (typeof tagInput === 'string') {
            const tagSlug = generateSlug(tagInput);
            [tag] = await BlogTag.findOrCreate({
              where: { slug: tagSlug },
              defaults: {
                name: tagInput,
                slug: tagSlug
              },
              transaction: t
            });
          } else if (tagInput.tag_id) {
            tag = await BlogTag.findByPk(tagInput.tag_id, { transaction: t });
          }
          
          if (tag) {
            tagIds.push(tag.tag_id);
          }
        }

        if (tagIds.length > 0) {
          const postTagData = tagIds.map(tag_id => ({
            post_id: id,
            tag_id
          }));
          
          await BlogPostTag.bulkCreate(postTagData, { transaction: t });
        }
      }
    }

    await t.commit();

    // Fetch updated post with associations
    const updatedPost = await BlogPost.findByPk(id, {
      include: [
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['category_id', 'name', 'slug', 'color']
        },
        {
          model: BlogTag,
          as: 'tags',
          attributes: ['tag_id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Blog post berhasil diupdate',
      data: updatedPost
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate blog post',
      error: error.message
    });
  }
};

export const deletePost = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id, { transaction: t });
    if (!post) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Blog post tidak ditemukan'
      });
    }

    // Delete associations first
    await BlogPostTag.destroy({
      where: { post_id: id },
      transaction: t
    });

    // Delete comments
    await BlogComment.destroy({
      where: { post_id: id },
      transaction: t
    });

    // Delete the post
    await BlogPost.destroy({
      where: { post_id: id },
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Blog post berhasil dihapus'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus blog post',
      error: error.message
    });
  }
};

// ==================== BLOG CATEGORIES ====================

export const getAllCategories = async (req, res) => {
  try {
    const { active_only = false } = req.query;
    
    const whereClause = {};
    if (active_only === 'true') {
      whereClause.active = true;
    }

    const categories = await BlogCategory.findAll({
      where: whereClause,
      include: [{
        model: BlogPost,
        as: 'posts',
        attributes: ['post_id'],
        where: { status: 'PUBLISHED' },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    // Add post count to each category
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toJSON(),
      posts_count: cat.posts ? cat.posts.length : 0,
      posts: undefined // remove posts array, only keep count
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Error getting blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori blog',
      error: error.message
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi'
      });
    }

    let slug = generateSlug(name);
    
    // Check if slug already exists
    const existingCategory = await BlogCategory.findOne({ where: { slug } });
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await BlogCategory.create({
      name,
      slug,
      description,
      color: color || '#6366f1'
    });

    res.status(201).json({
      success: true,
      message: 'Kategori blog berhasil dibuat',
      data: category
    });
  } catch (error) {
    console.error('Error creating blog category:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat kategori blog',
      error: error.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, active } = req.body;

    const category = await BlogCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori blog tidak ditemukan'
      });
    }

    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name;
      if (name !== category.name) {
        let newSlug = generateSlug(name);
        const existingCategory = await BlogCategory.findOne({ 
          where: { slug: newSlug, category_id: { [Op.ne]: id } } 
        });
        if (existingCategory) {
          newSlug = `${newSlug}-${Date.now()}`;
        }
        updateData.slug = newSlug;
      }
    }

    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (active !== undefined) updateData.active = active;

    await BlogCategory.update(updateData, {
      where: { category_id: id }
    });

    const updatedCategory = await BlogCategory.findByPk(id);

    res.json({
      success: true,
      message: 'Kategori blog berhasil diupdate',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating blog category:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate kategori blog',
      error: error.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;

    const category = await BlogCategory.findByPk(id, { transaction: t });
    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Kategori blog tidak ditemukan'
      });
    }

    // Check if category has posts
    const postCount = await BlogPost.count({
      where: { category_id: id },
      transaction: t
    });

    if (postCount > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori karena masih memiliki ${postCount} blog post`
      });
    }

    await BlogCategory.destroy({
      where: { category_id: id },
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Kategori blog berhasil dihapus'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting blog category:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori blog',
      error: error.message
    });
  }
};

// ==================== BLOG TAGS ====================

export const getAllTags = async (req, res) => {
  try {
    const { search } = req.query;
    
    const whereClause = {};
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const tags = await BlogTag.findAll({
      where: whereClause,
      include: [{
        model: BlogPost,
        as: 'posts',
        attributes: ['post_id'],
        where: { status: 'PUBLISHED' },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    // Add post count to each tag
    const tagsWithCount = tags.map(tag => ({
      ...tag.toJSON(),
      posts_count: tag.posts ? tag.posts.length : 0,
      posts: undefined
    }));

    res.json({
      success: true,
      data: tagsWithCount
    });
  } catch (error) {
    console.error('Error getting blog tags:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tag blog',
      error: error.message
    });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama tag wajib diisi'
      });
    }

    let slug = generateSlug(name);
    
    const existingTag = await BlogTag.findOne({ where: { slug } });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag dengan nama tersebut sudah ada'
      });
    }

    const tag = await BlogTag.create({
      name,
      slug,
      color: color || '#64748b'
    });

    res.status(201).json({
      success: true,
      message: 'Tag blog berhasil dibuat',
      data: tag
    });
  } catch (error) {
    console.error('Error creating blog tag:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat tag blog',
      error: error.message
    });
  }
};

export const deleteTag = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;

    const tag = await BlogTag.findByPk(id, { transaction: t });
    if (!tag) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tag blog tidak ditemukan'
      });
    }

    // Delete associations first
    await BlogPostTag.destroy({
      where: { tag_id: id },
      transaction: t
    });

    // Delete the tag
    await BlogTag.destroy({
      where: { tag_id: id },
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Tag blog berhasil dihapus'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting blog tag:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus tag blog',
      error: error.message
    });
  }
};