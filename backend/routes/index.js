import { Router } from 'express';
import bannerRoutes from './bannerRoutes.js';
// Sub-routers
import authRoutes from './shared/authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import addressRoutes from './addressRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import engagementRoutes from './engagementRoutes.js';
import reportRoutes from './reportRoutes.js';
import userManagementRoutes from './administrator/userManagementRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';
import referralRoutes from './referralRoutes.js';
import blogRoutes from './blogRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import membershipRoutes from './membershipRoutes.js';
import notificationAdminRoutes from './notificationAdminRoutes.js';
import paymentProofRoutes from './paymentProofRoutes.js';
import reviewAdminRoutes from './reviewAdminRoutes.js';
import chatbotAdminRoutes from './chatbotAdminRoutes.js';
import customerRoutes from './customerRoutes.js';
import profileRoutes from './profileRoutes.js';
import shippingRoutes from './shippingRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';

const api = Router();

// Mount sub-routers with clean prefixes
api.use('/banners', bannerRoutes);
api.use('/shared', authRoutes);
api.use('/catalog', catalogRoutes);
api.use('/cart', cartRoutes);
api.use('/orders', orderRoutes);
api.use('/addresses', addressRoutes);
api.use('/payments', paymentRoutes);
api.use('/engagement', engagementRoutes);
api.use('/reports', reportRoutes);
api.use('/chat', chatbotRoutes);
api.use('/referrals', referralRoutes);
api.use('/blog', blogRoutes);
api.use('/wishlist', wishlistRoutes);
api.use('/membership', membershipRoutes);
api.use('/notifications-admin', notificationAdminRoutes);
api.use('/payment-proofs', paymentProofRoutes);
api.use('/reviews-admin', reviewAdminRoutes);
api.use('/chat-admin', chatbotAdminRoutes);
api.use('/customers', customerRoutes);
api.use('/profile', profileRoutes);
api.use('/shipping', shippingRoutes);
api.use('/whatsapp', whatsappRoutes);

// Keep user management (change password) under /api/user/...
api.use('/', userManagementRoutes);

export default api;
