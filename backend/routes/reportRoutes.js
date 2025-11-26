import { Router } from 'express';
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';
import { 
  salesSummary, 
  salesSummaryExtended, 
  topProducts, 
  categoryPerformance, 
  dailySales, 
  orderDateRange, 
  statusBreakdown, 
  weekdaySales, 
  dashboardOverview,
  getSalesChart,
  getOrderStatusChart,
  getProductPerformanceChart,
  getRevenueChart
} from '../controllers/reportController.js';

const router = Router();

router.get('/summary', verifyUser, adminOnly, salesSummary);
router.get('/summary/extended', verifyUser, adminOnly, salesSummaryExtended);
router.get('/top-products', verifyUser, adminOnly, topProducts);
router.get('/category-performance', verifyUser, adminOnly, categoryPerformance);
router.get('/daily', verifyUser, adminOnly, dailySales);
router.get('/orders/date-range', verifyUser, adminOnly, orderDateRange);
router.get('/status-breakdown', verifyUser, adminOnly, statusBreakdown);
router.get('/weekday-sales', verifyUser, adminOnly, weekdaySales);
router.get('/dashboard', verifyUser, adminOnly, dashboardOverview);

// Chart data endpoints
router.get('/charts/sales', verifyUser, adminOnly, getSalesChart);
router.get('/charts/order-status', verifyUser, adminOnly, getOrderStatusChart);
router.get('/charts/product-performance', verifyUser, adminOnly, getProductPerformanceChart);
router.get('/charts/revenue', verifyUser, adminOnly, getRevenueChart);

export default router;
