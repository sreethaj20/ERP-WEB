import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function AdminQuery() {
  const { currentUser, users, listMyAdminQueries, createAdminQuery } = useAuth();
  const navigate = useNavigate();
  const [queryForm, setQueryForm] = useState({
    category: "policy",
    subject: "",
    description: "",
    priority: "normal",
    adminEmail: ""
  });
  const [queries, setQueries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { addNotification } = useNotifications();

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  const loadMyQueries = async () => {
    try {
      const rows = await listMyAdminQueries();
      const arr = Array.isArray(rows) ? rows : [];
      arr.sort((a,b) => new Date(b.updatedAt || b.createdAt || b.date || 0) - new Date(a.updatedAt || a.createdAt || a.date || 0));
      setQueries(arr);
    } catch {
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
    if (!queryForm.adminEmail) {
      addNotification({ title: 'Admin Query', message: 'Please select an Admin to send your query to.', type: 'warning', ttl: 4000 });
      return;
    }
    try {
      const rec = await createAdminQuery({
        category: queryForm.category,
        subject: queryForm.subject,
        description: queryForm.description,
        priority: queryForm.priority,
        adminEmail: queryForm.adminEmail,
      });
      addNotification({
        title: 'Admin Query Submitted',
        message: `Your admin query #${rec.id} has been submitted.`,
        type: 'success',
        link: '/employee/lcrm/admin-query',
        audience: `user:${(currentUser?.email || '').toLowerCase()}`,
      });
      await loadMyQueries();
      setQueryForm({ category: 'policy', subject: '', description: '', priority: 'normal', adminEmail: '' });
      setShowForm(false);
    } catch (err) {
      addNotification({ title: 'Admin Query', message: err?.message || 'Failed to submit query.', type: 'error', ttl: 6000 });
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
        <h2>⚙️ Admin Query - {displayName}</h2>
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ marginRight: '10px' }}
          >
            {showForm ? 'Cancel' : '+ Submit Query'}
          </button>
          {/* <button 
            className="btn btn-secondary"
            onClick={() => navigate("/employee/lcrm/it-support")}
            style={{ marginRight: '8px' }}
          >
            → Move to IT Support
          </button> */}
          {String(currentUser?.role || '').toLowerCase() === 'hr' ? (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate("/hr/solve-queries")}
              style={{ marginRight: '8px' }}
            >
              → Move to Solve Queries
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate("/employee/lcrm/hr-query")}
              style={{ marginRight: '8px' }}
            >
              → Move to HR Query
            </button>
          )}
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
          <h3>📝 Submit Admin Query</h3>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Admin:</label>
              <select
                value={queryForm.adminEmail}
                onChange={(e) => setQueryForm({ ...queryForm, adminEmail: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">-- Choose Admin --</option>
                {(users || [])
                  .filter(u => String(u.role || '').toLowerCase() === 'admin')
                  .map(adm => (
                    <option key={adm.email} value={adm.email}>{`${adm.firstName || ''} ${adm.lastName || ''}`.trim() || adm.username || adm.email}</option>
                  ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
              <select 
                value={queryForm.category}
                onChange={(e) => setQueryForm({...queryForm, category: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="policy">Company Policies</option>
                <option value="facilities">Office Facilities</option>
                <option value="security">Security & Access</option>
                <option value="compliance">Compliance & Legal</option>
                <option value="procedures">Work Procedures</option>
                <option value="systems">System Access</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priority:</label>
              <select 
                value={queryForm.priority}
                onChange={(e) => setQueryForm({...queryForm, priority: e.target.value})}
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
                placeholder="Brief description of your admin query"
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
                placeholder="Detailed description of your administrative query"
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Query</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>📋 My Admin Queries</h3>
          <div style={{ textAlign: 'left' }}>
            {queries.length === 0 ? (
              <p>No queries found. Click "Submit Query" to ask your first admin question.</p>
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
                      backgroundColor: '#e3f2fd', 
                      borderRadius: '4px',
                      borderLeft: '4px solid #2196f3'
                    }}>
                      <strong>Admin Response:</strong>
                      <p style={{ margin: '5px 0 0 0' }}>{query.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>📞 Admin Contacts</h3>
          <div style={{ textAlign: 'left' }}>
            <p><strong>Admin Office:</strong> ext. 2000</p>
            <p><strong>Email:</strong> admin@company.com</p>
            <p><strong>Office Hours:</strong> 9:00 AM - 5:30 PM</p>
            <p><strong>Emergency:</strong> ext. 999</p>
          </div>
        </div>
      </div>
    </div>
  );
}
