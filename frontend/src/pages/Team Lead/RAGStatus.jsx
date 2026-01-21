import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { getEffectiveRole } from "../../utils/dashboardPath";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function RAGStatus() {
  const { users, currentUser, createRagReport, createOneOnOne, getOneOnOneByMonth, getRagByMonth } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [oneOnOneData, setOneOnOneData] = useState([]);
  const [submittedOneOnOnes, setSubmittedOneOnOnes] = useState([]); // server-backed 1:1 submissions for month
  const [ragEmployeeStatus, setRagEmployeeStatus] = useState({}); // { [email]: 'red'|'amber'|'green' }
  const [ragComments, setRagComments] = useState({}); // { [email]: string }
  const [submittedRows, setSubmittedRows] = useState({}); // { [email]: true }
  const [overallSubmitted, setOverallSubmitted] = useState(false);
  const [monthKey, setMonthKey] = useState(""); // YYYY-MM
  // Tab and 1:1 interactions state
  const [activeTab, setActiveTab] = useState('rag'); // 'rag' | 'interactions' | 'reports'
  const [interactions, setInteractions] = useState([]); // [{id,email,name,date,notes,actions,status}]
  const [newItem, setNewItem] = useState({ email: '', date: '', notes: '', actions: '', status: 'Planned' });
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState({ email: '', date: '', notes: '', actions: '', status: 'Planned' });
  // Helper: Title Case for designation display
  const toTitle = (s) => String(s || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  // Helper: Get Employee ID from user record with safe fallbacks
  const getEmpIdFromUser = (u) => {
    const direct = u?.empId || u?.empID || u?.employeeId || u?.employeeID || u?.emp_id;
    if (direct) return String(direct).toUpperCase();
    const src = u?.email || u?.id || '';
    return String(src).split('@')[0].toUpperCase();
  };
  // Simple 1:1 per-employee comment + submit state
  const [ooComments, setOoComments] = useState({}); // { [email]: string }
  const [ooSubmitted, setOoSubmitted] = useState({}); // { [email]: true }
  const leadKey = (currentUser?.email || "unknown").toLowerCase();
  const nsKey = (base, mk = monthKey) => `${base}_${mk}_${leadKey}`; // kept for backward-compat no-ops

  // Determine access: Team Lead by designation OR has direct reports
  const isTeamLeadByDesignation = (currentUser?.designation || "").toLowerCase() === "team lead";
  const hasDirectReports = users.some(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
  const isLeadViewer = isTeamLeadByDesignation || hasDirectReports;
  // Only the lead's employees
  const employees = users.filter(user => (user.role || "").toLowerCase() === "employee" && (user.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());

  // Get current period key (YYYY-MM) where period is from 15th to 14th of next month
  const getCurrentMonthKey = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11 (Jan-Dec)
    
    // If it's the 15th or later, use current month as the period
    // (since period runs from 15th to 14th of next month)
    if (currentDay >= 15) {
      // Use current month as the period
      return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    } else {
      // If before the 15th, use previous month as the period
      // Handle January wrap-around
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return `${year}-${String(prevMonth + 1).padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    const mk = getCurrentMonthKey();
    setMonthKey(mk);
    // Always refresh one-on-one data to include all current employees
    initializeOneOnOneData();
    // Reset local draft state (no persistence)
    setRagEmployeeStatus({});
    setRagComments({});
    setSubmittedRows({});
    setOverallSubmitted(false);
    setInteractions([]);
    setOoComments({});
    setOoSubmitted({});
  }, [users, isLeadViewer, currentUser]);

  // Load 1:1 submissions for this month from server and filter by this manager
  useEffect(() => {
    const loadOO = async () => {
      if (!monthKey) { setSubmittedOneOnOnes([]); return; }
      try {
        const all = await getOneOnOneByMonth(monthKey);
        const mine = (Array.isArray(all) ? all : []).filter(r => (r.manager || '').toLowerCase() === (currentUser?.email || '').toLowerCase());
        setSubmittedOneOnOnes(mine);
        // reflect as submitted in UI
        const subs = {};
        const comms = {};
        mine.forEach(r => {
          const key = (r.email || '').toLowerCase();
          subs[key] = true;
          if (r.comments) comms[key] = r.comments; // populate textarea with submitted comments
        });
        setOoSubmitted(subs);
        // merge submitted comments into local state so disabled textareas show the value
        setOoComments(prev => ({ ...prev, ...comms }));
      } catch {
        setSubmittedOneOnOnes([]);
      }
    };
    loadOO();
  }, [monthKey, currentUser, getOneOnOneByMonth]);

  // Load RAG submissions for this month from server and mark submitted rows
  useEffect(() => {
    const loadRag = async () => {
      if (!monthKey) return;
      try {
        const ragRows = await getRagByMonth(monthKey);
        const mine = (Array.isArray(ragRows) ? ragRows : []).filter(r => (r.manager || '').toLowerCase() === (currentUser?.email || '').toLowerCase());
        const submitted = {};
        const statuses = { ...ragEmployeeStatus };
        const comments = { ...ragComments };
        mine.forEach(r => {
          const e = (r.email || '').toLowerCase();
          submitted[e] = true;
          if (r.status) statuses[e] = r.status;
          if (r.comments) comments[e] = r.comments;
        });
        setSubmittedRows(submitted);
        setRagEmployeeStatus(statuses);
        setRagComments(comments);
        setOverallSubmitted(false);
      } catch {}
    };
    loadRag();
  }, [monthKey, currentUser, getRagByMonth]);

  // Removed legacy project-based RAG logic. This screen now focuses solely on Employee RAG Matrix.

  const initializeOneOnOneData = () => {
    const allEmployees = users.filter(user => (user.role || "").toLowerCase() === "employee");
    const scoped = isLeadViewer
      ? allEmployees.filter(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase())
      : [];
    const initialData = scoped.map(emp => ({
      id: emp.email,
      empId: getEmpIdFromUser(emp),
      empName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.username || emp.email.split('@')[0],
      empRole: emp.designation || emp.position || emp.role || "Employee",
      comments: ""
    }));
    setOneOnOneData(initialData);
    localStorage.setItem(nsKey("oneOnOneData", getCurrentMonthKey()), JSON.stringify(initialData));
  };

  // TL Reports helpers
  const getSubmittedOneOnOnes = () => submittedOneOnOnes;

  // 1:1 Interactions helpers
  const persistInteractions = (arr) => { /* no server persistence for drafts; keep in memory */ };
  const resetNewItem = () => setNewItem({ email: '', date: '', notes: '', actions: '', status: 'Planned' });
  const addInteraction = (e) => {
    e.preventDefault();
    if (!newItem.email || !newItem.date) {
      alert('Please select an employee and a date');
      return;
    }
    const emp = employees.find(u => (u.email || '').toLowerCase() === newItem.email.toLowerCase());
    const rec = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      email: newItem.email,
      name: `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || emp?.username || newItem.email,
      date: newItem.date,
      notes: newItem.notes || '',
      actions: newItem.actions || '',
      status: newItem.status || 'Planned',
    };
    const next = [rec, ...interactions];
    setInteractions(next);
    resetNewItem();
  };
  const startEdit = (id) => {
    const it = interactions.find(x => x.id === id);
    if (!it) return;
    setEditingId(id);
    setEditItem({ email: it.email, date: it.date, notes: it.notes, actions: it.actions, status: it.status });
  };
  const saveEdit = (id) => {
    const next = interactions.map(x => x.id === id ? { ...x, ...editItem, name: users.find(u => (u.email||'').toLowerCase()===editItem.email.toLowerCase()) ? `${users.find(u => (u.email||'').toLowerCase()===editItem.email.toLowerCase()).firstName || ''} ${users.find(u => (u.email||'').toLowerCase()===editItem.email.toLowerCase()).lastName || ''}`.trim() : x.name } : x);
    setInteractions(next);
    persistInteractions(next);
    setEditingId(null);
  };
  const removeInteraction = (id) => {
    if (!confirm('Delete this 1:1 record?')) return;
    const next = interactions.filter(x => x.id !== id);
    setInteractions(next);
    persistInteractions(next);
  };

  // Simple 1:1 per-employee tab actions
  const setOoComment = (email, value) => {
    const next = { ...ooComments, [email]: value };
    setOoComments(next);
    if (monthKey) localStorage.setItem(nsKey('ooComments', monthKey), JSON.stringify(next));
  };
  const submitOoRow = async (email) => {
    const next = { ...ooSubmitted, [email]: true };
    setOoSubmitted(next);
    if (monthKey) localStorage.setItem(nsKey('ooSubmitted', monthKey), JSON.stringify(next));
    const comments = ooComments[email] || '';
    // Ensure the submitted comment stays visible in the disabled textarea
    setOoComments(prev => ({ ...prev, [email]: comments }));
    try {
      await createOneOnOne({ email, comments, month: monthKey });
      // refresh server list
      const rows = await getOneOnOneByMonth(monthKey);
      const mine = (Array.isArray(rows) ? rows : []).filter(r => (r.manager || '').toLowerCase() === (currentUser?.email || '').toLowerCase());
      setSubmittedOneOnOnes(mine);
      try {
        const emp = users.find(u => (u.email||'').toLowerCase() === (email||'').toLowerCase());
        const name = `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || emp?.username || email;
        addNotification({ title: "1:1 Submitted", message: `Submitted 1:1 for ${name}`, type: "success", link: "/teamlead/rag", audience: `user:${(currentUser?.email || '').toLowerCase()}` });
      } catch {}
    } catch (e) {
      alert(e?.message || 'Failed to submit 1:1');
    }
  };

  const handleOneOnOneCommentChange = (empId, comments) => {
    const updatedData = oneOnOneData.map(emp =>
      emp.id === empId ? { ...emp, comments } : emp
    );
    setOneOnOneData(updatedData);
  };

  const handleOneOnOneSubmit = () => {
    localStorage.setItem("oneOnOneData", JSON.stringify(oneOnOneData));
  };

  const handleEmployeeRagClick = (email, status) => {
    if (overallSubmitted || submittedRows[email]) return; // lock after submit
    const updated = { ...ragEmployeeStatus, [email]: status };
    setRagEmployeeStatus(updated);
    if (monthKey) localStorage.setItem(nsKey(`ragEmployeeStatus`), JSON.stringify(updated));
  };

  const handleCommentChange = (email, val) => {
    if (overallSubmitted || submittedRows[email]) return;
    const updated = { ...ragComments, [email]: val };
    setRagComments(updated);
    if (monthKey) localStorage.setItem(nsKey(`ragComments`), JSON.stringify(updated));
  };

  const sendToAdmin = async (records) => {
    if (!monthKey) return;
    const payloads = records.map(r => ({ ...r, month: monthKey, comments: r.comments || '' }));
    // POST each record to backend
    await Promise.all(payloads.map(p => createRagReport({ email: p.email, status: p.status, comments: p.comments, month: p.month })));
  };

  const submitRow = async (email) => {
    if (!ragEmployeeStatus[email]) {
      alert("Please select Red/Amber/Green before submitting.");
      return;
    }
    if (submittedRows[email]) return;
    const rowRecord = [{ email, status: ragEmployeeStatus[email], comments: ragComments[email] || "" }];
    try { await sendToAdmin(rowRecord); } catch (e) { alert(e?.message || 'Failed to submit'); return; }
    const updated = { ...submittedRows, [email]: true };
    setSubmittedRows(updated);
    if (monthKey) localStorage.setItem(nsKey(`ragSubmittedRows`), JSON.stringify(updated));
    // Ensure single-row submit does NOT lock all rows
    setOverallSubmitted(false);
    if (monthKey) localStorage.setItem(nsKey(`ragOverallSubmitted`), JSON.stringify(false));
    try {
      const emp = users.find(u => (u.email||'').toLowerCase() === (email||'').toLowerCase());
      const name = `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || emp?.username || email;
      addNotification({
        title: "RAG Submitted",
        message: `RAG ${ragEmployeeStatus[email]} submitted for ${name}`,
        type: "success",
        link: "/teamlead/rag",
        audience: `user:${(currentUser?.email || '').toLowerCase()}`,
      });
    } catch {}
  };

  const submitAll = async () => {
    // Prepare all not-yet-submitted rows with a selection
    const pending = oneOnOneData
      .map(e => e.id)
      .filter(email => !submittedRows[email] && ragEmployeeStatus[email]);
    if (pending.length === 0) {
      alert("No pending rows with a selected status to submit.");
      return;
    }
    const records = pending.map(email => ({ email, status: ragEmployeeStatus[email], comments: ragComments[email] || "" }));
    try { await sendToAdmin(records); } catch (e) { alert(e?.message || 'Failed to submit all'); return; }
    // Mark all rows non-editable after Submit All (UX requirement)
    const updatedRows = { ...submittedRows };
    oneOnOneData.forEach(e => { updatedRows[e.id] = true; });
    setSubmittedRows(updatedRows);
    if (monthKey) localStorage.setItem(nsKey(`ragSubmittedRows`), JSON.stringify(updatedRows));
    setOverallSubmitted(true);
    if (monthKey) localStorage.setItem(nsKey(`ragOverallSubmitted`), JSON.stringify(true));
    try {
      addNotification({
        title: "RAG: Submitted All",
        message: `Submitted ${pending.length} rows to Admin`,
        type: "success",
        link: "/teamlead/rag",
        audience: `user:${(currentUser?.email || '').toLowerCase()}`,
      });
    } catch {}
  };

  const handleBackToTeamPerformance = () => {
    navigate("/teamlead/performance");
  };

  if (!isLeadViewer) {
    return (
      <div className="dashboard fade-in" style={{ padding: 20 }}>
        <div className="dashboard-header">
          <div>
            <h2>🚦 Employee RAG Matrix</h2>
            <p>Only Team Leads can view and submit RAG for their team.</p>
          </div>
          <button className="btn-outline back-to-dashboard" onClick={handleBackToTeamPerformance}>
            ← Back to Team Performance
          </button>
        </div>
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <p style={{ margin: 0 }}>You are not assigned as a Team Lead or do not have any direct reports yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>🚦 Connections</h2>
          <p>Current month: {monthKey}</p>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={handleBackToTeamPerformance}>
          ← Back to Team Performance
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={activeTab === 'rag' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('rag')} type="button">RAG Matrix</button>
        <button className={activeTab === 'interactions' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('interactions')} type="button">1:1 Interactions</button>
        {(currentUser?.role || '').toLowerCase() === 'admin' && (
          <button className={activeTab === 'reports' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('reports')} type="button">Reports</button>
        )}
      </div>

      {activeTab === 'rag' && (
      <div className="one-on-one-container">
        <div className="table-wrapper">
          <table className="one-on-one-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Emp Name</th>
                <th>Designation</th>
                <th>Red</th>
                <th>Amber</th>
                <th>Green</th>
                <th>Comments</th>
                <th>Submit</th>
              </tr>
            </thead>
            <tbody>
              {oneOnOneData.map(emp => {
                const sel = ragEmployeeStatus[emp.id];
                const locked = overallSubmitted || submittedRows[emp.id];
                // Prefer the actual employee ID from users list; fallback to email username
                const userRef = users.find(u => (u.email || '').toLowerCase() === (emp.id || '').toLowerCase());
                const empIdDisplay = getEmpIdFromUser(userRef || { id: emp.id, email: emp.id });
                return (
                  <tr key={`rag-${emp.id}`} style={{ borderBottom: '#e5e7eb 1px solid' }}>
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>{empIdDisplay}</td>
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>{emp.empName}</td>
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                      <span style={{ fontWeight: 500 }}>{toTitle(emp.empRole)}</span>
                    </td>
                    <td
                      onClick={() => handleEmployeeRagClick(emp.id, 'red')}
                      style={{ cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'center', background: sel === 'red' ? '#FEE2E2' : 'transparent', color: sel === 'red' ? '#B91C1C' : undefined }}
                      title={locked ? 'Submitted' : 'Mark Red (Critical)'}
                    >
                      🔴
                    </td>
                    <td
                      onClick={() => handleEmployeeRagClick(emp.id, 'amber')}
                      style={{ cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'center', background: sel === 'amber' ? '#FEF3C7' : 'transparent', color: sel === 'amber' ? '#92400E' : undefined }}
                      title={locked ? 'Submitted' : 'Mark Amber (At Risk)'}
                    >
                      🟡
                    </td>
                    <td
                      onClick={() => handleEmployeeRagClick(emp.id, 'green')}
                      style={{ cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'center', background: sel === 'green' ? '#DCFCE7' : 'transparent', color: sel === 'green' ? '#065F46' : undefined }}
                      title={locked ? 'Submitted' : 'Mark Green (On Track)'}
                    >
                      🟢
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <textarea
                        className="comment-textarea"
                        rows={2}
                        value={ragComments[emp.id] || ''}
                        onChange={(e) => handleCommentChange(emp.id, e.target.value)}
                        placeholder="Add comment..."
                        disabled={locked}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 10px', verticalAlign: 'middle' }}>
                      <button
                        className="btn-primary"
                        onClick={() => submitRow(emp.id)}
                        disabled={locked || !ragEmployeeStatus[emp.id]}
                        title={locked ? 'Already submitted' : 'Submit row to Admin'}
                      >
                        Submit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="one-on-one-actions">
          <button className="btn-primary btn-submit" onClick={submitAll} disabled={overallSubmitted}>
            Submit All to Admin
          </button>
        </div>
      </div>
      )}

      {activeTab === 'interactions' && (
        <div className="dashboard-card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>1:1 Interactions</h3>
          <div className="table-wrapper">
            <table className="user-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Emp ID</th>
                  <th style={{ width: '22%' }}>Emp Name</th>
                  <th style={{ width: '18%' }}>Designation</th>
                  <th style={{ textAlign: 'left', width: '36%' }}>Comments</th>
                  <th style={{ width: '12%' }}>Submit</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const email = emp.email;
                  const empId = getEmpIdFromUser(emp);
                  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.username || empId;
                  const role = emp.designation || emp.role || 'Employee';
                  const locked = !!ooSubmitted[email];
                  return (
                    <tr key={`oo-${email}`} style={{ borderBottom: '#e5e7eb 1px solid' }}>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '8px 10px' }}>{empId}</td>
                      <td style={{ verticalAlign: 'middle', wordBreak: 'break-word', padding: '8px 10px' }}>{name}</td>
                      <td style={{ verticalAlign: 'middle', padding: '8px 10px' }}>
                        <span style={{ fontWeight: 500 }}>{toTitle(role)}</span>
                      </td>
                      <td style={{ textAlign: 'left', verticalAlign: 'middle', overflow: 'hidden', padding: '8px 10px' }}>
                        <textarea
                          rows={2}
                          placeholder="Add one-on-one comments..."
                          value={ooComments[email] || ''}
                          onChange={(e) => setOoComment(email, e.target.value)}
                          disabled={locked}
                          className="comment-textarea"
                          style={{ display: 'block', width: '100%', maxWidth: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 64, margin: 0, padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px 10px' }}>
                        <button className="btn-primary" type="button" onClick={() => submitOoRow(email)} disabled={locked}>
                          {locked ? 'Submitted' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 1:1 Interaction submissions list */}
          {/* <h3 style={{ marginTop: 16 }}>1:1 Interaction Reports</h3>
          <div className="table-wrapper">
            <table className="user-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>Emp ID</th>
                  <th style={{ width: '22%' }}>Emp Name</th>
                  <th style={{ width: '18%' }}>Designation</th>
                  <th style={{ width: '32%' }}>Comments</th>
                  <th style={{ width: '18%' }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = getSubmittedOneOnOnes();
                  if (rows.length === 0) {
                    return (
                      <tr><td colSpan={5} style={{ textAlign: 'center' }}>No 1:1 submissions yet this month.</td></tr>
                    );
                  }
                  return rows.map((r, idx) => {
                    const emp = users.find(u => (u.email||'').toLowerCase() === (r.email||'').toLowerCase());
                    const empId = (r.email || '').split('@')[0].toUpperCase();
                    const name = r.name || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || emp?.username || empId;
                    const role = emp?.designation || emp?.role || 'Employee';
                    const when = new Date(r.submittedAt || Date.now()).toLocaleString();
                    return (
                      <tr key={`oo-rep-${idx}`}>
                        <td style={{ verticalAlign: 'top' }}>{empId}</td>
                        <td style={{ verticalAlign: 'top' }}>{name}</td>
                        <td style={{ verticalAlign: 'top' }}><span className="role-badge">{role}</span></td>
                        <td style={{ verticalAlign: 'top' }}>{r.comments || ''}</td>
                        <td style={{ verticalAlign: 'top' }}>{when}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(currentUser?.role || '').toLowerCase() === 'admin' && activeTab === 'reports' && (
        <div className="dashboard-card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Team Lead Reports (This Month)</h3>
          <div className="table-wrapper">
            <table className="user-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>Emp ID</th>
                  <th style={{ width: '20%' }}>Emp Name</th>
                  <th style={{ width: '18%' }}>Designation</th>
                  <th style={{ width: '10%' }}>RAG</th>
                  <th style={{ width: '22%' }}>RAG Comment</th>
                  <th style={{ width: '20%' }}>1:1 Comment</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const email = emp.email;
                  const empId = (email || '').split('@')[0].toUpperCase();
                  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.username || empId;
                  const role = emp.designation || emp.role || 'Employee';
                  const ragSel = ragEmployeeStatus[email] || '-';
                  const ragCom = ragComments[email] || '';
                  const ooCom = ooComments[email] || '';
                  return (
                    <tr key={`rep-${email}`}>
                      <td style={{ verticalAlign: 'top' }}>{empId}</td>
                      <td style={{ verticalAlign: 'top' }}>{name}</td>
                      <td style={{ verticalAlign: 'top' }}><span className="role-badge">{role}</span></td>
                      <td style={{ verticalAlign: 'top', textTransform: 'capitalize' }}>{ragSel}</td>
                      <td style={{ verticalAlign: 'top' }}>{ragCom}</td>
                      <td style={{ verticalAlign: 'top' }}>{ooCom}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>*/}
        </div>
      )} 
    </div>
  );
}

