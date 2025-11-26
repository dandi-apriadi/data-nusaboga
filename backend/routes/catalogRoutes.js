import { Router } from 'express';
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  removeProductImage,
  listInventoryMovements,
  adjustInventory,
  getProductStats,
  listTopProductsPublic,
  getPublicStats,
} from '../controllers/catalogController.js';

const router = Router();

// Categories
router.get('/categories', listCategories);
router.post('/categories', verifyUser, adminOnly, createCategory);
router.put('/categories/:id', verifyUser, adminOnly, updateCategory);
router.delete('/categories/:id', verifyUser, adminOnly, deleteCategory);

// Products
router.get('/products', listProducts);
router.get('/products/:id', getProduct);
router.get('/products/:id/stats', verifyUser, adminOnly, getProductStats);
router.post('/products', verifyUser, adminOnly, createProduct);
router.put('/products/:id', verifyUser, adminOnly, updateProduct);
router.delete('/products/:id', verifyUser, adminOnly, deleteProduct);

// Public lightweight aggregates for homepage
router.get('/products-top/public', listTopProductsPublic); // no auth, limited fields
router.get('/public-stats', getPublicStats);

// Product images
router.post('/products/images', verifyUser, adminOnly, addProductImage);
router.delete('/products/images/:id', verifyUser, adminOnly, removeProductImage);

// Inventory
router.get('/inventory/movements', verifyUser, adminOnly, listInventoryMovements);
router.post('/inventory/adjust', verifyUser, adminOnly, adjustInventory);

export default router;
