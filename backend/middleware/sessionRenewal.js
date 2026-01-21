import jwt from 'jsonwebtoken';
import { signToken } from './auth.js';
import { buildSessionCookieOptions } from '../utils/cookies.js';

// Middleware: refresh JWT cookie if it will expire in <= 5 minutes.
// Non-invasive: if token missing/invalid, it does nothing (let downstream auth handle it).
export default function sessionRenewal(options = {}) {
  const cookieName = options.cookieName || 'erp_token';
  const renewWindowSec = Number(options.renewWindowSec || 300); // 5 minutes
  return (req, res, next) => {
    try {
      const cookieToken = req.cookies && req.cookies[cookieName] ? String(req.cookies[cookieName]) : null;
      const hdr = req.headers.authorization || '';
      const headerToken = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      const token = cookieToken || headerToken;
      if (!token) return next();

      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
      const decoded = jwt.verify(token, JWT_SECRET);

      const nowSec = Math.floor(Date.now() / 1000);
      const expSec = Number(decoded.exp || 0);
      const timeLeft = expSec - nowSec;
      if (Number.isFinite(timeLeft) && timeLeft > 0 && timeLeft <= renewWindowSec) {
        const { iat, exp, nbf, aud, iss, sub, jti, ...payload } = decoded;
        const refreshed = signToken(payload, { expiresIn: '15m' });
        res.cookie(cookieName, refreshed, buildSessionCookieOptions(15 * 60 * 1000));
      }
      return next();
    } catch (_e) {
      // ignore errors and continue
      return next();
    }
  };
}
