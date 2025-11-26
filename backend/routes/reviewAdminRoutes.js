import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { adminListReviews, approveReview, rejectReview, deleteReview } from '../controllers/reviewAdminController.js';

const router = Router();

router.get('/', verifyUser, adminOnly, adminListReviews);
router.patch('/:id/approve', verifyUser, adminOnly, approveReview);
router.patch('/:id/reject', verifyUser, adminOnly, rejectReview);
router.delete('/:id', verifyUser, adminOnly, deleteReview);

export default router;
