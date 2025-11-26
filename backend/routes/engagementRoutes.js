import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { listReviews, createReview, listNotifications, markNotificationRead, listLoyalty, listTestimonialsPublic, subscribeNewsletter } from '../controllers/engagementController.js';

const router = Router();

// Reviews
router.get('/reviews', listReviews);
router.post('/reviews', verifyUser, createReview);

// Notifications (user)
router.get('/notifications', verifyUser, listNotifications);
router.patch('/notifications/:id/read', verifyUser, markNotificationRead);

// Loyalty (user)
router.get('/loyalty', verifyUser, listLoyalty);

// Public testimonials & newsletter
router.get('/testimonials/public', listTestimonialsPublic);
router.post('/newsletter/subscribe', subscribeNewsletter);

export default router;
