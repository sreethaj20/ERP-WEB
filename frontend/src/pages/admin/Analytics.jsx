import React from "react";
import "../../App.css";


export default function Analytics() {
  return (
    <div className="dashboard fade-in">
      <h2>📊 Analytics</h2>
      <p>Here you can view company-wide performance metrics and ERP reports.</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Revenue Trends</h3>
          <p>Track revenue growth over time.</p>
        </div>
        <div className="dashboard-card">
          <h3>Employee Productivity</h3>
          <p>Monitor efficiency across teams.</p>
        </div>
      </div>
    </div>
  );
}
