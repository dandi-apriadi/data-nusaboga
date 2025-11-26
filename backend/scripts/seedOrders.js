import dotenv from 'dotenv';
dotenv.config();

import db from '../config/Database.js';
import * as Models from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

// Simple order number generator (duplicated lightly from controller for script use)
const generateOrderNumber = () => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NB-${y}${m}${d}-${rand}`;
};

async function ensureProducts() {
  const { Product } = Models;
  const count = await Product.count();
  if (count >= 3) return await Product.findAll({ limit: 5 });

  console.log('[SeedOrders] Creating sample products...');
  const samples = [
    { name: 'Abon Cakalang Premium 100g', price: 35000, cost_price: 20000, stock: 100, active: true },
    { name: 'Dendeng Cakalang Manis Pedas 150g', price: 42000, cost_price: 26000, stock: 80, active: true },
    { name: 'Cakalang Fufu Asap 500g', price: 95000, cost_price: 60000, stock: 40, active: true },
    { name: 'Sambal Rica Cakalang 200g', price: 30000, cost_price: 17000, stock: 120, active: true },
    { name: 'Keripik Cakalang Renyah 100g', price: 28000, cost_price: 16000, stock: 90, active: true },
  ];
  const created = [];
  for (const s of samples) {
    created.push(await Product.create({ product_id: uuidv4(), ...s }));
  }
  return created;
}

async function seedOrders() {
  const { initializeRelations } = Models;
  const { Order, OrderItem, InventoryMovement, Product } = Models;

  console.log('[SeedOrders] Authenticating DB...');
  await db.authenticate();
  initializeRelations();
  await db.sync();

  const existing = await Order.count();
  if (existing > 0) {
    console.log(`[SeedOrders] Skipping: there are already ${existing} orders.`);
    return;
  }

  const products = await ensureProducts();

  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const channels = ['online', 'pos'];

  console.log('[SeedOrders] Creating sample orders...');
  for (let i = 0; i < 8; i++) {
    const status = statuses[i % statuses.length];
    const channel = channels[i % channels.length];
    const order_number = generateOrderNumber();

    const chosen = products.slice(0, (i % products.length) + 1);
    const subtotal = chosen.reduce((s, p) => s + Number(p.price), 0);
    const discount_amount = 0;
    const shipping_cost = channel === 'online' ? 15000 : 0;
    const payment_fee = 0;
    const total = subtotal - discount_amount + shipping_cost + payment_fee;

    const order = await Order.create({
      order_id: uuidv4(),
      order_number,
      channel,
      status,
      priority: i % 5 === 0 ? 'high' : 'normal',
      subtotal,
      discount_amount,
      shipping_cost,
      payment_fee,
      total,
      payment_status: status === 'completed' ? 'paid' : 'unpaid',
      ship_receiver_name: 'Customer Demo',
      ship_phone: '08123456789',
      ship_address_detail: 'Jl. Contoh No. 123',
      ship_district: 'Wanea',
      ship_city: 'Manado',
      ship_province: 'Sulawesi Utara',
      ship_postal_code: '95119',
      created_at: new Date(Date.now() - i * 86400000),
    });

    for (const p of chosen) {
      await OrderItem.create({
        order_item_id: uuidv4(),
        order_id: order.order_id,
        product_id: p.product_id,
        name_snapshot: p.name,
        price_unit: p.price,
        quantity: 1,
        subtotal: p.price,
        discount_amount: 0,
        cost_at_sale: p.cost_price,
        created_at: new Date(),
      });

      await InventoryMovement.create({
        movement_id: uuidv4(), // if model defines PK differently adjust accordingly
        product_id: p.product_id,
        type: channel === 'pos' ? 'pos_sale' : 'sale',
        quantity: -1,
        unit_cost: p.cost_price,
        note: `Seed order ${order_number}`,
        reference_type: 'order',
        reference_id: order.order_id,
        created_at: new Date(),
      }).catch(() => {}); // ignore if model auto-generates id or schema differs
    }

    // update product stock cache
    for (const p of chosen) {
      const sum = await Models.InventoryMovement.sum('quantity', { where: { product_id: p.product_id } });
      await Product.update({ stock: sum || 0 }, { where: { product_id: p.product_id } });
    }
  }

  console.log('[SeedOrders] Done. Sample orders inserted.');
}

seedOrders()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[SeedOrders] Failed:', e);
    process.exit(1);
  });
