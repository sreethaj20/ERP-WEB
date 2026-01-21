import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "../../App.css";

// Utility to get YYYY-MM in LOCAL time to avoid UTC shifting to previous month
const ymLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const getCurrentMonthKey = () => ymLocal(new Date());
const getLastNMonths = (n = 12) => {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    arr.push(ymLocal(d));
  }
  return arr;
};

export default function TeamLeadReports() {
  const { users, getRagByMonth, getOneOnOneByMonth, createRagReport, createOneOnOne } = useAuth();
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [availableMonths, setAvailableMonths] = useState(getLastNMonths(12));
  const [records, setRecords] = useState([]);
  const [selectedTL, setSelectedTL] = useState(""); // email of TL when filtering
  const [ooRecords, setOoRecords] = useState([]); // 1:1 interaction submissions for month
  const [viewMode, setViewMode] = useState('rag'); // 'rag' | 'oo'
  const [ragForm, setRagForm] = useState({ email: '', status: 'green', comments: '' });
  const [ooForm, setOoForm] = useState({ email: '', comments: '' });

  // Initialize available months to last 12 months
  useEffect(() => {
    setAvailableMonths(getLastNMonths(12));
  }, []);

  // Load records for selected month from backend
  useEffect(() => {
    const load = async () => {
      try {
        const rag = await getRagByMonth(monthKey);
        setRecords(Array.isArray(rag) ? rag : []);
      } catch { setRecords([]); }
      try {
        const oo = await getOneOnOneByMonth(monthKey);
        setOoRecords(Array.isArray(oo) ? oo : []);
      } catch { setOoRecords([]); }
    };
    load();
  }, [monthKey, getRagByMonth, getOneOnOneByMonth]);

  const submitRag = async (e) => {
    e.preventDefault();
    if (!ragForm.email || !ragForm.status) return alert('Employee email and status are required');
    try {
      await createRagReport({ ...ragForm, month: monthKey });
      setRagForm({ email: '', status: 'green', comments: '' });
      const rag = await getRagByMonth(monthKey);
      setRecords(Array.isArray(rag) ? rag : []);
    } catch (err) { alert(err?.message || 'Failed to submit RAG'); }
  };

  const submitOneOnOne = async (e) => {
    e.preventDefault();
    if (!ooForm.email) return alert('Employee email is required');
    try {
      await createOneOnOne({ ...ooForm, month: monthKey });
      setOoForm({ email: '', comments: '' });
      const oo = await getOneOnOneByMonth(monthKey);
      setOoRecords(Array.isArray(oo) ? oo : []);
    } catch (err) { alert(err?.message || 'Failed to submit 1:1'); }
  };

  // Enrich with user names/designations
  const enriched = useMemo(() => {
    const nameFromEmail = (email = "") => {
      try {
        const local = String(email).split("@")[0] || "";
        if (!local) return email || "";
        const cleaned = local.replace(/[^a-zA-Z0-9._-]/g, " ");
        const parts = cleaned.split(/[._-]+/).filter(Boolean);
        if (parts.length === 0) return email || "";
        const titled = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        return titled;
      } catch { return email || ""; }
    };
    return records.map(r => {
      const user = users.find(u => u.email === r.email);
      const empName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email : r.email;
      const designation = user?.designation || user?.position || user?.role || "Employee";
      const teamLeadEmail = user?.teamLeadEmail || "";
      // Prefer the actual employee's Team Lead (teamLeadEmail) for display
      const tlUser = users.find(u => (u.email || "").toLowerCase() === (teamLeadEmail || "").toLowerCase());
      const teamLeadName = tlUser
        ? (`${tlUser.firstName || ""} ${tlUser.lastName || ""}`.trim() || tlUser.username || nameFromEmail(tlUser.email))
        : nameFromEmail(teamLeadEmail);
      // Fallback to the submitter's name (manager) only if TL name is unavailable
      const submitterUser = users.find(u => (u.email || "").toLowerCase() === (r.manager || "").toLowerCase());
      const submitterName = submitterUser
        ? (`${submitterUser.firstName || ""} ${submitterUser.lastName || ""}`.trim() || submitterUser.username || nameFromEmail(submitterUser.email))
        : nameFromEmail(r.manager || "");
      const displayLeadName = teamLeadName || submitterName;
      return { ...r, empName, designation, teamLeadEmail, teamLeadName: displayLeadName };
    });
  }, [records, users]);

  const teamLeadOptions = useMemo(() => {
    return users
      .filter(u => (u.designation || "").toLowerCase() === "team lead" || (u.role || "").toLowerCase() === "manager")
      .map(u => ({ email: u.email, name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.email }));
  }, [users]);

  const filtered = useMemo(() => {
    if (!selectedTL) return [];
    const sel = selectedTL.toLowerCase();
    return enriched.filter(r => ((r.teamLeadEmail || "").toLowerCase() === sel) || ((r.manager || "").toLowerCase() === sel));
  }, [enriched, selectedTL]);

  // Filter 1:1 submissions by the selected Team Lead (manager who submitted)
  const ooFiltered = useMemo(() => {
    if (!selectedTL) return [];
    return ooRecords
      .filter(r => (r.manager || "").toLowerCase() === selectedTL.toLowerCase())
      .map(r => {
        const emp = users.find(u => (u.email || '').toLowerCase() === (r.email || '').toLowerCase());
        const empName = r.name || (`${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || emp?.username || r.email);
        const designation = emp?.designation || emp?.role || 'Employee';
        return { ...r, empName, designation };
      });
  }, [ooRecords, selectedTL, users]);

  const downloadCSV = () => {
    if (!selectedTL) {
      alert("Please select a Team Lead to export their reports.");
      return;
    }
    const headers = [
      "Month","Employee Name","Email","Designation","RAG Status","Comments","Team Lead","Submitted At"
    ];
    const rows = filtered.map(r => [
      monthKey,
      wrap(r.empName),
      wrap(r.email),
      wrap(r.designation),
      wrap(r.status),
      wrap(r.comments || ""),
      wrap(r.teamLeadName || ""),
      wrap(new Date(r.submittedAt).toLocaleString()),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TeamLeadReports_${monthKey}_${(selectedTL || 'unselected').replace(/[^a-z0-9@._-]/gi,'_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadOOCSV = () => {
    if (!selectedTL) {
      alert("Please select a Team Lead to export their reports.");
      return;
    }
    const headers = [
      "Month","Employee Name","Email","Designation","Comments","Team Lead","Submitted At"
    ];
    const rows = ooFiltered.map(r => [
      monthKey,
      wrap(r.empName),
      wrap(r.email),
      wrap(r.designation),
      wrap(r.comments || ""),
      wrap(selectedTL),
      wrap(new Date(r.submittedAt).toLocaleString()),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OneOnOneReports_${monthKey}_${(selectedTL || 'unselected').replace(/[^a-z0-9@._-]/gi,'_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wrap = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    if (/[",\n]/.test(s)) return `"${s}"`;
    return s;
  };

  const monthLabel = (ym) => {
    // ym is YYYY-MM
    const [y, m] = ym.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
  };

  return (
    <div className="dashboard fade-in teamlead-reports-page">
      <div className="dashboard-header">
        <div>
          <h2>👥 Team Lead Reports</h2>
          <p>{viewMode === 'rag' ? 'View manager-submitted Employee RAG reports, by month.' : 'View 1:1 interaction submissions, by month.'}</p>
        </div>
        <div>
          <Link className="btn-outline" to="/admin/reports">← Back to Reports</Link>
        </div>
      </div>

      {/* Controls Row (new line) */}
      <div className="reports-toolbar">
        <div className="reports-toolbar__filters">
          <label className="reports-toolbar__label">Month:</label>
          <select value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
            {availableMonths.map(m => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <label className="reports-toolbar__label">Team Lead:</label>
          <select value={selectedTL} onChange={(e) => setSelectedTL(e.target.value)}>
            <option value="">Select Team Lead</option>
            {teamLeadOptions.map(tl => (
              <option key={tl.email} value={tl.email}>{tl.name} ({tl.email})</option>
            ))}
          </select>
          <div className="reports-toolbar__tabs">
            <button type="button" className={viewMode === 'rag' ? 'btn-primary' : 'btn-outline'} onClick={() => setViewMode('rag')}>RAG</button>
            <button type="button" className={viewMode === 'oo' ? 'btn-primary' : 'btn-outline'} onClick={() => setViewMode('oo')}>1:1</button>
          </div>
        </div>
        <div className="reports-toolbar__actions">
          {viewMode === 'rag' && (
            <button className="btn-primary" onClick={downloadCSV}>Export to Excel (CSV)</button>
          )}
          {viewMode === 'oo' && (
            <button className="btn-primary" onClick={downloadOOCSV}>Export to Excel (CSV)</button>
          )}
        </div>
      </div>

      {viewMode === 'rag' && (
        <div className="table-wrapper">
          <table className="one-on-one-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Team Lead</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    {selectedTL
                      ? `No RAG reports found for ${monthLabel(monthKey)} for ${selectedTL}. Ensure submissions were made for this month and that the employee's Team Lead or the submitter matches the selected email.`
                      : "Please select a Team Lead to view their submitted reports."}
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={`rag-admin-${idx}`}>
                    <td>{r.empName}</td>
                    <td>{r.email}</td>
                    <td><span className="role-badge">{r.designation}</span></td>
                    <td style={{ textAlign: "center" }}>
                      {r.status === 'red' ? '🔴 Red' : r.status === 'amber' ? '🟡 Amber' : r.status === 'green' ? '🟢 Green' : r.status}
                    </td>
                    <td>{r.comments || ""}</td>
                    <td>{r.teamLeadName || ""}</td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'oo' && (
        <div className="table-wrapper" style={{ marginTop: 16 }}>
          <table className="one-on-one-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Comments</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {ooFiltered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    {selectedTL
                      ? `No 1:1 interaction reports found for ${monthLabel(monthKey)} for the selected Team Lead.`
                      : 'Please select a Team Lead to view their 1:1 interactions.'}
                  </td>
                </tr>
              ) : (
                ooFiltered.map((r, idx) => (
                  <tr key={`oo-admin-${idx}`}>
                    <td>{r.empName}</td>
                    <td>{r.email}</td>
                    <td><span className="role-badge">{r.designation}</span></td>
                    <td>{r.comments || ''}</td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
