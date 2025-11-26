import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import cors from 'cors';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import crypto from 'crypto';
import db from './config/Database.js';
import * as Models from './models/index.js';
import apiRouter from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { ensurePaymentMethods } from './scripts/ensurePaymentMethods.js';

// Initialize Express app
const app = express();

// Serve static uploads (banner images, proofs, etc.) using an absolute path
// NOTE: Keep a single, correct mapping to avoid overriding with wrong relative paths
// Resolve relative to this file's directory to be robust regardless of process.cwd()
const uploadsAbsolutePath = path.join(__dirname, 'public/uploads');
app.use(
    '/uploads',
    (req, res, next) => {
        // CORS headers to allow embedding images from any origin
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        // Allow cross-origin resource embedding (for <img>, <video>, etc.)
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        // Cache for 24h; nginx may provide longer caching for direct alias hits
        res.header('Cache-Control', 'public, max-age=86400');
        if (req.method === 'OPTIONS') return res.status(200).end();
        next();
    },
    express.static(uploadsAbsolutePath)
);

// Trust proxy for production (important for session cookies)
if (process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

// CORS Configuration - Updated for better image support
app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
                process.env.CLIENT_ORIGIN || "http://localhost:3000",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            ];
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(null, true); // Allow all origins for development
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["Set-Cookie"],
        preflightContinue: false,
        optionsSuccessStatus: 200
    })
);

const sessionStore = SequelizeStore(session.Store);

// Create session store with database
const store = new sessionStore({
    db: db,
    tableName: process.env.SESSION_TABLE_NAME || 'Sessions',
    checkExpirationInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 15 * 60 * 1000,
    expiration: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
    onError: (error) => {
        console.error('Session store error:', error);
    },
    retry: {
        max: 3,
        timeout: 30000
    }
});

// Middleware
app.use(helmet());
// Increase body size limits to accommodate base64 image uploads (payment proof, etc.)
// Default ~100kb was causing PayloadTooLargeError for ~105kb requests.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '5mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || '5mb' }));
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    abortOnLimit: true,
    responseOnLimit: "File too large"
}));

// (Removed duplicate '/uploads' static mapping that pointed to a wrong relative path)

// Also apply CORS to general public folder for anonymous access
app.use('/public', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cache-Control', 'public, max-age=86400');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
}, express.static("public"));

app.use(
    session({
        secret: process.env.SESS_SECRET || "default_secret_key",
        resave: false,
        saveUninitialized: false,
        store: store,
        rolling: true,
        cookie: {
            secure: process.env.NODE_ENV === "production" ? false : false,
            httpOnly: true,
            maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
        },
        name: process.env.SESSION_NAME || 'iot.session.id',
        genid: (req) => {
            return crypto.randomBytes(16).toString('hex');
        }
    })
);
// Primary API mount
app.use('/api', apiRouter);
// Versioned alias for v1 (frontend currently calling /api/v1/*)
// Keep both so existing clients using /api still work.
app.use('/api/v1', apiRouter);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.APP_PORT || process.env.PORT || 5000;

const initializeDatabase = async () => {
    try {
        console.log('Connecting to database...');
        await db.authenticate();
        console.log('Database connection has been established successfully.');

        // Load all models and relations
        const { initializeRelations } = Models;
        if (initializeRelations) {
            initializeRelations();
        }

    // Sync strategy: configurable to avoid excessive ALTER and index overflow
    // NOTE: Some columns (e.g. invoice_number, tax_amount, shipping_insurance) are intentionally
    // commented out in models to match current DB schema and avoid "Unknown column" errors.
    // After adding those columns via proper migration, uncomment the fields in the models.
        const SYNC_MODE = (process.env.DB_SYNC_MODE || 'safe').toLowerCase();
        if (SYNC_MODE === 'force') {
            await db.sync({ force: true });
            console.log('Database synchronized with FORCE (all tables dropped/recreated).');
        } else if (SYNC_MODE === 'alter') {
            await db.sync({ alter: true });
            console.log('Database synchronized with ALTER (migrations inferred).');
        } else {
            await db.sync();
            console.log('Database synchronized in SAFE mode (no alter/force).');
        }

        try {
            await store.sync();
            console.log('Session store synchronized successfully.');
            await store.length();
        } catch (sessionError) {
            console.error('Session store sync failed:', sessionError);
            try {
                await db.query(`
                    CREATE TABLE IF NOT EXISTS Sessions (
                        sid VARCHAR(36) NOT NULL PRIMARY KEY,
                        expires DATETIME,
                        data TEXT,
                        createdAt DATETIME NOT NULL,
                        updatedAt DATETIME NOT NULL
                    )
                `);
            } catch (manualError) {
                console.error('Manual session table creation failed:', manualError);
                throw new Error('Session store initialization failed');
            }
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

// Start server after database initialization
const startServer = async () => {
    await initializeDatabase();
    // Batch convert semua gambar lama ke webp saat server start
    try {
        // Pastikan fs tersedia
        let fs;
        try {
            fs = (await import('fs')).default || (await import('fs'));
        } catch (e) {
            fs = require('fs');
        }
        const { spawn } = await import('child_process');
        const scriptPath = path.join(__dirname, 'scripts', 'convertAllImagesToWebp.js');
        if (fs.existsSync(scriptPath)) {
            const proc = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
            proc.on('close', code => {
                if (code === 0) {
                    console.log('Batch convert images to webp selesai.');
                } else {
                    console.warn('Batch convert images to webp gagal, code:', code);
                }
            });
        }
    } catch (e) {
        console.warn('Batch convert images to webp gagal dijalankan:', e.message);
    }
    // Optional auto-sync static blog categories
    if (process.env.AUTO_SYNC_BLOG_CATEGORIES === 'true') {
        try {
            const syncModulePath = './scripts/syncStaticBlogCategories.js';
            // Dynamic import to avoid cost when not enabled
            const { default: syncFn } = await import(syncModulePath).catch(() => ({ default: null }));
            if (!syncFn) {
                // Fallback: execute script via fs require style
                const syncScript = await import('./scripts/syncStaticBlogCategories.js');
                if (syncScript?.default) await syncScript.default();
            }
        } catch (e) {
            console.warn('Auto sync blog categories failed (non fatal):', e.message);
        }
    }
    
    // Start the HTTP server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 CORS Origin: ${process.env.CLIENT_ORIGIN || "http://localhost:3000"}`);
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        if (process.env.AUTO_SYNC_BLOG_CATEGORIES === 'true') {
            console.log('🗂️  AUTO_SYNC_BLOG_CATEGORIES enabled');
        }
        // Ensure base payment methods exist (non-blocking)
        ensurePaymentMethods().catch(e=> console.warn('[Init] ensurePaymentMethods failed:', e.message));
    });
};

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
