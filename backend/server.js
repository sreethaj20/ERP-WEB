// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import csrfProtect from './middleware/csrf.js';
import { auth as authMiddleware } from './middleware/auth.js';
import { refresh as refreshController, csrfToken as csrfTokenController } from './controllers/authController.js';
import sessionRenewal from './middleware/sessionRenewal.js';
import globalCsrf from './middleware/globalCsrf.js';
import globalValidator from './middleware/globalValidator.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import hrQueryRoutes from './routes/hrQueryRoutes.js';
import shiftRequestRoutes from './routes/shiftRequestRoutes.js';
import adminQueryRoutes from './routes/adminQueryRoutes.js';
import updatesRoutes from './routes/updatesRoutes.js';

import { findByEmail as findUserByEmail, createUser as createUserModel } from './models/userModel.js';
import { pool } from './utils/pg.js';
import ipFilter from './middleware/ipFilter.js';
import createShiftMiddleware from './middleware/shiftMiddleware.js';
import { isApprovedExtensionToday } from './models/shiftRequestModel.js';
import { isHalfDayApprovedToday } from './models/leaveModel.js';
import { loadShiftConfigFromDB, getShiftByKey } from './utils/shiftConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// Security & performance hardening
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());

// Rate limiting
const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const isLoopback = (ip) => ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
const devSkip = (req) => !isProd || isLoopback(req.ip);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: devSkip,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  skip: devSkip,
});

