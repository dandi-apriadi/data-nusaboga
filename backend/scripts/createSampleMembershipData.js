import db from '../config/Database.js';
import { User, LoyaltyPoint, Order, OrderItem, Product } from '../models/index.js';

/**
 * Create sample data for testing membership management
 */
const createSampleMembershipData = async () => {
    try {
        console.log('🌱 Creating sample membership data...');
        
        await db.authenticate();
        console.log('✅ Database connected');
        
        // Get existing users
        const users = await User.findAll();
        console.log(`📋 Found ${users.length} existing users`);
        
        if (users.length === 0) {
            console.log('❌ No users found. Please create users first.');
            return;
        }
        
        // Create sample loyalty points for each user
        const samplePoints = [
            { points: 100, source: 'order', note: 'Points from order #001' },
            { points: 250, source: 'promo', note: 'Welcome bonus' },
            { points: 50, source: 'manual', note: 'Customer service bonus' },
            { points: 300, source: 'order', note: 'Points from order #002' },
            { points: 150, source: 'promo', note: 'Birthday bonus' }
        ];
        
        for (const user of users) {
            // Create random points for each user
            const numPoints = Math.floor(Math.random() * 3) + 1; // 1-3 point entries per user
            
            for (let i = 0; i < numPoints; i++) {
                const randomPoint = samplePoints[Math.floor(Math.random() * samplePoints.length)];
                
                await LoyaltyPoint.create({
                    user_id: user.user_id,
                    points: randomPoint.points + Math.floor(Math.random() * 100), // Add some variation
                    source: randomPoint.source,
                    note: `${randomPoint.note} - User ${user.email}`,
                    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
                });
            }
            
            console.log(`✅ Created loyalty points for user: ${user.email}`);
        }
        
        // Verify data creation
        const totalUsers = await User.count();
        const totalPoints = await LoyaltyPoint.count();
        const totalPointsSum = await LoyaltyPoint.sum('points') || 0;
        
        console.log('\n📊 Sample Data Summary:');
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`🎯 Total Point Records: ${totalPoints}`);
        console.log(`💎 Total Points Awarded: ${totalPointsSum}`);
        console.log(`📈 Average Points per User: ${Math.round(totalPointsSum / totalUsers)}`);
        
        console.log('\n🎉 Sample membership data created successfully!');
        console.log('🚀 MembershipManagement component is now ready to display real data');
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error);
    } finally {
        await db.close();
    }
};

// Run script
createSampleMembershipData();