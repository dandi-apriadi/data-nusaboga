import db from '../config/Database.js';
import { User, LoyaltyPoint, Order, OrderItem, Product } from '../models/index.js';

/**
 * Test membership database connectivity and required tables
 */
const testMembershipDatabase = async () => {
    try {
        console.log('🧪 Testing Membership Database Connection...');
        
        // Test database connection
        await db.authenticate();
        console.log('✅ Database connection successful');
        
        // Test User table
        const userCount = await User.count();
        console.log(`✅ Users table: ${userCount} records`);
        
        // Test LoyaltyPoint table  
        const pointCount = await LoyaltyPoint.count();
        console.log(`✅ LoyaltyPoints table: ${pointCount} records`);
        
        // Test Order table
        const orderCount = await Order.count();
        console.log(`✅ Orders table: ${orderCount} records`);
        
        // Test association queries (what membership management uses)
        console.log('\n🔍 Testing membership queries...');
        
        // Test user points query (same as in membershipController)
        const usersWithPoints = await User.findAll({
            attributes: ['user_id', 'fullname', 'email', 'created_at'],
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        
        console.log(`✅ Found ${usersWithPoints.length} users for membership management`);
        
        // Test total points calculation
        const totalPointsAwarded = await LoyaltyPoint.sum('points') || 0;
        console.log(`✅ Total points in database: ${totalPointsAwarded}`);
        
        // Test order history query
        if (usersWithPoints.length > 0) {
            const testUserId = usersWithPoints[0].user_id;
            const userOrders = await Order.count({
                where: { user_id: testUserId }
            });
            console.log(`✅ User ${testUserId} has ${userOrders} orders`);
        }
        
        console.log('\n🎉 All membership database tests passed!');
        console.log('📊 Membership Management is ready to connect to database');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        console.error('💡 Make sure to:');
        console.error('   1. Check database credentials in .env file');
        console.error('   2. Ensure MySQL/database server is running');
        console.error('   3. Run database migrations/sync if needed');
        process.exit(1);
    } finally {
        await db.close();
    }
};

// Run test
testMembershipDatabase();