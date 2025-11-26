import { Router } from 'express';
import { verifyUser } from '../middleware/AuthUser.js';
import { listAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addressController.js';

const router = Router();

router.get('/', verifyUser, listAddresses);
router.post('/', verifyUser, createAddress);
router.put('/:id', verifyUser, updateAddress);
router.delete('/:id', verifyUser, deleteAddress);

export default router;
