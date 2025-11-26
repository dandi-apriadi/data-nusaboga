import { Order, User, LoyaltyPoint, OrderItem, Product } from "../models/index.js";
import { Op } from "sequelize";
import db from "../config/Database.js";

const testLoyaltyPointsSystem = async () => {
  try {
    console.log('🔍 Testing Loyalty Points System...\n');

    // Test 1: Check if loyalty points are being calculated correctly
    console.log('1. Checking loyalty points calculation...');
    
    const loyaltyPoints = await LoyaltyPoint.findAll({
      where: { source: 'order' },
      include: [{
        model: User,
        attributes: ['email', 'fullname']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log(`Found ${loyaltyPoints.length} loyalty point records from orders:`);
    loyaltyPoints.forEach(point => {
      console.log(`  - User: ${point.User?.email || 'Unknown'} | Points: ${point.points} | Ref: ${point.reference_id} | Note: ${point.note}`);
    });

    // Test 2: Check orders with channel information
    console.log('\n2. Checking orders by channel...');
    
    const ordersByChannel = await Order.findAll({
      attributes: [
        'channel',
        [db.fn('COUNT', db.col('order_id')), 'count'],
        [db.fn('SUM', db.col('total')), 'total_amount']
      ],
      group: ['channel'],
      raw: true
    });

    console.log('Orders by channel:');
    ordersByChannel.forEach(stat => {
      console.log(`  - ${stat.channel}: ${stat.count} orders, Total: Rp ${Number(stat.total_amount || 0).toLocaleString('id-ID')}`);
    });

    // Test 3: Check user points calculation
    console.log('\n3. Testing user points calculation...');
    
    const usersWithPoints = await User.findAll({
      attributes: ['user_id', 'email', 'fullname'],
      limit: 5
    });

    for (const user of usersWithPoints) {
      const totalPoints = await LoyaltyPoint.sum('points', {
        where: { user_id: user.user_id }
      }) || 0;

      const totalOrders = await Order.count({
        where: { user_id: user.user_id }
      });

      const totalSpent = await Order.sum('total', {
        where: { 
          user_id: user.user_id,
          status: { [Op.in]: ['pending', 'processing', 'shipped', 'completed', 'delivered'] },
          payment_status: { [Op.in]: ['paid', 'partial'] }
        }
      }) || 0;

      // Calculate expected points (1 point per Rp 1,000)
      const expectedPoints = Math.floor(totalSpent / 1000);

      console.log(`  User: ${user.email}`);
      console.log(`    Total Spent: Rp ${totalSpent.toLocaleString('id-ID')}`);
      console.log(`    Current Points: ${totalPoints}`);
      console.log(`    Expected Points: ${expectedPoints}`);
      console.log(`    Points Match: ${totalPoints === expectedPoints ? '✅' : '❌'}`);
      console.log(`    Total Orders: ${totalOrders}`);
      console.log('');
    }

    // Test 4: Verify point sources
    console.log('4. Checking point sources...');
    
    const pointSources = await LoyaltyPoint.findAll({
      attributes: [
        'source',
        [db.fn('COUNT', db.col('point_id')), 'count'],
        [db.fn('SUM', db.col('points')), 'total_points']
      ],
      group: ['source'],
      raw: true
    });

    console.log('Points by source:');
    pointSources.forEach(source => {
      console.log(`  - ${source.source}: ${source.count} transactions, ${source.total_points} total points`);
    });

    // Test 5: Recent order and point correlation
    console.log('\n5. Checking recent order-point correlation...');
    
    const recentOrders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      attributes: ['order_id', 'order_number', 'user_id', 'total', 'channel', 'status', 'payment_status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log(`Found ${recentOrders.length} recent orders:`);
    for (const order of recentOrders) {
      const relatedPoints = await LoyaltyPoint.findOne({
        where: { reference_id: order.order_id }
      });

      const expectedPoints = Math.floor(order.total / 1000);
      
      console.log(`  Order: ${order.order_number} (${order.channel.toUpperCase()})`);
      console.log(`    Total: Rp ${order.total.toLocaleString('id-ID')}`);
      console.log(`    Status: ${order.status} | Payment: ${order.payment_status || 'unpaid'}`);
      console.log(`    Expected Points: ${expectedPoints}`);
      console.log(`    Awarded Points: ${relatedPoints?.points || 0} ${relatedPoints ? '✅' : '❌'}`);
      console.log('');
    }

    console.log('✅ Loyalty Points System Test Completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testLoyaltyPointsSystem().then(() => {
  console.log('Test finished. You can now verify the loyalty points system is working correctly.');
  process.exit(0);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});