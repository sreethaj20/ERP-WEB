import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function TeamLeadDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const displayName =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Team Lead");

  return (
    <div className="dashboard fade-in">
      <div className="welcome-section">
        <h2>
          Welcome back, <span className="manager-name">{displayName}</span>! 👋
        </h2>
        <p className="welcome-subtitle">Manage your team and oversee departmental operations efficiently.</p>
      </div>

      <div className="dashboard-grid center-grid">
        {/* Team Management */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/team")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/team")}
        >
          <h3>👥 Team Management</h3>
          {/* <p>Manage your team members, assignments, and performance.</p> */}
        </div>

        {/* Attendance Overview */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/attendance")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/attendance")}
        >
          <h3>🕒 Team Attendance</h3>
          {/* <p>Monitor team attendance, approve leave requests, and track hours.</p> */}
        </div>

        {/* Performance Analytics */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/performance")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/performance")}
        >
          <h3>📊 Performance Analytics</h3>
          {/* <p>View team performance metrics and productivity reports.</p> */}
        </div>

        {/* Task Management */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/tasks")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/tasks")}
        >
          <h3>📋 Task Management</h3>
          {/* <p>Assign tasks, track progress, and manage project deadlines.</p> */}
        </div>

        {/* Leave Requests */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/leave-requests")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/leave-requests")}
        >
          <h3>🏖️ Leave History</h3>
          {/* <p>Review your leave history and track your leave balances</p> */}
        </div>

        {/* Shift Extension */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/shift-extensions")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/shift-extensions")}
        >
          <h3>⏱️ Shift Extension</h3>
          {/* <p>Review and approve shift extension requests from your team.</p> */}
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

        {/* Payroll */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => window.open("https://payroll.razorpay.com/login", "_blank", "noopener")}
          onKeyPress={(e) => e.key === "Enter" && window.open("https://payroll.razorpay.com/login", "_blank", "noopener")}
        >
          <h3>💰 Payroll</h3>
          {/* <p>Access payroll services and external payroll system.</p> */}
        </div>

        {/* Connections */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/rag")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/rag")}
        >
          <h3>🤝 Connections</h3>
          {/* <p>View and manage team connections and interactions.</p> */}
        </div>

        {/* Lead Approval */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/teamlead/lead-approval")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/teamlead/lead-approval")}
        >
          <h3>✅ Lead Approval</h3>
          {/* <p>Review and approve team member requests and submissions.</p> */}
        </div>

        {/* Profile Settings */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/profile")}
        >
          <h3>⚙️ Profile Settings</h3>
          <p>Update your personal details and account preferences.</p>
        </div>
      </div>
    </div>
  );
}

