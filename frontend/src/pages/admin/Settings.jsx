import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

const ALL_MODULES = [
  // Core
  { key: "dashboard", label: "Dashboard" },
  { key: "attendance", label: "Attendance" },
  { key: "leave", label: "Leave Requests" },
  // Manager suite
  { key: "teamManagement", label: "Team Management" },
  { key: "teamAttendance", label: "Team Attendance" },
  { key: "performanceAnalytics", label: "Performance Analytics" },
  { key: "taskManagement", label: "Task Management" },
  { key: "ragStatus", label: "RAG Status" },
];

const ROLES = ["admin", "manager", "employee"];

const DEFAULT_SETTINGS = {
  modules: Object.fromEntries(ALL_MODULES.map((m) => [m.key, true])),
  permissions: Object.fromEntries(
    ROLES.map((r) => [
      r,
      Object.fromEntries(
        ALL_MODULES.map((m) => [
          m.key,
          r === "admin" // Admin has access to everything by default
            ? true
            : r === "manager"
            ? [
                "dashboard",
                "attendance",
                "teamManagement",
                "teamAttendance",
                "performanceAnalytics",
                "taskManagement",
                "ragStatus",
              ].includes(m.key)
            : // employee
              ["dashboard", "attendance", "leave"].includes(m.key),
        ])
      ),
    ])
  ),
};

export default function Settings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("erpSettings");
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    localStorage.setItem("erpSettings", JSON.stringify(settings));
  }, [settings]);

  const setModuleEnabled = (key, value) => {
    setSettings((prev) => ({ ...prev, modules: { ...prev.modules, [key]: value } }));
  };

  const setPermission = (role, key, value) => {
    setSettings((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [role]: { ...prev.permissions[role], [key]: value },
      },
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("erpSettings", JSON.stringify(settings));
      setSavedAt(new Date());
    } catch (e) {
      alert("Failed to save settings");
    }
  };

  const formatSavedTime = (d) =>
    d ? d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>⚙️ System Settings</h2>
          <p>Configure ERP modules, permissions, and integrations.</p>
          {savedAt && (
            <small style={{ color: "#6b7280" }}>Last saved: {formatSavedTime(savedAt)}</small>
          )}
        </div>
        <div>
          <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      {/* Modules */}
      <div className="dashboard-card">
        <h3>Modules</h3>
        <p style={{ marginTop: 0 }}>Enable or disable ERP modules globally. Disabled modules will be hidden for all roles.</p>
        <table className="user-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ddd" }}>Module</th>
              <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {ALL_MODULES.map((m) => (
              <tr key={m.key} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>{m.label}</td>
                <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>
                  <input
                    type="checkbox"
                    checked={!!settings.modules[m.key]}
                    onChange={(e) => setModuleEnabled(m.key, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions */}
      <div className="dashboard-card" style={{ marginTop: 16 }}>
        <h3>Permissions</h3>
        <p style={{ marginTop: 0 }}>Role-based access per module. A module must be enabled above to be accessible.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="user-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: 12, textAlign: "left", border: "1px solid #ddd" }}>Module</th>
                {ROLES.map((r) => (
                  <th key={r} style={{ padding: 12, textAlign: "center", border: "1px solid #ddd", textTransform: "capitalize" }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_MODULES.map((m) => (
                <tr key={m.key} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{m.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>
                      <input
                        type="checkbox"
                        checked={!!settings.permissions?.[r]?.[m.key]}
                        onChange={(e) => setPermission(r, m.key, e.target.checked)}
                        disabled={!settings.modules[m.key]}
                        title={!settings.modules[m.key] ? "Module disabled" : undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrations placeholder */}
      <div className="dashboard-card" style={{ marginTop: 16 }}>
        <h3>Integrations</h3>
        <p style={{ marginTop: 0 }}>Connect ERP with third-party tools (Slack, Gmail, etc.).</p>
        <p style={{ color: "#6b7280" }}>
          Coming soon — this section can store API keys securely and manage integration toggles.
        </p>
      </div>
    </div>
  );
}
