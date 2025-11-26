import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to backend folder to avoid CWD issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Normalize and parse env values with sane defaults
const DIALECT = (process.env.DB_DIALECT || 'mysql').toLowerCase();
const HOST = process.env.DB_HOST || '127.0.0.1'; // prefer IPv4 on Windows to avoid ::1 issues
const PORT = parseInt(process.env.DB_PORT || '3306', 10);
const POOL_MAX = parseInt(process.env.DB_POOL_MAX || '5', 10);
const POOL_MIN = parseInt(process.env.DB_POOL_MIN || '0', 10);
const POOL_ACQUIRE = parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10);
const POOL_IDLE = parseInt(process.env.DB_POOL_IDLE || '10000', 10);
const CONNECT_TIMEOUT = parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10);
const LOGGING = (process.env.DB_LOGGING === 'true') ? console.log : false;

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: HOST,
        port: PORT,
        dialect: DIALECT,
        logging: LOGGING,
        pool: {
            max: POOL_MAX,
            min: POOL_MIN,
            acquire: POOL_ACQUIRE,
            idle: POOL_IDLE,
        },
        retry: {
            max: 3,
        },
        dialectOptions: {
            connectTimeout: CONNECT_TIMEOUT,
        },
    }
);

export default db;