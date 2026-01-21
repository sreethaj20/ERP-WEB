// src/components/Navbar.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, logout, logAttendance, checkLogoutAllowed } = useAuth();
  const { notifications = [], markRead, removeNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginTime, setLoginTime] = useState(null);
  const [workedTime, setWorkedTime] = useState("0h 0m");
  const [canLogout, setCanLogout] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  // Filter notifications: everyone sees only their targeted items
  const filteredNotifications = useMemo(() => {
    const email = (currentUser?.email || '').toLowerCase();
    const all = notifications || [];
    return all
      .filter(n => String(n.audience || '').toLowerCase() === `user:${email}`)
      .filter(n => !dismissedIds.has(n.id));
  }, [notifications, currentUser?.email, dismissedIds]);

  const localUnreadCount = useMemo(() => (filteredNotifications || []).filter(n => !n.read).length, [filteredNotifications]);

  const markVisibleRead = () => {
    filteredNotifications.filter(n => !n.read).forEach(n => markRead(n.id));
  };
  const clearVisible = () => {
    // UI-only clear: hide visible notifications locally (do not call server)
    setDismissedIds(prev => {
      const next = new Set(prev);
      filteredNotifications.forEach(n => next.add(n.id));
      return next;
    });
  };

  const isElevated = ['admin','teamlead','manager','hr'].includes(String(currentUser?.role || '').toLowerCase());

  const designation = String(currentUser?.designation || currentUser?.position || '').trim().toLowerCase();
  const isHRBP = (() => {
    const d = designation.replace(/\s+/g, ' ').trim();
    const compact = d.replace(/\s+/g, '');
    return compact === 'hrbp' || d.includes('hrbp');
  })();
  const isHRBPLead = (() => {
    const d = designation.replace(/\s+/g, ' ').trim();
    const compact = d.replace(/\s+/g, '');
    return compact.includes('hrbplead') || (d.includes('hrbp') && d.includes('lead'));
  })();

  const clearAllAndDismiss = async () => {
    try {
      // Attempt server-side clear via context
      if (typeof removeNotification === 'function') {
        // Fallback per-item if clearAll not exposed here
        for (const n of filteredNotifications) {
          try { await removeNotification(n.id); } catch {}
        }
      }
    } catch {}
    // Always dismiss locally to keep UI empty immediately
    setDismissedIds(prev => {
      const next = new Set(prev);
      filteredNotifications.forEach(n => next.add(n.id));
      return next;
    });
  };

  const notifRef = useRef(null);

  // Helper: normalize and format (e.g., 1 September 2025, 10:36)
  const formatLoginTime = (d) =>
    d
      ? d.toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const calcWorked = (start) => {
    if (!start) return { display: "0h 0m", hrs: 0, mins: 0, totalMins: 0 };
    const diff = Date.now() - start.getTime();
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const totalMins = Math.floor(diff / (1000 * 60));
    return { display: `${hrs}h ${mins}m`, hrs, mins, totalMins };
  };

  // Helper function to get today's date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Ensure loginTime exists (set once when user is present if missing) - User specific
  useEffect(() => {
    if (!currentUser) {
      setLoginTime(null);
      setWorkedTime("0h 0m");
      setCanLogout(false);
      return;
    }

    const userLoginKey = `erpLoginTime_${currentUser.email}`;
    const userDateKey = `erpLoginDate_${currentUser.email}`;
    const stored = localStorage.getItem(userLoginKey);
    const storedDate = localStorage.getItem(userDateKey);
    const today = getTodayDateString();

    if (stored && storedDate === today) {
      // Same day, use existing login time
      setLoginTime(new Date(stored));
    } else {
      // New day or no stored time, reset
      const now = new Date();
      localStorage.setItem(userLoginKey, now.toISOString());
      localStorage.setItem(userDateKey, today);
      setLoginTime(now);
    }
  }, [currentUser]);

  // Timer to update workedTime & logout enable with day change detection - User specific
  useEffect(() => {
    if (!loginTime || !currentUser) return;
    
    // Helper: read half-day logout unlock time from localStorage (support namespaced and legacy keys)
    const getHalfDayUnlockAt = () => {
      try {
        const nsKey = currentUser?.email ? `halfDayLogoutAfter_${String(currentUser.email).toLowerCase()}` : null;
        const namespaced = nsKey ? localStorage.getItem(nsKey) : null;
        const legacy = localStorage.getItem('halfDayLogoutAfter');
        return Number(namespaced || legacy || 0) || 0;
      } catch { return 0; }
    };

    const humanRemaining = (ms) => {
      const m = Math.max(0, Math.floor(ms / 60000));
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return `${h}h ${mm}m`;
    };

    const update = () => {
      const userDateKey = `erpLoginDate_${currentUser.email}`;
      const userLoginKey = `erpLoginTime_${currentUser.email}`;
      const storedDate = localStorage.getItem(userDateKey);
      const today = getTodayDateString();
      
      // Check if day has changed
      if (storedDate && storedDate !== today) {
        // Day changed, reset timer
        const now = new Date();
        localStorage.setItem(userLoginKey, now.toISOString());
        localStorage.setItem(userDateKey, today);
        setLoginTime(now);
        setWorkedTime("0h 0m");
        setCanLogout(false);
        return;
      }
      
      const { display, hrs, totalMins } = calcWorked(loginTime);
      setWorkedTime(display);

      // Enforce half-day unlock if present: allow logout after unlock time OR after 9 hours
      const unlockAt = getHalfDayUnlockAt();
      const now = Date.now();
      const unlocked = unlockAt && now >= unlockAt;
      const nineHours = hrs >= 9;
      setCanLogout(Boolean(unlocked || nineHours));

      // Update button tooltip dynamically
      try {
        const btn = document.querySelector('.btn-logout');
        if (btn) {
          if (unlockAt && now < unlockAt) {
            btn.title = `Logout available in ${humanRemaining(unlockAt - now)} (half-day)`;
          } else {
            btn.title = nineHours ? 'Logout' : `You can logout after completing 9 hours. Worked: ${display}`;
          }
        }
      } catch {}
      // Presence heartbeat: update every tick
      try {
        if (currentUser?.email) {
          localStorage.setItem(`erpPresence_${currentUser.email}`, String(Date.now()));
        }
      } catch {}
    };
    
    update();
    const id = setInterval(update, 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, [loginTime, currentUser]);

  // Ensure half-day unlock key is set when an approved half-day leave exists for today (even if approval happened elsewhere)
  useEffect(() => {
    if (!currentUser) return;
    let canceled = false;
    const token = '';
    const syncHalfDayUnlock = async () => {
      try {
        const res = await fetch('/api/leaves/my', { credentials: 'include' });
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) return;
        const today = new Date().toISOString().slice(0,10);
        const isHalf = (r) => {
          const ty = String(r.type || '').toLowerCase();
          return ty.includes('half') || Number(r.duration) === 0.5 || !!(r.partOfDay || r.part_of_day);
        };
        const approvedToday = rows.find(r => {
          const st = String(r.status || '').toLowerCase();
          const f = String(r.from || r.from_date || '').slice(0,10);
          const t = String(r.to || r.to_date || '').slice(0,10);
          return st === 'approved' && f === today && t === today && isHalf(r);
        });
        if (!approvedToday) return;
        const approvedAtStr = approvedToday.updatedAt || approvedToday.createdAt || new Date().toISOString();
        const approvedAt = new Date(approvedAtStr).getTime();
        const unlockAt = approvedAt + 4 * 60 * 60 * 1000;
        // Set if not set or if existing is earlier than computed
        try {
          const nsKey = currentUser?.email ? `halfDayLogoutAfter_${String(currentUser.email).toLowerCase()}` : 'halfDayLogoutAfter';
          const existing = Number(localStorage.getItem(nsKey) || 0) || 0;
          if (!existing || existing < unlockAt) {
            if (canceled) return;
            localStorage.setItem(nsKey, String(unlockAt));
            localStorage.setItem('halfDayLogoutAfter', String(unlockAt));
          }
        } catch {}
      } catch {}
    };
    // run once and every 5 minutes
    syncHalfDayUnlock();
    const id = setInterval(syncHalfDayUnlock, 5 * 60 * 1000);
    return () => { canceled = true; clearInterval(id); };
  }, [currentUser]);

  // close dropdown if click outside
  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName =
    `${(currentUser?.firstName || '').trim()} ${(currentUser?.lastName || '').trim()}`.trim() ||
    currentUser?.username?.split('@')[0] ||
    currentUser?.email?.split('@')[0] ||
    "User";

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = async () => {
    // 1) Upsert today's attendance first so backend sees worked hours
    try {
      if (currentUser?.email && loginTime && typeof logAttendance === 'function') {
        const { totalMins } = calcWorked(loginTime);
        const preciseHours = Math.max(0, Math.round((totalMins / 60) * 100) / 100); // e.g., 9.95
        const todayIsWednesday = new Date().getDay() === 3; // weekly off
        if (!todayIsWednesday) {
          const toYMD = (d) => {
            const dt = d instanceof Date ? d : new Date(d);
            return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          };
          await logAttendance({
            email: currentUser.email,
            date: toYMD(new Date()),
            status: "Present",
            hours: preciseHours || 9,
          });
          try { window.dispatchEvent(new Event('erp-attendance-updated')); } catch {}
        }
      }
    } catch (e) {
      console.warn("Failed to auto-log attendance before logout", e);
    }

    // 2) Backend enforcement check (will now see today's hours). Mark as final logout
    try {
      const result = await checkLogoutAllowed(true, (function(){
        try {
          const { totalMins } = calcWorked(loginTime);
          return totalMins;
        } catch { return undefined; }
      })());
      if (!result.allowed) {
        let msg = result.error || 'Logout not allowed yet';
        if (result?.details?.remainingHours != null) {
          msg += `\nRemaining: ${Number(result.details.remainingHours).toFixed(2)} hours`;
        } else if (loginTime) {
          const { totalMins } = calcWorked(loginTime);
          const remain = Math.max(0, 9 * 60 - totalMins);
          const rh = Math.floor(remain / 60);
          const rm = remain % 60;
          msg += `\nRemaining: ${rh}h ${rm}m`;
        }
        alert(msg);
        return;
      }
    } catch (e) {
      alert(e?.message || 'Logout check failed. Please try again later.');
      return;
    }
    // clear user-specific login time and date, then logout
    if (currentUser?.email) {
      localStorage.removeItem(`erpLoginTime_${currentUser.email}`);
      localStorage.removeItem(`erpLoginDate_${currentUser.email}`);
      try { localStorage.removeItem(`erpPresence_${currentUser.email}`); } catch {}
    }
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src="/logo.jpeg" className="nav-logo-img" />
        </div>
      </div>

      <div className="navbar-center">
        {currentUser ? (
          <>
            <span className="nav-greeting">
              {greeting()}, <strong>{displayName}</strong>
            </span>
            {loginTime && (
              <span className="nav-login-info">
                &nbsp;| Login: {formatLoginTime(loginTime)} | Worked: {workedTime}
              </span>
            )}
          </>
        ) : (
          <>
            {location.pathname === "/login" ? (
              <div className="nav-marquee" aria-label="Welcome banner">
                <div className="nav-marquee-inner once">
                  <div className="nav-marquee-track">
                    <span>{greeting()}, Welcome to Mercure Solutions</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="public-links"></div>
            )}
          </>
        )}
      </div>

      <div className="navbar-right">
        {currentUser && (
          <>
            <div ref={notifRef} className="notif-container">
              <button
                className="notification-bell"
                onClick={() => setNotifOpen((s) => !s)}
                aria-label="Notifications"
              >
                🔔
                {localUnreadCount > 0 && (
                  <span className="notif-badge">{localUnreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notification-dropdown">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #eee' }}>
                    <strong>Notifications</strong>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-outline" style={{ padding: '2px 6px', fontSize: 12 }} onClick={markVisibleRead} title={localUnreadCount ? 'Mark all visible as read' : 'No unread'}>
                        Mark all as read
                      </button>
                      <button className="btn-outline" style={{ padding: '2px 6px', fontSize: 12 }} onClick={isElevated ? clearAllAndDismiss : clearVisible} title={filteredNotifications.length ? (isElevated ? 'Clear notifications' : 'Clear visible notifications') : 'Nothing to clear'}>
                        Clear
                      </button>
                    </div>
                  </div>
                  {(filteredNotifications || []).length === 0 ? (
                    <div className="notif-empty">No notifications</div>
                  ) : (
                    <ul className="notif-list">
                      {filteredNotifications.map((n) => (
                        <li key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, opacity: n.read ? 0.6 : 1 }}>
                          <button
                            className="notif-link"
                            style={{ textAlign: 'left', flex: 1 }}
                            onClick={() => {
                              // mark read and optionally navigate
                              markRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifOpen(false);
                            }}
                            title={n.title || 'Notification'}
                          >
                            {n.message}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* {(isHRBP || isHRBPLead) ? (
              <Link to="/hrbp/analysis" className="nav-profile-link">
                Analysis
              </Link>
            ) : null} */}

            <Link to="/profile" className="nav-profile-link">
              Profile
            </Link>

            <button
              className="btn-logout"
              onClick={handleLogout}
              title={canLogout ? "Logout" : `You can logout after completing 9 hours. Worked: ${workedTime}`}
              disabled={!canLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}