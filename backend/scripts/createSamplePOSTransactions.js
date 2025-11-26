import { Order, User, Product, OrderItem, LoyaltyPoint, InventoryMovement } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import db from "../config/Database.js";

const createSamplePOSTransactions = async () => {
  const t = await db.transaction();
  
  try {
    console.log('🏪 Creating Sample POS Transactions...\n');

    // Get existing users
    const users = await User.findAll({ limit: 3 });
    if (users.length === 0) {
      throw new Error('No users found. Please create some users first.');
    }

    // Get existing products with valid prices
    const products = await Product.findAll({ 
      where: {
        price: { [Op.gt]: 0 }
      },
      limit: 5 
    });
    if (products.length === 0) {
      throw new Error('No products with valid prices found. Please create some products first.');
    }

    console.log('Available products for testing:');
    products.forEach(p => {
      console.log(`  - ${p.name}: Rp ${Number(p.price).toLocaleString('id-ID')}`);
    });

    const generateOrderNumber = () => {
      const now = new Date();
      const y = now.getFullYear().toString().slice(-2);
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `POS-${y}${m}${d}-${rand}`;
    };

    const awardLoyaltyPoints = async (userId, totalAmount, orderId, transaction) => {
      if (!userId || totalAmount <= 0) return 0;
      
      const pointsEarned = Math.floor(totalAmount / 1000);
      
      if (pointsEarned > 0) {
        await LoyaltyPoint.create({
          user_id: userId,
          points: pointsEarned,
          source: 'order',
          reference_id: orderId,
          note: `Points from POS order ${orderId}: Rp ${totalAmount.toLocaleString('id-ID')} = ${pointsEarned} points`
        }, { transaction });
        
        return pointsEarned;
      }
      
      return 0;
    };

    const sampleTransactions = [
      {
        user: users[0],
        items: [
          { product: products[0], quantity: 2 },
          ...(products[1] ? [{ product: products[1], quantity: 1 }] : [])
        ]
      },
      {
        user: users[1],
        items: [
          { product: products[Math.min(2, products.length - 1)], quantity: 3 },
          ...(products[Math.min(3, products.length - 1)] ? [{ product: products[Math.min(3, products.length - 1)], quantity: 1 }] : [])
        ]
      },
      {
        user: users[2] || users[0],
        items: [
          { product: products[Math.min(4, products.length - 1)] || products[0], quantity: 1 },
          { product: products[0], quantity: 2 }
        ]
      },
      {
        user: users[0], // Same user, different transaction
        items: [
          { product: products[1] || products[0], quantity: 5 },
          { product: products[Math.min(2, products.length - 1)], quantity: 2 }
        ]
      }
    ];

    console.log('\nCreating POS transactions:');
    
    for (let i = 0; i < sampleTransactions.length; i++) {
      const { user, items } = sampleTransactions[i];
      const orderNumber = generateOrderNumber();
      
      // Calculate total from actual product prices
      let calculatedTotal = 0;
      const validItems = [];
      
      for (const item of items) {
        const { product, quantity } = item;
        if (product && product.price) {
          const unitPrice = Number(product.price);
          const lineSubtotal = unitPrice * quantity;
          calculatedTotal += lineSubtotal;
          validItems.push({ product, quantity, unitPrice, lineSubtotal });
        }
      }
      
      if (validItems.length === 0) {
        console.log(`  ⚠️ Skipping transaction for ${user.email} - no valid items`);
        continue;
      }
      
      // Create POS order
      const order = await Order.create({
        order_number: orderNumber,
        channel: 'pos', // POS transaction
        user_id: user.user_id,
        status: 'completed', // POS orders are usually completed immediately
        payment_status: 'paid', // POS payments are immediate
        subtotal: calculatedTotal,
        discount_amount: 0,
        shipping_cost: 0,
        payment_fee: 0,
        total: calculatedTotal,
        customer_note: `POS transaction for ${user.fullname}`
      }, { transaction: t });

      // Create order items
      for (const item of validItems) {
        const { product, quantity, unitPrice, lineSubtotal } = item;

        await OrderItem.create({
          order_id: order.order_id,
          product_id: product.product_id,
          name_snapshot: product.name,
          price_unit: unitPrice,
          quantity: quantity,
          discount_amount: 0,
          subtotal: lineSubtotal,
          cost_at_sale: product.cost_price || 0
        }, { transaction: t });

        // Create inventory movement
        await InventoryMovement.create({
          product_id: product.product_id,
          type: 'pos_sale',
          quantity: -Math.abs(quantity),
          unit_cost: product.cost_price || 0,
          note: `POS Order ${order.order_number}`,
          reference_type: 'order',
          reference_id: order.order_id
        }, { transaction: t });
      }

      // Award loyalty points (1 point per Rp 1,000)
      const pointsAwarded = await awardLoyaltyPoints(user.user_id, calculatedTotal, order.order_id, t);

      console.log(`  ✅ ${orderNumber}: ${user.email} - Rp ${calculatedTotal.toLocaleString('id-ID')} (${pointsAwarded} points)`);
    }

    // Update product stock cache
    const productIds = [...new Set(products.map(p => p.product_id))];
    for (const pid of productIds) {
      const sum = await InventoryMovement.sum('quantity', { where: { product_id: pid }, transaction: t });
      await Product.update({ stock: sum || 0 }, { where: { product_id: pid }, transaction: t });
    }

    await t.commit();
    
    console.log('\n📊 Summary:');
    console.log(`Created ${sampleTransactions.length} POS transactions`);
    console.log('All transactions include automatic loyalty points calculation');
    console.log('Stock levels have been updated');
    
    // Show loyalty points summary
    console.log('\n💰 Loyalty Points Summary:');
    for (const user of users) {
      const totalPoints = await LoyaltyPoint.sum('points', {
        where: { user_id: user.user_id }
      }) || 0;
      
      console.log(`  ${user.email}: ${totalPoints} total points`);
    }

    console.log('\n✅ Sample POS transactions created successfully!');

  } catch (error) {
    await t.rollback();
    console.error('❌ Error creating sample POS transactions:', error);
    throw error;
  }
};

// Run the script
createSamplePOSTransactions().then(() => {
  console.log('\nPOS transactions created. You can now test the membership management system.');
  process.exit(0);
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});