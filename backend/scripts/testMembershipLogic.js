import db from '../config/Database.js';
import { User, Order } from '../models/index.js';

/**
 * Test script to verify membership point calculation
 * Verifies: 1 point = Rp 1,000 spent from paid orders
 */
const testMembershipLogic = async () => {
    try {
        console.log('🧪 Testing Membership Point Calculation Logic...');
        
        // Test database connection
        await db.authenticate();
        console.log('✅ Database connection successful');
        
        // Get sample users with orders (exclude admin)
        const users = await User.findAll({
            where: { role: 'user' }, // Only get regular users, not admin
            attributes: ['user_id', 'fullname', 'email', 'role'],
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        
        console.log(`\n📊 Testing ${users.length} users:\n`);
        
        for (const user of users) {
            // Calculate total spent from paid orders
            const totalSpent = await Order.sum('total', {
                where: { 
                    user_id: user.user_id,
                    status: { [db.Sequelize.Op.in]: ['pending', 'processing', 'shipped', 'completed', 'delivered'] },
                    payment_status: { [db.Sequelize.Op.in]: ['paid', 'partial'] }
                }
            }) || 0;
            
            // Calculate points: 1 point = Rp 1,000 spent
            const points = Math.floor(totalSpent / 1000);
            
            // Determine membership level
            let level = 'Starter';
            if (points >= 5000) level = 'VIP';
            else if (points >= 2500) level = 'Gold';
            else if (points >= 1000) level = 'Silver';
            else if (points >= 250) level = 'Bronze';
            
            console.log(`👤 ${user.fullname} (${user.email}) [${user.role}]`);
            console.log(`   💰 Total Spent: Rp ${totalSpent.toLocaleString('id-ID')}`);
            console.log(`   ⭐ Points: ${points.toLocaleString()} points`);
            console.log(`   🏆 Level: ${level}`);
            console.log('');
        }
        
        console.log('✅ Membership logic test completed!');
        console.log('📋 Rules: 1 point = Rp 1,000 spent | VIP: 5000+ | Gold: 2500+ | Silver: 1000+ | Bronze: 250+');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
};

testMembershipLogic();