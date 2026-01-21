import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppState, actions as appActions, selectors as appSelectors } from "../state/store.jsx";

// Single source of truth for default password used across the app
const DEFAULT_PASSWORD = 'Password@001';

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

const normalizeEmail = (email = "") => (email || "").toString().trim().toLowerCase();

const withDefaults = (u = {}) => {
  // Helper function to handle date fields
  const formatDate = (dateStr) => {
    if (!dateStr) return null; // Return null for empty dates
    // If it's already a valid date string, return it as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return dateStr;
    // If it's a Date object, format it
    if (dateStr instanceof Date && !isNaN(dateStr)) return dateStr.toISOString().split('T')[0];
    // Otherwise, return null
    return null;
  };

  return {
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    username: u.username || (u.email ? u.email.split("@")[0] : ""),
    email: normalizeEmail(u.email || ""),
    password: u.password || "",
    address: u.address || "",
    phone: u.phone || "",
    role: (u.role || "employee").toLowerCase(),
    status: u.status || "Active",
    department: u.department || "",
    // Prefer designation, falling back to legacy position
    designation: u.designation || u.position || "",
    teamLeadEmail: u.teamLeadEmail || "",
    // Handle date fields with the formatDate helper
    dateOfJoining: formatDate(u.dateOfJoining),
    dateOfBirth: formatDate(u.dateOfBirth),
    // Shift information
    shift: u.shift || "MORNING",
    // Additional profile fields
    empId: u.empId || "",
    bloodGroup: u.bloodGroup || "",
    coreEducation: u.coreEducation || "",
    attendance: u.attendance || [],
    tasks: u.tasks || [],
    wellness: u.wellness || [],
  };
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const rawUsers = localStorage.getItem("erpUsers");
      if (!rawUsers) return [];
      const parsed = JSON.parse(rawUsers);
      return Array.isArray(parsed) ? parsed.map(withDefaults) : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const rawCurrent = localStorage.getItem("erpUser");
      if (!rawCurrent) return null;
      return withDefaults(JSON.parse(rawCurrent));
    } catch {
      return null;
    }
  });
  // Minute-level tick to force reactive updates of time-based metrics (avg, live worked time)
  const [minuteTick, setMinuteTick] = useState(0);
  const API = (import.meta.env && import.meta.env.VITE_API_BASE) ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '') : '/api';
  const dispatch = useAppDispatch();
  const appState = useAppState();
  const csrfToken = appSelectors.csrfToken(appState);

  // SHIFT modal state (opened when server blocks login due to shift timing)
  // { open: bool, details: { shiftType, startTime, endTime, bufferMinutes }, pendingPayload: any }
  const [shiftModal, setShiftModal] = useState({ open: false, details: null, pendingPayload: null });

  // Helper: fetch and store CSRF token
  const refreshCsrf = async () => {
    try {
      const res = await fetch(`${API}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.csrfToken) dispatch(appActions.setCsrfToken(data.csrfToken));
      return data?.csrfToken || null;
    } catch {
      return null;
    }
  };

  // Generic JSON fetch helper using relative /api paths; auto-attaches CSRF when needed
  const fetchJSON = async (path, opts = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(opts.headers || {}),
    };

    // Attach CSRF token for state-changing requests when available
    const method = String(opts.method || 'GET').toUpperCase();
    const isStateChanging = !['GET','HEAD','OPTIONS'].includes(method);
    if (isStateChanging && csrfToken && !headers['X-CSRF-Token'] && !headers['x-csrf-token']) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    try {
      // Add a client-side timeout so the UI fails fast on unreachable backends
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API}${path}`, {
        method: opts.method || 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
        signal: controller.signal,
        ...opts,
        // Ensure body is not included in the spread if it's undefined
        ...(opts.body ? { body: opts.body } : {})
      });
      clearTimeout(to);

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        const backendMsg = (data && (data.message || data.error)) || null;
        const error = new Error(backendMsg || 'Request failed');
        error.status = res.status;
        error.data = data;
        // If CSRF failed, refresh token and retry once
        const shouldRetry = res.status === 403 && isStateChanging;
        if (shouldRetry) {
          const newToken = await refreshCsrf();
          if (newToken) {
            const retryHeaders = { ...headers, 'X-CSRF-Token': newToken };
            const retryRes = await fetch(`${API}${path}`, {
              method: opts.method || 'POST',
              headers: retryHeaders,
              credentials: 'include',
              mode: 'cors',
              signal: controller.signal,
              ...opts,
              ...(opts.body ? { body: opts.body } : {})
            });
            const retryData = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              const msg = (retryData && (retryData.message || retryData.error)) || 'Request failed';
              const err = new Error(msg);
              err.status = retryRes.status;
              err.data = retryData;
              throw err;
            }
            return retryData;
          }
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      // Reduce console noise: mute unauthorized/forbidden, warn other 4xx, error for 5xx
      const status = error?.status;
      if (status === 401 || status === 403) {
        // expected in some flows (e.g., employee creating notifications)
      } else if (status && status >= 400 && status < 500) {
        console.warn('API Warning:', error);
      } else {
        console.error('API Error:', error);
      }
      // Friendlier messages for network/timeout cases
      if (error?.name === 'AbortError') {
        throw new Error('Request timed out. Please check your network');
      }
      if (!status) {
        // Typically TypeError: Failed to fetch
        throw new Error('Unable to reach server. Verify network and API URL.');
      }
      throw error;
    }
  };

  const fetchFormData = async (path, { method = 'POST', body, headers: extraHeaders = {} } = {}) => {
    const headers = {
      'Accept': 'application/json',
      ...(extraHeaders || {}),
    };

    const m = String(method || 'POST').toUpperCase();
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(m);
    if (isStateChanging && csrfToken && !headers['X-CSRF-Token'] && !headers['x-csrf-token']) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 120000);

      const res = await fetch(`${API}${path}`.replace(/\/+$/, ''), {
        method: m,
        headers,
        credentials: 'include',
        mode: 'cors',
        signal: controller.signal,
        body,
      });
      clearTimeout(to);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const backendMsg = (data && (data.message || data.error)) || null;
        const error = new Error(backendMsg || 'Request failed');
        error.status = res.status;
        error.data = data;

        const shouldRetry = res.status === 403 && isStateChanging;
        if (shouldRetry) {
          const newToken = await refreshCsrf();
          if (newToken) {
            const retryHeaders = { ...headers, 'X-CSRF-Token': newToken };
            const retryRes = await fetch(`${API}${path}`.replace(/\/+$/, ''), {
              method: m,
              headers: retryHeaders,
              credentials: 'include',
              mode: 'cors',
              signal: controller.signal,
              body,
            });
            const retryData = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              const msg = (retryData && (retryData.message || retryData.error)) || 'Request failed';
              const err = new Error(msg);
              err.status = retryRes.status;
              err.data = retryData;
              throw err;
            }
            return retryData;
          }
        }
        throw error;
      }

      return data;
    } catch (error) {
      const status = error?.status;
      if (status === 401 || status === 403) {
      } else if (status && status >= 400 && status < 500) {
        console.warn('API Warning:', error);
      } else {
        console.error('API Error:', error);
      }
      if (error?.name === 'AbortError') {
        throw new Error('Request timed out. Please check your network');
      }
      if (!status) {
        throw new Error('Unable to reach server. Verify network and API URL.');
      }
      throw error;
    }
  };

  // Bootstrap CSRF token on app load and whenever user logs in
  useEffect(() => {
    refreshCsrf();
  }, [currentUser]);

  // Helper: open shift modal with details & payload
  const openShiftModal = (details = {}, pendingPayload = null) => {
    setShiftModal({ open: true, details: details || null, pendingPayload: pendingPayload || null });
  };
  const closeShiftModal = () => setShiftModal({ open: false, details: null, pendingPayload: null });

  // Helper: centralized handler for shift-blocked responses from backend
  const SHIFT_ERROR_CODES = ['SHIFT_TIME_RESTRICTED','SHIFT_ENDED','SHIFT_NOT_STARTED'];
  const handleShiftBlockedResponse = (error, pendingPayload = null) => {
    // error may be an Error thrown by fetchJSON; data may live in error.data
    const code = error?.data?.code || error?.code || null;
    if (code && SHIFT_ERROR_CODES.includes(code)) {
      // open modal with backend details (if available)
      const details = error?.data?.details || null;
      openShiftModal(details, pendingPayload);
      // throw a semantic error so callers know login didn't complete
      const e = new Error('LOGIN_BLOCKED_BY_SHIFT');
      e.code = code;
      e.details = details;
      throw e;
    }
    // otherwise rethrow original
    throw error;
  };

  // ===== Users API helpers (DB-backed) =====
  const getUsersAll = async () => fetchJSON('/users', { method: 'GET' });
  const getMyTeamUsers = async () => fetchJSON('/users/team', { method: 'GET' });
  // Attempt to fetch only HR users from server (with graceful fallbacks)
  const listHRUsers = async () => {
    try {
      // Safe endpoint accessible to all authenticated roles
      const res = await fetchJSON('/users/hr-directory', { method: 'GET' });
      if (Array.isArray(res)) return res;
    } catch {}
    try {
      // Admin-only route (may 403 for employees); keep as fallback when permitted
      const all = await getUsersAll();
      if (Array.isArray(all)) return all.filter(u => (getEffectiveRole(u) || '').toLowerCase() === 'hr');
    } catch {}
    // Fallback: local cache
    try {
      const raw = localStorage.getItem('erpUsers');
      const cached = raw ? JSON.parse(raw) : [];
      if (Array.isArray(cached)) return cached.filter(u => (getEffectiveRole(u) || '').toLowerCase() === 'hr');
    } catch {}
    return [];
  };

  // Auto-load users from backend for admin/teamlead roles
  useEffect(() => {
    const loadUsersFromServer = async () => {
      try {
        const eff = String(currentUser?.effectiveRole || currentUser?.role || '').toLowerCase();
        if (!eff) return;
        if (eff === 'admin') {
          const arr = await getUsersAll();
          if (Array.isArray(arr) && arr.length) { setUsers(arr); return; }
        } else if (eff === 'teamlead') {
          const arr = await getMyTeamUsers();
          if (Array.isArray(arr) && arr.length) { setUsers(arr); return; }
        }
      } catch (e) {
        // 401/403 likely when running without token or insufficient role; fall back to local cache
      }
      // Fallback: keep existing users or hydrate from localStorage if empty
      try {
        if (!users || users.length === 0) {
          const raw = localStorage.getItem('erpUsers');
          const cached = raw ? JSON.parse(raw) : [];
          if (Array.isArray(cached) && cached.length) setUsers(cached);
        }
      } catch {}
    };
    loadUsersFromServer();
  }, [currentUser]);

  // ===== Users API helpers =====
  const listUsers = async () => {
    // Admin only
    return fetchJSON('/users', { method: 'GET' });
  };

  const getUserByEmail = async (email) => {
    const e = normalizeEmail(email);
    return fetchJSON(`/users/${encodeURIComponent(e)}`, { method: 'GET' });
  };

  const registerUser = async (payload) => {
    // Backend creates user and returns { user, token? }
    return fetchJSON('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const patchUser = async (email, patch) => {
    const e = normalizeEmail(email);
    return fetchJSON(`/users/${encodeURIComponent(e)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  };

  const deleteUserApi = async (email) => {
    const e = normalizeEmail(email);
    // Route may not exist yet; catch errors gracefully
    return fetchJSON(`/users/${encodeURIComponent(e)}`, {
      method: 'DELETE',
    });
  };

  // ===== Attendance API helpers =====
  const saveAttendance = async ({ email, date, status, hours }) => {
    const payload = { email: normalizeEmail(email), date, status, hours };
    return fetchJSON('/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const getAttendanceForUser = async (email) => {
    const e = normalizeEmail(email);
    return fetchJSON(`/attendance/user/${encodeURIComponent(e)}`, { method: 'GET' });
  };
  const getAttendanceByDate = async (ymd) => {
    const d = String(ymd || '').slice(0,10);
    return fetchJSON(`/attendance/date/${encodeURIComponent(d)}`, { method: 'GET' });
  };

  // ===== Leaves API helpers =====
  const createLeave = async ({ from, to, type, reason, duration, partOfDay }) => {
    // email inferred from token (server uses req.user.email)
    const payload = { from, to, type, reason };
    if (duration != null) payload.duration = duration;
    if (partOfDay !== undefined) payload.partOfDay = partOfDay;
    const res = await fetchJSON('/leaves', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    try { window.dispatchEvent(new Event('erp-leaves-updated')); } catch {}
    return res;
  };
  const getMyLeaves = async () => {
    return fetchJSON('/leaves/my', { method: 'GET' });
  };

  const getMyLeaveBalance = async (year) => {
    const y = year ? `?year=${encodeURIComponent(year)}` : '';
    return fetchJSON(`/leaves/balance/my${y}`, { method: 'GET' });
  };

  const listAllLeaves = async () => {
    return fetchJSON('/leaves', { method: 'GET' });
  };

  const reviewLeave = async (id, status) => {
    const res = await fetchJSON(`/leaves/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    try { window.dispatchEvent(new Event('erp-leaves-updated')); } catch {}
    return res;
  };

  const deleteLeave = async (id) => {
    const res = await fetchJSON(`/leaves/${encodeURIComponent(id)}`, { method: 'DELETE' });
    try { window.dispatchEvent(new Event('erp-leaves-updated')); } catch {}
    return res;
  };
  // ===== Tasks API helpers =====
  const listTasks = async () => fetchJSON('/tasks', { method: 'GET' });
  const listTasksForUser = async (email) => fetchJSON(`/tasks?assignedTo=${encodeURIComponent(email)}`, { method: 'GET' });
  const createTask = async (payload) => fetchJSON('/tasks', { method: 'POST', body: JSON.stringify(payload) });
  const updateTask = async (id, patch) => fetchJSON(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
  const deleteTask = async (id) => fetchJSON(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });

  // ===== Projects/Production API helpers =====
  const getMyProduction = async () => fetchJSON('/projects/my', { method: 'GET' });
  const upsertProduction = async (payload) => fetchJSON('/projects', { method: 'POST', body: JSON.stringify(payload) });
  const getProductionForDate = async (email, ymd) => fetchJSON(`/projects/user/${encodeURIComponent(email)}/${encodeURIComponent(ymd)}`, { method: 'GET' });

  // ===== Notifications API helpers =====
  const listMyNotifications = async () => fetchJSON('/notifications/my', { method: 'GET' });
  const createNotificationApi = async (payload) => fetchJSON('/notifications', { method: 'POST', body: JSON.stringify(payload) });
  const createNotificationSelfApi = async (payload) => fetchJSON('/notifications/self', { method: 'POST', body: JSON.stringify(payload) });
  const markNotificationRead = async (id) => fetchJSON(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
  const deleteNotificationApi = async (id) => fetchJSON(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const deleteNotificationSelfApi = async (id) => fetchJSON(`/notifications/self/${encodeURIComponent(id)}`, { method: 'DELETE' });

  // ===== Updates API helpers =====
  const listUpdates = async () => fetchJSON('/updates', { method: 'GET' });
  const createUpdateApi = async (payload) => fetchJSON('/updates', { method: 'POST', body: JSON.stringify(payload) });
  const deleteUpdateApi = async (id) => fetchJSON(`/updates/${encodeURIComponent(id)}`, { method: 'DELETE' });

  // ===== Shift Extension Requests =====
  const listMyShiftExtensions = async () => fetchJSON('/shift-requests/my', { method: 'GET' });
  const listAssignedShiftExtensions = async (status) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchJSON(`/shift-requests/assigned${q}`, { method: 'GET' });
  };
  const updateShiftExtensionStatus = async (id, status) => {
    const res = await fetchJSON(`/shift-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    try { window.dispatchEvent(new Event('erp-shift-requests-updated')); } catch {}
    return res;
  };

  // ===== Reports API helpers =====
  const getUserMonthlySummary = async (email) => fetchJSON(`/reports/user/${encodeURIComponent(email)}/month`, { method: 'GET' });
  const getOverviewForDate = async (ymd) => fetchJSON(`/reports/overview/${encodeURIComponent(ymd)}`, { method: 'GET' });

  // ===== RAG & One-on-One reports =====
  const getRagByMonth = async (month) => fetchJSON(`/reports/rag/${encodeURIComponent(month)}`, { method: 'GET' });
  const createRagReport = async (payload) => fetchJSON('/reports/rag', { method: 'POST', body: JSON.stringify(payload) });
  const getOneOnOneByMonth = async (month) => fetchJSON(`/reports/oneonone/${encodeURIComponent(month)}`, { method: 'GET' });
  const createOneOnOne = async (payload) => fetchJSON('/reports/oneonone', { method: 'POST', body: JSON.stringify(payload) });

  // ===== Recruitment (HR) =====
  const listRecruitment = async () => fetchJSON('/recruitment', { method: 'GET' });
  const createRecruitment = async (payload) => fetchJSON('/recruitment', { method: 'POST', body: JSON.stringify(payload) });

  const listRecruitmentCandidates = async ({ limit, offset } = {}) => {
    const qs = new URLSearchParams();
    if (limit != null) qs.set('limit', String(limit));
    if (offset != null) qs.set('offset', String(offset));
    const q = qs.toString();
    return fetchJSON(`/recruitment/candidates${q ? `?${q}` : ''}`, { method: 'GET' });
  };
  const createRecruitmentCandidate = async (payload) => fetchJSON('/recruitment/candidates', { method: 'POST', body: JSON.stringify(payload) });
  const getRecruitmentCandidate = async (id) => fetchJSON(`/recruitment/candidates/${encodeURIComponent(id)}`, { method: 'GET' });
  const generateRecruitmentCandidateEmpId = async (id) => fetchJSON(`/recruitment/candidates/${encodeURIComponent(id)}/emp-id`, { method: 'GET' });
  const listRecruitmentCandidateDocuments = async (id) => fetchJSON(`/recruitment/candidates/${encodeURIComponent(id)}/documents`, { method: 'GET' });
  const uploadRecruitmentCandidateDocument = async ({ candidateId, docType, file }) => {
    const fd = new FormData();
    fd.append('docType', String(docType || 'document'));
    fd.append('file', file);
    return fetchFormData(`/recruitment/candidates/${encodeURIComponent(candidateId)}/documents`, { method: 'POST', body: fd });
  };

  // ===== HR Queries (Employee <-> HR) =====
  const listMyHrQueries = async () => fetchJSON('/hr-queries/my', { method: 'GET' });
  const createHrQuery = async (payload) => fetchJSON('/hr-queries', { method: 'POST', body: JSON.stringify(payload) });
  const respondHrQuery = async (id, payload) => fetchJSON(`/hr-queries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
  const listAssignedHrQueries = async () => fetchJSON('/hr-queries/assigned', { method: 'GET' });

  // ===== Admin Queries (Employee <-> Admin) =====
  const listMyAdminQueries = async () => fetchJSON('/admin-queries/my', { method: 'GET' });
  const createAdminQuery = async (payload) => fetchJSON('/admin-queries', { method: 'POST', body: JSON.stringify(payload) });
  const listAllAdminQueries = async () => fetchJSON('/admin-queries', { method: 'GET' });
  const respondAdminQuery = async (id, payload) => fetchJSON(`/admin-queries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });

  

  // Load from localStorage once
  useEffect(() => {
    try {
      const rawUsers = localStorage.getItem("erpUsers");
      const rawCurrent = localStorage.getItem("erpUser");
      if (rawUsers) setUsers(JSON.parse(rawUsers).map(withDefaults));
      if (rawCurrent) setCurrentUser(withDefaults(JSON.parse(rawCurrent)));
    } catch (e) {
      console.warn("Failed to parse localStorage keys — clearing them.", e);
      localStorage.removeItem("erpUsers");
      localStorage.removeItem("erpUser");
    }
  }, []);

  // Emit a tick every minute so components recompute averages/live minutes without manual refresh
  useEffect(() => {
    const id = setInterval(() => setMinuteTick((t) => (t + 1) % Number.MAX_SAFE_INTEGER), 60_000);
    return () => clearInterval(id);
  }, []);

  // Cookie-based hydration: ask backend who we are; if 401, remain logged out
  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await fetchJSON('/auth/me', { method: 'GET' });
        const me = data?.me || data?.user || null;
        if (me) {
          const normalized = withDefaults(me);
          setCurrentUser(normalized);
          localStorage.setItem('erpUser', JSON.stringify(normalized));

          // Guard: if the latest shift extension for today is Rejected, immediately de-auth
          try {
            const rows = await fetchJSON('/shift-requests/my', { method: 'GET' });
            if (Array.isArray(rows) && rows.length) {
              const today = new Date().toISOString().slice(0,10);
              const todays = rows.filter(r => String(r.createdAt||'').slice(0,10) === today);
              if (todays.length) {
                const latest = [...todays].sort((a,b) => new Date(b.updatedAt||b.createdAt||0) - new Date(a.updatedAt||a.createdAt||0))[0];
                const st = String(latest.status||'').toLowerCase();
                if (st === 'rejected') {
                  // Clear cookies and local state, then redirect to login
                  try { await fetchJSON('/auth/logout-clear', { method: 'POST' }); } catch {}
                  try {
                    localStorage.removeItem('erpUser');
                    localStorage.removeItem('erpToken');
                  } catch {}
                  window.location.assign('/login');
                  return;
                }
              }
            }
          } catch {}
        }
      } catch (e) {
        // Not authenticated; ignore
        console.warn('Cookie hydration failed or unauthenticated.', e?.message || e);
      }
    };
    hydrate();
  }, []);

  // One-time migration: remove legacy default HR account if present
  useEffect(() => {
    try {
      const flag = localStorage.getItem("erp_removed_default_hr_v1");
      if (flag) return;
      const raw = localStorage.getItem("erpUsers");
      if (!raw) {
        localStorage.setItem("erp_removed_default_hr_v1", "true");
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const filtered = parsed.filter(u => (u.email || "").toLowerCase() !== "hr@erp.com");
      if (filtered.length !== parsed.length) {
        localStorage.setItem("erpUsers", JSON.stringify(filtered));
        setUsers(filtered.map(withDefaults));
        const current = localStorage.getItem("erpUser");
        if (current) {
          const cu = JSON.parse(current);
          if ((cu.email || "").toLowerCase() === "hr@erp.com") {
            localStorage.removeItem("erpUser");
            setCurrentUser(null);
          }
        }
      }
      localStorage.setItem("erp_removed_default_hr_v1", "true");
    } catch {}
  }, []);

  // One-time migration: remove legacy default manager account if present
  useEffect(() => {
    try {
      const flag = localStorage.getItem("erp_removed_default_manager_v1");
      if (flag) return;
      const raw = localStorage.getItem("erpUsers");
      if (!raw) {
        localStorage.setItem("erp_removed_default_manager_v1", "true");
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const filtered = parsed.filter(u => (u.email || "").toLowerCase() !== "manager@erp.com");
      if (filtered.length !== parsed.length) {
        localStorage.setItem("erpUsers", JSON.stringify(filtered));
        setUsers(filtered.map(withDefaults));
        const current = localStorage.getItem("erpUser");
        if (current) {
          const cu = JSON.parse(current);
          if ((cu.email || "").toLowerCase() === "manager@erp.com") {
            localStorage.removeItem("erpUser");
            setCurrentUser(null);
          }
        }
      }
      localStorage.setItem("erp_removed_default_manager_v1", "true");
    } catch {}
  }, []);

  // One-time migration: move legacy `position` -> `designation` and remove `position` from storage
  useEffect(() => {
    try {
      const migratedFlag = localStorage.getItem("erp_migrated_designation_v1");
      if (migratedFlag) return;
      const rawUsers = localStorage.getItem("erpUsers");
      if (!rawUsers) {
        localStorage.setItem("erp_migrated_designation_v1", "true");
        return;
      }
      const parsed = JSON.parse(rawUsers);
      if (!Array.isArray(parsed)) return;
      const updated = parsed.map((u) => {
        const du = { ...u };
        if (!du.designation && du.position) {
          du.designation = du.position;
        }
        // Remove legacy key to keep storage clean
        if (Object.prototype.hasOwnProperty.call(du, 'position')) {
          delete du.position;
        }
        return withDefaults(du);
      });
      localStorage.setItem("erpUsers", JSON.stringify(updated));
      // Update in-memory state as well
      setUsers(updated);
      const rawCurrent = localStorage.getItem("erpUser");
      if (rawCurrent) {
        const cu = withDefaults(JSON.parse(rawCurrent));
        // Ensure current user follows migration too
        const migratedCU = { ...cu };
        if (!migratedCU.designation && cu.position) migratedCU.designation = cu.position;
        if (Object.prototype.hasOwnProperty.call(migratedCU, 'position')) delete migratedCU.position;
        setCurrentUser(migratedCU);
        localStorage.setItem("erpUser", JSON.stringify(migratedCU));
      }
      localStorage.setItem("erp_migrated_designation_v1", "true");
    } catch (e) {
      console.warn("Designation migration failed", e);
    }
  }, []);

  // Persist users
  useEffect(() => {
    const savedUsers = localStorage.getItem("erpUsers");
    const savedUser = localStorage.getItem("erpUsers");
    if(savedUsers)
      setUsers(JSON.parse(savedUsers));
    if(savedUser)
      setUsers(JSON.parse(savedUser));
    }, []);

  // Ensure admin always exists (default HR removed per request)
  useEffect(() => {
    setUsers((prev) => {
      let updated = [...prev];
      
      // Ensure admin exists
      if (!updated.some((u) => u.email === "admin@erp.com")) {
        const adminUser = withDefaults({
          firstName: "Admin",
          lastName: "User",
          username: "admin",
          email: "admin@erp.com",
          password: "admin123",
          role: "admin",
          status: "Active",
        });
        updated = [...updated, adminUser];
      } else {
        updated = updated.map((u) =>
          u.email === "admin@erp.com"
            ? { ...u, role: "admin", status: "Active" }
            : u
        );
      }
      localStorage.setItem("erpUsers", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Login (local/offline)
  const login = async (email, password) => {
    try {
      const e = normalizeEmail(email);
      if (!e) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      // Find user by email (case-insensitive)
      const found = users.find(u => u.email?.toLowerCase() === e.toLowerCase());
      
      // Check if user exists and is active
      if (!found || found.status !== "Active") {
        throw new Error("Invalid credentials or inactive user");
      }

      // Verify password (use default password if not set)
      const storedPassword = (found.password && String(found.password)) || DEFAULT_PASSWORD;
      if (password !== storedPassword) {
        throw new Error("Invalid credentials");
      }

      // For admin, ensure all admin properties are set
      if (e.toLowerCase() === "admin@erp.com") {
        const adminUser = withDefaults({
          ...found,
          firstName: found.firstName || "Admin",
          lastName: found.lastName || "User",
          username: found.username || "admin",
          email: "admin@erp.com",
          password: storedPassword,
          role: "admin",
          status: "Active",
          lastLogin: new Date().toISOString(),
          shift: found.shift || "MORNING"
        });

        // Update admin user in state and localStorage
        setCurrentUser(adminUser);
        localStorage.setItem('erpUser', JSON.stringify(adminUser));
        localStorage.setItem('erpToken', 'admin-token');
        return adminUser;
      }

      // For regular users
      const updatedUser = withDefaults({
        ...found,
        password: storedPassword,
        lastLogin: new Date().toISOString(),
        shift: found.shift || "MORNING"
      });

      // Update users list with the updated user
      const updatedUsers = users.map(u => 
        u.email?.toLowerCase() === e.toLowerCase() ? updatedUser : u
      );
      
      setUsers(updatedUsers);
      setCurrentUser(updatedUser);
      
      // Store in localStorage
      localStorage.setItem('erpUser', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  // Signup
  const signup = async (firstName, lastName, email, password) => {
    try {
      const e = normalizeEmail(email);
      if (!e) throw new Error("Email is required");
      
      const payload = {
        firstName,
        lastName,
        email: e,
        password: password || DEFAULT_PASSWORD,
        role: 'employee',
        status: 'Active',
        shift: 'MORNING',
        dateOfJoining: new Date().toISOString()
      };
      
      const data = await registerUser(payload);
      const user = withDefaults(data?.user || payload);
      
      // Update users list
      setUsers((prev) => {
        if (prev.some((u) => u.email?.toLowerCase() === e.toLowerCase())) {
          return prev;
        }
        const updated = [...prev, user];
        localStorage.setItem('erpUsers', JSON.stringify(updated));
        return updated;
      });
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('erpUser');
  };

  // API Login - for programmatic login (e.g., from other components)
  const apiLogin = async (email, password) => {
    try {
      const e = normalizeEmail(email);
      if (!e) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      // Call the login API endpoint
      const response = await fetchJSON('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: e, password })
      });

      if (response.user) {
        // Update current user in state and localStorage
        const user = withDefaults(response.user);
        setCurrentUser(user);
        localStorage.setItem('erpUser', JSON.stringify(user));

        // Update users list with the logged-in user
        setUsers(prevUsers => {
          const existingUserIndex = prevUsers.findIndex(u => 
            u.email?.toLowerCase() === e.toLowerCase()
          );
          
          if (existingUserIndex >= 0) {
            const updated = [...prevUsers];
            updated[existingUserIndex] = user;
            return updated;
          }
          return [...prevUsers, user];
        });

        return user;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      // If backend responded with shift-block codes, open the shift modal and rethrow a semantic error
      try {
        if (error?.data?.code && SHIFT_ERROR_CODES.includes(error.data.code)) {
          handleShiftBlockedResponse(error, { email, password });
        }
      } catch (e) {
        // ignore handler throw here — we'll rethrow original if not handled
      }
      console.error('API Login error:', error);
      throw new Error(error.message || 'API login failed. Please try again.');
    }
  };

  // Check with backend if logout is allowed (enforces 9h rule except Wednesday, admin bypass)
  // Optionally send client-calculated workedMinutes as a fallback for allowance
  const checkLogoutAllowed = async (final = false, workedMinutes) => {
    try {
      try {
        const userId = (() => {
          try {
            const token = localStorage.getItem('erpToken');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
            return payload.id || null;
          } catch { return null; }
        })();
        const getKey = (k) => userId ? `${k}_${userId}` : k;
        const unlock = localStorage.getItem(getKey('halfDayLogoutAfter')) || localStorage.getItem('halfDayLogoutAfter');
        if (unlock && Date.now() < Number(unlock)) {
          const ms = Number(unlock) - Date.now();
          return { allowed: false, error: 'Half-day logout available after timer ends', details: { remainingMs: ms } };
        }
      } catch {}
      const body = { final };
      if (Number.isFinite(workedMinutes)) body.workedMinutes = Math.floor(workedMinutes);
      const res = await fetchJSON('/auth/logout', { method: 'POST', body: JSON.stringify(body) });
      return { allowed: true, details: res };
    } catch (e) {
      return { allowed: false, error: e?.message || 'Not allowed', status: e?.status, details: e?.data };
    }
  };

  const updateProfile = async (updatedUser) => {
    const email = updatedUser?.email || currentUser?.email;
    if (!email) throw new Error('No user email provided');
    // Never send password fields here
    const patch = { ...updatedUser };
    delete patch.email;
    delete patch.password;
    delete patch.passwordHash;
    const updated = await patchUser(email, patch);
    const normalized = withDefaults(updated);
    // Update local cache
    setUsers((prev) => {
      const exists = prev.some((x) => x.email === normalized.email);
      const next = exists ? prev.map((x) => (x.email === normalized.email ? normalized : x)) : [...prev, normalized];
      localStorage.setItem('erpUsers', JSON.stringify(next));
      return next;
    });
    if (currentUser?.email === normalized.email) {
      setCurrentUser(normalized);
      localStorage.setItem('erpUser', JSON.stringify(normalized));
    }
    return normalized;
  };

  // Admin helpers
  const addUser = async (user) => {
    const u = withDefaults(user);
    // Helpers to normalize inputs coming from admin/TL create form
    const toYMD = (val) => {
      if (!val) return null;
      const s = String(val).trim();
      // dd-mm-yyyy
      const m1 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`; // yyyy-mm-dd
      // yyyy/mm/dd or dd/mm/yyyy -> normalize
      const m2 = s.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
      if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
      const m3 = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
      if (m3) return `${m3[3]}-${m3[2]}-${m3[1]}`;
      // If Date-parsable, format
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return s.slice(0, 10);
    };

    const email = String(u.email || '').toLowerCase().trim();
    const teamLeadEmail = String(u.teamLeadEmail || '').toLowerCase().trim();
    const role = String(u.role || 'employee').toLowerCase();
    const bloodGroup = String(u.bloodGroup || '').toUpperCase().trim();
    const coreEducation = String(u.coreEducation || '').trim();
    const dateOfBirth = toYMD(u.dateOfBirth);
    const dateOfJoining = toYMD(u.dateOfJoining);
    if (u.email === 'admin@erp.com') return; // prevent duplicate admin
    const payload = {
      email,
      password: u.password || DEFAULT_PASSWORD,
      role,
      firstName: u.firstName,
      lastName: u.lastName,
      department: u.department,
      designation: u.designation,
      empId: u.empId,
      dateOfJoining,
      teamLeadEmail,
      // Persist extended profile fields when Admin/TL creates an employee
      bloodGroup,
      dateOfBirth,
      coreEducation,
      // Shift data
      shift: u.shift || 'MORNING',
    };
    
    // Debug logging to check payload
    console.log('Register payload being sent:', payload);
    console.log('Shift data in payload:', {
      shift: payload.shift
    });
    
    const data = await registerUser(payload);
    const created = withDefaults(data?.user || {});
    setUsers((prev) => {
      if (prev.some((x) => x.email === created.email)) return prev;
      const updated = [...prev, created];
      localStorage.setItem('erpUsers', JSON.stringify(updated));
      return updated;
    });
    return created;
  };

  const updateUser = async (index, updatedUser) => {
    // Create a clean copy of the user with defaults
    let u = withDefaults(updatedUser);
    
    // Validate required fields
    if (!u.email) throw new Error('No user email provided');
    
    // Handle admin user restrictions
    if (u.email === 'admin@erp.com') {
      // lock admin role & status
      u = { ...u, role: 'admin', status: 'Active' };
    }
    
    // Create patch object, removing sensitive fields
    const patch = { ...u };
    delete patch.email;
    delete patch.password;
    delete patch.passwordHash;
    
    // Debug logging to check patch data
    console.log('Update patch being sent:', patch);
    console.log('Shift data in patch:', {
      shift: patch.shift
    });
    
    try {
      // Send the patch to the server
      const saved = await patchUser(u.email, patch);
      const normalized = withDefaults(saved);
      
      // Update local state
      setUsers((prev) => {
        const updated = [...prev];
        updated[index] = normalized;
        localStorage.setItem('erpUsers', JSON.stringify(updated));
        return updated;
      });
      
      // Update current user if this is the logged-in user
      if (currentUser?.email === normalized.email) {
        setCurrentUser(normalized);
        localStorage.setItem('erpUser', JSON.stringify(normalized));
      }
      
      return normalized;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const removeUser = async (index) => {
    setUsers(async (prev) => {
      const target = prev[index];
      if (!target) return prev;
      if (target.email === 'admin@erp.com') return prev; 
      try {
        await deleteUserApi(target.email);
      } catch (e) {
        console.warn('Delete user API not available or failed:', e?.message || e);
        return prev; // keep state unchanged on failure
      }
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('erpUsers', JSON.stringify(updated));
      return updated;
    });
  };

  // Wellness
  // const addWellnessEntry = ({ email, mood, note }) => {
  //   const e = normalizeEmail(email);
  //   if (!e || !mood) return false;
  //   const entry = {
  //     id: String(Date.now()),
  //     date: new Date().toISOString(),
  //     mood,
  //     note: note || "",
  //   };

  //   setUsers((prev) => {
  //     const updated = prev.map((u) => {
  //       if (u.email !== e) return u;
  //       const copy = withDefaults(u);
  //       copy.wellness = [entry, ...(copy.wellness || [])];
  //       return copy;
  //     });
  //     localStorage.setItem("erpUsers", JSON.stringify(updated));
  //     if (currentUser?.email === e) {
  //       const me = updated.find((x) => x.email === e);
  //       setCurrentUser(me);
  //       localStorage.setItem("erpUser", JSON.stringify(me));
  //     }
  //     return updated;
  //   });
  //   return true;
  // };

  // const getWellnessForUser = (email) => {
  //   const e = normalizeEmail(email);
  //   if (!e) return [];
  //   const user =
  //     users.find((u) => u.email === e) ||
  //     (currentUser?.email === e ? currentUser : null);
  //   return (user?.wellness || []).slice(0, 50);
  // };

  const logAttendance = async ({ email, date, status, hours }) => {
    // Always send LOCAL date in 'YYYY-MM-DD' to avoid timezone shifting
    const toYMD = (d) => {
      try {
        if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
        const dt = d instanceof Date ? d : new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const dy = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${dy}`;
      } catch { return String(d || '').slice(0, 10); }
    };
    const ymd = toYMD(date);

    const rec = await saveAttendance({ email, date: ymd, status, hours });
    // Update legacy local cache so old views still render
    try {
      const normalizedDateYMD = String(rec?.date || '').slice(0, 10) || ymd;
      const hrs = Number(rec?.hours || hours || 0);
      const finalStatus = rec?.status || status;
      const id = `${email}:${normalizedDateYMD}`;
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if ((u.email || '').toLowerCase() !== (email || '').toLowerCase()) return u;
          const existing = u.attendance || [];
          const dKey = (s) => (s || '').slice(0,10);
          const targetKey = dKey(normalizedDateYMD);
          const filtered = existing.filter((a) => dKey(a.date) !== targetKey);
          return {
            ...u,
            attendance: [
              ...filtered,
              { id, date: normalizedDateYMD, status: finalStatus, hours: hrs },
            ].sort((a,b) => (a.date > b.date ? 1 : -1)),
          };
        });
        localStorage.setItem('erpUsers', JSON.stringify(updated));
        if ((currentUser?.email || '').toLowerCase() === (email || '').toLowerCase()) {
          const me = updated.find((x) => (x.email || '').toLowerCase() === (email || '').toLowerCase());
          setCurrentUser(me);
          localStorage.setItem('erpUser', JSON.stringify(me));
        }
        return updated;
      });
    } catch {}
    // Broadcast so views that listen can refresh
    try { window.dispatchEvent(new Event('erp-attendance-updated')); } catch {}
    return rec;
  };

  // Get metrics for a specific user
  const getUserMetrics = (email) => {
    const user = users.find((u) => u.email === email);
    if (!user) return null;

    const attendance = Array.isArray(user.attendance) ? user.attendance : [];

    // Helpers
    const toMins = (h) => {
      if (!h && h !== 0) return 0;
      if (typeof h === 'number' && isFinite(h)) return Math.round(h * 60);
      const [HH, MM] = String(h).split(':');
      const hh = parseInt(HH || '0', 10);
      const mm = parseInt(MM || '0', 10);
      return (isFinite(hh) ? hh : 0) * 60 + (isFinite(mm) ? mm : 0);
    };
    const toHHMM = (mins) => {
      const m = Math.max(0, Math.floor(mins));
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(h)}:${pad(mm)}`;
    };
    const toYMD = (d) => {
      const dt = d instanceof Date ? d : new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    };

    // Consider only Present days for totals/average
    const presentOnly = attendance.filter((a) => String(a.status).toLowerCase() === 'present');
    // Sum past Present days from stored attendance (TIME strings)
    let totalMins = presentOnly.reduce((sum, a) => sum + toMins(a?.hours), 0);

    // Add today's live minutes if the user is currently logged in today (not yet final-logged-out)
    try {
      const lsLoginTime = localStorage.getItem('erpLoginTime');
      const lsLoginDate = localStorage.getItem('erpLoginDate');
      const lsPresence = localStorage.getItem('erpPresence');
      // Only count for this specific user
      const current = (currentUser?.email || '').toLowerCase();
      if (current && current === (email || '').toLowerCase()) {
        const today = toYMD(new Date());
        if (lsPresence && lsPresence.toLowerCase() !== 'loggedout' && lsLoginTime && lsLoginDate === today) {
          const start = new Date(lsLoginTime);
          const now = new Date();
          const live = Math.max(0, Math.floor((now - start) / 60000));
          // Avoid double-counting if today's attendance already has a record for today; we still add live time
          totalMins += live;
        }
      }
    } catch {}

    const totalDays = attendance.length;
    const presentDays = presentOnly.length;
    const absentDays = attendance.filter((a) => String(a.status).toLowerCase() === 'absent').length;
    const leaveDays = attendance.filter((a) => String(a.status).toLowerCase() === 'leave').length;
    // Working days exclude leave: only Present + Absent
    const workingDays = presentDays + absentDays;

    // Average per day: divide by number of Present days only
    const denom = presentDays || 1;
    const avgPerDayMins = Math.floor(totalMins / denom);

    return {
      totalDays,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      // Attendance rate only across working days (Present + Absent)
      attendanceRate: workingDays ? Math.round((presentDays / workingDays) * 100) : 0,
      totalTimeHHMM: toHHMM(totalMins),
      avgTimePerDayHHMM: toHHMM(avgPerDayMins),
    };
  };

  // Admin: overview across all employees
  const getAllAttendanceOverview = () => {
    return users.map((u) => ({
      email: u.email,
      username: u.username,
      metrics: getUserMetrics(u.email),
    }));
  };

  //
  // ===== Shift-related actions available via context =====
  //

  // Apply half-day using server endpoint; will infer email from token on server
  const applyHalfDayFromModal = async ({ email, reason } = {}) => {
    try {
      // Daily client-side guard to avoid multiple clicks in a day
      const today = new Date().toISOString().slice(0,10);
      try {
        const keyUser = (email || currentUser?.email || 'self').toLowerCase();
        const last = localStorage.getItem(`lastHalfDayApplied_${keyUser}`);
        if (last === today) {
          throw new Error('You have already applied for half-day leave today.');
        }
      } catch (e) {
        if (e?.message?.includes('already applied')) throw e;
        // continue on localStorage errors
      }

      // If email provided, use it; otherwise server will infer from token
      const payload = {
        from: today,
        to: today,
        type: 'half-day',
        reason: reason || `Half-day applied due to shift timing`
      };
      // If caller gave an email (for offline mode), attach it to body — server should validate identity
      if (email) payload.email = email;
      const res = await createLeave(payload);
      // Record date after success (per-user)
      try {
        const keyUser = (email || currentUser?.email || 'self').toLowerCase();
        localStorage.setItem(`lastHalfDayApplied_${keyUser}`, today);
      } catch {}
      closeShiftModal();
      return res;
    } catch (err) {
      console.error('applyHalfDayFromModal error', err);
      throw err;
    }
  };

  // Request shift extension; uses /shift-requests endpoint
  const requestShiftExtensionFromModal = async ({ email, shiftType, requestedMinutes = 30, reason = '' } = {}) => {
    try {
      const body = {
        email: email || (currentUser && currentUser.email) || undefined,
        shiftType: shiftType || (shiftModal?.details?.shiftType || undefined),
        requestedMinutes: Number(requestedMinutes) || 30,
        reason: reason || 'Requesting shift extension due to late arrival',
        assignedLeadEmail: (currentUser && currentUser.teamLeadEmail) ? String(currentUser.teamLeadEmail).toLowerCase() : undefined,
      };
      const res = await fetchJSON('/shift-requests', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      closeShiftModal();
      return res;
    } catch (err) {
      console.error('requestShiftExtensionFromModal error', err);
      throw err;
    }
  };

  //
  // The rest of provider functions below remain same as earlier, but apiLogin/login now open shift modal on shift-block.
  //

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        minuteTick,
        listUsers,
        listHRUsers,
        getUserByEmail,
        login,
        apiLogin,
        signup,
        logout,
        checkLogoutAllowed,
        updateProfile,
        addUser,
        updateUser,
        removeUser,
        logAttendance,
        getUserMetrics,
        getAllAttendanceOverview,
        // Users
        getUsersAll,
        getMyTeamUsers,
        // Attendance
        getAttendanceForUser,
        getAttendanceByDate,
        // Leaves
        createLeave,
        getMyLeaves,
        getMyLeaveBalance,
        listAllLeaves,
        reviewLeave,
        deleteLeave,
        // Tasks
        listTasks,
        listTasksForUser,
        createTask,
        updateTask,
        deleteTask,
        // Projects/Production
        getMyProduction,
        upsertProduction,
        getProductionForDate,
        // Notifications
        listMyNotifications,
        createNotificationApi,
        createNotificationSelfApi,
        markNotificationRead,
        deleteNotificationApi,
        deleteNotificationSelfApi,
        // Updates
        listUpdates,
        createUpdateApi,
        deleteUpdateApi,
        // Shift Extensions
        listMyShiftExtensions,
        listAssignedShiftExtensions,
        updateShiftExtensionStatus,
        // Reports
        getUserMonthlySummary,
        getOverviewForDate,
        // RAG & 1:1
        getRagByMonth,
        createRagReport,
        getOneOnOneByMonth,
        createOneOnOne,
        // Recruitment
        listRecruitment,
        createRecruitment,
        listRecruitmentCandidates,
        createRecruitmentCandidate,
        getRecruitmentCandidate,
        generateRecruitmentCandidateEmpId,
        listRecruitmentCandidateDocuments,
        uploadRecruitmentCandidateDocument,
        // HR Queries
        listMyHrQueries,
        listAssignedHrQueries,
        createHrQuery,
        respondHrQuery,
        // Admin Queries
        listMyAdminQueries,
        listAllAdminQueries,
        createAdminQuery,
        respondAdminQuery,

        // Shift modal and actions
        shiftModal,
        openShiftModal,
        closeShiftModal,
        applyHalfDayFromModal,
        requestShiftExtensionFromModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
