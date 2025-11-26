import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { getProfileSummary, updateProfile } from '../controllers/profileController.js';

const router = Router();

router.get('/summary', verifyUser, getProfileSummary);
router.patch('/', verifyUser, updateProfile);

export default router;
