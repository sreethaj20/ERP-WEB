// src/pages/admin/HRReports.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function HRReports() {
  const { listRecruitment } = useAuth();
  const [recruitmentSubs, setRecruitmentSubs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await listRecruitment();
        setRecruitmentSubs(Array.isArray(rows) ? rows : []);
      } catch {
        setRecruitmentSubs([]);
      }
    };
    load();
  }, [listRecruitment]);

  // Removed attendance/performance section per requirement.

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrreports-watermark {
          position: absolute;
          right: 28px;
          top: 140px;
          width: 220px;
          height: 220px;
          opacity: 0.10;
          pointer-events: none;
          z-index: 0;
          background-image: url('/hrms-watermark.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          filter: grayscale(10%) saturate(120%);
        }
        @media (max-width: 900px) {
          .hrreports-watermark {
            display: none;
          }
        }
        .hrreports-content {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div className="hrreports-watermark" aria-hidden="true" />

      <div className="hrreports-content">
      <h2>📋 HR Reports</h2>
      {/* <p>HR-submitted Recruitment reports (from backend).</p> */}

      {/* Recruitment Submissions from HR */}
      <div className="dashboard-card" style={{ marginTop: 20 }}>
        <h3>🧑‍🎓 Recruitment Submissions</h3>
        <p>Entries submitted by HR are listed here. Duplicate submissions are ignored.</p>
        <table className="user-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>College</th>
              <th>Qualification</th>
              <th>Company</th>
              <th>Submitted By (HR)</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {recruitmentSubs.length > 0 ? (
              recruitmentSubs.map((r, idx) => (
                <tr key={`${r.signature || r.id || idx}`}>
                  <td>{r.studentName}</td>
                  <td>{r.college}</td>
                  <td>{r.qualification}</td>
                  <td>{r.company}</td>
                  <td>{(() => {
                    const name = (r.submittedByName || '').trim();
                    const email = (r.submittedByEmail || '').trim();
                    if (name && email && name.toLowerCase() !== email.toLowerCase()) {
                      return `${name} (${email})`;
                    }
                    // If name equals email (or name missing), show only one
                    return email || name || '';
                  })()}</td>
                  <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No recruitment submissions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
