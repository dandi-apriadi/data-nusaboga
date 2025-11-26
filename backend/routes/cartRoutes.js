import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cartController.js';

const router = Router();

router.get('/', verifyUser, getCart);
router.post('/items', verifyUser, addItem);
router.put('/items/:id', verifyUser, updateItem);
router.delete('/items/:id', verifyUser, removeItem);

export default router;
