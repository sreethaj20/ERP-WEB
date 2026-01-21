import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Prefer real name. Fallbacks: firstName, name, email username, then "Employee"
  const displayName =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  return (
    <div className="dashboard fade-in">
      <div className="welcome-section">
        <h1>Welcome back, <span className="employee-name">{displayName}</span>! 👋</h1>
        <p className="welcome-subtitle">Here's what's happening with your account today.</p>
      </div>

      <div className="dashboard-grid center-grid">

        {/* Tasks */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/tasks")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/tasks")}
        >
          <h3>📋 My Tasks</h3>
          {/* <p>Stay updated with assigned tasks and deadlines.</p> */}
        </div>

        {/* Profile */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/profile")}
        >
          <h3>⚙️ Profile Settings</h3>
          {/* <p>Update your personal details and account preferences.</p> */}
        </div>
        
        {/* Policies */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/policies")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/policies")}
        >
          <h3>📜 Policies</h3>
          {/* <p>Browse company HR, IT, Admin and compliance policies.</p> */}
        </div>
        
        
        <div className="dashboard-card" onClick={() => navigate("/employee/leave-request")}>
          <h3>🏖️ Leave History</h3>
          {/* <p>Review your leave history and track your leave balances</p> */}
        </div>

        {/* My Desk */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk")}
        >
          <h3>📊 My Desk</h3>
          {/* <p>Access production metrics, quality scores, and performance indicators.</p> */}
        </div>

        {/* ICRM */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/lcrm")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/lcrm")}
        >
          <h3>🎧 ICRM</h3>
          {/* <p>Access support services, raise tickets, and submit queries.</p> */}
        </div>
      </div>
    </div>
  );
}
