// Centralized cookie options based on environment for cross-site support
// Env vars:
// - COOKIE_DOMAIN (e.g., .example.com) optional
// - COOKIE_SAMESITE (lax|strict|none) optional; defaults to lax unless CROSS_SITE=true
// - CROSS_SITE (true|false) if true -> sameSite none + secure true
// - FORCE_SECURE_COOKIES (true|false) force secure

function bool(v) {
  return String(v || '').toLowerCase() === 'true';
}

export function buildSessionCookieOptions(maxAgeMs) {
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  const crossSite = bool(process.env.CROSS_SITE);
  const forceSecure = bool(process.env.FORCE_SECURE_COOKIES);
  const domain = process.env.COOKIE_DOMAIN || undefined;
  let sameSite = (process.env.COOKIE_SAMESITE || '').toLowerCase();

  if (!sameSite) sameSite = crossSite ? 'none' : 'lax';
  if (sameSite === 'none') {
    // Browsers require Secure when SameSite=None
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain,
      path: '/',
      maxAge: maxAgeMs,
    };
  }
  return {
    httpOnly: true,
    secure: forceSecure || isProd,
    sameSite: sameSite === 'strict' ? 'strict' : 'lax',
    domain,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function buildCsrfCookieOptions(maxAgeMs) {
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  const crossSite = String(process.env.CROSS_SITE || '').toLowerCase() === 'true';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  let sameSite = (process.env.COOKIE_SAMESITE || '').toLowerCase();
  if (!sameSite) sameSite = crossSite ? 'none' : 'lax';
  const base = {
    httpOnly: false,
    sameSite: sameSite === 'none' ? 'none' : sameSite,
    domain,
    path: '/',
    maxAge: maxAgeMs,
  };
  if (base.sameSite === 'none') {
    return { ...base, secure: true };
  }
  return { ...base, secure: isProd };
}
