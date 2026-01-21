import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPAttendance() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const t = String(params.get("tab") || "daily").toLowerCase();
    return t === "monthly" ? "monthly" : "daily";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [dailyFilters, setDailyFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    department: "",
    shift: "",
  });

  const rows = useMemo(
    () => [
      {
        employeeCode: "EMP-0001",
        name: "Test",
        department: "Engineering",
        shift: "General",
        date: new Date().toISOString().slice(0, 10),
        inTime: "09:10",
        outTime: "18:05",
        status: "Present",
        remark: "",
      },
      {
        employeeCode: "EMP-0002",
        name: "Test 2",
        department: "HR",
        shift: "General",
        date: new Date().toISOString().slice(0, 10),
        inTime: "08:58",
        outTime: "18:02",
        status: "Present",
        remark: "",
      },
      {
        employeeCode: "EMP-0003",
        name: "Test 3",
        department: "Finance",
        shift: "Night",
        date: new Date().toISOString().slice(0, 10),
        inTime: "21:05",
        outTime: "06:02",
        status: "Present",
        remark: "",
      },
      {
        employeeCode: "EMP-0004",
        name: "Test 4",
        department: "Engineering",
        shift: "General",
        date: new Date().toISOString().slice(0, 10),
        inTime: "09:55",
        outTime: "17:10",
        status: "Present",
        remark: "Need regularization",
      },
    ],
    []
  );

  const [data, setData] = useState(rows);

  const departmentOptions = useMemo(
    () => Array.from(new Set(data.map((r) => r.department))).sort(),
    [data]
  );
  const shiftOptions = useMemo(
    () => Array.from(new Set(data.map((r) => r.shift))).sort(),
    [data]
  );

  const toMinutes = (hhmm) => {
    const [h, m] = String(hhmm || "0:0").split(":");
    const hh = Number(h || 0);
    const mm = Number(m || 0);
    return hh * 60 + mm;
  };

  const minutesToHHMM = (mins) => {
    const safe = Math.max(0, Math.round(mins));
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const hoursWorked = (inTime, outTime) => {
    if (!inTime || !outTime) return "00:00";
    const i = toMinutes(inTime);
    const o = toMinutes(outTime);
    const diff = o >= i ? o - i : o + 24 * 60 - i;
    return minutesToHHMM(diff);
  };

  const lateEarlyFlags = (shift, inTime, outTime) => {
    const baseline = shift === "Night" ? { start: "21:00", end: "06:00" } : { start: "09:00", end: "18:00" };
    const startM = toMinutes(baseline.start);
    const endM = toMinutes(baseline.end);
    const inM = toMinutes(inTime);
    const outM = toMinutes(outTime);

    const late = inTime ? inM > startM + 10 : false;
    const early = outTime
      ? baseline.end === "06:00"
        ? outM < endM - 10 && outM > 0
        : outM < endM - 10
      : false;

    if (late && early) return "Late + Early";
    if (late) return "Late";
    if (early) return "Early";
    return "";
  };

  const filteredDailyRows = useMemo(() => {
    return data.filter((r) => {
      if (dailyFilters.date && r.date !== dailyFilters.date) return false;
      if (dailyFilters.department && r.department !== dailyFilters.department) return false;
      if (dailyFilters.shift && r.shift !== dailyFilters.shift) return false;
      return true;
    });
  }, [data, dailyFilters]);

  const [regularizeTarget, setRegularizeTarget] = useState(null);
  const [regularizeForm, setRegularizeForm] = useState({ inTime: "", outTime: "" });

  const openRegularize = (row) => {
    setRegularizeTarget(row);
    setRegularizeForm({ inTime: row.inTime || "", outTime: row.outTime || "" });
  };

  const saveRegularize = () => {
    if (!regularizeTarget) return;
    setData((prev) =>
      prev.map((r) =>
        r.employeeCode === regularizeTarget.employeeCode && r.date === regularizeTarget.date
          ? { ...r, inTime: regularizeForm.inTime, outTime: regularizeForm.outTime }
          : r
      )
    );
    setRegularizeTarget(null);
  };

  const [remarkTarget, setRemarkTarget] = useState(null);
  const [remarkText, setRemarkText] = useState("");

  const openRemark = (row) => {
    setRemarkTarget(row);
    setRemarkText(String(row.remark || ""));
  };

  const saveRemark = () => {
    if (!remarkTarget) return;
    setData((prev) =>
      prev.map((r) =>
        r.employeeCode === remarkTarget.employeeCode && r.date === remarkTarget.date
          ? { ...r, remark: remarkText }
          : r
      )
    );
    setRemarkTarget(null);
  };

  const exportDailyToExcel = () => {
    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const header = [
      "Employee Code",
      "Name",
      "In Time",
      "Out Time",
      "Hours Worked",
      "Status",
      "Late / Early Flags",
      "Remark",
    ];

    const bodyRows = filteredDailyRows.map((r) => {
      const hw = hoursWorked(r.inTime, r.outTime);
      const flags = lateEarlyFlags(r.shift, r.inTime, r.outTime);
      return [r.employeeCode, r.name, r.inTime, r.outTime, hw, r.status, flags, r.remark || ""];
    });

    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr>${header.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${bodyRows
                .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Daily_Attendance_${dailyFilters.date || dateStamp}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const monthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [monthlyMonth, setMonthlyMonth] = useState(monthKey);

  const monthlyStats = useMemo(() => {
    const inMonth = data.filter((r) => String(r.date || "").startsWith(String(monthlyMonth || "")));
    const uniqueDayKey = (d) => String(d || "");
    const days = Array.from(new Set(inMonth.map((r) => uniqueDayKey(r.date))));
    const workingDays = days.length;

    const byEmp = {};
    inMonth.forEach((r) => {
      const k = r.employeeCode;
      if (!byEmp[k]) byEmp[k] = [];
      byEmp[k].push(r);
    });

    const presentDays = inMonth.filter((r) => String(r.status).toLowerCase() === "present").length;
    const leaveDays = inMonth.filter((r) => String(r.status).toLowerCase() === "leave").length;
    const lopDays = inMonth.filter((r) => String(r.status).toLowerCase() === "lop").length;

    return {
      workingDays,
      presentDays,
      leaveDays,
      lopDays,
      employees: Object.keys(byEmp).length,
    };
  }, [data, monthlyMonth]);

  const setTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search || "");
    params.set("tab", tab);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpatt-head {
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
        .hrbpatt-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpatt-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpatt-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpatt-tab {
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
        .hrbpatt-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpatt-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.12) 100%);
        }
        .hrbpatt-grid {
          display: grid;
          gap: 14px;
          margin-top: 14px;
        }
        .hrbpatt-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpatt-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpatt-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpatt-card__body {
          padding: 14px;
        }
        .hrbpatt-filters {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 12px;
          align-items: end;
        }
        .hrbpatt-field {
          display: grid;
          gap: 6px;
        }
        .hrbpatt-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .hrbpatt-input {
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
        .hrbpatt-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }
        .hrbpatt-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .hrbpatt-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpatt-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpatt-th {
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
        .hrbpatt-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpatt-actionBtn {
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
        .hrbpatt-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpatt-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbpatt-summaryCard {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbpatt-summaryK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbpatt-summaryV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbpatt-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.50);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 50;
        }
        .hrbpatt-modal {
          width: min(620px, 100%);
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 24px 70px rgba(2, 6, 23, 0.22);
          overflow: hidden;
        }
        .hrbpatt-modal__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpatt-modal__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpatt-modal__body {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .hrbpatt-modal__footer {
          padding: 0 14px 14px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 980px) {
          .hrbpatt-filters {
            grid-template-columns: 1fr;
          }
          .hrbpatt-summary {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="hrbpatt-head">
        <div>
          <div className="hrbpatt-title">Attendance Management</div>
          <div className="hrbpatt-sub">Time & Leave Management → Attendance</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpatt-grid">
        <div className="hrbpatt-card">
          <div className="hrbpatt-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 className="hrbpatt-card__title">Views</h3>
            <div className="hrbpatt-tabs">
              <button
                type="button"
                className={`hrbpatt-tab${activeTab === "daily" ? " hrbpatt-tabActive" : ""}`}
                onClick={() => setTab("daily")}
              >
                Daily Attendance
              </button>
              <button
                type="button"
                className={`hrbpatt-tab${activeTab === "monthly" ? " hrbpatt-tabActive" : ""}`}
                onClick={() => setTab("monthly")}
              >
                Monthly Attendance Summary
              </button>
            </div>
          </div>

          {activeTab === "daily" ? (
            <div className="hrbpatt-card__body">
              <div className="hrbpatt-filters">
                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">Date</div>
                  <input
                    type="date"
                    className="hrbpatt-input"
                    value={dailyFilters.date}
                    onChange={(e) => setDailyFilters((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">Department</div>
                  <select
                    className="hrbpatt-select"
                    value={dailyFilters.department}
                    onChange={(e) => setDailyFilters((p) => ({ ...p, department: e.target.value }))}
                  >
                    <option value="">All</option>
                    {departmentOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">Shift</div>
                  <select
                    className="hrbpatt-select"
                    value={dailyFilters.shift}
                    onChange={(e) => setDailyFilters((p) => ({ ...p, shift: e.target.value }))}
                  >
                    <option value="">All</option>
                    {shiftOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hrbpatt-actions">
                <button type="button" className="btn-outline" onClick={exportDailyToExcel}>
                  Export
                </button>
              </div>

              <div className="hrbpatt-tableWrap" style={{ marginTop: 12 }}>
                <table className="hrbpatt-table">
                  <thead>
                    <tr>
                      <th className="hrbpatt-th">Employee Code</th>
                      <th className="hrbpatt-th">Name</th>
                      <th className="hrbpatt-th">In Time</th>
                      <th className="hrbpatt-th">Out Time</th>
                      <th className="hrbpatt-th">Hours Worked</th>
                      <th className="hrbpatt-th">Status</th>
                      <th className="hrbpatt-th">Late / Early Flags</th>
                      <th className="hrbpatt-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailyRows.map((r) => {
                      const hw = hoursWorked(r.inTime, r.outTime);
                      const flags = lateEarlyFlags(r.shift, r.inTime, r.outTime);
                      return (
                        <tr key={`${r.employeeCode}-${r.date}`}>
                          <td className="hrbpatt-td">{r.employeeCode}</td>
                          <td className="hrbpatt-td">{r.name}</td>
                          <td className="hrbpatt-td">{r.inTime || "-"}</td>
                          <td className="hrbpatt-td">{r.outTime || "-"}</td>
                          <td className="hrbpatt-td">{hw}</td>
                          <td className="hrbpatt-td">{r.status}</td>
                          <td className="hrbpatt-td">{flags || "-"}</td>
                          <td className="hrbpatt-td">
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button type="button" className="hrbpatt-actionBtn" onClick={() => openRegularize(r)}>
                                Regularize
                              </button>
                              <button type="button" className="hrbpatt-actionBtn" onClick={() => openRemark(r)}>
                                Add Remark
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredDailyRows.length ? (
                      <tr>
                        <td className="hrbpatt-td" colSpan={8} style={{ color: "#64748b", textAlign: "center", padding: "22px 12px" }}>
                          No records match the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="hrbpatt-card__body">
              <div className="hrbpatt-filters" style={{ gridTemplateColumns: "minmax(200px, 260px) 1fr" }}>
                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">Month</div>
                  <input
                    type="month"
                    className="hrbpatt-input"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                  />
                </div>
                <div />
              </div>

              <div className="hrbpatt-summary" style={{ marginTop: 14 }}>
                <div className="hrbpatt-summaryCard">
                  <div className="hrbpatt-summaryK">Working Days</div>
                  <div className="hrbpatt-summaryV">{monthlyStats.workingDays}</div>
                </div>
                <div className="hrbpatt-summaryCard">
                  <div className="hrbpatt-summaryK">Present Days</div>
                  <div className="hrbpatt-summaryV">{monthlyStats.presentDays}</div>
                </div>
                <div className="hrbpatt-summaryCard">
                  <div className="hrbpatt-summaryK">Leave Days</div>
                  <div className="hrbpatt-summaryV">{monthlyStats.leaveDays}</div>
                </div>
                <div className="hrbpatt-summaryCard">
                  <div className="hrbpatt-summaryK">LOP Days</div>
                  <div className="hrbpatt-summaryV">{monthlyStats.lopDays}</div>
                </div>
              </div>

              <div className="hrbpatt-tableWrap" style={{ marginTop: 14 }}>
                <table className="hrbpatt-table" style={{ minWidth: 680 }}>
                  <thead>
                    <tr>
                      <th className="hrbpatt-th">Metric</th>
                      <th className="hrbpatt-th">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="hrbpatt-td">Employees in month</td>
                      <td className="hrbpatt-td">{monthlyStats.employees}</td>
                    </tr>
                    <tr>
                      <td className="hrbpatt-td">Working Days (days with records)</td>
                      <td className="hrbpatt-td">{monthlyStats.workingDays}</td>
                    </tr>
                    <tr>
                      <td className="hrbpatt-td">Present Entries</td>
                      <td className="hrbpatt-td">{monthlyStats.presentDays}</td>
                    </tr>
                    <tr>
                      <td className="hrbpatt-td">Leave Entries</td>
                      <td className="hrbpatt-td">{monthlyStats.leaveDays}</td>
                    </tr>
                    <tr>
                      <td className="hrbpatt-td">LOP Entries</td>
                      <td className="hrbpatt-td">{monthlyStats.lopDays}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {regularizeTarget ? (
        <div className="hrbpatt-modalOverlay" role="dialog" aria-modal="true">
          <div className="hrbpatt-modal">
            <div className="hrbpatt-modal__header">
              <h3 className="hrbpatt-modal__title">Regularize Attendance</h3>
              <button type="button" className="btn-outline" onClick={() => setRegularizeTarget(null)}>
                Close
              </button>
            </div>
            <div className="hrbpatt-modal__body">
              <div style={{ fontSize: 12, fontWeight: 850, color: "#475569" }}>
                {regularizeTarget.employeeCode} | {regularizeTarget.name} | {regularizeTarget.date}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">In Time</div>
                  <input
                    type="time"
                    className="hrbpatt-input"
                    value={regularizeForm.inTime}
                    onChange={(e) => setRegularizeForm((p) => ({ ...p, inTime: e.target.value }))}
                  />
                </div>
                <div className="hrbpatt-field">
                  <div className="hrbpatt-label">Out Time</div>
                  <input
                    type="time"
                    className="hrbpatt-input"
                    value={regularizeForm.outTime}
                    onChange={(e) => setRegularizeForm((p) => ({ ...p, outTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="hrbpatt-modal__footer">
              <button type="button" className="btn-outline" onClick={() => setRegularizeTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-outline" style={{ borderColor: "rgba(59,130,246,0.35)" }} onClick={saveRegularize}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {remarkTarget ? (
        <div className="hrbpatt-modalOverlay" role="dialog" aria-modal="true">
          <div className="hrbpatt-modal">
            <div className="hrbpatt-modal__header">
              <h3 className="hrbpatt-modal__title">Add Remark</h3>
              <button type="button" className="btn-outline" onClick={() => setRemarkTarget(null)}>
                Close
              </button>
            </div>
            <div className="hrbpatt-modal__body">
              <div style={{ fontSize: 12, fontWeight: 850, color: "#475569" }}>
                {remarkTarget.employeeCode} | {remarkTarget.name} | {remarkTarget.date}
              </div>
              <div className="hrbpatt-field">
                <div className="hrbpatt-label">Remark</div>
                <textarea
                  className="hrbpatt-input"
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
            <div className="hrbpatt-modal__footer">
              <button type="button" className="btn-outline" onClick={() => setRemarkTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-outline" style={{ borderColor: "rgba(59,130,246,0.35)" }} onClick={saveRemark}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
