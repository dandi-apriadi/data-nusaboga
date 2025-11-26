import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import {
  // Blog Posts
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  
  // Blog Categories
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Blog Tags
  getAllTags,
  createTag,
  deleteTag
} from '../controllers/blogController.js';

const router = Router();

// ==================== BLOG POSTS ROUTES ====================

// Public routes (untuk customer view)
router.get('/posts/public', getAllPosts); // Filter otomatis status=PUBLISHED
router.get('/posts/public/:id', getPostById); // Auto increment views

// Admin routes
router.get('/posts', verifyUser, adminOnly, getAllPosts); // All posts untuk admin
router.get('/posts/:id', verifyUser, adminOnly, getPostById);
router.post('/posts', verifyUser, adminOnly, createPost);
router.put('/posts/:id', verifyUser, adminOnly, updatePost);
router.delete('/posts/:id', verifyUser, adminOnly, deletePost);

// ==================== BLOG CATEGORIES ROUTES ====================

// Public routes (untuk customer view)
router.get('/categories/public', getAllCategories); // Filter otomatis active=true

// Admin routes
router.get('/categories', verifyUser, adminOnly, getAllCategories);
router.post('/categories', verifyUser, adminOnly, createCategory);
router.put('/categories/:id', verifyUser, adminOnly, updateCategory);
router.delete('/categories/:id', verifyUser, adminOnly, deleteCategory);

// ==================== BLOG TAGS ROUTES ====================

// Public routes (untuk customer view)
router.get('/tags/public', getAllTags);

// Admin routes  
router.get('/tags', verifyUser, adminOnly, getAllTags);
router.post('/tags', verifyUser, adminOnly, createTag);
router.delete('/tags/:id', verifyUser, adminOnly, deleteTag);

export default router;