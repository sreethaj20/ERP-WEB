import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/dashboardPath";
import "../../App.css";

export default function MyDesk() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  return (
    <div className="dashboard fade-in">
      <h2>My Desk - {displayName} 📊</h2>
      {/* <p>Access your work metrics and performance indicators.</p> */}

      <div className="dashboard-grid">
        {/* Production */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk/production")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk/production")}
        >
          <h3>🏭 Production</h3>
          <p>Monitor your production metrics and output performance.</p>
        </div>

        {/* Quality */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk/quality")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk/quality")}
        >
          <h3>✅ Quality</h3>
          <p>Track quality scores and improvement metrics.</p>
        </div>

        {/* AHT */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk/aht")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk/aht")}
        >
          <h3>⏱️ AHT</h3>
          <p>Average Handle Time analysis and trends.</p>
        </div>

        {/* ALB */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk/alb")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk/alb")}
        >
          <h3>⚖️ ALB</h3>
          <p>Adherence to Line of Business metrics.</p>
        </div>

        {/* WP */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/mydesk/wp")}
          onKeyPress={(e) => e.key === "Enter" && navigate("/employee/mydesk/wp")}
        >
          <h3>📋 WP</h3>
          <p>Work Plan tracking and schedule adherence.</p>
        </div>

        {/* Back to Home */}
        <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate(getDashboardPath(currentUser))}
          onKeyPress={(e) => e.key === "Enter" && navigate(getDashboardPath(currentUser))}
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <h3>🏠 Back to Home</h3>
          <p>Return to home.</p>
        </div>
      </div>
    </div>
  );
}
