import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function CoreHR() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    department: "",
    location: "",
    manager: "",
    status: "",
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    doj: "",
    department: "",
    designation: "",
    manager: "",
    location: "",
    status: "Active",
    bankVerification: "No",
    bankName: "",
    branch: "",
    accountNo: "",
    ifscCode: "",
    idVerification: "No",
    educationalDocuments: "No",
    policyAcknowledgment: "No",
  });

  const initialRows = useMemo(
    () => [
      {
        employeeCode: "EMP-0001",
        name: "Test ",
        doj: "2023-06-12",
        department: "Engineering",
        designation: "Software Engineer",
        manager: "Test 6",
        location: "Hyderabad",
        status: "Active",
      },
      {
        employeeCode: "EMP-0002",
        name: "Test 2",
        doj: "2022-11-04",
        department: "HR",
        designation: "HR Executive",
        manager: "Test 6",
        location: "Hyderabad",
        status: "Active",
      },
      {
        employeeCode: "EMP-0003",
        name: "Test 3",
        doj: "2021-09-18",
        department: "Finance",
        designation: "Accountant",
        manager: "Test 6",
        location: "Hyderabad",
        status: "Inactive",
      },
      {
        employeeCode: "EMP-0004",
        name: "Test 4",
        doj: "2024-02-01",
        department: "Engineering",
        designation: "QA Analyst",
        manager: "Test 6",
        location: "Hyderabad",
        status: "Active",
      },
    ],
    []
  );

  const [rows, setRows] = useState(initialRows);

  const departmentOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.department))).sort(),
    [rows]
  );
  const locationOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.location))).sort(),
    [rows]
  );
  const managerOptions = useMemo(() => {
    const mgrs = rows.map((r) => String(r.manager || "").trim()).filter(Boolean);
    const names = rows.map((r) => String(r.name || "").trim()).filter(Boolean);
    return Array.from(new Set([...mgrs, ...names])).sort();
  }, [rows]);
  const statusOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))).sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.department && r.department !== filters.department) return false;
      if (filters.location && r.location !== filters.location) return false;
      if (filters.manager && r.manager !== filters.manager) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  }, [filters, rows]);

  const openAddEmployee = () => {
    setNewEmployee({
      name: "",
      doj: "",
      department: "",
      designation: "",
      manager: "",
      location: "",
      status: "Active",
      bankVerification: "No",
      bankName: "",
      branch: "",
      accountNo: "",
      ifscCode: "",
      idVerification: "No",
      educationalDocuments: "No",
      policyAcknowledgment: "No",
    });
    setIsAddOpen(true);
  };

  const closeAddEmployee = () => {
    setIsAddOpen(false);
  };

  const createEmployeeCode = (existing) => {
    const maxNum = existing.reduce((max, r) => {
      const m = String(r.employeeCode || "").match(/EMP-(\d+)/i);
      const n = m ? Number(m[1]) : 0;
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const next = maxNum + 1;
    return `EMP-${String(next).padStart(4, "0")}`;
  };

  const onAddEmployeeSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: String(newEmployee.name || "").trim(),
      doj: String(newEmployee.doj || "").trim(),
      department: String(newEmployee.department || "").trim(),
      designation: String(newEmployee.designation || "").trim(),
      manager: String(newEmployee.manager || "").trim(),
      location: String(newEmployee.location || "").trim(),
      status: String(newEmployee.status || "").trim() || "Active",
      bankVerification: String(newEmployee.bankVerification || "No").trim() || "No",
      bankName: String(newEmployee.bankName || "").trim(),
      branch: String(newEmployee.branch || "").trim(),
      accountNo: String(newEmployee.accountNo || "").trim(),
      ifscCode: String(newEmployee.ifscCode || "").trim(),
      idVerification: String(newEmployee.idVerification || "No").trim() || "No",
      educationalDocuments: String(newEmployee.educationalDocuments || "No").trim() || "No",
      policyAcknowledgment: String(newEmployee.policyAcknowledgment || "No").trim() || "No",
    };

    if (!payload.name || !payload.department || !payload.designation) {
      return;
    }

    if (
      String(payload.bankVerification).toLowerCase() === "yes" &&
      (!payload.bankName || !payload.branch || !payload.accountNo || !payload.ifscCode)
    ) {
      return;
    }

    setRows((prev) => {
      const employeeCode = createEmployeeCode(prev);
      return [
        {
          employeeCode,
          ...payload,
        },
        ...prev,
      ];
    });

    setIsAddOpen(false);
  };

  const exportToExcel = () => {
    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const header = ["Employee Code", "Name", "DOJ", "Department", "Designation", "Manager", "Status"];
    const bodyRows = filteredRows.map((r) => [r.employeeCode, r.name, r.doj, r.department, r.designation, r.manager, r.status]);

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
    a.download = `CoreHR_Employee_Master_${dateStamp}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .corehr-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 14px;
          align-items: start;
        }
        .corehr-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .corehr-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .corehr-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .corehr-card__body {
          padding: 14px;
        }
        .corehr-field {
          display: grid;
          gap: 6px;
          margin-bottom: 12px;
        }
        .corehr-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .corehr-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }
        .corehr-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .corehr-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .corehr-th {
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
        }
        .corehr-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }
        .corehr-actionBtn {
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
        .corehr-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        @media (max-width: 980px) {
          .corehr-grid {
            grid-template-columns: 1fr;
          }
        }

        .corehr-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.50);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 54px 18px 18px;
          z-index: 1999;
        }
        .corehr-modal {
          width: min(720px, 100%);
          max-height: calc(100vh - 36px);
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 24px 70px rgba(2, 6, 23, 0.22);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .corehr-modal__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .corehr-modal__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .corehr-modal__body {
          padding: 14px;
          display: grid;
          gap: 12px;
          overflow: auto;
          flex: 1;
        }
        .corehr-formGrid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
        }
        .corehr-input {
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
        .corehr-modal__footer {
          padding: 0 14px 14px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 720px) {
          .corehr-formGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-header">
        <div>
          <h2>🧑‍💼 Core HR</h2>
          <p>HRBP Reports → Core HR → Employee Master</p>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="corehr-grid">
        <div className="corehr-card">
          <div className="corehr-card__header">
            <h3 className="corehr-card__title">Panel (Filters)</h3>
          </div>
          <div className="corehr-card__body">
            <div className="corehr-field">
              <div className="corehr-label">Department</div>
              <select
                className="corehr-select"
                value={filters.department}
                onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
              >
                <option value="">All</option>
                {departmentOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="corehr-field">
              <div className="corehr-label">Location</div>
              <select
                className="corehr-select"
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              >
                <option value="">All</option>
                {locationOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="corehr-field">
              <div className="corehr-label">Manager</div>
              <select
                className="corehr-select"
                value={filters.manager}
                onChange={(e) => setFilters((p) => ({ ...p, manager: e.target.value }))}
              >
                <option value="">All</option>
                {managerOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="corehr-field" style={{ marginBottom: 0 }}>
              <div className="corehr-label">Status</div>
              <select
                className="corehr-select"
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="">All</option>
                {statusOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="btn-outline"
                onClick={exportToExcel}
              >
                Export
              </button>

              <button type="button" className="btn-outline" onClick={openAddEmployee}>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        <div className="corehr-card">
          <div className="corehr-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h3 className="corehr-card__title">Main Grid</h3>
            <div style={{ fontSize: 12, fontWeight: 850, color: "#475569" }}>{filteredRows.length} records</div>
          </div>
          <div className="corehr-card__body" style={{ padding: 0 }}>
            <div className="corehr-tableWrap">
              <table className="corehr-table">
                <thead>
                  <tr>
                    <th className="corehr-th">Employee Code</th>
                    <th className="corehr-th">Name</th>
                    <th className="corehr-th">DOJ</th>
                    <th className="corehr-th">Department</th>
                    <th className="corehr-th">Designation</th>
                    <th className="corehr-th">Manager</th>
                    <th className="corehr-th">Status</th>
                    <th className="corehr-th">View / Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.employeeCode}>
                      <td className="corehr-td">{r.employeeCode}</td>
                      <td className="corehr-td">{r.name}</td>
                      <td className="corehr-td">{r.doj}</td>
                      <td className="corehr-td">{r.department}</td>
                      <td className="corehr-td">{r.designation}</td>
                      <td className="corehr-td">{r.manager}</td>
                      <td className="corehr-td">{r.status}</td>
                      <td className="corehr-td">
                        <button
                          type="button"
                          className="corehr-actionBtn"
                          onClick={() => {
                            try {
                              sessionStorage.setItem(
                                `corehr:selectedEmployee:${encodeURIComponent(r.employeeCode)}`,
                                JSON.stringify(r)
                              );
                            } catch {
                              // ignore
                            }
                            navigate(`/hrbp/reports/corehr/employee/${encodeURIComponent(r.employeeCode)}`, {
                              state: { employee: r },
                            });
                          }}
                        >
                          View/Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredRows.length ? (
                    <tr>
                      <td className="corehr-td" colSpan={8} style={{ color: "#64748b", textAlign: "center", padding: "22px 12px" }}>
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddOpen ? (
        <div className="corehr-modalOverlay" role="dialog" aria-modal="true">
          <div className="corehr-modal">
            <div className="corehr-modal__header">
              <h3 className="corehr-modal__title">Add Employee</h3>
              <button type="button" className="btn-outline" onClick={closeAddEmployee}>
                Close
              </button>
            </div>
            <form onSubmit={onAddEmployeeSubmit} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <div className="corehr-modal__body">
                <div className="corehr-formGrid">
                  <div className="corehr-field">
                    <div className="corehr-label">Employee Name</div>
                    <input
                      className="corehr-input"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Date of Joining</div>
                    <input
                      type="date"
                      className="corehr-input"
                      value={newEmployee.doj}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, doj: e.target.value }))}
                    />
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Department</div>
                    <input
                      className="corehr-input"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, department: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Designation</div>
                    <input
                      className="corehr-input"
                      value={newEmployee.designation}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, designation: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Manager</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.manager}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, manager: e.target.value }))}
                    >
                      <option value="">Select</option>
                      {managerOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Location</div>
                    <input
                      className="corehr-input"
                      value={newEmployee.location}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, location: e.target.value }))}
                    />
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Status</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.status}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Bank Verification</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.bankVerification}
                      onChange={(e) =>
                        setNewEmployee((p) => ({
                          ...p,
                          bankVerification: e.target.value,
                          ...(e.target.value === "Yes"
                            ? {}
                            : {
                                bankName: "",
                                branch: "",
                                accountNo: "",
                                ifscCode: "",
                              }),
                        }))
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {newEmployee.bankVerification === "Yes" ? (
                    <>
                      <div className="corehr-field">
                        <div className="corehr-label">Bank Name</div>
                        <input
                          className="corehr-input"
                          value={newEmployee.bankName}
                          onChange={(e) => setNewEmployee((p) => ({ ...p, bankName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="corehr-field">
                        <div className="corehr-label">Branch</div>
                        <input
                          className="corehr-input"
                          value={newEmployee.branch}
                          onChange={(e) => setNewEmployee((p) => ({ ...p, branch: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="corehr-field">
                        <div className="corehr-label">Account No</div>
                        <input
                          className="corehr-input"
                          value={newEmployee.accountNo}
                          onChange={(e) => setNewEmployee((p) => ({ ...p, accountNo: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="corehr-field">
                        <div className="corehr-label">IFSC Code</div>
                        <input
                          className="corehr-input"
                          value={newEmployee.ifscCode}
                          onChange={(e) => setNewEmployee((p) => ({ ...p, ifscCode: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="corehr-field">
                    <div className="corehr-label">ID Verification</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.idVerification}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, idVerification: e.target.value }))}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Educational Documents</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.educationalDocuments}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, educationalDocuments: e.target.value }))}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="corehr-field">
                    <div className="corehr-label">Policy Acknowledgment</div>
                    <select
                      className="corehr-select"
                      value={newEmployee.policyAcknowledgment}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, policyAcknowledgment: e.target.value }))}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="corehr-modal__footer">
                <button type="button" className="btn-outline" onClick={closeAddEmployee}>
                  Cancel
                </button>
                <button type="submit" className="btn-outline" style={{ borderColor: "rgba(59,130,246,0.35)" }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
