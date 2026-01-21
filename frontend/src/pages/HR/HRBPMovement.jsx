import React from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPMovement() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>🔁 Employee movement</h2>
          <p>HRBP Reports → Employee movement</p>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="dashboard-card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Feature coming soon</h3>
        <p style={{ margin: 0, color: "#475569" }}>
          This module is under development. Turnover, hiring, and exit analytics will be available here soon.
        </p>
      </div>
    </div>
  );
}
