import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../App.css";

export default function EmployeeView() {
  const navigate = useNavigate();
  const { employeeCode } = useParams();
  const location = useLocation();

  const [warningsFetched, setWarningsFetched] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [selectedWarningId, setSelectedWarningId] = useState(null);
  const [isAddWarningOpen, setIsAddWarningOpen] = useState(false);
  const [newWarning, setNewWarning] = useState({ date: "", reason: "", severity: "Low" });

  const warningsStorageKey = useMemo(() => {
    const code = String(employeeCode || "").trim();
    return `employeeView:warnings:${encodeURIComponent(code || "unknown")}`;
  }, [employeeCode]);

  const exitStorageKey = useMemo(() => {
    const code = String(employeeCode || "").trim();
    return `employeeView:exit:${encodeURIComponent(code || "unknown")}`;
  }, [employeeCode]);

  const [exitInitiateOpen, setExitInitiateOpen] = useState(false);
  const [exitDetails, setExitDetails] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`employeeView:exit:${encodeURIComponent(String(employeeCode || "").trim() || "unknown")}`);
      if (!raw) return { initiated: false, exitType: "", lastWorkingDay: "" };
      const parsed = JSON.parse(raw);
      return {
        initiated: Boolean(parsed?.initiated),
        exitType: String(parsed?.exitType || ""),
        lastWorkingDay: String(parsed?.lastWorkingDay || ""),
      };
    } catch {
      return { initiated: false, exitType: "", lastWorkingDay: "" };
    }
  });

  const employee = useMemo(() => {
    const fromState = location?.state?.employee || null;
    if (fromState) return fromState;
    try {
      const key = `corehr:selectedEmployee:${encodeURIComponent(employeeCode || "")}`;
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [employeeCode, location?.state]);

  const getFieldValue = (sectionTitle) => {
    if (!employee) return "-";
    const t = String(sectionTitle || "").toLowerCase();

    if (t === "email id") return employee.email || employee.emailId || "-";
    if (t === "name") return employee.name || "-";
    if (t === "dob") return employee.dob || employee.dateOfBirth || employee.date_of_birth || "-";
    if (t === "blood group") return employee.bloodGroup || employee.blood_group || "-";

    if (t === "doj") return employee.doj || employee.dateOfJoining || employee.date_of_joining || "-";
    if (t === "department") return employee.department || "-";
    if (t === "designation") return employee.designation || "-";
    if (t === "grade") return employee.grade || "-";
    if (t === "reporting manager") return employee.manager || employee.reportingManager || employee.reporting_manager || "-";

    if (t === "bank verification status") {
      const v = employee.bankVerification || employee.bank_verification;
      if (v == null || v === "") return "-";
      return String(v);
    }

    if (t === "id proof") {
      const v = employee.idVerification || employee.id_verification;
      if (v == null || v === "") return "-";
      return String(v);
    }
    if (t === "educational documents") {
      const v = employee.educationalDocuments || employee.educational_documents;
      if (v == null || v === "") return "-";
      return String(v);
    }
    if (t === "professional documents") {
      const v =
        employee.professionalDocuments ||
        employee.professional_documents ||
        employee.professionalDocs ||
        employee.professional_docs;
      if (v == null || v === "") return "-";
      return String(v);
    }
    if (t === "policy acknowledgment") {
      const v = employee.policyAcknowledgment || employee.policy_acknowledgment;
      if (v == null || v === "") return "-";
      return String(v);
    }

    return "-";
  };

  const tabs = useMemo(
    () => [
      {
        id: "personal",
        title: "Personal Details",
        sections: [
          { title: "Email ID" },
          { title: "Name" },
          { title: "DOB" },
          { title: "Blood Group" },
          { title: "Contact Details" },
          { title: "Emergency Contact" },
        ],
      },
      {
        id: "job",
        title: "Job Details",
        sections: [
          { title: "DOJ" },
          { title: "Department" },
          { title: "Designation" },
          { title: "Grade" },
          { title: "Reporting Manager" },
        ],
      },
      {
        id: "attendance",
        title: "Attendance & Leave Snapshot",
        sections: [{ title: "Present Days" }, { title: "Leave Taken" }, { title: "LOP Days" }],
      },
      {
        id: "payroll",
        title: "Payroll",
        sections: [{ title: "Salary Structure" }, { title: "Payslip Download" }, { title: "Bank Verification Status" }],
      },
      {
        id: "assets",
        title: "Assets",
        sections: [{ title: "Asset Assigned" }, { title: "Return Status" }],
      },
      {
        id: "documents",
        title: "Documents",
        sections: [{ title: "ID Proof" }, { title: "Educational Documents" }, { title: "Professional Documents" }, { title: "Policy Acknowledgment" }],
      },
      {
        id: "warnings",
        title: "Warnings",
        sections: [],
      },
      {
        id: "exit",
        title: "Exit Details",
        sections: [],
      },
    ],
    []
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || "personal");
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const selectedWarning = useMemo(
    () => warnings.find((w) => String(w.id) === String(selectedWarningId)) || null,
    [selectedWarningId, warnings]
  );

  const assets = useMemo(() => {
    const source =
      employee?.assets ||
      employee?.assetList ||
      employee?.asset_list ||
      employee?.assignedAssets ||
      employee?.assigned_assets ||
      [];
    const arr = Array.isArray(source) ? source : [];
    return arr.map((a, idx) => {
      const assetId = a?.assetId ?? a?.asset_id ?? a?.id ?? a?.assetCode ?? a?.asset_code ?? `A-${idx + 1}`;
      const assetName = a?.assetName ?? a?.asset_name ?? a?.name ?? a?.itemName ?? a?.item_name ?? "-";
      const date = a?.date ?? a?.assignedDate ?? a?.assigned_date ?? a?.issueDate ?? a?.issue_date ?? "-";
      const returnStatusRaw =
        a?.returnStatus ??
        a?.return_status ??
        a?.status ??
        a?.assetStatus ??
        a?.asset_status ??
        a?.returned ??
        a?.isReturned ??
        a?.is_returned ??
        "-";
      const returnStatus =
        typeof returnStatusRaw === "boolean" ? (returnStatusRaw ? "Returned" : "Not Returned") : String(returnStatusRaw || "-");
      return {
        assetId: assetId == null || assetId === "" ? `A-${idx + 1}` : String(assetId),
        assetName: assetName == null || assetName === "" ? "-" : String(assetName),
        date: date == null || date === "" ? "-" : String(date),
        returnStatus: returnStatus == null || returnStatus === "" ? "-" : returnStatus,
      };
    });
  }, [employee]);

  const normalizeWarnings = (list) => {
    const arr = Array.isArray(list) ? list : [];
    return arr
      .map((w, idx) => ({
        id: w?.id ?? w?.warningId ?? `W-${idx + 1}`,
        date: w?.date ?? w?.warningDate ?? "",
        reason: w?.reason ?? w?.warningReason ?? "",
        severity: w?.severity ?? w?.warningSeverity ?? "Low",
      }))
      .filter((w) => w.id != null);
  };

  const readStoredWarnings = () => {
    try {
      const raw = sessionStorage.getItem(warningsStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return normalizeWarnings(parsed);
    } catch {
      return [];
    }
  };

  const writeStoredWarnings = (list) => {
    try {
      sessionStorage.setItem(warningsStorageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const writeStoredExit = (payload) => {
    try {
      sessionStorage.setItem(exitStorageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const mergeWarnings = (a, b) => {
    const out = [];
    const seen = new Set();
    const push = (w) => {
      const id = String(w?.id ?? "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      out.push(w);
    };
    (Array.isArray(a) ? a : []).forEach(push);
    (Array.isArray(b) ? b : []).forEach(push);
    return out;
  };

  const fetchWarningRecords = () => {
    setIsAddWarningOpen(false);
    const source = employee?.warnings || employee?.warningRecords || employee?.warning_records;
    const fromEmployee = normalizeWarnings(source);
    const fromStorage = readStoredWarnings();
    const merged = mergeWarnings(fromStorage, fromEmployee);

    setWarningsFetched(true);
    setWarnings(merged);
    setSelectedWarningId(merged[0]?.id ?? null);
  };

  const openAddWarning = () => {
    setIsAddWarningOpen(true);
    setWarningsFetched(false);
    setNewWarning({ date: new Date().toISOString().slice(0, 10), reason: "", severity: "Low" });
  };

  const addWarning = (e) => {
    e.preventDefault();
    const payload = {
      id: `W-${Date.now()}`,
      date: String(newWarning.date || "").trim(),
      reason: String(newWarning.reason || "").trim(),
      severity: String(newWarning.severity || "Low").trim() || "Low",
    };
    if (!payload.date || !payload.reason) return;
    const stored = readStoredWarnings();
    const nextStored = mergeWarnings([payload, ...stored], []);
    writeStoredWarnings(nextStored);
    setWarnings((prev) => mergeWarnings([payload, ...prev], []));
    setWarningsFetched(true);
    setSelectedWarningId(payload.id);
    setIsAddWarningOpen(false);
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .empview-shell {
          display: grid;
          gap: 14px;
        }
        .empview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.14) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .empview-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .empview-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .empview-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 14px;
          align-items: start;
        }
        .empview-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .empview-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.10) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .empview-card__title {
          margin: 0;
          font-size: 13px;
          font-weight: 950;
          color: #0f172a;
        }
        .empview-card__body {
          padding: 14px;
        }
        .empview-tabs {
          display: grid;
          gap: 8px;
        }
        .empview-tabBtn {
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.86);
          padding: 10px 12px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          color: #0f172a;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
        }
        .empview-tabBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .empview-tabBtnActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.16) 0%, rgba(139,92,246,0.12) 60%, rgba(16,185,129,0.10) 100%);
        }
        .empview-list {
          display: grid;
          gap: 10px;
        }
        .empview-section {
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.88);
          padding: 12px;
        }
        .empview-section__title {
          font-weight: 950;
          color: #0f172a;
          font-size: 13px;
          margin: 0 0 8px;
        }
        .empview-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          line-height: 18px;
        }

        .empview-dot {
          color: #2563eb;
          font-weight: 950;
          line-height: 18px;
        }

        .empview-warnGrid {
          display: grid;
          gap: 12px;
        }
        .empview-warnActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .empview-warnTableWrap {
          width: 100%;
          overflow: auto;
        }
        .empview-warnTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 760px;
        }
        .empview-warnTh {
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
        .empview-warnTd {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }

        .empview-assetTableWrap {
          width: 100%;
          overflow: auto;
        }
        .empview-assetTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 520px;
        }
        .empview-assetTh {
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
        .empview-assetTd {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }
        .empview-warnList {
          display: grid;
          gap: 10px;
        }
        .empview-warnRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.88);
        }
        .empview-warnMeta {
          display: grid;
          gap: 4px;
        }
        .empview-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          color: #0f172a;
          width: fit-content;
        }
        .empview-warnForm {
          display: grid;
          gap: 10px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(248,250,252,0.95);
        }
        .empview-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          outline: none;
          box-sizing: border-box;
        }

        .empview-exitGrid {
          display: grid;
          gap: 12px;
        }
        .empview-exitRow {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 720px) {
          .empview-exitRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="empview-head">
        <div>
          <div className="empview-title">Employee View</div>
          <div className="empview-sub">
            Employee Code: {employeeCode}
            {employee?.name ? ` | Name: ${employee.name}` : ""}
          </div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="empview-grid">
        <div className="empview-card">
          <div className="empview-card__header">
            <h3 className="empview-card__title">Tabs</h3>
          </div>
          <div className="empview-card__body">
            <div className="empview-tabs">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`empview-tabBtn ${activeTabId === t.id ? "empview-tabBtnActive" : ""}`}
                  onClick={() => setActiveTabId(t.id)}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="empview-card">
          <div className="empview-card__header">
            <h3 className="empview-card__title">{activeTab?.title || "Details"}</h3>
          </div>
          <div className="empview-card__body">
            {!employee ? (
              <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>
                No employee data found. Please go back and open this page using View/Edit from the Employee Master.
              </div>
            ) : null}
            {activeTabId === "warnings" ? (
              <div className="empview-warnGrid">
                <div className="empview-warnActions">
                  <button type="button" className="btn-outline" onClick={fetchWarningRecords}>
                    Fetch Warning Records
                  </button>
                  <button type="button" className="btn-outline" onClick={openAddWarning}>
                    Add Warning
                  </button>
                </div>

                {!warningsFetched ? (
                  <div style={{ color: "#475569", fontWeight: 850, fontSize: 13 }}>
                    Click <b>Fetch Warning Records</b> to load warnings.
                  </div>
                ) : warnings.length === 0 ? (
                  <div style={{ color: "#475569", fontWeight: 850, fontSize: 13 }}>
                    Show: <b>No Active Warnings</b>
                  </div>
                ) : (
                  <>
                    <div className="empview-warnTableWrap">
                      <table className="empview-warnTable">
                        <thead>
                          <tr>
                            <th className="empview-warnTh">Warning ID</th>
                            <th className="empview-warnTh">Date</th>
                            <th className="empview-warnTh">Reason</th>
                            <th className="empview-warnTh">Severity</th>
                            {/* <th className="empview-warnTh">Action</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {warnings.map((w) => {
                            const isSelected = String(w.id) === String(selectedWarningId);
                            return (
                              <tr key={w.id} style={isSelected ? { background: "rgba(59,130,246,0.06)" } : undefined}>
                                <td className="empview-warnTd">{w.id}</td>
                                <td className="empview-warnTd">{w.date || "-"}</td>
                                <td className="empview-warnTd">{w.reason || "-"}</td>
                                <td className="empview-warnTd">
                                  <span className="empview-pill">{w.severity || "-"}</span>
                                </td>
                                <td className="empview-warnTd">
                                  {/* <button type="button" className="btn-outline" onClick={() => setSelectedWarningId(w.id)}>
                                    {isSelected ? "Selected" : "View Details"}
                                  </button> */}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* <div className="empview-section">
                      <div className="empview-section__title">View Details</div>
                      <div className="empview-item">
                        <span className="empview-dot">•</span>
                        <span>Date: {selectedWarning?.date || "-"}</span>
                      </div>
                      <div className="empview-item">
                        <span className="empview-dot">•</span>
                        <span>Reason: {selectedWarning?.reason || "-"}</span>
                      </div>
                      <div className="empview-item">
                        <span className="empview-dot">•</span>
                        <span>Severity: {selectedWarning?.severity || "-"}</span>
                      </div>
                    </div> */}
                  </>
                )}

                {isAddWarningOpen ? (
                  <form className="empview-warnForm" onSubmit={addWarning}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 950, color: "#0f172a" }}>Add Warning</div>
                      <button type="button" className="btn-outline" onClick={() => setIsAddWarningOpen(false)}>
                        Close
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>Date</div>
                        <input
                          type="date"
                          className="empview-input"
                          value={newWarning.date}
                          onChange={(e) => setNewWarning((p) => ({ ...p, date: e.target.value }))}
                          required
                        />
                      </div>

                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>Severity</div>
                        <select
                          className="empview-input"
                          value={newWarning.severity}
                          onChange={(e) => setNewWarning((p) => ({ ...p, severity: e.target.value }))}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>Reason</div>
                      <input
                        className="empview-input"
                        value={newWarning.reason}
                        onChange={(e) => setNewWarning((p) => ({ ...p, reason: e.target.value }))}
                        placeholder="Enter reason"
                        required
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button type="submit" className="btn-outline">
                        Save
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ) : activeTabId === "exit" ? (
              <div className="empview-exitGrid">
                <div className="empview-section">
                  <div className="empview-section__title">Exit Status</div>
                  <div className="empview-item">
                    <span className="empview-dot">•</span>
                    <span>{exitDetails.initiated ? "Initiated" : "Not Initiated"}</span>
                  </div>
                  {exitDetails.initiated ? (
                    <>
                      <div className="empview-item">
                        <span className="empview-dot">•</span>
                        <span>Exit Type: {exitDetails.exitType || "-"}</span>
                      </div>
                      <div className="empview-item">
                        <span className="empview-dot">•</span>
                        <span>Last Working Day: {exitDetails.lastWorkingDay || "-"}</span>
                      </div>
                    </>
                  ) : null}
                </div>

                {!exitDetails.initiated ? (
                  <div className="empview-section">
                    <div className="empview-section__title">Initiate Exit</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" className="btn-outline" onClick={() => setExitInitiateOpen((p) => !p)}>
                        Initiate
                      </button>
                    </div>

                    {exitInitiateOpen ? (
                      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                        <div className="empview-exitRow">
                          <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>Exit Type</div>
                          <select
                            className="empview-input"
                            value={exitDetails.exitType}
                            onChange={(e) => {
                              const t = e.target.value;
                              setExitDetails((p) => ({ ...p, exitType: t, lastWorkingDay: "" }));
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Termination">Termination</option>
                            <option value="Resignation">Resignation</option>
                            <option value="Absconding">Absconding</option>
                          </select>
                        </div>

                        {exitDetails.exitType ? (
                          <div className="empview-exitRow">
                            <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>Last Working Day</div>
                            <input
                              type="date"
                              className="empview-input"
                              value={exitDetails.lastWorkingDay}
                              onChange={(e) => setExitDetails((p) => ({ ...p, lastWorkingDay: e.target.value }))}
                            />
                          </div>
                        ) : null}

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => {
                              const payload = {
                                initiated: true,
                                exitType: exitDetails.exitType,
                                lastWorkingDay: exitDetails.lastWorkingDay,
                              };
                              writeStoredExit(payload);
                              setExitDetails(payload);
                              setExitInitiateOpen(false);
                              navigate("/hrbp/reports/exit", {
                                state: {
                                  employeeCode,
                                  employeeName: employee?.name || "",
                                  exitType: payload.exitType,
                                  lastWorkingDay: payload.lastWorkingDay,
                                },
                              });
                            }}
                            disabled={!exitDetails.exitType || !exitDetails.lastWorkingDay}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : activeTabId === "assets" ? (
              <div className="empview-section">
                <div className="empview-section__title">Assets</div>
                <div className="empview-assetTableWrap">
                  <table className="empview-assetTable">
                    <thead>
                      <tr>
                        <th className="empview-assetTh">Asset Id</th>
                        <th className="empview-assetTh">Asset Name</th>
                        <th className="empview-assetTh">Date</th>
                        <th className="empview-assetTh">Return Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.length === 0 ? (
                        <tr>
                          <td className="empview-assetTd" colSpan={4} style={{ color: "#475569", fontWeight: 850 }}>
                            No assets assigned.
                          </td>
                        </tr>
                      ) : (
                        assets.map((a) => (
                          <tr key={a.assetId}>
                            <td className="empview-assetTd">{a.assetId}</td>
                            <td className="empview-assetTd">{a.assetName}</td>
                            <td className="empview-assetTd">{a.date}</td>
                            <td className="empview-assetTd">{a.returnStatus}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empview-list">
                {(activeTab?.sections || []).map((s) => (
                  <div key={s.title} className="empview-section">
                    <div className="empview-section__title">{s.title}</div>
                    <div className="empview-item">
                      <span className="empview-dot">•</span>
                      <span>{getFieldValue(s.title)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
