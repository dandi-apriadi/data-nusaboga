import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { listPaymentMethods, createPayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/methods', listPaymentMethods);
router.post('/', verifyUser, createPayment);

export default router;
