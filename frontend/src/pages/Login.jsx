// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ShiftActionModal from "../components/ShiftActionModal";
import "../App.css";

export default function Login() {
  const { apiLogin, apiLogout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shiftModalData, setShiftModalData] = useState(null);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Keep the page from scrolling (same as previous behavior)
  useEffect(() => {
    const htmlEl = document.documentElement;
    const rootEl = document.getElementById("root");
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = htmlEl ? htmlEl.style.overflow : "";
    const prevRootOverflow = rootEl ? rootEl.style.overflow : "";
    const prevRootHeight = rootEl ? rootEl.style.height : "";

    document.body.style.overflow = "hidden";
    if (htmlEl) htmlEl.style.overflow = "hidden";
    if (rootEl) {
      rootEl.style.overflow = "hidden";
      rootEl.style.height = "100dvh";
    }
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (htmlEl) htmlEl.style.overflow = prevHtmlOverflow;
      if (rootEl) {
        rootEl.style.overflow = prevRootOverflow;
        rootEl.style.height = prevRootHeight;
      }
    };
  }, []);

  // handleSubmit: direct fetch to /api/auth/login to reliably read server JSON
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShiftModalData(null);

    if (!email || !password) {
      setError("❌ Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();

      // Direct fetch so we always can parse response body
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalized, password }),
      });

      let body = null;
      try {
        body = await res.json();
      } catch (_) {
        body = null;
      }

      // If server blocked due to shift -> show popup (modal)
      if (!res.ok) {
        const status = res.status;
        const code = body?.code || (status === 403 ? "SHIFT_TIME_RESTRICTED" : null);
        const message = body?.message || (status === 403 ? "Login blocked due to shift timing" : (body?.error || "Login failed"));

        if (code === "LOGIN_CUTOFF" || code === "SHIFT_TIME_RESTRICTED") {
          // Redirect to Late Login page with server-provided details
          const details = body?.details || null;
          navigate('/late-login', {
            state: {
              shiftInfo: {
                ...details,
                email: normalized,
              },
              from: 'login',
            }
          });
          setLoading(false);
          return;
        }

        if (status === 401) {
          setError("❌ Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        setError(`🔧 Server error (${status}). ${message}`);
        setLoading(false);
        return;
      }

      // Check for late login flag in the response
      if (body?.lateLogin) {
        // Store the token(s) and redirect to late login page
        if (body.token) {
          localStorage.setItem('token', body.token);
          localStorage.setItem('erpToken', body.token);
        }
        navigate('/late-login', { 
          state: { 
            shiftInfo: { ...(body.shiftInfo || {}), email: normalized },
            from: 'login' 
          } 
        });
      } else {
        // Normal login flow
        try {
          await apiLogin(normalized, password);
        } catch (hydErr) {
          // if hydration fails, still allow navigation when server accepted login
          console.warn("apiLogin hydration failed after direct fetch:", hydErr);
        }
        navigate("/");
      }
    } catch (err) {
      console.error("handleSubmit unexpected error:", err);
      setError("❌ An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-background"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "fixed",
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "calc(100dvh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
      aria-busy={loading}
    >
      {/* SHIFT MODAL — rendered only after attempted login was blocked */}
      {shiftModalData && (
        <ShiftActionModal
          data={shiftModalData}
          email={email}
          onClose={() => setShiftModalData(null)}
        />
      )}

      <div
        className="auth-container"
        style={{
          background: "rgba(255,255,255,0.95)",
          padding: 24,
          borderRadius: 10,
          width: "100%",
          maxWidth: 420,
          margin: 0,
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Login</h2>

        {error && (
          <p
            role="alert"
            style={{
              color: "red",
              marginBottom: 10,
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="login-email">Email</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                style={{ width: "100%", paddingRight: 16, boxSizing: "border-box" }}
                aria-label="Email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="login-password">Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                style={{ width: "100%", paddingRight: 40, boxSizing: "border-box" }}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-actions" style={{ marginBottom: 8 }}>
            <button
              className="btn-primary"
              type="submit"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: 10 }}>
            <Link to="/forgot-password" className="link-text">
              Forgot Password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
