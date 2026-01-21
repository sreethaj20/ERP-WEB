import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import { getEffectiveRole } from "../utils/dashboardPath";

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const displayName =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  const role = getEffectiveRole(currentUser);
  const designation = String(currentUser?.designation || currentUser?.position || '').trim().toLowerCase();
  const isHRBP = designation === 'hrbp';
  const canSeeUpdates = ['hr', 'hrbp', 'hrbp lead'].includes(designation);

  // Admins should keep using the dedicated Admin dashboard
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Helper: access control for card interactivity
  const canAccess = (needed) => {
    const r = String(role || '').toLowerCase();
    if (!needed) return true; // employee/common modules
    return r === needed;
  };

  const cardProps = (neededRole, onClick) => {
    const allowed = canAccess(neededRole);
    return {
      className: allowed ? "dashboard-card" : "dashboard-card disabled-card",
      role: "button",
      tabIndex: 0,
      onClick,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (typeof onClick === 'function') onClick();
        }
      },
      "aria-disabled": !allowed,
      title: allowed ? undefined : "You don't have access to this module",
    };
  };

  return (
    <div className="dashboard unified-dashboard fade-in">
      <div className="welcome-section">
        <h1>
          Welcome back, <span className="employee-name">{displayName}</span>! 👋
        </h1>
      </div>

      {/* Core employee utilities (always visible; enabled for all non-admins) */}
      <div
        className="dashboard-grid"
        style={{ gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {(() => {
          const tasksPath = role === "hr"
            ? "/hr/tasks"
            : (role === "teamlead" ? "/teamlead/my-tasks" : "/employee/tasks");
          return (
            <div {...cardProps(undefined, () => navigate(tasksPath))}> 
              <h3>📋 My Tasks</h3>
              <p>View and manage tasks and deadlines.</p>
            </div>
          );
        })()}
        <div {...cardProps(undefined, () => navigate("/policies"))}> 
          <h3>📜 Policies</h3>
          <p>Browse HR, IT, Admin and compliance policies.</p>
        </div>
        {(() => {
          const deskPath = role === "hr" ? "/hr/mydesk" : "/employee/mydesk";
          // Always navigate; unauthorized routes will show access popup via PrivateRoute
          const props = role === "teamlead"
            ? cardProps("hr", () => navigate(deskPath))
            : cardProps(undefined, () => navigate(deskPath));
          return (
            <div {...props}> 
              <h3>📊 My Desk</h3>
              <p>Production metrics, quality scores, performance indicators.</p>
            </div>
          );
        })()}
        {(() => {
          const lcrmPath = role === "teamlead" ? "/teamlead/lcrm" : (role === "hr" || isHRBP ? "/hr/lcrm" : "/employee/lcrm");
          return (
            <div {...cardProps(undefined, () => navigate(lcrmPath))}> 
              <h3>🎧 ICRM</h3>
              <p>Support services, tickets and queries.</p>
            </div>
          );
        })()}
        <div {...cardProps(undefined, () => navigate("/leave-request"))}>
          <h3>🏖️ Leave History</h3>
          <p>Review leave history and balances.</p>
        </div>

        {canSeeUpdates && (
          <div {...cardProps(undefined, () => navigate("/updates"))}>
            <h3>🆕 Updates</h3>
            <p>View HR updates and announcements.</p>
          </div>
        )}
        {role === "employee" && (
          <div {...cardProps(undefined, () => navigate("/profile"))}> 
            <h3>⚙️ Profile Settings</h3>
            <p>Update your personal details and preferences.</p>
          </div>
        )}

      {/* Role-specific modules: render current role first, then others */}
      {role === "hr" ? (
        <>
          {/* HR modules first */}
          {!isHRBP && (
            <div {...cardProps("hr", () => navigate("/hr/recruitment"))}>
              <h3>🧑‍🎓 Recruitment</h3>
              <p>Manage candidates and placement partners.</p>
            </div>
          )}
          {isHRBP && (
            <div {...cardProps(undefined, () => navigate("/teamlead/performance"))}>
              <h3>📊 Team Performance</h3>
              <p>View team metrics and productivity reports.</p>
            </div>
          )}
          {/* Place Profile Settings as the last item of the current user's cluster */}
          <div {...cardProps(undefined, () => navigate("/profile"))}> 
            <h3>⚙️ Profile Settings</h3>
            <p>Update your personal details and preferences.</p>
          </div>
          {/* Team Lead modules next */}
          <div {...cardProps("teamlead", () => navigate("/teamlead/team"))}>
            <h3>👥 Team Management</h3>
            <p>Manage team members, assignments and performance.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/attendance"))}>
            <h3>🕒 Team Attendance</h3>
            <p>Monitor attendance and track hours.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/tasks"))}>
            <h3>📋 Task Management</h3>
            <p>Assign tasks and track progress.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/shift-extensions"))}>
            <h3>⏱️ Shift Extension</h3>
            <p>Review and approve shift extension requests.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/lead-approval"))}>
            <h3>✅ Lead Approval</h3>
            <p>Approve team member requests and submissions.</p>
          </div>
        </>
      ) : role === "teamlead" ? (
        <>
          {/* Team Lead modules first (for non-HR) */}
          <div {...cardProps("teamlead", () => navigate("/teamlead/team"))}>
            <h3>👥 Team Management</h3>
            <p>Manage team members, assignments and performance.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/attendance"))}>
            <h3>🕒 Team Attendance</h3>
            <p>Monitor attendance and track hours.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/performance"))}>
            <h3>📊 Team Performance</h3>
            <p>View team metrics and productivity reports.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/tasks"))}>
            <h3>📋 Task Management</h3>
            <p>Assign tasks and track progress.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/shift-extensions"))}>
            <h3>⏱️ Shift Extension</h3>
            <p>Review and approve shift extension requests.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/lead-approval"))}>
            <h3>✅ Lead Approval</h3>
            <p>Approve team member requests and submissions.</p>
          </div>
          {/* Place Profile Settings as the last item of the current user's cluster */}
          <div {...cardProps(undefined, () => navigate("/profile"))}> 
            <h3>⚙️ Profile Settings</h3>
            <p>Update your personal details and preferences.</p>
          </div>
        </>
      ) : (
        <>
          {/* Employee view already rendered Profile after common cards; show the other role modules next */}
          <div {...cardProps("teamlead", () => navigate("/teamlead/team"))}>
            <h3>👥 Team Management</h3>
            <p>Manage team members, assignments and performance.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/attendance"))}>
            <h3>🕒 Team Attendance</h3>
            <p>Monitor attendance and track hours.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/tasks"))}>
            <h3>📋 Task Management</h3>
            <p>Assign tasks and track progress.</p>
          </div>
          <div {...cardProps("teamlead", () => navigate("/teamlead/shift-extensions"))}>
            <h3>⏱️ Shift Extension</h3>
            <p>Review and approve shift extension requests.</p>
          </div>
          {/* <div {...cardProps("teamlead", () => navigate("/teamlead/rag"))}>
            <h3>🤝 Connections</h3>
            <p>View and manage connections.</p>
          </div> */}
          <div {...cardProps("teamlead", () => navigate("/teamlead/lead-approval"))}>
            <h3>✅ Lead Approval</h3>
            <p>Approve team member requests and submissions.</p>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
