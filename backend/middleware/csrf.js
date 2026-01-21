import crypto from 'crypto';

// Simple double-submit cookie CSRF protection
// Usage: app.use(csrfProtect()) OR per-route: router.post('/x', csrfProtect(), handler)
export default function csrfProtect(options = {}) {
  const headerName = options.headerName || 'x-csrf-token';
  const cookieName = options.cookieName || 'erp_csrf';
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

  return (req, res, next) => {
    // Skip CSRF check for safe methods
    if (safeMethods.has(String(req.method || '').toUpperCase())) return next();

    try {
      const tokenFromHeader = String(req.headers[headerName] || req.headers[headerName.toLowerCase()] || '').trim();
      const tokenFromCookie = String((req.cookies && req.cookies[cookieName]) || '').trim();
      if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
      return next();
    } catch (e) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }
  };
}

// Utility to generate a CSRF token (not wired automatically)
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}
