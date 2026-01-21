import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function HRSolveQueries() {
  const { users, listAssignedHrQueries, respondHrQuery } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [hrQueries, setHrQueries] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await listAssignedHrQueries();
        setHrQueries(Array.isArray(rows) ? rows : []);
      } catch {
        setHrQueries([]);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [listAssignedHrQueries]);

  const getEmployeeName = (email) => {
    const u = (users || []).find(x => (x.email || '').toLowerCase() === String(email || '').toLowerCase());
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email : email;
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

  const filtered = hrQueries.filter(q => filter === 'all' ? true : q.status === filter);

  const updateQueryStatus = async (queryId, newStatus, response = "") => {
    try {
      await respondHrQuery(queryId, { status: newStatus, response });
      const rows = await listAssignedHrQueries();
      setHrQueries(Array.isArray(rows) ? rows : []);
      addNotification({ title: 'HR Query', message: `#${queryId} ${newStatus}`, type: 'success', ttl: 3000 });
    } catch (e) {
      addNotification({ title: 'HR Query', message: e?.message || 'Failed to update query', type: 'error', ttl: 5000 });
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>📝 Solve HR Queries</h2>
          {/* <p>View and resolve queries raised by employees.</p> */}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14 }}>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Queries</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button className="btn-outline" onClick={() => navigate('/hr/lcrm')}>← Back to ICRM</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="one-on-one-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Query ID</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>No HR queries found.</td>
              </tr>
            ) : (
              filtered.map(query => (
                <tr key={query.id}>
                  <td>#{query.id}</td>
                  <td>{getEmployeeName(query.employeeEmail)}</td>
                  <td><span className="role-badge">{query.category}</span></td>
                  <td>{query.subject}</td>
                  <td style={{
                    color: query.urgency === 'urgent' ? '#dc3545' : query.urgency === 'high' ? '#fd7e14' : '#6c757d',
                    fontWeight: (query.urgency === 'urgent' || query.urgency === 'high') ? 'bold' : 'normal'
                  }}>{query.urgency}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: getStatusColor(query.status), color: 'white'
                    }}>{query.status.toUpperCase()}</span>
                  </td>
                  <td>{new Date(query.date).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {query.status === 'submitted' && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => updateQueryStatus(query.id, 'in-progress')}>Start</button>
                    )}
                    {query.status === 'in-progress' && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => {
                        const response = prompt('Enter response for the employee:');
                        if (response) updateQueryStatus(query.id, 'resolved', response);
                      }}>Resolve</button>
                    )}
                    {query.status === 'resolved' && (
                      <button className="btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => updateQueryStatus(query.id, 'closed')}>Close</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Query Details</h3>
          {filtered.map(query => (
            <div key={`detail-${query.id}`} className="dashboard-card" style={{ marginBottom: 12, padding: '14px', textAlign: 'left' }}>
              <h4>#{query.id} - {query.subject}</h4>
              <p><strong>Employee:</strong> {getEmployeeName(query.employeeEmail)} ({query.employeeEmail})</p>
              <p><strong>Description:</strong> {query.description}</p>
              {query.response && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px', borderLeft: '4px solid #28a745' }}>
                  <strong>HR Response:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{query.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
