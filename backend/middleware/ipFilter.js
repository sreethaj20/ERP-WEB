import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

/**
 * Normalize IPs to handle IPv4 / IPv6 consistency
 */
function normalizeIp(ip) {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";
  return ip.trim();
}

/**
 * Safely extract the client IP from headers or socket
 */
export function getClientIp(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers["x-real-ip"] ||
    "";
  return normalizeIp(ip);
}

/**
 * Append logs for auditing
 */
function logToFile(message) {
  try {
    const logDir = path.resolve("logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logPath = path.join(logDir, "ip-access.log");
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logPath, line, "utf8");
  } catch (err) {
    console.warn(" Failed to write to log file:", err.message);
  }
}

export default function ipFilter() {
  // Load exempt designations dynamically from .env
  const EXEMPT_ROLES = String(process.env.IP_BYPASS_ROLES || "")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);

  return function (req, res, next) {
    // Skip IP check for login routes or auth-less APIs
    const cleanPath = req.path?.toLowerCase()?.replace(/\/+$/, "");
    if (
      cleanPath === "/api/auth/login" ||
      cleanPath === "/login" ||
      cleanPath === "/api/auth/register"
    ) {
      return next();
    }

    const allowList =
      process.env.IP_ALLOWLIST?.split(",").map((ip) => normalizeIp(ip)) || [];
    const clientIp = getClientIp(req);

    // Decode token if present
    const token = req.headers.authorization?.split(" ")[1];
    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.warn(" Invalid or expired token:", err.message);
      }
    }

    // Skip restriction for exempt designations
    if (user?.designation) {
      const desig = String(user.designation).toLowerCase().trim();
      if (EXEMPT_ROLES.includes(desig)) {
        const msg = ` IP check bypassed for ${desig} (${clientIp})`;
        console.log(msg);
        logToFile(msg);
        return next();
      }
    }

    // Enforce IP restriction
    if (allowList.length && !allowList.includes(clientIp)) {
      const warnMsg = ` Unauthorized IP attempt from: ${clientIp} (Path: ${req.path})`;
      console.warn(warnMsg);
      logToFile(warnMsg);
      return res.status(403).json({
        success: false,
        message: "Access restricted to authorized network only.",
        ip: clientIp,
      });
    }

    const okMsg = ` IP allowed: ${clientIp} (Path: ${req.path})`;
    console.log(okMsg);
    logToFile(okMsg);
    next();
  };
}
// import net from 'net';

// // Extract client IP, considering proxies
// function getClientIp(req) {
//   try {
//     const xff = (req.headers['x-forwarded-for'] || '').split(',').map(s => s.trim()).filter(Boolean);
//     if (xff.length > 0) return normalizeIp(xff[0]);
//   } catch (_) {}
//   const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || req.headers['x-real-ip'];
//   return normalizeIp(ip);
// }

// // Normalize IPv6-wrapped IPv4 like ::ffff:1.2.3.4 and strip scope
// function normalizeIp(ip) {
//   if (!ip) return '';
//   let s = String(ip).trim();
//   if (s.startsWith('::ffff:')) s = s.replace('::ffff:', '');
//   if (s.includes('%')) s = s.split('%')[0];
//   if (s === '::1') return '127.0.0.1';
//   return s;
// }

// // Parse env allowlist: comma-separated IPs. Supports single IPs only for now.
// function parseAllowlist(envVal) {
//   return String(envVal || '')
//     .split(',')
//     .map(s => String(s || '').trim())
//     .filter(Boolean);
// }

// // IPv4 helpers to support CIDR ranges like 192.168.0.0/24
// function ipv4ToLong(ipv4) {
//   const parts = String(ipv4).split('.').map(n => parseInt(n, 10));
//   if (parts.length !== 4 || parts.some(n => !Number.isFinite(n) || n < 0 || n > 255)) return null;
//   return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
// }

// function isIpv4InCidr(ip, cidr) {
//   const [base, maskStr] = String(cidr).split('/');
//   const mask = parseInt(maskStr, 10);
//   if (!Number.isFinite(mask) || mask < 0 || mask > 32) return false;
//   const ipLong = ipv4ToLong(ip);
//   const baseLong = ipv4ToLong(base);
//   if (ipLong === null || baseLong === null) return false;
//   const maskBits = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
//   return (ipLong & maskBits) === (baseLong & maskBits);
// }

// // Check if client IP is allowed by any entry in allowlist. Entries can be exact IP or IPv4 CIDR.
// function isIpAllowed(allowlist, clientIpRaw) {
//   const ip = normalizeIp(clientIpRaw);
//   if (!ip) return false;
//   const isV4 = net.isIP(ip) === 4;
//   for (const entryRaw of (allowlist || [])) {
//     const entry = String(entryRaw).trim();
//     if (!entry) continue;
//     // CIDR
//     if (entry.includes('/')) {
//       if (isV4 && isIpv4InCidr(ip, entry)) return true;
//       continue; // no IPv6 CIDR support here
//     }
//     // Exact IP match (normalize both sides)
//     if (normalizeIp(entry) === ip) return true;
//   }
//   return false;
// }

// // Middleware factory
// export default function ipFilter(options = {}) {
//   const { allow = process.env.IP_ALLOWLIST } = options;
//   const allowlist = Array.isArray(allow) ? allow : parseAllowlist(allow);

//   return function (req, res, next) {
//     // If no allowlist configured, allow by default to avoid accidental lockout.
//     if (!allowlist || allowlist.length === 0) return next();

//     const clientIp = getClientIp(req);
//     const ok = isIpAllowed(allowlist, clientIp);

//     if (!ok) {
//       return res.status(403).json({
//         message: 'Unauthorized network',
//         ip: clientIp,
//       });
//     }
//     next();
//   };
// }

 // export { getClientIp, parseAllowlist, isIpAllowed };

