import dotenv from 'dotenv';
dotenv.config();
import db from '../config/Database.js';
import { User } from '../models/userModel.js';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';

async function run() {
  try {
    await db.authenticate();
    console.log('DB connected');

    const existing = await User.count({ where: { role: 'user' } });
    if (existing > 0) {
      console.log('Users already exist, aborting seed.');
      process.exit(0);
    }

    const plainPassword = 'User12345!';
    const hashed = await argon2.hash(plainPassword, { type: argon2.argon2id });

    const samples = [
      { fullname: 'Andi Pratama', email: 'andi@example.com', gender: 'male', phone: '08111111111' },
      { fullname: 'Budi Santoso', email: 'budi@example.com', gender: 'male', phone: '08122222222' },
      { fullname: 'Citra Dewi', email: 'citra@example.com', gender: 'female', phone: '08133333333' },
      { fullname: 'Dian Putri', email: 'dian@example.com', gender: 'female', phone: '08144444444' },
    ];

    for (const s of samples) {
      await User.create({
        user_id: uuidv4(),
        fullname: s.fullname,
        email: s.email,
        password: hashed,
        role: 'user',
        gender: s.gender,
        phone: s.phone,
        is_active: true
      });
    }

    console.log('Seeded sample customers (password semua: ' + plainPassword + ')');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
}

run();
