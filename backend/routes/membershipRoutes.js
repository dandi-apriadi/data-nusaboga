import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { 
  listPrograms, createProgram, updateProgram, deleteProgram, 
  listTiers, createTier, updateTier, deleteTier, 
  listPromos, createPromo, updatePromo, deletePromo,
  getUserPoints, getUserOrderHistory
} from '../controllers/membershipController.js';

const router = Router();

// Note: For real apps, also verify admin role; here we reuse verifyUser placeholder

// User Points routes
router.get('/user-points', verifyUser, adminOnly, getUserPoints);
router.get('/user-points/:id/orders', verifyUser, adminOnly, getUserOrderHistory);

// Programs routes
router.get('/programs', verifyUser, adminOnly, listPrograms);
router.post('/programs', verifyUser, adminOnly, createProgram);
router.put('/programs/:id', verifyUser, adminOnly, updateProgram);
router.delete('/programs/:id', verifyUser, adminOnly, deleteProgram);

router.get('/tiers', verifyUser, adminOnly, listTiers);
router.post('/tiers', verifyUser, adminOnly, createTier);
router.put('/tiers/:id', verifyUser, adminOnly, updateTier);
router.delete('/tiers/:id', verifyUser, adminOnly, deleteTier);

router.get('/promos', verifyUser, adminOnly, listPromos);
router.post('/promos', verifyUser, adminOnly, createPromo);
router.put('/promos/:id', verifyUser, adminOnly, updatePromo);
router.delete('/promos/:id', verifyUser, adminOnly, deletePromo);

export default router;
