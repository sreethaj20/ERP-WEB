import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Prefer real name. Fallbacks: firstName, name, email username, then "Admin"
  const displayName =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Admin");

  return (
    <div className="dashboard admin-dashboard fade-in">
      <div className="welcome-section">
        <h1>Welcome back, <span className="admin-name">{displayName}</span>! 👋</h1>
        <p className="welcome-subtitle">Manage your organization's ERP settings and monitor performance.</p>
      </div>

      <div className="dashboard-grid">

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/performance-analytics")}
        >
          <h3>📊 Performance Analytics</h3>
          {/* <p>View performance metrics and analyze company-wide data.</p> */}
        </div>


        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/reports")}
        >
          <h3>📑 Reports</h3>
          {/* <p>Generate and download operational and HR reports.</p> */}
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/payroll")}
        >
          <h3>💰 Payroll</h3>
          <p>Review payroll, deductions, and generate payslips.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/attendance")}
        >
          <h3>🕒 Attendance </h3>
          {/* <p>Update attendance and over view </p> */}
        </div>

        {/* Policies */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/policies")}
        >
          <h3>📜 Policies</h3>
          {/* <p>Browse HR, IT, Admin and compliance policies.</p> */}
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/leave-requests")}
        >
          <h3>🏖️ Leave Requests</h3>
          {/* <p>Review and approve employee leave requests.</p> */}
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/leave-history")}
        >
          <h3>📚 Leave History</h3>
          {/* <p>Review your leave history and track your leave balances</p> */}
        </div>

        {/* Admin Query Inbox */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/queries")}
        >
          <h3>📮 Admin Query Inbox</h3>
          {/* <p>View and resolve administrative queries from employees.</p> */}
        </div>

        {/* Manager Components - Now Available to Admin */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/team-management")}
        >
          <h3>👥 Team Management</h3>
          {/* <p>Manage team members, attendance, roles, and organizational structure.</p> */}
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/team-attendance")}
        >
          <h3>🕒 Team Leads Attendance</h3>
          {/* <p>Monitor attendance for teams under each Team Lead.</p> */}
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/task-management")}
        >
          <h3>📋 Task Management</h3>
          {/* <p>Assign tasks, track progress, and manage project deadlines.</p> */}
        </div>



        
      </div>
    </div>
  );
}
