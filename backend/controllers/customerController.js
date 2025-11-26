import { Op, fn, col } from "sequelize";
import db from "../config/Database.js";
import { User } from "../models/index.js";

// Get all customers with filtering and pagination
export const getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all',
      level = 'all',
      sort = 'name',
      order = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    // Accept primary customer role 'user' plus legacy 'customer' if ever existed
    const whereConditions = {
      role: { [Op.in]: ['user', 'customer'] }
    };

    // Search filter
    if (search) {
      whereConditions[Op.or] = [
        { fullname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      if (status === 'active') {
        whereConditions.is_active = true;
      } else if (status === 'inactive') {
        whereConditions.is_active = false;
      }
    }

    // Get users with order statistics
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [[sort === 'name' ? 'fullname' : sort, order]],
      attributes: [
        'user_id',
        'fullname', 
        'email',
        'phone',
        'gender',
        'avatar',
        'is_active',
        'created_at',
        'last_login'
      ]
    });

    if (count === 0) {
      console.log('[Customers] No users found with roles user/customer.');
    }

    // Calculate customer statistics for each user
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        // Import Order model dynamically to avoid circular dependency
        const { Order } = await import("../models/index.js");
        
        // Get order statistics
        const orderStats = await Order.findAll({
          where: { user_id: user.user_id },
          attributes: [
            [db.fn('COUNT', db.col('order_id')), 'totalOrders'],
            [db.fn('SUM', db.col('total')), 'totalSpent'],
            [db.fn('AVG', db.col('total')), 'averageOrderValue'],
            [db.fn('MAX', db.col('created_at')), 'lastOrderDate'],
            [db.fn('MIN', db.col('created_at')), 'firstOrderDate']
          ],
          raw: true
        });

        const stats = orderStats[0] || {};
        const totalOrders = parseInt(stats.totalOrders) || 0;
        const totalSpent = parseFloat(stats.totalSpent) || 0;
        const averageOrderValue = parseFloat(stats.averageOrderValue) || 0;
        const lastOrderDate = stats.lastOrderDate;
        const firstOrderDate = stats.firstOrderDate;

        // Calculate days since last order
        let daysSinceLastOrder = null;
        if (lastOrderDate) {
          const diffTime = Math.abs(new Date() - new Date(lastOrderDate));
          daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Determine customer level based on total spent
        let customerLevel = 'Bronze';
        if (totalSpent >= 2000000) customerLevel = 'VIP';
        else if (totalSpent >= 1000000) customerLevel = 'Gold';
        else if (totalSpent >= 500000) customerLevel = 'Silver';

        // Determine status
        let status = 'new';
        if (totalOrders === 0) status = 'new';
        else if (daysSinceLastOrder <= 30) status = 'active';
        else status = 'inactive';

        return {
          id: user.user_id,
          fullName: user.fullname,
          name: user.fullname, // Keep for backwards compatibility
          email: user.email,
          phoneNumber: user.phone || '',
          phone: user.phone || '', // Keep for backwards compatibility
          gender: user.gender,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}&background=6366f1&color=fff&size=150`,
          totalOrders,
          totalSpent,
          averageOrderValue,
          lastOrder: lastOrderDate,
          firstOrder: firstOrderDate,
          daysSinceLastOrder,
          customerLevel,
          status,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          rating: 4.5, // Default rating - you can implement review system later
          reviews: 0   // Default reviews count
        };
      })
    );

    // Apply level filter after calculating customer levels
    let filteredCustomers = customersWithStats;
    if (level !== 'all') {
      filteredCustomers = customersWithStats.filter(customer => customer.customerLevel === level);
    }

    res.json({
      success: true,
      data: filteredCustomers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      },
      filters: {
        search,
        status,
        level,
        sort,
        order
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ msg: "Gagal mengambil data pelanggan", error: error.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({
      where: { 
        user_id: id,
        role: 'user'
      },
      attributes: [
        'user_id',
        'fullname',
        'email', 
        'phone',
        'gender',
        'avatar',
        'is_active',
        'created_at',
        'last_login'
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: "Pelanggan tidak ditemukan" });
    }

    // Get order statistics
    const { Order } = await import("../models/index.js");
    const orderStats = await Order.findAll({
      where: { user_id: user.user_id },
      attributes: [
        [db.fn('COUNT', db.col('order_id')), 'totalOrders'],
        [db.fn('SUM', db.col('total')), 'totalSpent'],
        [db.fn('AVG', db.col('total')), 'averageOrderValue'],
        [db.fn('MAX', db.col('created_at')), 'lastOrderDate'],
        [db.fn('MIN', db.col('created_at')), 'firstOrderDate']
      ],
      raw: true
    });

    const stats = orderStats[0] || {};
    const totalOrders = parseInt(stats.totalOrders) || 0;
    const totalSpent = parseFloat(stats.totalSpent) || 0;
    const averageOrderValue = parseFloat(stats.averageOrderValue) || 0;
    const lastOrderDate = stats.lastOrderDate;
    const firstOrderDate = stats.firstOrderDate;

    // Calculate days since last order
    let daysSinceLastOrder = null;
    if (lastOrderDate) {
      const diffTime = Math.abs(new Date() - new Date(lastOrderDate));
      daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Determine customer level
    let customerLevel = 'Bronze';
    if (totalSpent >= 2000000) customerLevel = 'VIP';
    else if (totalSpent >= 1000000) customerLevel = 'Gold';
    else if (totalSpent >= 500000) customerLevel = 'Silver';

    // Determine status
    let status = 'new';
    if (totalOrders === 0) status = 'new';
    else if (daysSinceLastOrder <= 30) status = 'active';
    else status = 'inactive';

    const customerData = {
      id: user.user_id,
      name: user.fullname,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}&background=6366f1&color=fff&size=150`,
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrder: lastOrderDate,
      firstOrder: firstOrderDate,
      daysSinceLastOrder,
      customerLevel,
      status,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      rating: 4.5,
      reviews: 0,
      // Additional fields for detail view
      address: '', // You can add address from address table if needed
      city: '',
      province: '',
      birthday: null
    };

    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ msg: "Gagal mengambil data pelanggan", error: error.message });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const {
      fullName,
      name, // fallback for compatibility
      email,
      phoneNumber,
      phone, // fallback for compatibility
      gender = 'male',
      avatar = '',
      password = '123456', // Default password
      isActive = true
    } = req.body;

    // Use fullName or fallback to name for compatibility
    const customerName = fullName || name;
    const customerPhone = phoneNumber || phone;

    // Validation
    if (!customerName || !email || !customerPhone) {
      return res.status(400).json({ msg: "Nama, email, dan telepon harus diisi" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    // Generate user ID
    const { v4: uuidv4 } = await import("uuid");
    const userId = uuidv4();

    // Create user
    const newUser = await User.create({
      user_id: userId,
      fullname: customerName,
      email,
      phone: customerPhone,
      gender,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=6366f1&color=fff&size=150`,
      password: password, // Will be automatically hashed by the model hook
      role: 'user',
      is_active: isActive
    });

    // Return created customer data
    const customerData = {
      id: newUser.user_id,
      fullName: newUser.fullname,
      email: newUser.email,
      phoneNumber: newUser.phone,
      gender: newUser.gender,
      avatar: newUser.avatar,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrder: null,
      firstOrder: null,
      daysSinceLastOrder: null,
      customerLevel: 'Bronze',
      status: 'new',
      isActive: newUser.is_active,
      createdAt: newUser.created_at,
      lastLogin: null,
      rating: 4.5,
      reviews: 0
    };

    // --- Generate referral code sekali pakai (diskon 10%) untuk user baru ---
    let referralCodeData = null;
    try {
      // Import model secara dinamis untuk menghindari circular dependency
      const { ReferralCode } = await import("../models/referralCodeModel.js");
      const { User } = await import("../models/userModel.js");
      // Cari admin paling awal
      const adminUser = await User.findOne({
        where: { role: 'admin' },
        order: [['created_at', 'ASC']]
      });
      // Generate kode unik (6 karakter alfanumerik kapital)
      function generateReferralCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      }
      let code;
      let isUnique = false;
      // Pastikan kode unik
      for (let i = 0; i < 5 && !isUnique; i++) {
        code = generateReferralCode();
        const exist = await ReferralCode.findOne({ where: { code } });
        if (!exist) isUnique = true;
      }
      if (!isUnique) code = code + Date.now().toString().slice(-2); // fallback

      // Buat referral code
      const newReferral = await ReferralCode.create({
        code,
        type: 'percent',
        value: 10,
        description: 'Diskon 10% untuk pendaftar baru, 1x pakai',
        is_active: true,
        usage_limit: 1,
        usage_count: 0,
        owner_user_id: adminUser ? adminUser.user_id : null,
        valid_from: new Date(),
        // valid_until: null, // bisa diatur jika ingin expired
      });
      referralCodeData = {
        code: newReferral.code,
        type: newReferral.type,
        value: newReferral.value,
        description: newReferral.description,
        usage_limit: newReferral.usage_limit,
        owner_user_id: newReferral.owner_user_id
      };
    } catch (err) {
      console.error('[Referral][AutoCreate] error:', err);
    }

    res.status(201).json({
      success: true,
      msg: "Pelanggan berhasil ditambahkan",
      customer: customerData,
      referral: referralCodeData
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ msg: "Gagal menambahkan pelanggan", error: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      name, // fallback for compatibility
      email,
      phoneNumber,
      phone, // fallback for compatibility
      gender,
      avatar,
      password,
      isActive
    } = req.body;

    // Use fullName or fallback to name for compatibility
    const customerName = fullName || name;
    const customerPhone = phoneNumber || phone;

    // Check if customer exists
    const user = await User.findOne({
      where: { 
        user_id: id,
        role: 'user'
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "Pelanggan tidak ditemukan" });
           referral: referralCodeData
    }

    // Check if email is already used by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { 
          email,
          user_id: { [Op.ne]: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ msg: "Email sudah digunakan oleh pengguna lain" });
      }
    }

    // Prepare update data
    const updateData = {};
    if (customerName) updateData.fullname = customerName;
    if (email) updateData.email = email;
    if (customerPhone) updateData.phone = customerPhone;
    if (gender) updateData.gender = gender;
    if (avatar) updateData.avatar = avatar;
    if (password) updateData.password = password; // Will be hashed by the model hook
    if (isActive !== undefined) updateData.is_active = isActive;

    // Update user
    await User.update(updateData, {
      where: { user_id: id }
    });

    // Get updated user data
    const updatedUser = await User.findOne({
      where: { user_id: id }
    });

    res.json({
      success: true,
      msg: "Data pelanggan berhasil diperbarui",
      customer: {
        id: updatedUser.user_id,
        fullName: updatedUser.fullname,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone,
        gender: updatedUser.gender,
        avatar: updatedUser.avatar,
        isActive: updatedUser.is_active
      }
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ msg: "Gagal memperbarui data pelanggan", error: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const user = await User.findOne({
      where: { 
        user_id: id,
        role: 'user'
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "Pelanggan tidak ditemukan" });
    }

    // Check if customer has orders
    const { Order } = await import("../models/index.js");
    const orderCount = await Order.count({
      where: { user_id: id }
    });

    if (orderCount > 0) {
      return res.status(400).json({ 
        msg: "Tidak dapat menghapus pelanggan yang memiliki riwayat pesanan. Silakan nonaktifkan akun pelanggan sebagai gantinya." 
      });
    }

    // Delete user
    await User.destroy({
      where: { user_id: id }
    });

    res.json({ success: true, msg: "Pelanggan berhasil dihapus" });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ msg: "Gagal menghapus pelanggan", error: error.message });
  }
};

// Deactivate customer
export const deactivateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    // Check if customer exists
    const user = await User.findOne({
      where: { 
        user_id: id,
        role: 'user'
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "Pelanggan tidak ditemukan" });
    }

    // Determine new status: use explicit isActive if provided, otherwise toggle
    const newStatus = (typeof isActive === 'boolean') ? isActive : !user.is_active;
    
    await User.update({
      is_active: newStatus
    }, {
      where: { user_id: id }
    });

    res.json({ 
      success: true,
      msg: `Pelanggan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      isActive: newStatus
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ msg: "Gagal mengubah status pelanggan", error: error.message });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.count({
      where: { role: 'user' }
    });

    const activeCustomers = await User.count({
      where: { 
        role: 'user',
        is_active: true
      }
    });

    const inactiveCustomers = await User.count({
      where: { 
        role: 'user',
        is_active: false
      }
    });

    // Get new customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = await User.count({
      where: { 
        role: 'user',
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get customers with orders for revenue calculation
    const { Order } = await import("../models/index.js");
    const revenueData = await Order.findAll({
      attributes: [
        [db.fn('SUM', db.col('total')), 'totalRevenue'],
        [db.fn('AVG', db.col('total')), 'averageOrderValue'],
        [db.fn('COUNT', db.col('order_id')), 'totalOrders']
      ],
      where: {
        status: 'completed'
      },
      raw: true
    });

    const stats = revenueData[0] || {};
    const totalRevenue = parseFloat(stats.totalRevenue) || 0;
    const averageOrderValue = parseFloat(stats.averageOrderValue) || 0;
    const totalOrders = parseInt(stats.totalOrders) || 0;

    // Calculate VIP customers (> 2M total spent) - using a corrected approach
    const vipCustomersResult = await db.query(`
      SELECT COUNT(*) as vipCount
      FROM (
        SELECT u.user_id
        FROM users u
        INNER JOIN orders o ON u.user_id = o.user_id
        WHERE u.role = 'user' AND o.status = 'completed'
        GROUP BY u.user_id
        HAVING SUM(o.total) > 2000000
      ) as vip_users
    `, { 
      type: db.QueryTypes.SELECT 
    });
    
    const vipCustomers = vipCustomersResult[0]?.vipCount || 0;

    res.json({
      success: true,
      data: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        new: newCustomers,
        totalRevenue,
        averageOrderValue,
        vipCustomers: vipCustomers || 0,
        recentCustomers: newCustomers,
        growth: totalCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({ msg: "Gagal mengambil statistik pelanggan", error: error.message });
  }
};

// Export customers data
export const exportCustomers = async (req, res) => {
  try {
    const { format = 'csv', detail = 'customers' } = req.query;

    if (!['csv','xlsx','xls','excel'].includes((format || '').toLowerCase())) {
      return res.status(400).json({ msg: 'format must be csv or xlsx' });
    }

    // Helper to escape CSV values
    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    // Detailed export: one row per order
    if (detail === 'orders') {
      // Use raw query to join orders and users for performance
      const orders = await db.query(`
        SELECT o.order_id, o.user_id, u.fullname as customerName, u.email, u.phone as customerPhone,
               o.created_at as orderDate, o.status, o.total, o.payment_method
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
      `, { type: db.QueryTypes.SELECT });

      const headers = ['Order ID','Order Date','Customer ID','Customer Name','Email','Phone','Status','Total','Payment Method'];

      // If XLSX requested, build workbook
      if (format === 'xlsx' || format === 'xls' || format === 'excel') {
        const ExcelJS = (await import('exceljs')).default;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Orders');

        if (req.query.layout === 'vertical') {
          for (const o of orders) {
            ws.addRow(['Order']);
            ws.addRow(['Order ID', o.order_id]);
            ws.addRow(['Order Date', o.orderDate]);
            ws.addRow(['Customer ID', o.user_id]);
            ws.addRow(['Customer Name', o.customerName]);
            ws.addRow(['Email', o.email]);
            ws.addRow(['Phone', o.customerPhone]);
            ws.addRow(['Status', o.status]);
            ws.addRow(['Total', o.total]);
            ws.addRow(['Payment Method', o.payment_method]);
            ws.addRow([]);
          }
        } else {
          ws.columns = [
            { header: 'Order ID', key: 'order_id', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Customer ID', key: 'user_id', width: 36 },
            { header: 'Customer Name', key: 'customerName', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'customerPhone', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Payment Method', key: 'payment_method', width: 20 }
          ];
          orders.forEach(o => ws.addRow({
            order_id: o.order_id,
            orderDate: o.orderDate,
            user_id: o.user_id,
            customerName: o.customerName,
            email: o.email,
            customerPhone: o.customerPhone,
            status: o.status,
            total: o.total,
            payment_method: o.payment_method
          }));
        }

        const buf = await wb.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="orders_export.xlsx"');
        return res.send(Buffer.from(buf));
      }

      // CSV fallback
      // If layout=vertical requested, produce field-per-row layout for each order
      if (req.query.layout === 'vertical') {
        const lines = [];
        for (const o of orders) {
          lines.push('Order');
          lines.push(`Order ID,${esc(o.order_id)}`);
          lines.push(`Order Date,${esc(o.orderDate)}`);
          lines.push(`Customer ID,${esc(o.user_id)}`);
          lines.push(`Customer Name,${esc(o.customerName)}`);
          lines.push(`Email,${esc(o.email)}`);
          lines.push(`Phone,${esc(o.customerPhone)}`);
          lines.push(`Status,${esc(o.status)}`);
          lines.push(`Total,${esc(o.total)}`);
          lines.push(`Payment Method,${esc(o.payment_method)}`);
          lines.push(''); // empty line between records
        }
        const csv = lines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="orders_export_vertical.csv"');
        return res.send(csv);
      }

      const rows = [headers.join(',')];
      for (const o of orders) {
        rows.push([
          esc(o.order_id),
          esc(o.orderDate),
          esc(o.user_id),
          esc(o.customerName),
          esc(o.email),
          esc(o.customerPhone),
          esc(o.status),
          esc(o.total),
          esc(o.payment_method)
        ].join(','));
      }

      const csv = rows.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="orders_export.csv"');
      return res.send(csv);
    }

    // Default: summary per customer. Prefer DB view `export_customers` if available
    let customersWithStats = [];
    try {
      const viewRows = await db.query('SELECT * FROM export_customers ORDER BY createdAt DESC', { type: db.QueryTypes.SELECT });
      customersWithStats = viewRows.map(r => ({
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        phoneNumber: r.phoneNumber || '',
        gender: r.gender,
        isActive: r.isActive,
        totalOrders: parseInt(r.totalOrders) || 0,
        totalSpent: parseFloat(r.totalSpent) || 0,
        createdAt: r.createdAt
      }));
    } catch (viewErr) {
      console.warn('[exportCustomers] export_customers view not available, falling back to in-app aggregation', viewErr.message);

      // Fallback aggregation
      const users = await User.findAll({
        where: { role: 'user' },
        attributes: [
          'user_id', 'fullname', 'email', 'phone', 'gender', 'is_active', 'created_at'
        ],
        order: [['created_at', 'DESC']]
      });

      const { Order } = await import("../models/index.js");
      customersWithStats = await Promise.all(
        users.map(async (user) => {
          const stats = await Order.findAll({
            where: { user_id: user.user_id },
            attributes: [
              [db.fn('COUNT', db.col('order_id')), 'totalOrders'],
              [db.fn('SUM', db.col('total')), 'totalSpent']
            ],
            raw: true
          });
          const s = stats[0] || {};
          return {
            id: user.user_id,
            fullName: user.fullname,
            email: user.email,
            phoneNumber: user.phone || '',
            gender: user.gender,
            isActive: user.is_active,
            totalOrders: parseInt(s.totalOrders) || 0,
            totalSpent: parseFloat(s.totalSpent) || 0,
            createdAt: user.created_at
          };
        })
      );
    }

    // Build CSV / XLSX
    const headers = ['Customer ID','Full Name','Email','Phone','Gender','Active','Total Orders','Total Spent','Created At'];

    if (format === 'xlsx' || format === 'xls' || format === 'excel') {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Customers');

      if (req.query.layout === 'vertical') {
        for (const c of customersWithStats) {
          ws.addRow(['Customer']);
          ws.addRow(['Customer ID', c.id]);
          ws.addRow(['Full Name', c.fullName]);
          ws.addRow(['Email', c.email]);
          ws.addRow(['Phone', c.phoneNumber]);
          ws.addRow(['Gender', c.gender]);
          ws.addRow(['Active', c.isActive]);
          ws.addRow(['Total Orders', c.totalOrders]);
          ws.addRow(['Total Spent', c.totalSpent]);
          ws.addRow(['Created At', c.createdAt]);
          ws.addRow([]);
        }
      } else {
        ws.columns = [
          { header: 'Customer ID', key: 'id', width: 36 },
          { header: 'Full Name', key: 'fullName', width: 30 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Phone', key: 'phoneNumber', width: 20 },
          { header: 'Gender', key: 'gender', width: 10 },
          { header: 'Active', key: 'isActive', width: 10 },
          { header: 'Total Orders', key: 'totalOrders', width: 15 },
          { header: 'Total Spent', key: 'totalSpent', width: 15 },
          { header: 'Created At', key: 'createdAt', width: 20 }
        ];
        customersWithStats.forEach(c => ws.addRow(c));
      }

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="customers_export.xlsx"');
      return res.send(Buffer.from(buf));
    }

    // CSV fallback
    // If layout=vertical requested, produce field-per-row layout for each customer
    if (req.query.layout === 'vertical') {
      const lines = [];
      for (const c of customersWithStats) {
        lines.push('Customer');
        lines.push(`Customer ID,${esc(c.id)}`);
        lines.push(`Full Name,${esc(c.fullName)}`);
        lines.push(`Email,${esc(c.email)}`);
        lines.push(`Phone,${esc(c.phoneNumber)}`);
        lines.push(`Gender,${esc(c.gender)}`);
        lines.push(`Active,${esc(c.isActive)}`);
        lines.push(`Total Orders,${esc(c.totalOrders)}`);
        lines.push(`Total Spent,${esc(c.totalSpent)}`);
        lines.push(`Created At,${esc(c.createdAt)}`);
        lines.push('');
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="customers_export_vertical.csv"');
      return res.send(csv);
    }

    const out = [headers.join(',')];
    for (const c of customersWithStats) {
      out.push([
        esc(c.id),
        esc(c.fullName),
        esc(c.email),
        esc(c.phoneNumber),
        esc(c.gender),
        esc(c.isActive),
        esc(c.totalOrders),
        esc(c.totalSpent),
        esc(c.createdAt)
      ].join(','));
    }

    const csv = out.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_export.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ msg: "Gagal mengekspor data pelanggan", error: error.message });
  }
};