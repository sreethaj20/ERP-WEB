// src/utils/shiftUtils.js

// Shift configuration
export const SHIFTS = {
  MORNING: {
    name: 'Morning',
    startTime: '09:00',
    endTime: '18:00',
    bufferMinutes: 10,
  },
  EVENING: {
    name: 'Evening',
    startTime: '18:30',
    endTime: '03:30', // next day
    bufferMinutes: 10,
  },
};

// Helpers ---------------------------------------------------------

// Get current time in India timezone as "HH:MM"
const getCurrentTime = () => {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  return formatter.format(now); // "HH:MM"
};

// Convert "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return NaN;
  const [hours, minutes] = parts;
  return hours * 60 + minutes;
};

// Format minutes (may be >=1440 or <0) to "HH:MM"
const formatTime = (minutes) => {
  if (!Number.isFinite(minutes)) return '';
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440; // normalize to [0,1439]
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// Compute next login suggestion (returns minutes since midnight possibly normalized)
const computeNextLoginMinutes = (key, adjNow, adjStart, adjEnd) => {
  // If now is before today's start, suggest start - buffer (adjStart - buffer should be passed by caller)
  // If now is after end, suggest the next shift's login start (we use config)
  if (adjNow < adjStart) {
    return adjStart; // caller can subtract buffer for display if needed
  }
  if (key === 'MORNING') {
    // next is evening start (same day)
    return timeToMinutes(SHIFTS.EVENING.startTime);
  } else {
    // EVENING -> next is morning start (next day)
    return timeToMinutes(SHIFTS.MORNING.startTime);
  }
};

// Main logic ------------------------------------------------------

// isWithinShiftTime accepts options: { forLogin: boolean }
// Returns:
// { isValid: boolean, message: string, reasonCode: string, latestAllowedLogin?: "HH:MM", nextLoginAt?: "HH:MM" }
export const isWithinShiftTime = (shiftType, user = {}, options = { forLogin: false }) => {
  // Admin bypass
  if (user?.role?.toUpperCase() === 'ADMIN') {
    return {
      isValid: true,
      message: 'Admin access granted',
      reasonCode: 'ADMIN'
    };
  }

  // Determine shift
  if (!shiftType) {
    shiftType = getCurrentShift();
    if (!shiftType) {
      return {
        isValid: false,
        message: 'No active shift found. Please contact administrator.',
        reasonCode: 'INVALID_SHIFT'
      };
    }
  }

  const key = shiftType.toUpperCase();
  const shift = SHIFTS[key];
  if (!shift) {
    console.error(`Invalid shift type: ${shiftType}`);
    return {
      isValid: false,
      message: `Invalid shift configuration: ${shiftType}. Please contact administrator.`,
      reasonCode: 'INVALID_SHIFT'
    };
  }

  const nowStr = getCurrentTime();
  const nowMinutes = timeToMinutes(nowStr);
  const startMinutes = timeToMinutes(shift.startTime);
  const endMinutes = timeToMinutes(shift.endTime);
  const buffer = Number.isFinite(shift.bufferMinutes) ? shift.bufferMinutes : 10;
  const startGrace = 10;
  const endGrace = 10;

  if (Number.isNaN(nowMinutes) || Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return {
      isValid: false,
      message: 'Time parsing error. Please check shift configuration.',
      reasonCode: 'TIME_PARSE_ERROR'
    };
  }

  const crossesMidnight = endMinutes <= startMinutes;

  // Normalize timeline for easy comparisons.
  // If shift crosses midnight, treat end as end + 1440; if current time is before start, adjust now +1440
  let adjNow = nowMinutes;
  let adjStart = startMinutes;
  let adjEnd = endMinutes;

  if (crossesMidnight) {
    adjEnd = endMinutes + 1440;
    if (nowMinutes < startMinutes) {
      adjNow = nowMinutes + 1440;
    }
  }

  // Window that counts as "in shift" (includes buffer)
  const windowStart = adjStart - buffer;
  const windowEnd = adjEnd + buffer;
  const isWithinWindow = adjNow >= windowStart && adjNow <= windowEnd;

  // Compute latest allowed login for this shift: adjStart + buffer
  const latestAllowedLoginMins = adjStart + buffer;
  const latestAllowedLoginStr = formatTime(latestAllowedLoginMins);

  // LOGIN CUTOFF enforcement
  if (options.forLogin) {
    if (adjNow > latestAllowedLoginMins) {
      // compute next allowed login suggestion
      let nextLoginMins = computeNextLoginMinutes(key, adjNow, adjStart, adjEnd);
      // For suggestion, prefer start - buffer when next is upcoming
      if (nextLoginMins === adjStart) {
        nextLoginMins = adjStart - buffer;
      } else if (key === 'MORNING') {
        nextLoginMins = timeToMinutes(SHIFTS.EVENING.startTime) - (SHIFTS.EVENING.bufferMinutes || 10);
      } else {
        nextLoginMins = timeToMinutes(SHIFTS.MORNING.startTime);
      }

      return {
        isValid: false,
        message: `Login window closed for ${shift.name}. Last allowed login: ${latestAllowedLoginStr}. Next login at ${formatTime(nextLoginMins)}. Current time: ${formatTime(nowMinutes)}`,
        reasonCode: 'LOGIN_CUTOFF',
        latestAllowedLogin: latestAllowedLoginStr,
        nextLoginAt: formatTime(nextLoginMins)
      };
    }
    // if adjNow <= latestAllowedLoginMins then we proceed to other checks
  }

  // Grace period checks
  const isStartGrace = adjNow >= (adjStart - startGrace) && adjNow <= (adjStart + startGrace);
  const isEndGrace = adjNow > adjEnd && adjNow <= (adjEnd + endGrace);

  if (isWithinWindow) {
    if (isStartGrace && adjNow < adjStart) {
      return {
        isValid: true,
        message: 'Grace period: Shift starting soon. Please be on time.',
        reasonCode: 'START_GRACE',
        latestAllowedLogin: latestAllowedLoginStr
      };
    }
    if (isStartGrace && adjNow >= adjStart) {
      return {
        isValid: true,
        message: 'Grace period: Shift started recently. Please be on time.',
        reasonCode: 'IN_WINDOW',
        latestAllowedLogin: latestAllowedLoginStr
      };
    }
    if (isEndGrace) {
      return {
        isValid: true,
        message: 'Grace period: Shift ended recently. Please log out soon.',
        reasonCode: 'END_GRACE',
        latestAllowedLogin: latestAllowedLoginStr
      };
    }
    return {
      isValid: true,
      message: 'You can log in now.',
      reasonCode: 'IN_WINDOW',
      latestAllowedLogin: latestAllowedLoginStr
    };
  }

  // Outside shift window: suggest next login time
  let suggestedNext;
  if (adjNow < adjStart) {
    suggestedNext = adjStart - buffer;
  } else {
    if (key === 'EVENING') {
      suggestedNext = timeToMinutes(SHIFTS.MORNING.startTime);
    } else {
      suggestedNext = timeToMinutes(SHIFTS.EVENING.startTime) - (SHIFTS.EVENING.bufferMinutes || 10);
    }
  }

  return {
    isValid: false,
    message: `Outside shift hours. Next login at ${formatTime(suggestedNext)}. Current time: ${formatTime(nowMinutes)}`,
    reasonCode: 'OUT_OF_WINDOW',
    nextLoginAt: formatTime(suggestedNext),
    latestAllowedLogin: latestAllowedLoginStr
  };
};

// Wrapper that forwards options
export const canLoginForShift = (shiftType, user = {}, options = { forLogin: false }) => {
  if (!shiftType) {
    return { isValid: false, message: 'No shift specified', reasonCode: 'INVALID_SHIFT' };
  }
  const shiftInfo = getShiftInfo(shiftType);
  if (!shiftInfo) {
    return { isValid: false, message: 'Invalid shift configuration', reasonCode: 'INVALID_SHIFT' };
  }
  return isWithinShiftTime(shiftType, user, options);
};

// canLoginNow: (userShift, user, options)
export const canLoginNow = (userShift, user = {}, options = { forLogin: false }) => {
  if (userShift) {
    const result = canLoginForShift(userShift, user, options);
    return {
      isValid: !!result.isValid,
      message: result.message,
      reasonCode: result.reasonCode,
      latestAllowedLogin: result.latestAllowedLogin,
      nextLoginAt: result.nextLoginAt
    };
  }
  const currentShift = getCurrentShift();
  if (currentShift) {
    const result = canLoginForShift(currentShift, user, options);
    return {
      isValid: !!result.isValid,
      message: result.message,
      reasonCode: result.reasonCode,
      latestAllowedLogin: result.latestAllowedLogin,
      nextLoginAt: result.nextLoginAt
    };
  }
  return { isValid: false, message: 'No active shift found', reasonCode: 'INVALID_SHIFT' };
};

// Get shift info
export const getShiftInfo = (shiftType) => {
  if (!shiftType) return null;
  const shift = SHIFTS[shiftType.toUpperCase()];
  if (!shift) return null;
  return {
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    bufferMinutes: shift.bufferMinutes || 0,
    displayTime: `${shift.startTime} - ${shift.endTime}`,
    displayName: `${shift.name} (${shift.startTime} - ${shift.endTime})`
  };
};

// Get current shift based on IST time
export const getCurrentShift = () => {
  const nowStr = getCurrentTime();
  const nowMinutes = timeToMinutes(nowStr);
  if (Number.isNaN(nowMinutes)) return null;

  const ev = SHIFTS.EVENING;
  const evStart = timeToMinutes(ev.startTime);
  const evEnd = timeToMinutes(ev.endTime);

  if (evEnd <= evStart) {
    // crosses midnight
    if (nowMinutes >= evStart || nowMinutes <= evEnd) return 'EVENING';
  } else {
    if (nowMinutes >= evStart && nowMinutes <= evEnd) return 'EVENING';
  }

  const mn = SHIFTS.MORNING;
  const mnStart = timeToMinutes(mn.startTime);
  const mnEnd = timeToMinutes(mn.endTime);
  if (nowMinutes >= mnStart && nowMinutes <= mnEnd) return 'MORNING';

  return null;
};

export default {
  SHIFTS,
  isWithinShiftTime,
  getShiftInfo,
  canLoginForShift,
  canLoginNow,
  getCurrentShift
};
