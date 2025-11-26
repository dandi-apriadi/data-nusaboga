import { Router } from 'express';
import { verifyUser, adminOnly, verifyGuestCheckout } from '../middleware/AuthUser.js';
import { listOrders, getOrder, placeOrder, updateOrderStatus, addPayment, posCheckout, updatePaymentStatus, debugOrderItems, guestCheckout, trackOrder, trackOrderById } from '../controllers/orderController.js';

const router = Router();

// Public routes - order tracking (no authentication required)
router.get('/track/:id', trackOrderById); // Track by order_id (for WhatsApp links)
router.get('/track', trackOrder); // Track by order_number/email/phone

router.get('/', verifyUser, listOrders);
router.get('/debug/:orderNumber', verifyUser, debugOrderItems); // DEBUG route - remove in production
router.get('/:id', verifyUser, getOrder);
router.post('/', verifyUser, placeOrder);
router.patch('/:id/status', verifyUser, updateOrderStatus);
router.patch('/:id/payment-status', verifyUser, adminOnly, updatePaymentStatus);
router.post('/:id/payments', verifyUser, addPayment);

// POS (admin or cashier)
router.post('/pos/checkout', verifyUser, adminOnly, posCheckout);

// Guest checkout (tanpa perlu login)
router.post('/guest/checkout', verifyGuestCheckout, guestCheckout);

export default router;
