import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();
export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { listMyNotifications, createNotificationApi, createNotificationSelfApi, markNotificationRead, deleteNotificationApi, deleteNotificationSelfApi, currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastClearedAt, setLastClearedAt] = useState(0);

  const clearKey = useCallback(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    return email ? `erpNotificationsClearedAt_${email}` : 'erpNotificationsClearedAt_';
  }, [currentUser?.email]);

  const getClearedAt = useCallback(() => {
    try {
      const raw = localStorage.getItem(clearKey());
      const n = raw ? Number(raw) : 0;
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }, [clearKey]);

  const applyClearedFilter = useCallback((rows = []) => {
    const clearedAt = getClearedAt();
    if (!clearedAt) return Array.isArray(rows) ? rows : [];
    const arr = Array.isArray(rows) ? rows : [];
    return arr.filter((n) => {
      const ts = n?.createdAt ? Date.parse(n.createdAt) : NaN;
      // After clear: hide items without a usable timestamp to prevent them from reappearing
      if (!Number.isFinite(ts)) return false;
      return ts > clearedAt;
    });
  }, [getClearedAt]);

  const fetchAll = useCallback(async () => {
    try {
      const rows = await listMyNotifications();
      setNotifications(applyClearedFilter(rows));
    } catch (e) {
      // Fallback: hydrate from localStorage so notifications created client-side are visible
      try {
        const raw = localStorage.getItem('erpNotifications');
        const cached = raw ? JSON.parse(raw) : [];
        setNotifications(applyClearedFilter(Array.isArray(cached) ? cached : []));
      } catch {
        setNotifications([]);
      }
    }
  }, [listMyNotifications, applyClearedFilter]);

  // Initial load when user changes
  useEffect(() => {
    if (!currentUser) { setNotifications([]); return; }
    // Hydrate lastClearedAt per user
    const ca = getClearedAt();
    setLastClearedAt(ca);
    fetchAll();
  }, [currentUser, fetchAll, getClearedAt]);

  // Lightweight polling to keep notifications fresh (only when logged in)
  useEffect(() => {
    if (!currentUser) return;
    const t = setInterval(() => { fetchAll(); }, 10000);
    return () => clearInterval(t);
  }, [currentUser, fetchAll]);

  // Optimistically mark notifications as read locally (and mirror to localStorage cache)
  const setReadLocal = useCallback((ids = []) => {
    if (!ids.length) return;
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
    try {
      const raw = localStorage.getItem('erpNotifications');
      const arr = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(arr) ? arr.map(n => ids.includes(n.id) ? { ...n, read: true } : n) : arr;
      localStorage.setItem('erpNotifications', JSON.stringify(updated));
    } catch {}
  }, []);

  const addNotification = useCallback(async ({ title = "", message = "", type = "info", ttl = 0, link = "", audience = "all" }) => {
    const role = String(currentUser?.role || '').toLowerCase();
    const elevated = ['admin','teamlead','manager','hr'].includes(role);
    try {
      if (elevated) {
        await createNotificationApi({ title, message, type, link, audience });
      } else {
        await createNotificationSelfApi({ title, message, type, link });
      }
      await fetchAll();
    } catch (e) {
      // Fallback: ephemeral client-side toast (non-persistent across reloads)
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
      const n = { id, title, message, type, link, audience, createdAt: new Date().toISOString(), read: false };
      setNotifications((prev) => {
        const next = applyClearedFilter([n, ...prev]);
        try {
          // Mirror to localStorage so other sessions on this browser (e.g., HR) can see it after login
          const raw = localStorage.getItem('erpNotifications');
          const arr = raw ? JSON.parse(raw) : [];
          localStorage.setItem('erpNotifications', JSON.stringify([n, ...arr]));
        } catch {}
        return next;
      });
      if (ttl && ttl > 0) {
        setTimeout(() => {
          setNotifications((prev) => {
            const next = prev.filter((x) => x.id !== id);
            try {
              const raw = localStorage.getItem('erpNotifications');
              const arr = raw ? JSON.parse(raw) : [];
              const updated = arr.filter((x) => x.id !== id);
              localStorage.setItem('erpNotifications', JSON.stringify(updated));
            } catch {}
            return next;
          });
        }, ttl);
      }
      return id;
    }
  }, [currentUser, createNotificationApi, createNotificationSelfApi, fetchAll, applyClearedFilter]);

  const markRead = useCallback(async (id) => {
    // Optimistic UI update
    setReadLocal([id]);
    try {
      await markNotificationRead(id);
      await fetchAll();
    } catch (e) {
      console.warn('Failed to mark notification read', e);
      // Keep optimistic state; server will reconcile on next fetch
    }
  }, [markNotificationRead, fetchAll, setReadLocal]);

  const removeNotification = useCallback(async (id) => {
    const role = String(currentUser?.role || '').toLowerCase();
    const elevated = ['admin','teamlead','manager','hr'].includes(role);
    // Optimistic UI removal
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const raw = localStorage.getItem('erpNotifications');
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) localStorage.setItem('erpNotifications', JSON.stringify(arr.filter(n => n.id !== id)));
    } catch {}
    try {
      if (elevated) {
        await deleteNotificationApi(id);
      } else {
        await deleteNotificationSelfApi(id);
      }
      await fetchAll();
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  }, [currentUser, deleteNotificationApi, deleteNotificationSelfApi, fetchAll]);

  const clearAll = useCallback(async () => {
    const role = String(currentUser?.role || '').toLowerCase();
    const elevated = ['admin','teamlead','manager','hr'].includes(role);
    const clearedAt = Date.now();
    // Attempt to clear from server where possible
    for (const n of notifications) {
      try {
        if (elevated) {
          await deleteNotificationApi(n.id);
        } else {
          // Employees: try self endpoint; some broadcasts may not be deletable server-side
          await deleteNotificationSelfApi(n.id);
        }
      } catch {}
    }
    // Always clear local cache and UI state to satisfy UX expectation
    try { localStorage.removeItem('erpNotifications'); } catch {}
    setNotifications([]);
    setLastClearedAt(clearedAt);
    try { localStorage.setItem(clearKey(), String(clearedAt)); } catch {}
  }, [currentUser, notifications, deleteNotificationApi, deleteNotificationSelfApi, clearKey]);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    const ids = unread.map(n => n.id);
    // Optimistic UI update
    setReadLocal(ids);
    // Best-effort server sync
    try {
      await Promise.all(unread.map(n => markNotificationRead(n.id).catch(() => {})));
    } catch {}
    await fetchAll();
  }, [notifications, markNotificationRead, fetchAll, setReadLocal]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, markRead, markAllRead, clearAll, unreadCount, lastClearedAt }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
