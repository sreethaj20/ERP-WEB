import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPExceptionsDiscipline() {
  const navigate = useNavigate();
  const [selectedException, setSelectedException] = useState("All");

  const exceptionCards = useMemo(
    () => [
      { key: "Late Coming", value: 18 },
      { key: "Repeated LOP", value: 6 },
      { key: "Leave Without Approval", value: 9 },
    ],
    []
  );

  const rows = useMemo(
    () => [
      {
        employee: "Test 1",
        exceptionType: "Late Coming",
        count: 4,
        warningLevel: "L1",
        actionTaken: "Counseling",
      },
      {
        employee: "Test 2",
        exceptionType: "Leave Without Approval",
        count: 2,
        warningLevel: "L1",
        actionTaken: "Email Warning",
      },
      {
        employee: "Test 3",
        exceptionType: "Repeated LOP",
        count: 3,
        warningLevel: "L2",
        actionTaken: "Escalated to Manager",
      },
      {
        employee: "Test 4",
        exceptionType: "Late Coming",
        count: 6,
        warningLevel: "L2",
        actionTaken: "Written Warning",
      },
    ],
    []
  );

  const filteredRows = useMemo(() => {
    if (selectedException === "All") return rows;
    return rows.filter((r) => String(r.exceptionType) === String(selectedException));
  }, [rows, selectedException]);

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpex-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(239,68,68,0.16) 0%, rgba(255,255,255,0.88) 50%, rgba(59,130,246,0.08) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpex-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpex-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpex-grid {
          margin-top: 14px;
          display: grid;
          gap: 14px;
        }
        .hrbpex-cardRow {
          display: grid;
          grid-template-columns: repeat(3, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbpex-card {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }
        .hrbpex-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(2, 6, 23, 0.10);
          border-color: rgba(239,68,68,0.30);
        }
        .hrbpex-cardK {
          font-size: 12px;
          font-weight: 900;
          color: #475569;
        }
        .hrbpex-cardV {
          margin-top: 6px;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpex-panel {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpex-panelHead {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(239,68,68,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(59,130,246,0.06) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hrbpex-panelTitle {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpex-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hrbpex-select {
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 800;
          color: #0f172a;
          outline: none;
        }
        .hrbpex-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpex-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 920px;
        }
        .hrbpex-th {
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
        .hrbpex-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        @media (max-width: 980px) {
          .hrbpex-cardRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="hrbpex-head">
        <div>
          <div className="hrbpex-title">HR Exceptions & Discipline</div>
          <div className="hrbpex-sub">Employee Relation & Compliance → HR Exceptions & Discipline Screen</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpex-grid">
        <div className="hrbpex-cardRow">
          {exceptionCards.map((c) => (
            <div
              key={c.key}
              className="hrbpex-card"
              onClick={() => setSelectedException((p) => (p === c.key ? "All" : c.key))}
              title="Click to filter"
              style={
                selectedException === c.key
                  ? { borderColor: "rgba(239,68,68,0.35)", boxShadow: "0 18px 36px rgba(239,68,68,0.10)" }
                  : undefined
              }
            >
              <div className="hrbpex-cardK">{c.key}</div>
              <div className="hrbpex-cardV">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="hrbpex-panel">
          <div className="hrbpex-panelHead">
            <h3 className="hrbpex-panelTitle">Exceptions Grid</h3>
            <div className="hrbpex-filter">
              <div style={{ fontSize: 12, fontWeight: 900, color: "#475569" }}>
                Filter
              </div>
              <select className="hrbpex-select" value={selectedException} onChange={(e) => setSelectedException(e.target.value)}>
                <option value="All">All</option>
                {exceptionCards.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hrbpex-tableWrap">
            <table className="hrbpex-table">
              <thead>
                <tr>
                  <th className="hrbpex-th">Employee</th>
                  <th className="hrbpex-th">Exception Type</th>
                  <th className="hrbpex-th">Count</th>
                  <th className="hrbpex-th">Warning Level</th>
                  <th className="hrbpex-th">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, idx) => (
                  <tr key={`${r.employee}-${idx}`}>
                    <td className="hrbpex-td">{r.employee}</td>
                    <td className="hrbpex-td">{r.exceptionType}</td>
                    <td className="hrbpex-td">{r.count}</td>
                    <td className="hrbpex-td">{r.warningLevel}</td>
                    <td className="hrbpex-td">{r.actionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
