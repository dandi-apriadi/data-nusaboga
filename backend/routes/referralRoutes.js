import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { 
  validateReferralCode, 
  applyReferralCode, 
  listReferralCodes, 
  createReferralCode, 
  updateReferralCode, 
  deleteReferralCode,
  listReferralBonuses,
  uploadPaymentProof,
  updatePaymentStatus
} from '../controllers/referralController.js';

const router = Router();

// Public routes for validation
router.post('/validate', validateReferralCode);
router.post('/apply', applyReferralCode);

// Admin routes for management
router.get('/', verifyUser, adminOnly, listReferralCodes);
router.get('/:id/bonuses', verifyUser, adminOnly, listReferralBonuses);
router.post('/', verifyUser, adminOnly, createReferralCode);
router.put('/:id', verifyUser, adminOnly, updateReferralCode);
router.delete('/:id', verifyUser, adminOnly, deleteReferralCode);

// Payment routes (using express-fileupload middleware)
router.post('/:id/payment-proof', verifyUser, adminOnly, uploadPaymentProof);
router.put('/:id/payment-status', verifyUser, adminOnly, updatePaymentStatus);

export default router;