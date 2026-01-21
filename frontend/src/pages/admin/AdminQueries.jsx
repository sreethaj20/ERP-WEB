import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function AdminQueries() {
  const { currentUser, users, listAllAdminQueries, respondAdminQuery } = useAuth();
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [filter, setFilter] = useState("all");
  const { addNotification } = useNotifications();

  const loadAll = async () => {
    try {
      const rows = await listAllAdminQueries();
      const arr = Array.isArray(rows) ? rows : [];
      arr.sort((a,b) => new Date(b.updatedAt || b.createdAt || b.date || 0) - new Date(a.updatedAt || a.createdAt || a.date || 0));
      setQueries(arr);
    } catch {
      setQueries([]);
    }
  };

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 10000);
    return () => clearInterval(id);
  }, []);

  const updateQuery = async (id, patch) => {
    try {
      await respondAdminQuery(id, patch);
      await loadAll();
      const q = (queries || []).find(x => x.id === id) || {};
      if (patch.status === 'in-progress') {
        addNotification({ title: 'Admin Query Started', message: `#${id} marked In Progress`, type: 'info', audience: 'role:admin' });
      }
      if (patch.status === 'closed') {
        addNotification({ title: 'Admin Query Closed', message: `#${id} has been closed`, type: 'success', audience: 'role:admin' });
        addNotification({ title: 'Admin Query Closed', message: `Your admin query #${id} has been closed.`, type: 'info', link: '/employee/lcrm/admin-query', audience: `user:${(q.employeeEmail || '').toLowerCase()}` });
      }
    } catch (e) {
      addNotification({ title: 'Admin Query', message: e?.message || 'Failed to update query', type: 'error', ttl: 6000 });
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

  const getEmployeeName = (email) => {
    const u = (users || []).find(x => x.email === email);
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || email : email;
  };

  const filtered = queries.filter(q => filter === 'all' ? true : q.status === filter);

  const handleRespond = async (q) => {
    const response = prompt(`Respond to #${q.id} - ${q.subject}`);
    if (!response) return;
    try {
      await respondAdminQuery(q.id, { response, status: 'resolved' });
      await loadAll();
      addNotification({ title: 'Admin Query Resolved', message: `#${q.id} - ${q.subject} resolved`, type: 'success', audience: 'role:admin' });
      addNotification({ title: 'Admin Query Resolved', message: `Your admin query #${q.id} has been resolved.`, type: 'success', link: '/employee/lcrm/admin-query', audience: `user:${(q.employeeEmail || '').toLowerCase()}` });
    } catch (e) {
      addNotification({ title: 'Admin Query', message: e?.message || 'Failed to respond', type: 'error', ttl: 6000 });
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>⚙️ Admin Query Inbox</h2>
          {/* <p>View and resolve administrative queries submitted by employees.</p> */}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14 }}>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button className="btn-outline" onClick={() => navigate("/admin/dashboard")}>← Back</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="one-on-one-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>No admin queries found.</td>
              </tr>
            ) : (
              filtered.map(q => (
                <tr key={q.id}>
                  <td>#{q.id}</td>
                  <td>{getEmployeeName(q.employeeEmail)} ({q.employeeEmail})</td>
                  <td><span className="role-badge">{q.category}</span></td>
                  <td>{q.subject}</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold', backgroundColor: getStatusColor(q.status), color: '#fff' }}>
                      {q.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>{q.date}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {q.status === 'submitted' && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => updateQuery(q.id, { status: 'in-progress' })}>Start</button>
                    )}
                    {q.status === 'in-progress' && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleRespond(q)}>Resolve</button>
                    )}
                    {q.status === 'resolved' && (
                      <button className="btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => updateQuery(q.id, { status: 'closed' })}>Close</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.map(q => (
        <div key={`detail-${q.id}`} className="dashboard-card" style={{ marginTop: 12, textAlign: 'left' }}>
          <h4>#{q.id} - {q.subject}</h4>
          <p><strong>Employee:</strong> {getEmployeeName(q.employeeEmail)} ({q.employeeEmail})</p>
          {q.description && <p><strong>Description:</strong> {q.description}</p>}
          {q.response && (
            <div style={{ marginTop: 10, padding: 10, background: '#e3f2fd', borderLeft: '4px solid #2196f3', borderRadius: 4 }}>
              <strong>Admin Response:</strong>
              <p style={{ margin: '6px 0 0 0' }}>{q.response}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
