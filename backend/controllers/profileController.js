import { User, Order, Notification, LoyaltyPoint } from '../models/index.js';
import { verifyUser } from '../middleware/AuthUser.js';
import { Op } from 'sequelize';

// Helper: derive membership level & color from totalPoints (rule aligned with membershipController.js logic)
function computeMembership(totalPoints) {
  let level = 'Starter';
  let color = 'gray';
  if (totalPoints >= 5000) { level = 'VIP'; color = 'indigo'; }
  else if (totalPoints >= 2500) { level = 'Gold'; color = 'amber'; }
  else if (totalPoints >= 1000) { level = 'Silver'; color = 'slate'; }
  else if (totalPoints >= 250) { level = 'Bronze'; color = 'orange'; }
  return { level, color };
}

// GET /api/profile/summary
export const getProfileSummary = async (req, res) => {
  try {
    const userId = req.session?.user_id;
    console.log('[ProfileSummary] session user_id:', userId, 'sessionID:', req.sessionID);
    if (!userId) return res.status(401).json({ msg: 'Mohon login terlebih dahulu' });

    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id','fullname','email','gender','phone','avatar','date_of_birth','whatsapp_number','street_address','province','city','district','postal_code','bio','created_at','updated_at','role']
    });
    if(!user){
      console.log('[ProfileSummary] user not found for id', userId);
    }
    if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });

    // Order stats (include multiple active statuses similar to membership logic)
    const orderWhere = { user_id: userId };
  const totalOrders = await Order.count({ where: orderWhere });
  console.log('[ProfileSummary] totalOrders:', totalOrders);
    // Total belanja agregat (semua status aktif) – tetap ditampilkan sebagai "Total Belanja"
    const totalSpent = await Order.sum('total', {
      where: {
        ...orderWhere,
        status: { [Op.in]: ['pending','processing','shipped','completed'] },
        payment_status: { [Op.in]: ['paid','partial'] }
      }
    }) || 0;
    // Total belanja yang benar-benar selesai (completed/shipped) untuk perhitungan points & level
    const completedStatuses = ['completed','shipped'];
    const completedSpent = await Order.sum('total', {
      where: {
        ...orderWhere,
        status: { [Op.in]: completedStatuses },
        payment_status: { [Op.in]: ['paid','partial'] }
      }
    }) || 0;
    const completedOrders = await Order.count({ where: { ...orderWhere, status: { [Op.in]: completedStatuses } } });
    console.log('[ProfileSummary] totalSpent:', totalSpent);

    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  // Points rule: 1 point per Rp 1,000 spent (hanya dari order selesai)
  const totalPoints = Math.floor(completedSpent / 1000);

    // LoyaltyPoint rows (optional detailed history)
    const loyaltyRows = await LoyaltyPoint.findAll({
      where: { user_id: userId },
      order: [['created_at','DESC']],
      limit: 20 // cap for summary
    });
    console.log('[ProfileSummary] loyaltyRows count:', loyaltyRows.length);

    // Notifications
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at','DESC']],
      limit: 20
    });
    console.log('[ProfileSummary] notifications count:', notifications.length);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const { level: membership_level, color: membership_color } = computeMembership(totalPoints);

    res.json({
      success: true,
      data: {
        user: user,
        membership: {
          membership_level,
          membership_color,
          total_points: totalPoints,
          next_level_points: membership_level === 'VIP' ? null : (
            membership_level === 'Gold' ? 5000 :
            membership_level === 'Silver' ? 2500 :
            membership_level === 'Bronze' ? 1000 : 250
          ),
          // points remaining to next level (if any)
          points_to_next: membership_level === 'VIP' ? 0 : (
            (membership_level === 'Gold' ? 5000 :
             membership_level === 'Silver' ? 2500 :
             membership_level === 'Bronze' ? 1000 : 250) - totalPoints
          )
        },
        orders: {
          total_orders: totalOrders,
          total_spent: totalSpent,
          completed_orders: completedOrders,
          completed_spent: completedSpent,
          avg_order_value: avgOrderValue
        },
        points_history: loyaltyRows,
        notifications: {
          unread_count: unreadCount,
            recent: notifications
        }
      }
    });
  } catch (e) {
    console.error('Profile summary error:', e);
    res.status(500).json({ success: false, msg: 'Gagal mengambil ringkasan profil', error: e.message });
  }
};

// PATCH /api/profile  (basic profile update)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.session?.user_id;
    if (!userId) return res.status(401).json({ msg: 'Mohon login terlebih dahulu' });

    console.log('[ProfileController] updateProfile called for user_id:', userId, 'body:', req.body);

    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });

    // Allowed fields to update
    const allowed = ['fullname','email','phone','gender','date_of_birth','whatsapp_number','street_address','province','city','district','postal_code','bio'];
    const payload = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined && req.body[f] !== null) {
        payload[f] = req.body[f];
      }
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ msg: 'Tidak ada data yang diubah' });
    }

    // Basic validation
    if (payload.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      return res.status(400).json({ msg: 'Format email tidak valid' });
    }
    if (payload.gender && !['male','female'].includes(payload.gender)) {
      return res.status(400).json({ msg: 'Gender tidak valid' });
    }

    await user.update(payload);
    // Remove password if any
    if (user.dataValues.password) delete user.dataValues.password;
    console.log('[ProfileController] updateProfile success for user_id:', userId);

    res.json({ success: true, msg: 'Profil berhasil diperbarui', data: { user } });
  } catch (e) {
    console.error('Update profile error:', e);
    // Handle unique email constraint
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ msg: 'Email sudah digunakan' });
    }
    res.status(500).json({ msg: 'Gagal memperbarui profil', error: e.message });
  }
};
