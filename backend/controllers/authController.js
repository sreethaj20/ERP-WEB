import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth.js';
import { createUser, findByEmail } from '../models/userModel.js';
import { listByEmail as listAttendanceByEmail, upsertAttendance, setLoginTime, setLogoutTime } from '../models/attendanceModel.js';
import { listByEmail as listLeavesByEmail } from '../models/leaveModel.js';
import { getClientIp } from '../middleware/ipFilter.js';
import { getShiftByKey, loadShiftConfigFromDB } from '../utils/shiftConfig.js';
import crypto from 'crypto';
import { buildSessionCookieOptions, buildCsrfCookieOptions } from '../utils/cookies.js';

export async function register(req, res, next) {
  try {
    const { 
      email, password, role, firstName, lastName, department, designation,
      empId, dateOfJoining, teamLeadEmail,
      // extended profile fields
      bloodGroup, dateOfBirth, coreEducation,
      // shift fields
      shift,
    } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await createUser({ 
      email, password, role, firstName, lastName, department, designation,
      empId, dateOfJoining, teamLeadEmail,
      bloodGroup, dateOfBirth, coreEducation,
      shift,
    });
    const token = signToken({ email: user.email, role: user.role, empId: user.empId }, { expiresIn: '15m' });
    try {
      res.cookie('erp_token', token, buildSessionCookieOptions(15 * 60 * 1000));
    } catch {}
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(password || ''), user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Designation-based IP policy: bypass for specific designations only (flexible contains match)
    const rawDesig = String(user.designation || user.position || '').trim().toLowerCase();
    const bypassPhrases = [
      'admin',             // e.g., 'admin', 'system admin', 'administrator'
      'project manager',   // e.g., 'sr project manager'
      'java developer',    // e.g., 'senior java developer'
      'developer'          // generic devs
    ];
    const isBypass = rawDesig && bypassPhrases.includes(rawDesig);
    try { console.log('[login] user:', email, '| designation:', rawDesig || '(empty)', '| bypass:', isBypass); } catch {}

    if (!isBypass) {
      // Enforce IP allowlist
      const clientIp = (getClientIp(req) || '').trim();
      try { console.log('[login] clientIp:', clientIp); } catch {}
      const normalize = (ip) => {
        if (!ip) return '';
        let s = String(ip).trim();
        if (s.startsWith('::ffff:')) s = s.replace('::ffff:', '');
        if (s.includes('%')) s = s.split('%')[0];
        if (s === '::1') return '127.0.0.1';
        return s;
      };
      const allowlist = String(process.env.IP_ALLOWLIST || '')
        .split(',')
        .map(s => normalize(s))
        .filter(Boolean);
      try { console.log('[login] allowlist:', allowlist); } catch {}
      if (allowlist.length > 0) {
        const allowed = allowlist.includes(normalize(clientIp));
        try { console.log('[login] allowedByIP:', allowed); } catch {}
        if (!allowed) return res.status(403).json({ message: 'Unauthorized network', ip: clientIp });
      }
      // If no allowlist configured, allow by default to avoid lockout
    }

    const safe = { ...user, passwordHash: undefined };

    // ✅ Updated JWT payload with designation
    const shiftKey = (user.shift || user.shiftType || '').toString().trim().toUpperCase();
    let shiftData = null;
    if (shiftKey) {
      shiftData = getShiftByKey(shiftKey);
      if (!shiftData) {
        try { await loadShiftConfigFromDB(); shiftData = getShiftByKey(shiftKey); } catch {}
      }
    }
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      empId: user.empId,
      designation: user.designation,
      lateLogin: req.lateLogin || false,
      ...(req.shiftInfo ? { shiftInfo: req.shiftInfo } : {}),
      ...(shiftData ? { shiftData, shiftdata: shiftData } : {}),
      ...(req.extensionApproved ? { extensionApproved: true, extensionMessage: (req.extensionMessage || 'Your shift extension request has been approved. Please login again.') } : {})
    }, { expiresIn: '15m' });

    // Set HTTP-only cookie
    try {
      res.cookie('erp_token', token, buildSessionCookieOptions(15 * 60 * 1000));
    } catch {}

    const response = {
      user: safe,
      token,
      ...(shiftData ? { shiftData, shiftdata: shiftData } : {}),
      ...(req.extensionApproved ? { extensionApproved: true, extensionMessage: (req.extensionMessage || 'Your shift extension request has been approved. Please login again.') } : {})
    };
    if (req.lateLogin) {
      response.lateLogin = true;
      response.shiftInfo = req.shiftInfo;
    }

    // Capture first login time for today's attendance (does not overwrite if already set)
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      await setLoginTime({ email: user.email, date: `${y}-${m}-${d}`, loginTime: `${hh}:${mm}` });
    } catch {}
    
    res.json(response);
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const email = (req.user?.email || '').toLowerCase();
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    const u = await findByEmail(email);
    if (!u) return res.status(404).json({ error: 'Not found' });
    const safe = { ...u, passwordHash: undefined };
    res.json({ me: safe });
  } catch (e) { next(e); }
}

