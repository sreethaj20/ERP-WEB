// src/components/ContextNav.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/dashboardPath";

function humanize(segment = "") {
  const s = segment.replace(/[-_]/g, " ").trim();
  if (!s) return "Module";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ContextNav() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { show, dashboardPath, moduleBasePath, moduleLabel } = useMemo(() => {
    const path = (location.pathname || "/").toLowerCase();
    // Do not show on login/signup/forgot
    if (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot")) {
      return { show: false };
    }
    // Must be logged in
    if (!currentUser) return { show: false };

    const dash = getDashboardPath(currentUser);
    // Hide on the dashboard home itself
    if (path === dash) return { show: false };

    // Determine module base path: '/role/<module>'
    // e.g. /admin/team-management -> module base '/admin/team-management'
    // e.g. /teamlead/performance -> '/teamlead/performance'
    // Fallback to dashboard if not matching role prefix
    const parts = path.split("/").filter(Boolean); // [role, module, ...]
    if (parts.length >= 2 && ["admin", "manager", "employee", "hr", "teamlead"].includes(parts[0])) {
      const base = `/${parts[0]}/${parts[1]}`;
      return {
        show: true,
        dashboardPath: dash,
        moduleBasePath: base,
        moduleLabel: humanize(parts[1])
      };
    }

    // If path doesn't follow role/module pattern, just show Back to Dashboard
    return {
      show: true,
      dashboardPath: dash,
      moduleBasePath: null,
      moduleLabel: null
    };
  }, [location.pathname, currentUser]);

  if (!show) return null;

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: '8px 16px',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      background: '#fafafa',
      position: 'sticky',
      top: 56, // below Navbar height
      zIndex: 5
    }}>
      <button className="secondary-btn" type="button" onClick={() => navigate(dashboardPath)}>
        ← Back to Home
      </button>
      {moduleBasePath && (
        <button className="primary-btn" type="button" onClick={() => navigate(moduleBasePath)}>
          ← Back to {moduleLabel}
        </button>
      )}
    </div>
  );
}
