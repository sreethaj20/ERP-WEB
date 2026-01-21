import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";
import { getEffectiveRole } from "../../utils/dashboardPath";

export default function HRQuery() {
  const { currentUser, users, listMyHrQueries, createHrQuery, listHRUsers } = useAuth();
  const navigate = useNavigate();
  const [queryForm, setQueryForm] = useState({
    category: "leave",
    subject: "",
    description: "",
    urgency: "normal",
    hrEmail: ""
  });
  const [queries, setQueries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { addNotification } = useNotifications();

  // Block HR users from accessing HRQuery form (they shouldn't raise to themselves)
  const effRole = getEffectiveRole(currentUser);
  if ((effRole || '').toLowerCase() === 'hr') {
    return <Navigate to="/hr/lcrm" replace />;
  }

  // Local HR list state; auto-fetch from server when empty
  const [hrList, setHrList] = useState([]);
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError] = useState("");
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setHrLoading(true);
        setHrError("");
        const rows = await listHRUsers();
        if (!ignore && Array.isArray(rows)) setHrList(rows);
      } catch (e) {
        if (!ignore) setHrError(e?.message || "Failed to load HR list");
      } finally {
        if (!ignore) setHrLoading(false);
      }
    };
    // Always refresh HR list to reflect latest DB state
    load();
    return () => { ignore = true; };
  }, [listHRUsers]);

  // Build HR list from context users or fetched list; fallback to localStorage
  const hrUsers = useMemo(() => {
    // Merge fetched hrList with in-memory users, prefer fetched entries
    let base = Array.isArray(users) ? users.slice() : [];
    if (Array.isArray(hrList) && hrList.length) {
      const byEmail = new Map(base.map(u => [String(u.email || '').toLowerCase(), u]));
      hrList.forEach(u => byEmail.set(String(u.email || '').toLowerCase(), u));
      base = Array.from(byEmail.values());
    }
    if (!base.length) {
      try {
        const raw = localStorage.getItem('erpUsers');
        const cached = raw ? JSON.parse(raw) : [];
        if (Array.isArray(cached)) base = cached;
      } catch {}
    }
    const list = (base || []).filter(u => (getEffectiveRole(u) || '').toLowerCase() === 'hr');
    list.sort((a,b) => (`${a.firstName||''} ${a.lastName||''}`.trim()).localeCompare(`${b.firstName||''} ${b.lastName||''}`.trim()));
    return list;
  }, [hrList, users]);

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  // Load my queries from backend API
  const loadMyQueries = async () => {
    try {
      const rows = await listMyHrQueries();
      const arr = Array.isArray(rows) ? rows : [];
      // newest first by createdAt/updatedAt/date
      arr.sort((a,b) => new Date(b.updatedAt || b.createdAt || b.date || 0) - new Date(a.updatedAt || a.createdAt || a.date || 0));
      setQueries(arr);
    } catch (e) {
      setQueries([]);
    }
  };

  useEffect(() => {
    loadMyQueries();
    const id = setInterval(loadMyQueries, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!queryForm.hrEmail) {
      addNotification({ title: 'HR Query', message: 'Please select an HR to send your query to.', type: 'warning', ttl: 4000 });
      return;
    }
    try {
      const rec = await createHrQuery({
        category: queryForm.category,
        subject: queryForm.subject,
        description: queryForm.description,
        urgency: queryForm.urgency,
        hrEmail: queryForm.hrEmail,
      });
      addNotification({
        title: 'HR Query Submitted',
        message: `Your HR query #${rec.id} has been submitted to ${queryForm.hrEmail}.`,
        type: 'success',
        link: '/employee/lcrm/hr-query',
        audience: `user:${(currentUser?.email || '').toLowerCase()}`,
      });
      // Notify HR also handled in backend; keep this for redundancy only if needed
      // Refresh list from server
      await loadMyQueries();
      setQueryForm({ category: 'leave', subject: '', description: '', urgency: 'normal', hrEmail: '' });
      setShowForm(false);
    } catch (err) {
      addNotification({ title: 'HR Query', message: err?.message || 'Failed to submit query. Please try again.', type: 'error', ttl: 6000 });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "#ffc107";
      case "in-progress": return "#007bff";
      case "resolved": return "#28a745";
      case "closed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  return (
    <div className="dashboard fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 HR Query - {displayName}</h2>
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ marginRight: '10px' }}
          >
            {showForm ? 'Cancel' : '+ Submit Query'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={loadMyQueries}
            style={{ marginRight: '8px' }}
          >
            ↻ Refresh
          </button>
          {/* <button 
            className="btn btn-secondary"
            onClick={() => navigate("/employee/lcrm/it-support")}
            style={{ marginRight: '8px' }}
          >
            → Move to IT Support
          </button> */}
          <button 
            className="btn btn-secondary"
            onClick={() => navigate("/employee/lcrm/admin-query")}
            style={{ marginRight: '8px' }}
          >
            → Move to Admin Query
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back to ICRM
          </button>
        </div>
      </div>

      {showForm && (
        <div className="dashboard-card" style={{ marginBottom: '20px' }}>
          <h3>📝 Submit HR Query</h3>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontWeight: 'bold' }}>Select HR:</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {hrLoading && <span style={{ fontSize: 12, color: '#6b7280' }}>Loading…</span>}
                  <button type="button" className="btn-outline" style={{ padding: '4px 8px' }} onClick={async () => {
                    try {
                      setHrLoading(true);
                      setHrError("");
                      const rows = await listHRUsers();
                      setHrList(Array.isArray(rows) ? rows : []);
                    } catch (e) {
                      setHrError(e?.message || 'Failed to refresh HR list');
                    } finally {
                      setHrLoading(false);
                    }
                  }}>Refresh</button>
                </div>
              </div>
              {hrError && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 6 }}>{hrError}</div>}
              {hrUsers.length > 0 ? (
                <select
                  value={queryForm.hrEmail}
                  onChange={(e) => setQueryForm({ ...queryForm, hrEmail: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="">-- Choose HR --</option>
                  {hrUsers.map(hr => (
                    <option key={hr.email} value={hr.email}>{`${hr.firstName || ''} ${hr.lastName || ''}`.trim() || hr.username || hr.email}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="email"
                  value={queryForm.hrEmail}
                  onChange={(e) => setQueryForm({ ...queryForm, hrEmail: e.target.value })}
                  required
                  placeholder="Enter HR email (no HR users found)"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
              <select 
                value={queryForm.category}
                onChange={(e) => setQueryForm({...queryForm, category: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="leave">Leave & Attendance</option>
                <option value="benefits">Benefits & Insurance</option>
                <option value="payroll">Payroll & Compensation</option>
                <option value="policy">Company Policies</option>
                <option value="training">Training & Development</option>
                <option value="grievance">Grievance & Complaints</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Urgency:</label>
              <select 
                value={queryForm.urgency}
                onChange={(e) => setQueryForm({...queryForm, urgency: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject:</label>
              <input 
                type="text"
                value={queryForm.subject}
                onChange={(e) => setQueryForm({...queryForm, subject: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Brief description of your query"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
              <textarea 
                value={queryForm.description}
                onChange={(e) => setQueryForm({...queryForm, description: e.target.value})}
                required
                rows="4"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Detailed description of your query or concern"
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Query</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>📋 My HR Queries</h3>
          <div style={{ textAlign: 'left' }}>
            {queries.length === 0 ? (
              <p>No queries found. Click "Submit Query" to ask your first HR question.</p>
            ) : (
              queries.map((query) => (
                <div key={query.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>#{query.id} - {query.subject}</h4>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(query.status),
                      color: 'white'
                    }}>
                      {query.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Category:</strong> {query.category} | <strong>Date:</strong> {query.date}
                  </p>
                  {query.response && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '4px',
                      borderLeft: '4px solid #28a745'
                    }}>
                      <strong>HR Response:</strong>
                      <p style={{ margin: '5px 0 0 0' }}>{query.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>📞 Quick Contacts</h3>
          <div style={{ textAlign: 'left' }}>
            <p><strong>HR Helpdesk:</strong> ext. 1234</p>
            <p><strong>Email:</strong> hr@company.com</p>
            <p><strong>Office Hours:</strong> 9:00 AM - 6:00 PM</p>
            <p><strong>Emergency Contact:</strong> ext. 911</p>
          </div>
        </div>
      </div>
    </div>
  );
}
