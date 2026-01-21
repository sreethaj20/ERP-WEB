import React from "react";
import "../App.css";
import organisationPolicyPdf from "../../Organisation Policy.pdf";

export default function Policies() {
  return (
    <div className="dashboard fade-in">
      <div className="welcome-section">
        <h1>Policies</h1>
        <p className="welcome-subtitle">Organization documents and guidelines</p>
      </div>

      <div className="dashboard-actions">
        <a
          className="btn-primary"
          href={organisationPolicyPdf}
          target="_blank"
          rel="noreferrer"
        >
          Open Organisation Policy
        </a>
        <a className="btn-outline" href={organisationPolicyPdf} download>
          Download
        </a>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <iframe
          title="Organisation Policy PDF"
          src={organisationPolicyPdf}
          style={{ width: "100%", height: "75vh", border: "0" }}
        />
      </div>
    </div>
  );
}
