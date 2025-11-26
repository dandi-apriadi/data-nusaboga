
import express from 'express';
import bannerController from '../controllers/bannerController.js';

// import { adminAuth } from '../middleware/AuthUser.js'; // Uncomment for admin protection


const router = express.Router();
router.get('/', bannerController.getAll);
router.get('/:id', bannerController.getById);
// Custom middleware: only use multer if file is present

router.post('/', bannerController.create);
router.put('/:id', bannerController.update);
router.delete('/:id', /*adminAuth,*/ bannerController.remove);
router.patch('/reorder', bannerController.reorderBanners);

export default router;
