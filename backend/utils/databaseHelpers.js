import { Product, ProductCategory } from '../models/productModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { Op } from 'sequelize';

// Helper functions untuk mengambil data dari database

// Mengambil produk berdasarkan pencarian
export const searchProducts = async (searchTerm, limit = 10) => {
  try {
    const products = await Product.findAll({
      where: {
        active: true,
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      limit,
      order: [['name', 'ASC']]
    });
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Mengambil semua kategori produk
export const getProductCategories = async () => {
  try {
    const categories = await ProductCategory.findAll({
      attributes: ['category_id', 'name', 'description'],
      order: [['name', 'ASC']]
    });
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Mengambil produk populer (berdasarkan rating atau review)
export const getPopularProducts = async (limit = 5) => {
  try {
    const products = await Product.findAll({
      where: {
        active: true,
        rating_avg: { [Op.gt]: 0 }
      },
      order: [
        ['rating_avg', 'DESC'],
        ['reviews_count', 'DESC']
      ],
      limit
    });
    return products;
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
};

// Mengambil produk dengan stok rendah
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const products = await Product.findAll({
      where: {
        active: true,
        stock: { [Op.lte]: threshold }
      },
      attributes: ['product_id', 'name', 'stock', 'price'],
      order: [['stock', 'ASC']],
      limit: 10
    });
    return products;
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
};

// Mengambil informasi pesanan berdasarkan nomor pesanan
export const getOrderByNumber = async (orderNumber) => {
  try {
    const order = await Order.findOne({
      where: { order_number: orderNumber }
    });
    return order;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

// Mengambil statistik pesanan recent
export const getOrderStatistics = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Order.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('order_id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'total_amount']
      ],
      group: ['status'],
      raw: true
    });

    return stats;
  } catch (error) {
    console.error('Error getting order statistics:', error);
    return [];
  }
};

// Mengambil customer berdasarkan email atau phone
export const searchCustomers = async (searchTerm, limit = 5) => {
  try {
    const customers = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${searchTerm}%` } },
          { phone: { [Op.like]: `%${searchTerm}%` } },
          { name: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      attributes: ['user_id', 'name', 'email', 'phone', 'created_at'],
      limit,
      order: [['created_at', 'DESC']]
    });
    return customers;
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
};

// Mengambil top selling products (simplified version)
export const getTopSellingProducts = async (limit = 5) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      order: [['reviews_count', 'DESC'], ['rating_avg', 'DESC']],
      limit
    });
    return products;
  } catch (error) {
    console.error('Error getting top selling products:', error);
    return [];
  }
};

// Top selling products berdasarkan penjualan sesungguhnya (order_items)
export const getTopSellingProductsBySales = async (days = 30, limit = 8) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Aggregate qty per product_id from completed-like orders
    const rows = await OrderItem.findAll({
      attributes: [
        'product_id',
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'sold_qty'],
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('subtotal')), 'gross_revenue']
      ],
      include: [
        {
          model: Order,
          required: true,
          attributes: [],
          where: {
            created_at: { [Op.gte]: since },
            status: { [Op.in]: ['processing', 'shipped', 'completed'] }
          }
        },
        {
          model: Product,
          required: true,
          attributes: ['product_id', 'name', 'price', 'active']
        }
      ],
      group: ['order_items.product_id', 'product.product_id'],
      order: [[OrderItem.sequelize.literal('sold_qty'), 'DESC']],
      limit
    });

    // Map ke bentuk sederhana
    return rows.map(r => {
      const p = r.product || {};
      return {
        product_id: p.product_id,
        name: p.name,
        price: p.price,
        sold_qty: Number(r.get('sold_qty') || 0),
        gross_revenue: Number(r.get('gross_revenue') || 0)
      };
    });
  } catch (error) {
    console.error('Error getting top selling products by sales:', error);
    return [];
  }
};

// Daftar produk aktif default jika pencarian kosong
export const listActiveProducts = async (limit = 8) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      attributes: ['product_id', 'name', 'price', 'stock'],
      order: [['updated_at', 'DESC']],
      limit
    });
    return products;
  } catch (error) {
    console.error('Error listing active products:', error);
    return [];
  }
};