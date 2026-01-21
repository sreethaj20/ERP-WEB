import jwt from 'jsonwebtoken';
import { findByEmail as findUserByEmail } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...opts });
}

export function auth(required = true) {
  return (req, res, next) => {
    // Prefer HTTP-only cookie token
    const cookieToken = req.cookies && req.cookies.erp_token ? String(req.cookies.erp_token) : null;
    const hdr = req.headers.authorization || '';
    const headerToken = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    const token = cookieToken || headerToken;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      // Enrich with effective role derived from designation when available
      // This aligns backend RBAC with frontend mapping
      (async () => {
        try {
          const user = await findUserByEmail(decoded.email);
          const designation = String(user?.designation || '').trim().toLowerCase();
          const role = String(user?.role || decoded.role || '').trim().toLowerCase();
          const isOneOf = (val, arr) => arr.map(s => s.toLowerCase()).includes(val);
          let effectiveRole = '';
          if (designation) {
            if (isOneOf(designation, ['project manager'])) effectiveRole = 'admin';
            else if (isOneOf(designation, ['team lead'])) effectiveRole = 'teamlead';
            else if (
              designation === 'hr' ||
              designation === 'hrbp' ||
              designation.includes('hr executive') ||
              designation.includes('hr manager') ||
              designation.includes('hrbp') ||
              designation.includes('it recruiter')
            ) effectiveRole = 'hr';
            else if (isOneOf(designation, ['process associate','senior process associate','developer','java developer'])) effectiveRole = 'employee';
          }
          if (!effectiveRole) effectiveRole = role || 'employee';
          // Expose both raw role and normalized role derived from designation
          req.user.rawRole = role; // original stored role
          req.user.role = effectiveRole; // override to match designation mapping (e.g., team lead -> teamlead)
          req.user.designation = user?.designation || req.user.designation;
          req.user.effectiveRole = effectiveRole;
        } catch {
          // On failure, fall back to token role
          req.user.effectiveRole = String(req.user.role || '').toLowerCase() || 'employee';
        }
        next();
      })();
    } catch (e) {
      if (!required) return next();
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function requireRole(...roles) {
  const set = new Set(roles.map(r => String(r).toLowerCase()));
  return (req, res, next) => {
    const role = (req.user?.role || '').toLowerCase();
    const eff = (req.user?.effectiveRole || '').toLowerCase();
    if (set.has(role) || set.has(eff)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
