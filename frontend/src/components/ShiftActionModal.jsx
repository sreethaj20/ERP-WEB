// src/components/ShiftActionModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Props:
 *  - data: { code, message, details }
 *  - email: string (user email attempted)
 *  - onClose: () => void
 */
export default function ShiftActionModal({ data, email, onClose }) {
  const { createLeave, createNotificationSelfApi, requestShiftExtensionFromModal } = useAuth();
  const navigate = useNavigate();

  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingExtend, setLoadingExtend] = useState(false);
  const details = data?.details || {};

  const applyHalfDay = async () => {
    try {
      setLoadingLeave(true);
      const today = new Date().toISOString().slice(0, 10);
      const key = `lastHalfDayApplied_${email || 'self'}`;
      const last = localStorage.getItem(key);
      if (last === today) {
        alert("You have already applied a half-day leave today.");
        return;
      }

      await createLeave({
        from: today,
        to: today,
        type: "half-day",
        duration: 0.5,
        partOfDay: 'AM',
        reason: `Missed login window (${details?.loginWindow?.startHH || ""} - ${details?.loginWindow?.endHH || ""})`,
      });
      try { localStorage.setItem(key, today); } catch(_) {}
      alert("Half-day leave applied.");

      // Start polling for approval; navigate to home when approved
      const pollStatus = async () => {
        try {
          const token = localStorage.getItem('erpToken');
          const res = await fetch('/api/leaves/my', {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            }
          });
          if (!res.ok) return false;
          const myLeaves = await res.json();
          const latestLeave = Array.isArray(myLeaves)
            ? myLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;
          if (latestLeave?.status === 'approved') {
            navigate('/home');
            return true;
          }
        } catch (_) {}
        return false;
      };

      const interval = setInterval(async () => {
        const done = await pollStatus();
        if (done) clearInterval(interval);
      }, 5000);

      // Also do an initial check immediately
      (async () => { const done = await pollStatus(); if (done) clearInterval(interval); })();

      onClose();
    } catch (e) {
      console.error("applyHalfDay:", e);
      const msg = e?.message || e?.data?.message || "Failed to apply leave. Try again or contact HR.";
      alert(msg);
    } finally {
      setLoadingLeave(false);
    }
  };

  const requestExtension = async () => {
    try {
      setLoadingExtend(true);
      // Send to backend shift-requests endpoint
      const reason = `Late login. Allowed ${details?.loginWindow?.startHH || ''}-${details?.loginWindow?.endHH || ''}, current ${details?.now || ''}`;
      await requestShiftExtensionFromModal({
        email,
        shiftType: details?.shiftType || details?.displayName || undefined,
        requestedMinutes: 30,
        reason,
      });
      try {
        const title = "Shift extension request";
        const body = `User ${email} requested a login extension for ${details?.displayName || details?.shiftType || ""}.`;
        await createNotificationSelfApi({ title, body, meta: { email, shift: details?.shiftType || null } });
      } catch {}
      alert("Extension request created and sent to your team lead.");
      onClose();
    } catch (e) {
      console.error("requestExtension:", e);
      const msg = e?.message || e?.data?.message || "Failed to send request. Try again or notify manager.";
      alert(msg);
    } finally {
      setLoadingExtend(false);
    }
  };

  // minimal inline styles; move to CSS if desired
  const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const boxStyle = {
    background: "#fff",
    padding: 20,
    width: "min(720px, 96%)",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };
  const btn = {
    padding: "10px 16px",
    borderRadius: 6,
    marginRight: 8,
    cursor: "pointer",
    border: "none",
  };

  return (
    <div style={backdropStyle} role="dialog" aria-modal="true">
      <div style={boxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>⏰ Shift Login Blocked</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", fontSize: 20 }}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <p style={{ color: "#b71c1c", fontWeight: 600, marginBottom: 8 }}>{data?.message}</p>

          {details?.loginWindow && (
            <p style={{ margin: 0 }}>
              Allowed login window: <strong>{details.loginWindow.startHH} - {details.loginWindow.endHH}</strong>
            </p>
          )}

          {details?.now && (
            <p style={{ marginTop: 8, color: "#444" }}>Current server time: <strong>{details.now}</strong></p>
          )}

          <div style={{ marginTop: 18, display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={applyHalfDay} disabled={loadingLeave} style={{ ...btn, background: "#0b63e5", color: "#fff" }}>
              {loadingLeave ? "Applying..." : "Apply Half-Day Leave"}
            </button>

            <button onClick={requestExtension} disabled={loadingExtend} style={{ ...btn, background: "#1f8f4e", color: "#fff" }}>
              {loadingExtend ? "Sending..." : "Request Shift Extension"}
            </button>

            <button onClick={onClose} style={{ ...btn, background: "#eee" }}>
              Close
            </button>
          </div>

          <div style={{ marginTop: 14, color: "#666", fontSize: 13 }}>
            <p style={{ margin: 0 }}>
              Applying a half-day leave will mark your attendance for the day. Requesting extension will notify your manager to approve a late login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
