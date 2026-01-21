import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPPayrollReports() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const t = String(params.get("tab") || "dashboard").toLowerCase();
    if (t === "register") return "register";
    return "dashboard";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [payrollMonth, setPayrollMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isLocked, setIsLocked] = useState(false);

  const rows = useMemo(
    () => [
      {
        employeeCode: "EMP-0001",
        grossSalary: 65000,
        deductions: 5200,
        netPay: 59800,
        paymentStatus: "Paid",
      },
      {
        employeeCode: "EMP-0002",
        grossSalary: 48000,
        deductions: 3200,
        netPay: 44800,
        paymentStatus: "Pending",
      },
      {
        employeeCode: "EMP-0003",
        grossSalary: 72000,
        deductions: 6800,
        netPay: 65200,
        paymentStatus: "Paid",
      },
      {
        employeeCode: "EMP-0004",
        grossSalary: 30000,
        deductions: 1500,
        netPay: 28500,
        paymentStatus: "Pending",
      },
    ],
    []
  );

  const totals = useMemo(() => {
    const totalPayout = rows.reduce((sum, r) => sum + (Number(r.netPay) || 0), 0);
    const employeesPaid = rows.filter((r) => String(r.paymentStatus).toLowerCase() === "paid").length;
    const pendingPayroll = rows.filter((r) => String(r.paymentStatus).toLowerCase() === "pending").length;
    return { totalPayout, employeesPaid, pendingPayroll };
  }, [rows]);

  const exportBankFile = () => {
    const escapeCsv = (v) => {
      const s = String(v ?? "");
      if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const header = ["Employee Code", "Net Pay", "Payroll Month"];
    const body = rows.map((r) => [r.employeeCode, r.netPay, payrollMonth]);
    const csv = [header, ...body].map((line) => line.map(escapeCsv).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bank_File_${payrollMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbppay-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.16) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbppay-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbppay-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbppay-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbppay-tab {
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
        .hrbppay-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbppay-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(245,158,11,0.16) 0%, rgba(59,130,246,0.14) 60%, rgba(16,185,129,0.10) 100%);
        }
        .hrbppay-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbppay-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbppay-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbppay-card__body {
          padding: 14px;
        }
        .hrbppay-filters {
          display: grid;
          grid-template-columns: minmax(200px, 260px) 1fr;
          gap: 12px;
          align-items: end;
        }
        .hrbppay-field {
          display: grid;
          gap: 6px;
        }
        .hrbppay-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .hrbppay-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
        }
        .hrbppay-cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbppay-stat {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbppay-statK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbppay-statV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbppay-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .hrbppay-actionBtn {
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
        .hrbppay-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbppay-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbppay-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .hrbppay-th {
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
        .hrbppay-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        @media (max-width: 980px) {
          .hrbppay-cards {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 620px) {
          .hrbppay-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="hrbppay-head">
        <div>
          <div className="hrbppay-title">Payroll Reports</div>
          <div className="hrbppay-sub">Payroll & Statutory → Payroll</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbppay-card">
        <div className="hrbppay-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 className="hrbppay-card__title">Views</h3>
          <div className="hrbppay-tabs">
            <button
              type="button"
              className={`hrbppay-tab${activeTab === "dashboard" ? " hrbppay-tabActive" : ""}`}
              onClick={() => setTab("dashboard")}
            >
              Payroll Dashboard
            </button>
            <button
              type="button"
              className={`hrbppay-tab${activeTab === "register" ? " hrbppay-tabActive" : ""}`}
              onClick={() => setTab("register")}
            >
              Payroll Register
            </button>
          </div>
        </div>

        <div className="hrbppay-card__body">
          <div className="hrbppay-filters">
            <div className="hrbppay-field">
              <div className="hrbppay-label">Payroll Month</div>
              <input
                type="month"
                className="hrbppay-input"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
              />
            </div>
            <div />
          </div>

          {activeTab === "dashboard" ? (
            <div style={{ marginTop: 14 }}>
              <div className="hrbppay-cards">
                <div className="hrbppay-stat">
                  <div className="hrbppay-statK">Payroll Month</div>
                  <div className="hrbppay-statV">{payrollMonth}</div>
                </div>
                <div className="hrbppay-stat">
                  <div className="hrbppay-statK">Total Payout</div>
                  <div className="hrbppay-statV">{formatCurrency(totals.totalPayout)}</div>
                </div>
                <div className="hrbppay-stat">
                  <div className="hrbppay-statK">Employees Paid</div>
                  <div className="hrbppay-statV">{totals.employeesPaid}</div>
                </div>
                <div className="hrbppay-stat">
                  <div className="hrbppay-statK">Pending Payroll</div>
                  <div className="hrbppay-statV">{totals.pendingPayroll}</div>
                </div>
              </div>

              <div className="hrbppay-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsLocked((p) => !p)}
                  style={{ borderColor: "rgba(245,158,11,0.35)" }}
                >
                  {isLocked ? "Unlock Payroll" : "Lock Payroll"}
                </button>
                <button type="button" className="btn-outline" onClick={exportBankFile}>
                  Export Bank File
                </button>
              </div>

              <div style={{ marginTop: 10, color: "#475569", fontWeight: 800, fontSize: 12 }}>
                Status: {isLocked ? "Locked" : "Open"}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <div className="hrbppay-tableWrap">
                <table className="hrbppay-table">
                  <thead>
                    <tr>
                      <th className="hrbppay-th">Employee Code</th>
                      <th className="hrbppay-th">Gross Salary</th>
                      <th className="hrbppay-th">Deductions</th>
                      <th className="hrbppay-th">Net Pay</th>
                      <th className="hrbppay-th">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.employeeCode}>
                        <td className="hrbppay-td">{r.employeeCode}</td>
                        <td className="hrbppay-td">{formatCurrency(r.grossSalary)}</td>
                        <td className="hrbppay-td">{formatCurrency(r.deductions)}</td>
                        <td className="hrbppay-td">{formatCurrency(r.netPay)}</td>
                        <td className="hrbppay-td">{r.paymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="hrbppay-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsLocked((p) => !p)}
                  style={{ borderColor: "rgba(245,158,11,0.35)" }}
                >
                  {isLocked ? "Unlock Payroll" : "Lock Payroll"}
                </button>
                <button type="button" className="btn-outline" onClick={exportBankFile}>
                  Export Bank File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
