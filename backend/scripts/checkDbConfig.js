import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import db from '../config/Database.js';

// Sequelize instance exposes options on private props; we read from env instead for clarity
const effective = {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: (process.env.DB_PASS ? '(set)' : '(empty)') ,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || '3306',
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  DB_POOL_MAX: process.env.DB_POOL_MAX || '5',
  DB_POOL_MIN: process.env.DB_POOL_MIN || '0',
  DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE || '30000',
  DB_POOL_IDLE: process.env.DB_POOL_IDLE || '10000',
  DB_CONNECT_TIMEOUT: process.env.DB_CONNECT_TIMEOUT || '10000',
  NODE_ENV: process.env.NODE_ENV,
};

console.log('[DB CONFIG CHECK] Effective settings:');
console.table(effective);

// Ensure import works (no connection attempted yet)
console.log('[DB CONFIG CHECK] Sequelize instance created successfully (no connection attempted).');
