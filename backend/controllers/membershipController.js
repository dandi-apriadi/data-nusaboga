import { LoyaltyProgram, MembershipTier, MembershipPromo, User, LoyaltyPoint, Order, OrderItem, Product } from "../models/index.js";
import { Op, literal } from "sequelize";

// User Points Management
export const getUserPoints = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      role: 'user', // Only get users with 'user' role, exclude admin
      ...(search ? {
        [Op.or]: [
          { fullname: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      } : {})
    };

    // First get users with basic info (exclude admin)
    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['user_id', 'fullname', 'email', 'created_at'],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    // Then calculate points and transaction data for each user
    const usersWithStats = await Promise.all(
      users.rows.map(async (user) => {
        // Calculate total orders and spending (include all channels: online + POS)
        const totalOrders = await Order.count({
          where: { user_id: user.user_id }
        });
        
        // Calculate total spent from all completed/paid transactions
        const totalSpent = await Order.sum('total', {
          where: { 
            user_id: user.user_id,
            status: { [Op.in]: ['pending', 'processing', 'shipped', 'completed'] },
            payment_status: { [Op.in]: ['paid', 'partial'] }
          }
        }) || 0;
        
        // Calculate points based on spending: 1 point = Rp 1,000 spent
        const totalPoints = Math.floor(totalSpent / 1000);
        
        // Get last order date
        const lastOrder = await Order.findOne({
          where: { user_id: user.user_id },
          order: [['created_at', 'DESC']],
          attributes: ['created_at']
        });
        
        // Calculate membership level based on spending points: 1 point = Rp 1,000 spent
        let membershipLevel = 'Starter';
        let membershipColor = 'gray';
        if (totalPoints >= 5000) {          // Rp 5,000,000+ spent
          membershipLevel = 'VIP';
          membershipColor = 'indigo';
        } else if (totalPoints >= 2500) {   // Rp 2,500,000+ spent  
          membershipLevel = 'Gold';
          membershipColor = 'amber';
        } else if (totalPoints >= 1000) {   // Rp 1,000,000+ spent
          membershipLevel = 'Silver';
          membershipColor = 'slate';
        } else if (totalPoints >= 250) {    // Rp 250,000+ spent
          membershipLevel = 'Bronze';
          membershipColor = 'orange';
        }
        
        return {
          ...user.toJSON(),
          total_points: totalPoints,
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order_date: lastOrder?.created_at || null,
          membership_level: membershipLevel,
          membership_color: membershipColor,
          avg_order_value: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0
        };
      })
    );

    // Calculate statistics (include all channels and paid transactions, only for users not admin)
    const totalUsers = await User.count({ where: { role: 'user' } });
    
    // Get all user IDs with role 'user' (exclude admin)
    const userIds = await User.findAll({
      where: { role: 'user' },
      attributes: ['user_id']
    }).then(users => users.map(user => user.user_id));
    
    // Count orders only from regular users (not admin)
    const totalOrdersCount = await Order.count({
      where: {
        user_id: { [Op.in]: userIds }
      }
    });
    
    // Calculate revenue only from regular users (not admin)
    const totalRevenue = await Order.sum('total', {
      where: { 
        user_id: { [Op.in]: userIds },
        status: { [Op.in]: ['pending', 'processing', 'shipped', 'completed'] },
        payment_status: { [Op.in]: ['paid', 'partial'] }
      }
    }) || 0;
    
    // Calculate total points based on spending rule: 1 point = Rp 1,000
    const totalPointsAwarded = Math.floor(totalRevenue / 1000);
    const avgPointsPerUser = totalUsers > 0 ? Math.round(totalPointsAwarded / totalUsers) : 0;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / limit)
        },
        statistics: {
          totalUsers,
          totalPointsAwarded,
          avgPointsPerUser,
          totalOrders: totalOrdersCount,
          totalRevenue,
          avgOrderValue
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ 
      success: false, 
      msg: "Gagal mengambil data user points", 
      error: error.message 
    });
  }
};

