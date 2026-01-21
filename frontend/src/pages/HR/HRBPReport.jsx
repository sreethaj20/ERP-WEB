import React from "react";
import { Link } from "react-router-dom";
import "../../App.css";


export default function Reports() {
  return (
    <div className="dashboard fade-in">
      <h2>📑 Reports</h2>
      {/* <p>Generate HR and Team Lead reports for your organization.</p> */}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recruitment</h3>
          <p>Track attendance, leaves, and employee performance.</p>
          <Link to="/HR/hr-reports" className="card-link">Recruitment</Link>
        </div>
        <div className="dashboard-card">
          <h3>Team Lead Reports</h3>
          <p>View team-level summaries such as productivity, attendance, and task outcomes by team lead.</p>
          <Link to="/HR/team-lead-reports" className="card-link">Open Team Lead Reports</Link>
        </div>
      </div>
    </div>
  );
}
