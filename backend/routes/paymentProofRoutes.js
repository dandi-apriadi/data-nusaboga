import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { uploadPaymentProof, listPaymentProofs, moderatePaymentProof, listMyPaymentProofs } from '../controllers/paymentProofController.js';
import { uploadPaymentProofGuest } from '../controllers/paymentProofController.js';

const router = Router();

// User upload
router.post('/', verifyUser, uploadPaymentProof);

// Guest POS upload (no login)
router.post('/guest', uploadPaymentProofGuest);

// Admin review
router.get('/', verifyUser, adminOnly, listPaymentProofs);
// User listing their own proofs
router.get('/my', verifyUser, listMyPaymentProofs);
router.patch('/:id/moderate', verifyUser, adminOnly, moderatePaymentProof);

export default router;