const corsOptions = {
  origin: function (origin, callback) {
    const defaults = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4000',
      'http://127.0.0.1:4000'
    ];
    const fromEnv = String(process.env.CORS_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const allowedOrigins = [...new Set([...defaults, ...fromEnv])];

    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Headers',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(ipFilter());
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// Apply general rate limit on all API routes
app.use('/api', generalLimiter);
// Global session renewal: refresh JWT cookie if close to expiry
app.use(sessionRenewal());
// Global CSRF protection for state-changing routes (double-submit cookie)
app.use(globalCsrf());
// Global request validator (body/query/params) before routes
app.use(globalValidator());

app.get('/', (_req, res) => res.send('ERP backend running. Try GET /api/health'));
// Plain health endpoint for ALB/monitors
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// CSRF token endpoint for double-submit cookie strategy
app.get('/api/auth/csrf-token', csrfTokenController);

// Startup DB check and load shift cache
(async () => {
  try {
    await pool.query('select 1');
    console.log('Postgres connection: OK');
    await loadShiftConfigFromDB();
  } catch (e) {
    console.error('Postgres connection: FAILED', e?.message || e);
  }
})();

// helper: getUserShiftFromReq (robust, uses model then raw SQL fallback)
async function getUserShiftFromReq(req) {
  try {
    // Prefer decoded token user if present
    if (req.user && (req.user.shift || req.user.shiftType)) {
      const s = String(req.user.shift || req.user.shiftType).trim().toUpperCase();
      // If token contains a flag indicating presence, pass it through
      const already = req.user && typeof req.user.alreadyLoggedInToday === 'boolean' ? req.user.alreadyLoggedInToday : null;
      return { shiftType: s, alreadyLoggedInToday: already };
    }

    const email = (req.body?.email || req.query?.email || '').toString().trim().toLowerCase();
    if (!email) return null;

    // 1) Try model helper
    let user = null;
    try {
      user = await findUserByEmail(email);
    } catch (e) {
      console.warn('[getUserShiftFromReq] model lookup failed:', e?.message || e);
      user = null;
    }

    // If user found via model and is admin -> bypass
    if (user && user.role && String(user.role).toLowerCase() === 'admin') {
      return { shiftType: 'ANY', alreadyLoggedInToday: true };
    }

    // If model provided a shift, prefer it (but still check attendance)
    // We'll use raw SQL fallback if model.shift missing
    let shiftFromModel = user && user.shift ? String(user.shift).trim().toUpperCase() : null;

    // Raw DB fallback to guarantee reading the same DB
    const { rows } = await pool.query('SELECT email, role, shift FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
    const row = rows && rows[0] ? rows[0] : null;
    if (row) {
      if (!shiftFromModel && row.shift) shiftFromModel = String(row.shift).trim().toUpperCase();
      // admin by raw DB
      if (row.role && String(row.role).toLowerCase() === 'admin') {
        return { shiftType: 'ANY', alreadyLoggedInToday: true };
      }
    }

    const shiftType = shiftFromModel || null;
    if (!shiftType) {
      // no shift configured
      return null;
    }

    // Now check if user already logged in today (attendance table)
    // Adjust this query to match your attendance schema (status field name etc.)
    try {
      const todayQ = await pool.query(
        `SELECT 1 FROM attendance WHERE LOWER(email) = LOWER($1) AND date = CURRENT_DATE AND LOWER(status) = 'present' LIMIT 1`,
        [email]
      );
      const alreadyLoggedInToday = (todayQ.rows && todayQ.rows.length > 0);
      return { shiftType, alreadyLoggedInToday };
    } catch (attErr) {
      console.warn('[getUserShiftFromReq] attendance check failed:', attErr?.message || attErr);
      // if attendance check fails, be conservative: return alreadyLoggedInToday = false
      return { shiftType, alreadyLoggedInToday: false };
    }

  } catch (err) {
    console.error('[getUserShiftFromReq] unexpected error', err);
    return null;
  }
}

// create shift middleware instance (DB-backed)
const shiftMiddlewareInstance = createShiftMiddleware({
  shifts: async (shiftKey) => getShiftByKey(shiftKey),
  getUserShift: getUserShiftFromReq,
  timeZone: process.env.SHIFT_TIMEZONE || 'Asia/Kolkata',
  // Correct option names consumed by shiftMiddleware
  allowEarlyLogin: true,
  allowLateLogin: true,
  allowEarlyWork: true,
  allowLateWork: true,
  logger: console,
  // Allow login outside window if TL has approved an extension today
  isExtensionApproved: isApprovedExtensionToday,
  // Also allow normal login when a half-day leave is approved for today
  isHalfDayApproved: isHalfDayApprovedToday,
});

// IMPORTANT: mount shift middleware strictly for POST /login BEFORE mounting authRoutes
app.post('/api/auth/login', shiftMiddlewareInstance);

// mount auth routes (contains POST /login)
app.use('/api/auth', authLimiter, authRoutes);
// Session refresh endpoint protected by auth and CSRF
app.post('/api/auth/refresh', authMiddleware(), csrfProtect(), refreshController);

// mount other routes
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/hr-queries', hrQueryRoutes);
app.use('/api/admin-queries', adminQueryRoutes);
app.use('/api/shift-requests', shiftRequestRoutes);
app.use('/api/updates', updatesRoutes);

// Debug endpoint — guarded by ENABLE_DEBUG_ROUTES and disabled in production
if (String(process.env.ENABLE_DEBUG_ROUTES || '').toLowerCase() === 'true' && !isProd) {
  app.get('/_debug/shifts', (_req, res) => {
    try {
      const sample = getShiftByKey('MORNING') || null;
      res.json({ ok: true, sample });
    } catch (e) {
      res.status(500).json({ ok: false, message: String(e) });
    }
  });
}

// static data
app.use('/api/_data', express.static(path.join(__dirname, 'data')));

// global error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ERP backend running on http://localhost:${PORT}`);
});

// Seed default admin only when explicitly enabled via env flag
if (String(process.env.SEED_ADMIN_ON_START || '').toLowerCase() === 'true') {
  (async () => {
    try {
      const admin = await findUserByEmail('admin@erp.com');
      if (!admin) {
        await createUserModel({
          email: 'admin@erp.com',
          password: 'admin123',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          department: 'Administration',
          designation: 'Admin',
        });
        console.log('Seeded default admin: admin@erp.com / admin123');
      }
    } catch (e) {
      console.warn('Admin seed failed:', e?.message || e);
    }
  })();
}
