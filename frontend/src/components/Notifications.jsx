import React, { useMemo, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import "./Notifications.css"; // small CSS (see below) or put styles in App.css

export default function Notifications() {
  const { notifications, addNotification, removeNotification, markRead, clearAll, markAllRead } = useNotifications();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  const filtered = useMemo(() => {
    const email = (currentUser?.email || '').toLowerCase();
    const all = notifications || [];
    // Requirement: Admin should NOT see all notifications. Everyone only sees items targeted to their user.
    const base = all.filter(n => String(n.audience || '').toLowerCase() === `user:${email}`);
    return base.filter(n => !dismissedIds.has(n.id));
  }, [notifications, currentUser?.email, dismissedIds]);

  const localUnreadCount = useMemo(() => filtered.filter(n => !n.read).length, [filtered]);

  const clearVisible = () => {
    // UI-only clear: hide visible notifications locally (do not call server)
    setDismissedIds(prev => {
      const next = new Set(prev);
      filtered.forEach(n => next.add(n.id));
      return next;
    });
  };

  const isElevated = ['admin','teamlead','manager','hr'].includes(String(currentUser?.role || '').toLowerCase());

  const clearAllAndDismiss = async () => {
    try { await clearAll(); } catch {}
    // Ensure UI hides anything that reappears due to polling
    setDismissedIds(prev => {
      const next = new Set(prev);
      (notifications || []).forEach(n => next.add(n.id));
      return next;
    });
  };

  const markVisibleRead = () => {
    filtered.filter(n => !n.read).forEach(n => markRead(n.id));
  };

  const canClear = filtered.length > 0;
  const canMark = localUnreadCount > 0;

  return (
    <div className="notif-root">
      <button
        className="notif-bell"
        aria-label="Notifications"
        onClick={() => setOpen((s) => !s)}
        title="Notifications"
      >
        🔔
        {localUnreadCount > 0 && <span className="notif-badge">{localUnreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <strong>Notifications</strong>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" className="link-button" onClick={markVisibleRead} title={canMark ? 'Mark all visible as read' : 'No unread items'}>
                Mark all read
              </button>
              <button
                type="button"
                className="link-button"
                onClick={isElevated ? clearAllAndDismiss : clearVisible}
                title={canClear ? (isElevated ? 'Clear notifications' : 'Clear visible notifications') : 'Nothing to clear'}
              >
                Clear
              </button>
              <button type="button" className="link-button" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
          <div className="notif-list">
            {filtered.length === 0 ? (
              <div className="notif-empty">No notifications</div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.read ? "read" : "unread"} ${n.type}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-meta">
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                    <button className="link-button" onClick={(e) => { e.stopPropagation(); setDismissedIds(prev => new Set(prev).add(n.id)); }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderTop: '1px solid #eee' }}>
            <button type="button" className="link-button" onClick={markVisibleRead} title={canMark ? 'Mark all visible as read' : 'No unread items'}>
              Mark all read
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="link-button"
                onClick={isElevated ? clearAll : clearVisible}
                title={canClear ? (isElevated ? 'Clear notifications' : 'Clear visible notifications') : 'Nothing to clear'}
              >
                Clear
              </button>
              <button type="button" className="link-button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