export async function refresh(req, res, next) {
  try {
    if (!req.user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const { iat, exp, nbf, aud, iss, sub, jti, ...payload } = req.user || {};
    const token = signToken(payload, { expiresIn: '15m' });
    try {
      res.cookie('erp_token', token, buildSessionCookieOptions(15 * 60 * 1000));
    } catch {}
    res.json({ ok: true });
  } catch (e) { next(e); }
}

export async function csrfToken(_req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  try {
    res.cookie('erp_csrf', token, buildCsrfCookieOptions(60 * 60 * 1000));
  } catch {}
  res.json({ csrfToken: token });
}

// Clear auth cookies immediately (no attendance side-effects)
export async function logoutClear(_req, res) {
  try {
    const sessOpts = buildSessionCookieOptions(0);
    delete sessOpts.maxAge;
    res.clearCookie('erp_token', sessOpts);
  } catch {}
  try {
    const csrfOpts = buildCsrfCookieOptions(0);
    delete csrfOpts.maxAge;
    res.clearCookie('erp_csrf', csrfOpts);
  } catch {}
  res.json({ ok: true });
}

// Enforced logout: deny if today's worked hours < 9 (except Wednesday)
// Helpers for local date handling
const todayLocalYMD = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export async function logoutEnforced(req, res, next) {
  try {
    const user = req.user;
    if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    const isWednesday = today.getDay() === 3;
    const ymd = todayLocalYMD();

    // Determine if logout is allowed
    const isAdmin = String(user.role || '').toLowerCase() === 'admin';
    const finalFlag = (String(req.body?.final || req.query?.final || '').toLowerCase() === 'true') || req.body?.final === true;

    const rows = await listAttendanceByEmail(user.email);
    const todayRec = (rows || []).find(r => String(r.date || '').slice(0,10) === ymd);
    // Convert stored TIME ('HH:MM[:SS]') to total minutes
    const timeToMins = (v) => {
      if (!v) return 0;
      if (typeof v === 'number') return Math.max(0, Math.round(v * 60));
      const s = String(v);
      if (!s.includes(':')) {
        const num = Number(s);
        return Number.isFinite(num) ? Math.max(0, Math.round(num * 60)) : 0;
      }
      const [hh, mm, ss] = s.split(':').map(x => Number(x));
      const h = Number.isFinite(hh) ? hh : 0;
      const m = Number.isFinite(mm) ? mm : 0;
      // ignore seconds for allowance
      return Math.max(0, h * 60 + m);
    };
    const workedMins = timeToMins(todayRec?.hours);
    // Optional client-provided live minutes (from frontend timer)
    const clientMinsRaw = req.body?.workedMinutes;
    const clientMins = Number.isFinite(Number(clientMinsRaw)) ? Math.max(0, Math.floor(Number(clientMinsRaw))) : 0;
    // Prefer the larger value to prevent blocking logout if DB hasn't captured today's hours yet
    const effectiveMins = Math.max(workedMins, clientMins);

    let allowed = false;
    let reason = '';

    // Half-day leave rule: if a half-day leave is approved for today, allow logout after 4 hours from approval time
    let halfDayApprovedAt = null;
    try {
      const leaves = await listLeavesByEmail(user.email);
      const todayLeaves = (leaves || []).filter(l => String(l.from).slice(0,10) === ymd && String(l.to).slice(0,10) === ymd);
      const isHalf = (l) => {
        const ty = String(l.type || '').toLowerCase();
        return ty.includes('half') || Number(l.duration) === 0.5 || !!l.partOfDay;
      };
      const approvedHalf = todayLeaves.find(l => String(l.status || '').toLowerCase() === 'approved' && isHalf(l));
      if (approvedHalf) {
        const ts = approvedHalf.updatedAt || approvedHalf.createdAt;
        if (ts) halfDayApprovedAt = new Date(ts).getTime();
      }
    } catch {}

    const nowMs = Date.now();
    const halfDayUnlockOk = halfDayApprovedAt ? (nowMs - halfDayApprovedAt) >= (4 * 60 * 60 * 1000) : false;

    if (isAdmin) { allowed = true; reason = 'admin_bypass'; }
    else if (isWednesday) { allowed = true; reason = 'weekly_off'; }
    else if (halfDayUnlockOk) { allowed = true; reason = 'halfday_unlock'; }
    else if (effectiveMins >= 9 * 60) { allowed = true; reason = 'hours_ok'; }

    if (!allowed) {
      // If half-day approved but 4h not elapsed, show remaining to 4h; otherwise show remaining to 9h
      if (halfDayApprovedAt) {
        const remainingMs = Math.max(0, (4 * 60 * 60 * 1000) - (nowMs - halfDayApprovedAt));
        const remaining = Math.ceil(remainingMs / (60 * 1000));
        return res.status(403).json({
          error: 'Half-day logout available after 4 hours from approval',
          halfDay: true,
          remainingMinutes: remaining,
          remainingHours: Number((remaining / 60).toFixed(2)),
        });
      } else {
        const remaining = Math.max(0, 9 * 60 - effectiveMins);
        return res.status(403).json({
          error: 'Minimum 9 hours required before logout',
          worked: Math.floor(effectiveMins / 60) + ':' + String(effectiveMins % 60).padStart(2, '0'),
          workedMinutes: effectiveMins,
          remainingMinutes: remaining,
          remainingHours: Number((remaining / 60).toFixed(2)),
        });
      }
    }

    // Final logout: deduct 60 minutes from the worked time and persist; no clamp to 8h
    if (finalFlag) {
      const pad = (n) => String(n).padStart(2, '0');
      // Apply deduction on effective minutes only when finalizing
      const deductedMins = Math.max(0, effectiveMins - 60); // basic non-negative guard
      const hhmm = `${pad(Math.floor(deductedMins / 60))}:${pad(deductedMins % 60)}`; // no seconds
      try {
        await upsertAttendance({ email: user.email, date: ymd, status: todayRec?.status || 'Present', hours: hhmm });
      } catch (e) {
        // non-fatal; still allow logout
        console.warn('Failed to apply 1hr deduction on logout:', e?.message || e);
      }

      // Capture logout time for today's attendance (overwrite to keep last logout)
      try {
        const now = new Date();
        const out = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        await setLogoutTime({ email: user.email, date: ymd, logoutTime: out });
      } catch {}
      try {
        const sessOpts = buildSessionCookieOptions(0);
        delete sessOpts.maxAge;
        res.clearCookie('erp_token', sessOpts);
      } catch {}
      try {
        const csrfOpts = buildCsrfCookieOptions(0);
        delete csrfOpts.maxAge;
        res.clearCookie('erp_csrf', csrfOpts);
      } catch {}
      return res.json({ ok: true, worked: effectiveMins, adjusted: hhmm, reason, adjustment: 'deduct_60m' });
    }

    return res.json({ ok: true, worked: effectiveMins, reason, adjustment: 'none' });
  } catch (e) { next(e); }
}
