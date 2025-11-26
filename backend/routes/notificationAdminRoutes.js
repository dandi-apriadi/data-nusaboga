import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, listJobs, createJob, getJobDeliveries } from '../controllers/notificationAdminController.js';

const router = Router();

router.get('/templates', verifyUser, adminOnly, listTemplates);
router.post('/templates', verifyUser, adminOnly, createTemplate);
router.put('/templates/:id', verifyUser, adminOnly, updateTemplate);
router.delete('/templates/:id', verifyUser, adminOnly, deleteTemplate);

router.get('/jobs', verifyUser, adminOnly, listJobs);
router.post('/jobs', verifyUser, adminOnly, createJob);
router.get('/jobs/:id/deliveries', verifyUser, adminOnly, getJobDeliveries);

// Alias: send endpoint (creates a job immediately)
router.post('/send', verifyUser, adminOnly, createJob);

export default router;
