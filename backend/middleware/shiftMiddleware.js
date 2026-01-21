// backend/middleware/shiftMiddleware.js
// ESM module - createShiftMiddleware default export

/**
 * Shift middleware
 * - Expects getUserShift(req) to return:
 *     - string shiftKey (e.g., 'MORNING')
 *     - OR object { shiftType: 'MORNING', alreadyLoggedInToday: boolean }
 *
 * - Expects shifts param as object or function resolving to a shift config:
 *     { startTime: '09:00', endTime: '18:00', bufferMinutes: 15, displayName: 'Morning' }
 *
 * - Full-day detection:
 *     Treated as full-day (allow always) if any of:
 *       * startMinutes === endMinutes  (common config for 'ANY' typed rows)
 *       * start === 0 && end === 1439  (00:00 - 23:59 explicit)
 *       * shiftKey === 'ANY'
 *
 *  Use createShiftMiddleware({ shifts, getUserShift, timeZone, ... })
 */

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const parts = timeStr.split(':').map((p) => Number(p));
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return NaN;
  const [h, m] = parts;
  return h * 60 + m;
}

function minsToHHMM(mins) {
  if (!Number.isFinite(mins)) return '00:00';
  const m = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function nowMinutesInTimeZone(timeZone) {
  const now = new Date();
  if (!timeZone) {
    return now.getHours() * 60 + now.getMinutes();
  }
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
  const parts = fmt.formatToParts(now);
  const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return Number(hourPart) * 60 + Number(minutePart);
}

/**
 * compute windows for login and work
 */
function computeWindows(shiftCfg, buffer = 0, allowEarlyLogin = false, allowLateLogin = true, allowEarlyWork = false, allowLateWork = true) {
  const s = timeToMinutes(shiftCfg.startTime);
  const e = timeToMinutes(shiftCfg.endTime);
  const b = Number.isFinite(Number(buffer)) ? Math.max(0, Math.floor(Number(buffer))) : 0;

  const workStart = allowEarlyWork ? s - b : s;
  const workEnd = allowLateWork ? e + b : e;

  const loginStart = allowEarlyLogin ? s - b : s;
  const loginEnd = allowLateLogin ? s + b : s;

  return {
    s,
    e,
    b,
    loginWindow: { start: loginStart, end: loginEnd, startHH: minsToHHMM(loginStart), endHH: minsToHHMM(loginEnd) },
    workWindow: { start: workStart, end: workEnd, startHH: minsToHHMM(workStart), endHH: minsToHHMM(workEnd) },
  };
}

export default function createShiftMiddleware(opts = {}) {
  const {
    shifts: shiftsParam,
    getUserShift,
    timeZone = null,
    allowEarlyLogin = false,
    allowLateLogin = true,
    allowEarlyWork = false,
    allowLateWork = true,
    logger = console,
    isExtensionApproved, // async (email) => boolean, optional
    isHalfDayApproved,   // async (email) => boolean, optional
  } = opts;

  if (typeof getUserShift !== 'function') {
    throw new Error('createShiftMiddleware: getUserShift must be provided (async function returning shift or {shiftType, alreadyLoggedInToday})');
  }

  const resolveShiftCfg = async (shiftKey) => {
    if (!shiftKey) return null;
    if (typeof shiftsParam === 'function') {
      const res = shiftsParam(shiftKey);
      if (res && typeof res.then === 'function') return await res;
      return res;
    } else if (typeof shiftsParam === 'object' && shiftsParam !== null) {
      return shiftsParam[String(shiftKey).toUpperCase()] || null;
    }
    return null;
  };

  return async function shiftMiddleware(req, res, next) {
    logger?.info && logger.info(`[shiftMiddleware] entry path=${req.path} method=${req.method} ip=${req.ip}`);

    try {
      const maybe = await getUserShift(req);

      let shiftType = null;
      let alreadyLoggedInToday = null;

      if (!maybe) {
        logger?.info && logger.info('[shiftMiddleware] getUserShift returned null/undefined');
      } else if (typeof maybe === 'string') {
        shiftType = maybe;
      } else if (typeof maybe === 'object') {
        shiftType = maybe.shiftType || maybe.shift || maybe.assignedShift || null;
        if (typeof maybe.alreadyLoggedInToday === 'boolean') {
          alreadyLoggedInToday = maybe.alreadyLoggedInToday;
        }
      }

      if (typeof shiftType === 'string') shiftType = String(shiftType).trim().toUpperCase();

      if (!shiftType) {
        logger?.warn && logger.warn('[shiftMiddleware] blocking login: MISSING_SHIFT');
        return res.status(400).json({ ok: false, code: 'MISSING_SHIFT', message: 'User has no assigned shift' });
      }

      // Admin sentinel or explicit ANY shift -> allow always
      if (String(shiftType).toUpperCase() === 'ANY') {
        logger?.info && logger.info('[shiftMiddleware] bypass allowed: ANY sentinel');
        return next();
      }

      const shiftCfg = await resolveShiftCfg(shiftType);

      if (!shiftCfg) {
        logger?.warn && logger.warn(`[shiftMiddleware] unknown shift type: ${shiftType}`);
        return res.status(400).json({
          ok: false,
          code: 'UNKNOWN_SHIFT',
          message: `Unknown shift type: ${shiftType}`,
          details: { shiftType },
        });
      }

      // Normalize buffer
      const bufferMinutes = Number.isFinite(Number(shiftCfg.bufferMinutes)) ? Math.max(0, Math.floor(Number(shiftCfg.bufferMinutes))) : 0;

      // Convert start/end to minutes (safe)
      const startMins = timeToMinutes(shiftCfg.startTime);
      const endMins = timeToMinutes(shiftCfg.endTime);

      // Full-day detection:
      // - explicit 00:00 - 23:59 (0 - 1439)
      // - or start == end (common sentinel in some configs) -> treat as full-day
      // If a shift truly needs to be zero-length, change config; by default equality means full-day/anytime.
      const isFullDay = (Number.isFinite(startMins) && Number.isFinite(endMins)) &&
        (
          (startMins === 0 && endMins === 1439) ||
          (startMins === endMins)
        );

      if (isFullDay) {
        logger?.info && logger.info(`[shiftMiddleware] full-day detected for shift=${shiftType} start=${minsToHHMM(startMins)} end=${minsToHHMM(endMins)} -> allowing anytime`);
        return next();
      }

      // compute windows
      const { loginWindow, workWindow } = computeWindows(shiftCfg, bufferMinutes, allowEarlyLogin, allowLateLogin, allowEarlyWork, allowLateWork);
      const nowMins = nowMinutesInTimeZone(timeZone);

      const isLoginAttempt = (req.path === '/api/auth/login' || (req.originalUrl && req.originalUrl.includes('/api/auth/login'))) && req.method === 'POST';
      const loggedIn = alreadyLoggedInToday === true;

      logger?.info && logger.info(`[shiftMiddleware] shift=${shiftType} now=${minsToHHMM(nowMins)} loginWindow=${loginWindow.startHH}-${loginWindow.endHH} workWindow=${workWindow.startHH}-${workWindow.endHH} loggedInToday=${loggedIn}`);

      // If this is a login attempt and user hasn't already logged in today => enforce loginWindow
      if (isLoginAttempt && !loggedIn) {
        if (nowMins < loginWindow.start || nowMins > loginWindow.end) {
          logger?.info && logger.info(`[shiftMiddleware] late login detected for shift ${shiftType}`);
          // If an approved extension OR approved half-day exists for today, allow normal login (no late flag)
          try {
            const email = String((req.body && req.body.email) || '').toLowerCase();
            if (email) {
              if (typeof isExtensionApproved === 'function') {
                const approvedExt = await isExtensionApproved(email);
                if (approvedExt) {
                  logger?.info && logger.info('[shiftMiddleware] approved extension found -> allowing normal login');
                  // Signal to controller/UI that an extension was approved so a helpful popup can be shown
                  req.extensionApproved = true;
                  req.extensionMessage = 'Your shift extension request has been approved. Please login again.';
                  return next();
                }
              }
              if (typeof isHalfDayApproved === 'function') {
                const approvedHD = await isHalfDayApproved(email);
                if (approvedHD) {
                  logger?.info && logger.info('[shiftMiddleware] approved half-day found -> allowing normal login');
                  return next();
                }
              }
            }
          } catch {}
          // Otherwise: allow login but mark it as late
          req.lateLogin = true;
          req.shiftInfo = {
            shiftType,
            displayName: shiftCfg.displayName || shiftType,
            loginWindow: {
              start: loginWindow.startHH,
              end: loginWindow.endHH,
              current: minsToHHMM(nowMins)
            }
          };
          return next();
        }
        // inside login window -> allow login
        return next();
      }

      // For non-login attempt or already logged in -> apply normal work window check
      if (nowMins < workWindow.start || nowMins > workWindow.end) {
        logger?.info && logger.info(`[shiftMiddleware] blocking: outside work window for shift ${shiftType}`);
        return res.status(403).json({
          ok: false,
          code: 'SHIFT_TIME_RESTRICTED',
          message: `Action restricted outside working hours (${workWindow.startHH} - ${workWindow.endHH})`,
          details: {
            shiftType,
            displayName: shiftCfg.displayName || shiftType,
            loginWindow,
            workWindow,
            now: minsToHHMM(nowMins),
            bufferMinutes,
          }
        });
      }

      // allowed
      return next();
    } catch (err) {
      logger?.error && logger.error('[shiftMiddleware] error', err);
      return res.status(500).json({ ok: false, code: 'SHIFT_MIDDLEWARE_ERROR', message: String(err) });
    }
  };
}

export { timeToMinutes, minsToHHMM as nowToHHMM, nowMinutesInTimeZone, computeWindows };
