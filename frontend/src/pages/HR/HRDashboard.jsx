import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function HRDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Prefer real name. Fallbacks: firstName, name, email username, then "HR"
  const displayName =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "HR");

  return (
    <div className="dashboard fade-in">
      <div className="welcome-section">
        <h1>Welcome back, <span className="employee-name">{displayName}</span>! 👋</h1>
        {/* <p className="welcome-subtitle">Quick access to HR tools and employee-like utilities.</p> */}
      </div>

      <div className="dashboard-grid" style={{ gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {/* Employee-like functions */}
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/hr/tasks")}>
          <h3>📋 My Tasks</h3>
          {/* <p>Stay updated with assigned tasks and deadlines.</p> */}
        </div>
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/profile")}>
          <h3>⚙️ Profile Settings</h3>
          <p>Update your personal details and account preferences.</p>
        </div>
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/policies")}>
          <h3>📜 Policies</h3>
          <p>Browse company HR, IT, Admin and compliance policies.</p>
        </div>
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/hr/mydesk")}>
          <h3>📊 My Desk</h3>
          <p>Access production metrics, quality scores, and performance indicators.</p>
        </div>
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/hr/lcrm")}>
          <h3>🎧 ICRM</h3>
          <p>Access support services, raise tickets, and submit queries.</p>
        </div>

        {/* HR-specific tools */}
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/hr/recruitment")}>
          <h3>🧑‍🎓 Recruitment</h3>
          <p>Manage candidates and placement partners.</p>
        </div>
        <div className="dashboard-card" style={{ padding: '14px', borderRadius: '10px' }} onClick={() => navigate("/hr/leave-requests")}>
          <h3>🏖️ Leave History</h3>
          <p>Review your leave history and track your leave balances</p>
        </div>
      </div>
    </div>
  );
}

