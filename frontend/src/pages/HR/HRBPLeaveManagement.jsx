import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPLeaveManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const t = String(params.get("tab") || "dashboard").toLowerCase();
    if (t === "approval") return "approval";
    return "dashboard";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);

  const initialApprovals = useMemo(
    () => [
      {
        id: "LV-0001",
        employeeName: "Test",
        leaveType: "Sick Leave",
        from: "2026-01-03",
        to: "2026-01-04",
        days: 2,
        reason: "Fever",
        status: "Pending",
      },
      {
        id: "LV-0002",
        employeeName: "Test 2",
        leaveType: "Casual Leave",
        from: "2026-01-05",
        to: "2026-01-05",
        days: 1,
        reason: "Personal work",
        status: "Pending",
      },
      {
        id: "LV-0003",
        employeeName: "Test 3",
        leaveType: "Leave",
        from: "2026-01-02",
        to: "2026-01-03",
        days: 2,
        reason: "Travel",
        status: "Approved",
      },
    ],
    []
  );

  const [approvals, setApprovals] = useState(initialApprovals);

  const dashboardStats = useMemo(() => {
    const leaveBalanceOverview = { total: 18, used: 6, remaining: 12 };
    const pendingApprovals = approvals.filter((r) => String(r.status).toLowerCase() === "pending").length;
    const lopDueToLeaveViolation = 0;
    return { leaveBalanceOverview, pendingApprovals, lopDueToLeaveViolation };
  }, [approvals]);

  const setTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search || "");
    params.set("tab", tab);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  const approve = (id) => {
    setApprovals((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  };

  const reject = (id) => {
    setApprovals((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpleave-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.14) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpleave-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpleave-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpleave-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpleave-tab {
          border: 1px solid rgba(148,163,184,0.32);
          background: rgba(255,255,255,0.74);
          color: #0f172a;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 850;
          font-size: 13px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
        }
        .hrbpleave-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpleave-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.12) 100%);
        }
        .hrbpleave-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbpleave-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpleave-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpleave-card__body {
          padding: 14px;
        }
        .hrbpleave-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 12px;
        }
        .hrbpleave-stat {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbpleave-statK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbpleave-statV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbpleave-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpleave-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpleave-th {
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
        .hrbpleave-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpleave-actionBtn {
          border-radius: 10px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.9);
          padding: 8px 10px;
          cursor: pointer;
          font-weight: 850;
          color: #0f172a;
          transition: transform 140ms ease, box-shadow 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
          white-space: nowrap;
        }
        .hrbpleave-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        @media (max-width: 980px) {
          .hrbpleave-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="hrbpleave-head">
        <div>
          <div className="hrbpleave-title">Leave Management</div>
          <div className="hrbpleave-sub">Time & Leave Management → Leave</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpleave-card">
        <div className="hrbpleave-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 className="hrbpleave-card__title">Views</h3>
          <div className="hrbpleave-tabs">
            <button
              type="button"
              className={`hrbpleave-tab${activeTab === "dashboard" ? " hrbpleave-tabActive" : ""}`}
              onClick={() => setTab("dashboard")}
            >
              Leave Dashboard
            </button>
            <button
              type="button"
              className={`hrbpleave-tab${activeTab === "approval" ? " hrbpleave-tabActive" : ""}`}
              onClick={() => setTab("approval")}
            >
              Leave Approval
            </button>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <div className="hrbpleave-card__body">
            <div className="hrbpleave-cards">
              <div className="hrbpleave-stat">
                <div className="hrbpleave-statK">Leave Balance Overview</div>
                <div className="hrbpleave-statV">
                  {dashboardStats.leaveBalanceOverview.remaining} remaining
                </div>
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 750, color: "#475569" }}>
                  Used: {dashboardStats.leaveBalanceOverview.used} / Total: {dashboardStats.leaveBalanceOverview.total}
                </div>
              </div>

              <div className="hrbpleave-stat">
                <div className="hrbpleave-statK">Pending Approvals</div>
                <div className="hrbpleave-statV">{dashboardStats.pendingApprovals}</div>
              </div>

              <div className="hrbpleave-stat">
                <div className="hrbpleave-statK">LOP Due to Leave Violation</div>
                <div className="hrbpleave-statV">{dashboardStats.lopDueToLeaveViolation}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hrbpleave-card__body">
            <div className="hrbpleave-tableWrap">
              <table className="hrbpleave-table">
                <thead>
                  <tr>
                    <th className="hrbpleave-th">Employee Name</th>
                    <th className="hrbpleave-th">Leave Type</th>
                    <th className="hrbpleave-th">From – To</th>
                    <th className="hrbpleave-th">Days</th>
                    <th className="hrbpleave-th">Reason</th>
                    <th className="hrbpleave-th">Approve / Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((r) => (
                    <tr key={r.id}>
                      <td className="hrbpleave-td">{r.employeeName}</td>
                      <td className="hrbpleave-td">{r.leaveType}</td>
                      <td className="hrbpleave-td">
                        {r.from} – {r.to}
                      </td>
                      <td className="hrbpleave-td">{r.days}</td>
                      <td className="hrbpleave-td" style={{ whiteSpace: "normal" }}>
                        {r.reason}
                      </td>
                      <td className="hrbpleave-td">
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="hrbpleave-actionBtn"
                            onClick={() => approve(r.id)}
                            disabled={String(r.status).toLowerCase() !== "pending"}
                            style={{ borderColor: "rgba(16,185,129,0.35)" }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="hrbpleave-actionBtn"
                            onClick={() => reject(r.id)}
                            disabled={String(r.status).toLowerCase() !== "pending"}
                            style={{ borderColor: "rgba(239,68,68,0.35)" }}
                          >
                            Reject
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 850, color: "#475569", alignSelf: "center" }}>
                            {r.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!approvals.length ? (
                    <tr>
                      <td className="hrbpleave-td" colSpan={6} style={{ color: "#64748b", textAlign: "center", padding: "22px 12px" }}>
                        No approval requests.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
