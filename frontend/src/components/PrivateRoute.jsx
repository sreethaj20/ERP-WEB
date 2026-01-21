import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEffectiveRole, getDashboardPath } from "../utils/dashboardPath";

function AccessDeniedPopup({ target }) {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(target, { replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, target]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Access denied"
    >
      <div
        style={{
          width: "min(520px, 92vw)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))",
          border: "1px solid rgba(148, 163, 184, 0.30)",
          borderRadius: 16,
          boxShadow: "0 22px 60px rgba(2, 6, 23, 0.30)",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", marginBottom: 6 }}>
          Access denied
        </div>
        <div style={{ color: "#334155", marginBottom: 12 }}>
          You don&apos;t have access to this module.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(target, { replace: true })}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrivateRoute({ children, role, designations }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // ❌ Not logged in → send to login
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const normalize = (s = "") => String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
    const required = normalize(role);
    const effectiveRole = normalize(getEffectiveRole(currentUser));
    const actualRole = normalize(currentUser.role || "");
    if (effectiveRole !== required && actualRole !== required) {
      // ❌ Not allowed → send to the user's appropriate dashboard
      const target = getDashboardPath(currentUser);
      // Avoid redirect loop if we're already at target
      if (location.pathname === target) return children;
      return <AccessDeniedPopup target={target} />;
    }
  }

  if (Array.isArray(designations) && designations.length > 0) {
    const normalize = (s = "") => String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();
    const allowed = designations.map(normalize);
    const current = normalize(currentUser.designation || currentUser.position || "");
    if (!allowed.includes(current)) {
      const target = getDashboardPath(currentUser);
      if (location.pathname === target) return children;
      return <AccessDeniedPopup target={target} />;
    }
  }

  // Access granted
  return children;
}