export const getUserOrderHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id, {
      attributes: ['user_id', 'fullname', 'email']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User tidak ditemukan"
      });
    }

    const orderHistory = await Order.findAndCountAll({
      where: { user_id: id },
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['name', 'price']
        }]
      }],
      attributes: ['order_id', 'order_number', 'channel', 'total', 'status', 'payment_status', 'created_at', 'updated_at'],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    // Calculate total spent and order statistics (include paid transactions)
    const totalSpent = await Order.sum('total', {
      where: { 
        user_id: id, 
        status: { [Op.in]: ['pending', 'processing', 'shipped', 'completed'] },
        payment_status: { [Op.in]: ['paid', 'partial'] }
      }
    }) || 0;

    const totalOrders = orderHistory.count;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    res.json({
      success: true,
      data: {
        user,
        orderHistory: orderHistory.rows,
        statistics: {
          totalOrders,
          totalSpent,
          avgOrderValue
        },
        pagination: {
          total: orderHistory.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(orderHistory.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user order history:', error);
    res.status(500).json({ 
      success: false, 
      msg: "Gagal mengambil riwayat pesanan user", 
      error: error.message 
    });
  }
};

// Programs
export const listPrograms = async (req, res) => {
  try {
    const rows = await LoyaltyProgram.findAll({ order: [["created_at", "DESC"]] });
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, msg: "Gagal mengambil program", error: e.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const row = await LoyaltyProgram.create(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal membuat program", error: e.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await LoyaltyProgram.update(req.body, { where: { id } });
    const row = await LoyaltyProgram.findByPk(id);
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal mengubah program", error: e.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await LoyaltyProgram.destroy({ where: { id } });
    res.json({ success: true, msg: "Program dihapus" });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal menghapus program", error: e.message });
  }
};

// Tiers
export const listTiers = async (req, res) => {
  try {
    const { program_id } = req.query;
    const where = {};
    if (program_id) where.program_id = program_id;
    const rows = await MembershipTier.findAll({ where, order: [["min_points", "ASC"]] });
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, msg: "Gagal mengambil tier", error: e.message });
  }
};

export const createTier = async (req, res) => {
  try {
    const row = await MembershipTier.create(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal membuat tier", error: e.message });
  }
};

export const updateTier = async (req, res) => {
  try {
    const { id } = req.params;
    await MembershipTier.update(req.body, { where: { id } });
    const row = await MembershipTier.findByPk(id);
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal mengubah tier", error: e.message });
  }
};

export const deleteTier = async (req, res) => {
  try {
    const { id } = req.params;
    await MembershipTier.destroy({ where: { id } });
    res.json({ success: true, msg: "Tier dihapus" });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal menghapus tier", error: e.message });
  }
};

// Promos
export const listPromos = async (req, res) => {
  try {
    const { program_id, is_active } = req.query;
    const where = {};
    if (program_id) where.program_id = program_id;
    if (is_active !== undefined) where.is_active = is_active === "true";
    const rows = await MembershipPromo.findAll({ where, order: [["created_at", "DESC"]] });
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, msg: "Gagal mengambil promo", error: e.message });
  }
};

export const createPromo = async (req, res) => {
  try {
    // Membership levels berdasarkan Profile.jsx
    const membershipLevels = {
      'bronze': { discount: 0, minPoints: 0, maxPoints: 499 },
      'silver': { discount: 5, minPoints: 500, maxPoints: 1499 },
      'gold': { discount: 10, minPoints: 1500, maxPoints: 2999 },
      'platinum': { discount: 15, minPoints: 3000, maxPoints: 4999 },
      'diamond': { discount: 20, minPoints: 5000, maxPoints: Infinity }
    };

    // Validasi target_tier dan auto-set discount berdasarkan level
    if (req.body.target_tier) {
      const tier = req.body.target_tier.toLowerCase();
      if (!membershipLevels[tier]) {
        return res.status(400).json({ 
          success: false, 
          msg: "Level membership tidak valid. Pilih: bronze, silver, gold, platinum, atau diamond" 
        });
      }
      
      // Auto-set discount berdasarkan level
      req.body.discount_type = 'percentage';
      req.body.discount_value = membershipLevels[tier].discount;
    }

    const row = await MembershipPromo.create(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal membuat promo", error: e.message });
  }
};

export const updatePromo = async (req, res) => {
  try {
    // Membership levels berdasarkan Profile.jsx (validasi sama untuk update)
    const membershipLevels = {
      'bronze': { discount: 0, minPoints: 0, maxPoints: 499 },
      'silver': { discount: 5, minPoints: 500, maxPoints: 1499 },
      'gold': { discount: 10, minPoints: 1500, maxPoints: 2999 },
      'platinum': { discount: 15, minPoints: 3000, maxPoints: 4999 },
      'diamond': { discount: 20, minPoints: 5000, maxPoints: Infinity }
    };

    // Validasi target_tier dan auto-set discount berdasarkan level
    if (req.body.target_tier) {
      const tier = req.body.target_tier.toLowerCase();
      if (!membershipLevels[tier]) {
        return res.status(400).json({ 
          success: false, 
          msg: "Level membership tidak valid. Pilih: bronze, silver, gold, platinum, atau diamond" 
        });
      }
      
      // Auto-set discount berdasarkan level
      req.body.discount_type = 'percentage';
      req.body.discount_value = membershipLevels[tier].discount;
    }

    const { id } = req.params;
    await MembershipPromo.update(req.body, { where: { id } });
    const row = await MembershipPromo.findByPk(id);
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal mengubah promo", error: e.message });
  }
};

export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    await MembershipPromo.destroy({ where: { id } });
    res.json({ success: true, msg: "Promo dihapus" });
  } catch (e) {
    res.status(400).json({ success: false, msg: "Gagal menghapus promo", error: e.message });
  }
};
