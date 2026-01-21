import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPStatutoryReturns() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const t = String(params.get("tab") || "pf").toLowerCase();
    if (t === "esi") return "esi";
    if (t === "pt") return "pt";
    return "pf";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);

  const baseRows = useMemo(
    () => [
      {
        month: new Date().toISOString().slice(0, 7),
        eligibleEmployees: 42,
        amount: 185000,
        challanNo: "CH-10021",
        filingStatus: "Filed",
        statusIndicator: "Green",
      },
      {
        month: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7),
        eligibleEmployees: 44,
        amount: 192400,
        challanNo: "CH-10012",
        filingStatus: "Due",
        statusIndicator: "Amber",
      },
      {
        month: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().slice(0, 7),
        eligibleEmployees: 41,
        amount: 176800,
        challanNo: "CH-10005",
        filingStatus: "Overdue",
        statusIndicator: "Red",
      },
    ],
    []
  );

  const rows = useMemo(() => {
    const factor = activeTab === "pf" ? 1 : activeTab === "esi" ? 0.62 : 0.22;
    return baseRows.map((r) => ({
      ...r,
      amount: Math.round((Number(r.amount) || 0) * factor),
      challanNo: `${activeTab.toUpperCase()}-${String(r.challanNo || "").replace(/^\w+-/, "")}`,
    }));
  }, [activeTab, baseRows]);

  const setTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search || "");
    params.set("tab", tab);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  const formatCurrency = (n) => {
    const val = Number(n) || 0;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
    } catch {
      return `₹${val.toLocaleString()}`;
    }
  };

  const indicatorStyle = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "green" || s === "filed") return { background: "#DCFCE7", color: "#065F46" };
    if (s === "amber" || s === "due") return { background: "#FEF3C7", color: "#92400E" };
    return { background: "#FEE2E2", color: "#B91C1C" };
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpstat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.16) 0%, rgba(255,255,255,0.88) 45%, rgba(59,130,246,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpstat-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpstat-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpstat-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpstat-tab {
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
        .hrbpstat-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpstat-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.16) 0%, rgba(245,158,11,0.12) 60%, rgba(16,185,129,0.10) 100%);
        }
        .hrbpstat-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbpstat-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.10) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpstat-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpstat-card__body {
          padding: 14px;
        }
        .hrbpstat-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpstat-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpstat-th {
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
        .hrbpstat-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpstat-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          min-width: 70px;
        }
      `}</style>

      <div className="hrbpstat-head">
        <div>
          <div className="hrbpstat-title">Statutory & Compliance</div>
          <div className="hrbpstat-sub">Payroll & Statutory → Statutory Returns</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpstat-card">
        <div className="hrbpstat-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 className="hrbpstat-card__title">Tabs</h3>
          <div className="hrbpstat-tabs">
            <button
              type="button"
              className={`hrbpstat-tab${activeTab === "pf" ? " hrbpstat-tabActive" : ""}`}
              onClick={() => setTab("pf")}
            >
              PF
            </button>
            <button
              type="button"
              className={`hrbpstat-tab${activeTab === "esi" ? " hrbpstat-tabActive" : ""}`}
              onClick={() => setTab("esi")}
            >
              ESI
            </button>
            <button
              type="button"
              className={`hrbpstat-tab${activeTab === "pt" ? " hrbpstat-tabActive" : ""}`}
              onClick={() => setTab("pt")}
            >
              PT
            </button>
          </div>
        </div>

        <div className="hrbpstat-card__body">
          <div className="hrbpstat-tableWrap">
            <table className="hrbpstat-table">
              <thead>
                <tr>
                  <th className="hrbpstat-th">Month</th>
                  <th className="hrbpstat-th">Eligible Employees</th>
                  <th className="hrbpstat-th">Amount</th>
                  <th className="hrbpstat-th">Challan No</th>
                  <th className="hrbpstat-th">Filing Status</th>
                  <th className="hrbpstat-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${activeTab}-${r.month}`}
                    style={{ background: String(r.statusIndicator).toLowerCase() === "red" ? "rgba(254,226,226,0.30)" : "transparent" }}
                  >
                    <td className="hrbpstat-td">{r.month}</td>
                    <td className="hrbpstat-td">{r.eligibleEmployees}</td>
                    <td className="hrbpstat-td">{formatCurrency(r.amount)}</td>
                    <td className="hrbpstat-td">{r.challanNo}</td>
                    <td className="hrbpstat-td">{r.filingStatus}</td>
                    <td className="hrbpstat-td">
                      <span
                        className="hrbpstat-pill"
                        style={indicatorStyle(r.statusIndicator)}
                        title={
                          String(r.statusIndicator).toLowerCase() === "green"
                            ? "Filed"
                            : String(r.statusIndicator).toLowerCase() === "amber"
                              ? "Due"
                              : "Overdue"
                        }
                      >
                        {String(r.statusIndicator).toLowerCase() === "green"
                          ? "Filed"
                          : String(r.statusIndicator).toLowerCase() === "amber"
                            ? "Due"
                            : "Overdue"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 6, color: "#475569", fontWeight: 850, fontSize: 12 }}>
            <div>Green – Filed</div>
            <div>Amber – Due</div>
            <div>Red – Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
