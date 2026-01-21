import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPExitFullFinal() {
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] = useState("Test 1");

  const rows = useMemo(
    () => [
      {
        employeeName: "Test 1",
        lwd: "2026-01-20",
        hrClearance: "Completed",
        itClearance: "In Progress",
        financeClearance: "Pending",
        clearanceStatus: "In Progress",
        ffStatus: "Pending",
      },
      {
        employeeName: "Test 2",
        lwd: "2026-01-10",
        hrClearance: "Completed",
        itClearance: "Completed",
        financeClearance: "Completed",
        clearanceStatus: "Completed",
        ffStatus: "Completed",
      },
      {
        employeeName: "Test 3",
        lwd: "2026-02-05",
        hrClearance: "In Progress",
        itClearance: "Pending",
        financeClearance: "Pending",
        clearanceStatus: "Pending",
        ffStatus: "Pending",
      },
    ],
    []
  );

  const selected = useMemo(() => rows.find((r) => r.employeeName === selectedEmployee) || rows[0] || null, [rows, selectedEmployee]);

  const statusPill = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "completed") return { background: "#DCFCE7", color: "#065F46" };
    if (s === "in progress") return { background: "#DBEAFE", color: "#1D4ED8" };
    return { background: "#FEF3C7", color: "#92400E" };
  };

  const progress = useMemo(() => {
    if (!selected) return { pct: 0, steps: [] };
    const steps = [
      { label: "HR Clearance", value: selected.hrClearance },
      { label: "IT Clearance", value: selected.itClearance },
      { label: "Finance Clearance", value: selected.financeClearance },
    ];
    const completed = steps.filter((s) => String(s.value).toLowerCase() === "completed").length;
    const pct = Math.round((completed / steps.length) * 100);
    return { pct, steps };
  }, [selected]);

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpexit-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.16) 0%, rgba(255,255,255,0.88) 50%, rgba(245,158,11,0.08) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpexit-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpexit-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpexit-layout {
          margin-top: 14px;
          display: grid;
          gap: 14px;
        }
        .hrbpexit-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpexit-cardHead {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(245,158,11,0.06) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hrbpexit-cardTitle {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpexit-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpexit-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .hrbpexit-th {
          position: sticky;
          top: 0;
          background: rgba(248,250,252,0.95);
          backdrop-filter: blur(6px);
          text-align: left;
          font-size: 12px;
          font-weight: 950;
          color: #0f172a;
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.25);
          white-space: nowrap;
        }
        .hrbpexit-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpexit-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          min-width: 92px;
        }
        .hrbpexit-progressWrap {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .hrbpexit-progressBar {
          height: 10px;
          border-radius: 999px;
          background: rgba(148,163,184,0.22);
          overflow: hidden;
        }
        .hrbpexit-progressFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(139,92,246,0.70) 0%, rgba(59,130,246,0.70) 50%, rgba(16,185,129,0.70) 100%);
          width: 0;
          transition: width 180ms ease;
        }
        .hrbpexit-stepRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.20);
          background: rgba(255,255,255,0.86);
        }
      `}</style>

      <div className="hrbpexit-head">
        <div>
          <div className="hrbpexit-title">Exit Tracker / Full & Final</div>
          <div className="hrbpexit-sub">Employee Lifecycle Management → Exit Tracker Screen</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpexit-layout">
        <div className="hrbpexit-card">
          <div className="hrbpexit-cardHead">
            <h3 className="hrbpexit-cardTitle">Exit Tracker Grid</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#475569" }}>Employee</div>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{ borderRadius: 12, border: "1px solid rgba(148,163,184,0.35)", background: "rgba(255,255,255,0.9)", padding: "10px 12px", fontWeight: 800 }}
              >
                {rows.map((r) => (
                  <option key={r.employeeName} value={r.employeeName}>
                    {r.employeeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hrbpexit-tableWrap">
            <table className="hrbpexit-table">
              <thead>
                <tr>
                  <th className="hrbpexit-th">Employee Name</th>
                  <th className="hrbpexit-th">LWD</th>
                  <th className="hrbpexit-th">Clearance Status</th>
                  <th className="hrbpexit-th">F&F Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.employeeName} style={r.employeeName === selectedEmployee ? { background: "rgba(139,92,246,0.08)" } : undefined}>
                    <td className="hrbpexit-td">{r.employeeName}</td>
                    <td className="hrbpexit-td">{r.lwd}</td>
                    <td className="hrbpexit-td">
                      <span className="hrbpexit-pill" style={statusPill(r.clearanceStatus)}>
                        {r.clearanceStatus}
                      </span>
                    </td>
                    <td className="hrbpexit-td">
                      <span className="hrbpexit-pill" style={statusPill(r.ffStatus)}>
                        {r.ffStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hrbpexit-card">
          <div className="hrbpexit-cardHead">
            <h3 className="hrbpexit-cardTitle">Progress Bar</h3>
            <div style={{ color: "#475569", fontWeight: 900, fontSize: 12 }}>{progress.pct}% Complete</div>
          </div>

          <div className="hrbpexit-progressWrap">
            <div className="hrbpexit-progressBar">
              <div className="hrbpexit-progressFill" style={{ width: `${progress.pct}%` }} />
            </div>

            {progress.steps.map((s) => (
              <div key={s.label} className="hrbpexit-stepRow">
                <div style={{ fontWeight: 950, color: "#0f172a" }}>{s.label}</div>
                <span className="hrbpexit-pill" style={statusPill(s.value)}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
