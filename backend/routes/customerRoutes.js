import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deactivateCustomer,
  getCustomerStats,
  exportCustomers
} from "../controllers/customerController.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(verifyUser);
router.use(adminOnly);

// Customer management routes
router.get('/export', exportCustomers);           // GET /api/customers/export
router.get('/stats', getCustomerStats);           // GET /api/customers/stats
router.get('/', getCustomers);                    // GET /api/customers
router.get('/:id', getCustomerById);              // GET /api/customers/:id
router.post('/', createCustomer);                 // POST /api/customers
router.put('/:id', updateCustomer);               // PUT /api/customers/:id
router.delete('/:id', deleteCustomer);            // DELETE /api/customers/:id
router.patch('/:id/status', deactivateCustomer);  // PATCH /api/customers/:id/status

export default router;