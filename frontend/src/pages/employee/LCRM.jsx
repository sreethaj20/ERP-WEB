import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveRole } from "../../utils/dashboardPath";
import { getDashboardPath } from "../../utils/dashboardPath";
import "../../App.css";

export default function LCRM() {
  const { currentUser } = useAuth();
  const effectiveRole = getEffectiveRole(currentUser);
  const normRole = String(effectiveRole || '').toLowerCase().replace(/\s+/g, '');
  const navigate = useNavigate();
  const IT_EMAIL = "it.support@mercuresolution.com"; // central IT email

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>ICRM - {displayName} 🌐</h2>
          {/* <p>Access support services and raise queries for various departments.</p> */}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* IT Support - open email directly */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            try {
              const subject = encodeURIComponent("IT Support Request");
              const bodyLines = [
                `Employee: ${currentUser?.email || ""}`,
                "",
                "Describe your issue here:",
              ];
              const body = encodeURIComponent(bodyLines.join("\n"));
              window.location.href = `mailto:${IT_EMAIL}?subject=${subject}&body=${body}`;
            } catch {
              // Fallback to IT Support page if mailto fails
              navigate("/employee/lcrm/it-support");
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              try {
                const subject = encodeURIComponent("IT Support Request");
                const bodyLines = [
                  `Employee: ${currentUser?.email || ""}`,
                  "",
                  "Describe your issue here:",
                ];
                const body = encodeURIComponent(bodyLines.join("\n"));
                window.location.href = `mailto:${IT_EMAIL}?subject=${subject}&body=${body}`;
              } catch { navigate("/employee/lcrm/it-support"); }
            }
          }}
        >
          <h3>💻 IT Support</h3>
          <p>Click to open your email to contact IT.</p>
        </div>

        {/* HR Query */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            const path = normRole === 'teamlead' ? '/teamlead/lcrm/hr-query' : '/employee/lcrm/hr-query';
            navigate(path);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const path = normRole === 'teamlead' ? '/teamlead/lcrm/hr-query' : '/employee/lcrm/hr-query';
              navigate(path);
            }
          }}
        >
          <h3>👥 HR Query</h3>
          <p>Submit HR-related questions and requests.</p>
        </div>

        {/* Admin Query */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            const path = normRole === 'teamlead' ? '/teamlead/lcrm/admin-query' : '/employee/lcrm/admin-query';
            navigate(path);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const path = normRole === 'teamlead' ? '/teamlead/lcrm/admin-query' : '/employee/lcrm/admin-query';
              navigate(path);
            }
          }}
        >
          <h3>⚙️ Admin Query</h3>
          <p>Contact administration for policy and process queries.</p>
        </div>

        {/* Payroll */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => window.open("https://payroll.razorpay.com/login", "_blank", "noopener")}
          onKeyPress={(e) => e.key === "Enter" && window.open("https://payroll.razorpay.com/login", "_blank", "noopener")}
        >
          <h3>💰 Payroll</h3>
          <p>Access payroll services and external payroll system.</p>
        </div>

              </div>
    </div>
  );
}
