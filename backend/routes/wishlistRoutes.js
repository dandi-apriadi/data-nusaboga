import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/wishlistController.js';

const router = Router();

router.get('/', verifyUser, getWishlist);
router.post('/', verifyUser, addToWishlist);
router.delete('/:product_id', verifyUser, removeFromWishlist);
router.delete('/', verifyUser, clearWishlist);

export default router;
