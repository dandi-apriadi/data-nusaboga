import express from 'express';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();

/**
 * Shipping Routes - RajaOngkir Integration
 * Base path: /api/v1/shipping
 */

// Get provinces
router.get('/provinces', shippingController.getProvinces);

// Get cities (optionally filter by province_id)
router.get('/cities', shippingController.getCities);

// Calculate shipping cost
router.post('/cost', shippingController.calculateShippingCost);

// Get available couriers
router.get('/couriers', shippingController.getCouriers);

export default router;
