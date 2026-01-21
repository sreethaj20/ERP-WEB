import csrfProtect from './csrf.js';

// Global CSRF enforcement for state-changing requests with a whitelist of paths
// Use this when it's hard to wire csrfProtect() at every route file.
export default function globalCsrf(options = {}) {
  const isSafe = (m) => ['GET', 'HEAD', 'OPTIONS'].includes(String(m || '').toUpperCase());
  const whitelist = new Set(
    (options.whitelist || [
      '/api/auth/login',
      '/api/auth/csrf-token',
      '/api/auth/refresh', // already protected; keep in whitelist to avoid double work
      '/api/shift-requests/public',
    ]).map(String)
  );

  const check = csrfProtect(options);

  return (req, res, next) => {
    try {
      if (isSafe(req.method)) return next();
      const path = req.path || req.originalUrl || '';
      if (whitelist.has(path)) return next();
      return check(req, res, next);
    } catch (e) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }
  };
}
