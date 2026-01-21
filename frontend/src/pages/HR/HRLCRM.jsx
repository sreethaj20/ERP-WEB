import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function HRLCRM() {
  const { users, currentUser, listAssignedHrQueries, respondHrQuery } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [hrQueries, setHrQueries] = useState([]);
  const [filter, setFilter] = useState("all");

  // Load HR queries from backend (assigned to this HR)
  useEffect(() => {
    const load = async () => {
      try {
        const rows = await listAssignedHrQueries();
        setHrQueries(Array.isArray(rows) ? rows : []);
      } catch {
        setHrQueries([]);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [currentUser?.email, listAssignedHrQueries]);

  // (Removed inline Solve Queries panel; now navigates to dedicated page)

  const updateQueryStatus = async (queryId, newStatus, response = "") => {
    try {
      await respondHrQuery(queryId, { status: newStatus, response });
      // Refresh list from server
      const rows = await listAssignedHrQueries();
      setHrQueries(Array.isArray(rows) ? rows : []);
      // Extra UX notification for HR
      addNotification({ title: 'HR Query', message: `#${queryId} ${newStatus}`, type: 'success', ttl: 3000 });
    } catch (e) {
      addNotification({ title: 'HR Query', message: e?.message || 'Failed to update query', type: 'error', ttl: 5000 });
    }
  };

  const getEmployeeName = (email) => {
    const user = users.find(u => u.email === email);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || email : email;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "#ffc107";
      case "in-progress": return "#007bff";
      case "resolved": return "#28a745";
      case "closed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const filteredQueries = hrQueries.filter(q => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>🌐 HR ICRM </h2>
          {/* <p>Manage HR queries submitted by employees.</p> */}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>

      {/* Keep ICRM functionalities: IT Support, Admin Query, Payroll */}
      <div className="dashboard-grid" style={{ marginBottom: 12 }}>
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            try {
              const IT_EMAIL = "it.support@mercuresolution.com";
              const subject = encodeURIComponent("IT Support Request");
              const bodyLines = [
                `Requester (HR): ${currentUser?.email || ""}`,
                "",
                "Describe the IT issue here:",
              ];
              const body = encodeURIComponent(bodyLines.join("\n"));
              window.location.href = `mailto:${IT_EMAIL}?subject=${subject}&body=${body}`;
            } catch {
              // Fallback: keep previous navigation behavior
              navigate("/employee/lcrm/it-support");
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              try {
                const IT_EMAIL = "it.support@mercuresolution.com";
                const subject = encodeURIComponent("IT Support Request");
                const bodyLines = [
                  `Requester (HR): ${currentUser?.email || ""}`,
                  "",
                  "Describe the IT issue here:",
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

        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/hr/lcrm/admin-query")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/hr/lcrm/admin-query")}
        >
          <h3>⚙️ Admin Query</h3>
          <p>Contact administration for policy and process queries.</p>
        </div>

        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/hr/lcrm/payroll")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/hr/lcrm/payroll")}
        >
          <h3>💰 Payroll</h3>
          <p>Access payroll services and external payroll system.</p>
        </div>

        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/hr/solve-queries')}
          onKeyPress={(e) => e.key === "Enter" && navigate('/hr/solve-queries')}
        >
          <h3>📝 Solve Queries</h3>
          <p>Open the module to view and resolve employee queries.</p>
        </div>
      </div>

    </div>
  );
}
