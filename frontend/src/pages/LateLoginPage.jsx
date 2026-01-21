import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import { getDashboardPath } from "../utils/dashboardPath";

export default function LateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Cookie-based auth: no JS token. Namespace local keys by email when available
  const getUserEmail = () => {
    try {
      const raw = localStorage.getItem('erpUser');
      return raw ? String(JSON.parse(raw).email || '').toLowerCase() : '';
    } catch { return ''; }
  };

  const userEmail = getUserEmail();
  const hasToken = Boolean(userEmail); // consider authenticated if we have a cached user email
  const getStorageKey = (key) => userEmail ? `${key}_${userEmail}` : key;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [leaveStatus, setLeaveStatus] = useState(localStorage.getItem(getStorageKey('leaveStatus')) || '');
  const [countdown, setCountdown] = useState(null);
  const [shiftInfo, setShiftInfo] = useState({
    shiftName: "Morning Shift",
    loginWindow: { start: "09:00", end: "09:10" },
    currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  // Use a ref to track the latest leave status
  const leaveStatusRef = useRef(leaveStatus);
  // Run-once guard for rejection redirect to prevent duplicate navigations
  const rejectionHandledRef = useRef(false);
  // Track a manual refresh loop timer
  const refreshIntervalRef = useRef(null);
  useEffect(() => {
    leaveStatusRef.current = leaveStatus;
  }, [leaveStatus]);

  useEffect(() => {
    if (location.state?.shiftInfo) {
      const { shiftType, loginWindow } = location.state.shiftInfo;
      setShiftInfo({
        shiftName: shiftType || "Morning Shift",
        loginWindow: {
          start: loginWindow?.start || "09:00",
          end: loginWindow?.end || "09:10"
        },
        currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      });
    }

    // If previously rejected, show a one-time popup even when not authenticated
    try {
      const rejAt = localStorage.getItem('lastExtensionRejectedAt');
      if (rejAt) {
        try { alert('Your late login (shift extension) request was previously rejected by your Team Lead.'); } catch {}
        localStorage.removeItem('lastExtensionRejectedAt');
        localStorage.removeItem('lastExtensionRejectedEmail');
      }
    } catch {}

    // Daily reset: clear previous day's local state so the button updates daily
    try {
      const today = new Date().toISOString().slice(0,10);
      const lastDate = localStorage.getItem(getStorageKey('lastHalfDayDate'));
      if (lastDate !== today) {
        // Clear both namespaced and legacy keys
        localStorage.removeItem(getStorageKey('leaveStatus'));
        localStorage.removeItem(getStorageKey('leaveApprovalTime'));
        localStorage.removeItem(getStorageKey('halfDayLogoutAfter'));
        localStorage.removeItem('leaveStatus');
        localStorage.removeItem('leaveApprovalTime');
        localStorage.removeItem('halfDayLogoutAfter');
        setLeaveStatus('');
      }
      localStorage.setItem(getStorageKey('lastHalfDayDate'), today);
    } catch (_) {}

    // Check for existing approval
    const approvalTime = localStorage.getItem(getStorageKey('leaveApprovalTime'));
    if (approvalTime) {
      const approvedAt = new Date(approvalTime);
      const now = new Date();
      const hoursSinceApproval = (now - approvedAt) / (1000 * 60 * 60);
      
      if (hoursSinceApproval < 4) {
        const remainingMs = (4 * 60 * 60 * 1000) - (now - approvedAt);
        startLogoutTimer(remainingMs);
        setLeaveStatus("approved");
        setMessage(`Leave approved. Redirecting...`);
        setTimeout(() => {
          if (hasToken) {
            navigateToRoleHome();
          } else {
            navigate('/login');
          }
        }, 1200);
      } else {
        localStorage.removeItem(getStorageKey('leaveStatus'));
        localStorage.removeItem(getStorageKey('leaveApprovalTime'));
      }
    }
  }, [location.state]);

  // Helper: navigate to role-based home
  const navigateToRoleHome = () => {
    try {
      const raw = localStorage.getItem('erpUser');
      const user = raw ? JSON.parse(raw) : null;
      const path = getDashboardPath(user) || '/';
      navigate(path);
    } catch {
      navigate('/');
    }
  };

  // Centralized rejection handler: clear session, mark flag, and go to login
  const handleRejectionRedirect = () => {
    if (rejectionHandledRef.current) return;
    rejectionHandledRef.current = true;
    setMessage('Extension request was rejected. Redirecting to login...');
    try {
      alert('Your late login request was rejected by your Team Lead. You will be redirected to the login screen.');
    } catch {}
    try {
      const raw = localStorage.getItem('erpUser');
      const email = raw ? (JSON.parse(raw).email || '') : '';
      localStorage.setItem('lastExtensionRejectedAt', new Date().toISOString());
      if (email) localStorage.setItem('lastExtensionRejectedEmail', String(email).toLowerCase());
    } catch {}
    try {
      // Best-effort server logout to clear auth cookies (no auth required)
      fetch('/api/auth/logout-clear', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch {}
    try {
      // Clear local session so navbar/home actions are disabled after refresh
      localStorage.removeItem('erpUser');
      localStorage.removeItem('erpToken');
    } catch {}
    setTimeout(() => navigate('/login'), 300);
  };

  // Manual status check used by Refresh button auto-loop
  const checkExtensionStatus = async () => {
    try {
      if (!hasToken) return;
      const res = await fetch('/api/shift-requests/my', { credentials: 'include' });
      if (!res.ok) return;
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length) {
        const latest = [...rows].sort((a,b) => new Date(b.updatedAt||b.createdAt||0) - new Date(a.updatedAt||a.createdAt||0))[0];
        const st = String(latest.status || '').toLowerCase();
        if (st === 'approved') {
          setMessage('Extension approved! Redirecting to your home page...');
          setTimeout(navigateToRoleHome, 1200);
          if (refreshIntervalRef.current) { clearInterval(refreshIntervalRef.current); refreshIntervalRef.current = null; }
        } else if (st === 'rejected') {
          handleRejectionRedirect();
          if (refreshIntervalRef.current) { clearInterval(refreshIntervalRef.current); refreshIntervalRef.current = null; }
        } else {
          setMessage('Latest extension status: ' + st);
        }
      }
    } catch {}
  };

  // Poll for shift extension approval when authenticated
  useEffect(() => {
    if (!hasToken) return;
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/shift-requests/my', { credentials: 'include' });
        if (!res.ok) return;
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length) {
          // Use the most recent item by updatedAt/createdAt to avoid stale status
          const latest = [...rows].sort((a,b) => new Date(b.updatedAt||b.createdAt||0) - new Date(a.updatedAt||a.createdAt||0))[0];
          const st = String(latest.status || '').toLowerCase();
          if (st === 'approved') {
            setMessage('Extension approved! Redirecting to your home page...');
            stopped = true;
            setTimeout(navigateToRoleHome, 1500);
          } else if (st === 'rejected') {
            stopped = true;
            handleRejectionRedirect();
          }
        }
      } catch {}
    };
    const id = setInterval(() => { if (!stopped) poll(); }, 15000);
    // initial check
    poll();
    return () => clearInterval(id);
  }, [hasToken]);

  const handleApplyHalfDay = async () => {
    setLoading(true);
    setMessage("Sending half-day leave request...");

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          from: today,
          to: today,
          type: "half-day",
          reason: "Late login - Half day leave requested",
          duration: 0.5,
          partOfDay: "AM"
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit leave request");
      }

      setLeaveStatus("pending");
      localStorage.setItem(getStorageKey('leaveStatus'), 'pending');
      try {
        const today = new Date().toISOString().slice(0,10);
        localStorage.setItem(getStorageKey('lastHalfDayDate'), today);
      } catch (_) {}
      setMessage("Half-day leave request submitted. Waiting for approval...");
      
      // Start polling for status updates
      const pollStatus = async () => {
        try {
          const statusRes = await fetch("/api/leaves/my", { credentials: 'include' });
          
          if (!statusRes.ok) throw new Error("Failed to fetch leave status");
          
          const myLeaves = await statusRes.json();
          
          // Find the most recent leave request
          const latestLeave = Array.isArray(myLeaves) 
            ? myLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;
          
          if (latestLeave?.status === "approved") {
            setLeaveStatus("approved");
            localStorage.setItem(getStorageKey('leaveStatus'), 'approved');
            localStorage.setItem(getStorageKey('leaveApprovalTime'), new Date().toISOString());
            try {
              // Persist half-day logout unlock time globally for today (Option A)
              const unlockAt = Date.now() + (4 * 60 * 60 * 1000);
              localStorage.setItem(getStorageKey('halfDayLogoutAfter'), String(unlockAt));
              // Also set a non-namespaced key for global checks
              localStorage.setItem('halfDayLogoutAfter', String(unlockAt));
            } catch (_) {}
            try {
              const today = new Date().toISOString().slice(0,10);
              localStorage.setItem(getStorageKey('lastHalfDayDate'), today);
            } catch (_) {}
            setMessage("Leave approved! Redirecting to your home page...");
            startLogoutTimer(4 * 60 * 60 * 1000); // 4 hours
            setTimeout(navigateToRoleHome, 1500);
            return true; // Stop polling
          } else if (latestLeave?.status === "rejected") {
            setLeaveStatus("rejected");
            localStorage.setItem(getStorageKey('leaveStatus'), 'rejected');
            handleRejectionRedirect();
            return true; // Stop polling
          }
        } catch (error) {
          console.error("Error checking leave status:", error);
        }
        return false; // Continue polling
      };

      // Start polling
      const pollInterval = setInterval(async () => {
        const shouldStop = await pollStatus();
        if (shouldStop) {
          clearInterval(pollInterval);
        }
      }, 15000); // Check every 15 seconds

      // Initial poll
      const initialPoll = async () => {
        const shouldStop = await pollStatus();
        if (shouldStop) {
          clearInterval(pollInterval);
        }
      };
      initialPoll();

      // Cleanup on unmount
      return () => clearInterval(pollInterval);
    } catch (error) {
      console.error("Leave request error:", error);
      setMessage(error.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const startLogoutTimer = (durationMs) => {
    const endTime = Date.now() + durationMs;
    
    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown(`${hours}h ${minutes}m`);
      
      if (remaining <= 0) {
        clearInterval(timer);
        setMessage("You can now log out.");
        setCountdown(null);
      }
    };
    
    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(timer);
  };

  const handleRequestExtension = async () => {
    try {
      setLoading(true);
      setMessage("Sending shift extension request...");
      // Read current user's email from storage so backend can infer approver
      let employeeEmail = '';
      try {
        const raw = localStorage.getItem('erpUser');
        if (raw) employeeEmail = (JSON.parse(raw).email || '').toLowerCase();
      } catch {}
      if (!employeeEmail && location?.state?.shiftInfo?.email) {
        employeeEmail = String(location.state.shiftInfo.email).toLowerCase();
      }
      const payload = {
        email: employeeEmail || undefined,
        shiftType: shiftInfo.shiftName,
        requestedMinutes: 30,
        reason: `Late login. Allowed ${shiftInfo.loginWindow.start}-${shiftInfo.loginWindow.end}, current ${shiftInfo.currentTime}`
      };
      const endpoint = '/api/shift-requests/public';
      const headers = { 'Content-Type': 'application/json' };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        // no credentials for public endpoint
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to create shift extension request');
      }
      setMessage('Shift extension request submitted to your team lead.');
      // Extension path should not carry half-day logout restrictions
      try {
        localStorage.removeItem(getStorageKey('leaveStatus'));
        localStorage.removeItem(getStorageKey('leaveApprovalTime'));
        localStorage.removeItem(getStorageKey('halfDayLogoutAfter'));
        localStorage.removeItem('leaveStatus');
        localStorage.removeItem('leaveApprovalTime');
        localStorage.removeItem('halfDayLogoutAfter');
      } catch {}
    } catch (e) {
      setMessage(e?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setShiftInfo((prev) => ({
        ...prev,
        currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }));
      // Start or restart a short auto-refresh loop to keep status updated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      await checkExtensionStatus();
      refreshIntervalRef.current = setInterval(async () => {
        setShiftInfo((prev) => ({
          ...prev,
          currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
        await checkExtensionStatus();
      }, 10000);
    } catch {}
  };

  // Cleanup any manual refresh loop on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  const handleContinue = () => {
    if (leaveStatus === 'approved') {
      navigateToRoleHome();
    } else {
      navigate("/login");
    }
  };

  // Page is accessible with or without token (public shift extension supported)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Clock size={24} style={styles.clockIcon} />
          <h2 style={styles.title}>Shift Login Blocked</h2>
        </div>
        
        <div style={styles.errorMessage}>
          Login window closed for {shiftInfo.shiftName}. Allowed login: {shiftInfo.loginWindow.start} - {shiftInfo.loginWindow.end}. Current: {shiftInfo.currentTime}
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Allowed login window:</span>
          <span style={styles.infoValue}>{shiftInfo.loginWindow.start} - {shiftInfo.loginWindow.end}</span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Current server time:</span>
          <span style={styles.infoValue}>{shiftInfo.currentTime}</span>
        </div>

        <div style={styles.buttonGroup}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{ ...styles.button, backgroundColor: '#6b7280', padding: '8px 12px', fontSize: 14 }}
              onClick={handleRefresh}
              disabled={loading}
            >↻ Refresh</button>
          </div>
          <button
            style={styles.button}
            onClick={handleApplyHalfDay}
            disabled={loading || leaveStatus === "pending" || leaveStatus === "approved"}
          >
            {leaveStatus === "pending" ? "Request Pending..." : 
             leaveStatus === "approved" ? "Leave Approved" : 
             "Apply Half-Day Leave"}
          </button>

          <button
            style={{ ...styles.button, backgroundColor: "#3b82f6" }}
            onClick={handleRequestExtension}
            disabled={loading || leaveStatus === "approved"}
          >
            Request Shift Extension
          </button>

          <button
            style={{ ...styles.button, backgroundColor: "#4b5563" }}
            onClick={handleContinue}
            disabled={loading}
          >
            {leaveStatus === "approved" ? "Continue to Home" : "Back to Login"}
          </button>
        </div>

        {countdown && (
          <p style={{color: '#666', marginTop: '10px', textAlign: 'center'}}>
            Logout available in: {countdown}
          </p>
        )}

        <p style={styles.note}>
          Applying a half-day leave will mark your attendance for the day. Requesting extension will notify your manager to approve a late login.
        </p>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '8px',
  },
  clockIcon: {
    color: '#ef4444',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  infoLabel: {
    color: '#4b5563',
  },
  infoValue: {
    fontWeight: '500',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '24px 0',
  },
  note: {
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '16px',
    lineHeight: '1.5',
  },
  container: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0",
    color: "#1f2937"
  },
  button: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontSize: "16px"
  },
  message: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f0fdf4",
    color: "#065f46",
    textAlign: "center",
    fontSize: "14px"
  }
};

