import React, { useMemo, useState, useEffect } from "react";
import { formatDMY } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function LeaveRequests() {
  const { listAllLeaves, reviewLeave, deleteLeave } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0,7)); // YYYY-MM
  const [hideData, setHideData] = useState(false); // when true, hide table rows (UI-only clear)

  const mapRows = (rows = []) =>
    rows.map(r => {
      const hasDuration = r.duration != null && !isNaN(Number(r.duration));
      const isHalfType = String(r.type || '').toLowerCase().includes('half');
      const hasHalfMarker = isHalfType || !!(r.partOfDay || r.part_of_day);
      const computed = Math.max(1, Math.ceil((new Date(r.to) - new Date(r.from)) / (1000*60*60*24)) + 1);
      const days = hasDuration ? Number(r.duration) : (hasHalfMarker ? 0.5 : computed);
      return ({
        id: r.id,
        employeeEmail: r.email,
        employeeName: r.email, // no name in API; showing email
        leaveType: r.type || 'Leave',
        startDate: r.from,
        endDate: r.to,
        days,
        partOfDay: r.partOfDay || r.part_of_day || undefined,
        reason: r.reason || '',
        status: String(r.status || '').toLowerCase(),
        approvedBy: r.approverEmail || '',
        approvedAt: r.updatedAt || r.createdAt,
        createdAt: r.createdAt,
      });
    });

  const loadLeaveRequests = async () => {
    try {
      const rows = await listAllLeaves();
      setLeaveRequests(mapRows(rows));
    } catch (e) {
      console.warn('Failed to load leaves', e);
      setLeaveRequests([]);
    }
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  // Auto-refresh leave requests every 5 seconds to sync with updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaveRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Refresh immediately when any page updates leaves
  useEffect(() => {
    const onLeavesUpdate = () => loadLeaveRequests();
    try { window.addEventListener('erp-leaves-updated', onLeavesUpdate); } catch {}
    return () => { try { window.removeEventListener('erp-leaves-updated', onLeavesUpdate); } catch {} };
  }, []);

  const updateStatus = async (id, status) => {
    // Backend expects: 'Approved' | 'Rejected' | 'Pending'
    const serverStatus = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
    try {
      await reviewLeave(id, serverStatus);
      await loadLeaveRequests();
    } catch (e) {
      alert(e?.message || 'Failed to update status');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this leave request?')) return;
    try {
      await deleteLeave(id);
      await loadLeaveRequests();
    } catch (e) {
      alert(e?.message || 'Failed to delete leave');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'manager_pending': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  // Calculate remaining leaves for an employee in the current month from SERVER state
  // Count only approved leaves within the month; duration is inclusive (from..to)
  const calculateRemainingLeaves = (employeeEmail) => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const isSameMonth = (d) => d.getMonth() === m && d.getFullYear() === y;

    const approvedForEmp = (leaveRequests || []).filter(r =>
      (r.employeeEmail || '').toLowerCase() === (employeeEmail || '').toLowerCase() &&
      String(r.status || '').toLowerCase() === 'approved' &&
      isSameMonth(new Date(String(r.startDate).slice(0,10)))
    );

    const usedDays = approvedForEmp.reduce((sum, r) => sum + (Number(r.days) || 0), 0);

    const allowance = 1.5;
    return { remaining: Math.max(0, allowance - usedDays), used: usedDays, allowance };
  };

  const filtered = useMemo(() => {
    if (hideData) return [];
    const q = query.toLowerCase();
    // Month filter: only include rows whose startDate is in selectedMonth
    const inMonth = (d) => {
      try { return String(new Date(d).toISOString()).slice(0,7) === selectedMonth; } catch { return true; }
    };
    // Show all requests including manager-approved ones and admin_pending
    const allRequests = leaveRequests.filter(r => 
      r.status === 'pending' || 
      r.status === 'manager_pending' || 
      r.status === 'admin_pending' || 
      r.status === 'approved' || 
      r.status === 'rejected'
    ).filter(r => inMonth(r.startDate));
    
    if (!q) return allRequests;
    return allRequests.filter(r =>
      [r.employeeName, r.employeeEmail, r.leaveType, r.reason, r.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leaveRequests, query, selectedMonth, hideData]);

  const pendingCount = filtered.filter(r => r.status === 'pending' || r.status === 'manager_pending' || r.status === 'admin_pending').length;
  const approvedCount = filtered.filter(r => r.status === 'approved').length;
  const rejectedCount = filtered.filter(r => r.status === 'rejected').length;

  return (
    <div className="dashboard fade-in">
      <h2>🏖️ Leave Requests Management</h2>
      {/* <p>Review and manage employee leave requests with approval workflow.</p> */}

      {/* Statistics Cards (compact) */}
      <div
        className="dashboard-grid"
        style={{
          marginBottom: '16px',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <div className="dashboard-card" style={{ background: '#fff3cd', padding: '14px', borderRadius: '10px' }}>
          <h3 style={{ color: '#856404', fontSize: '16px', marginBottom: '6px' }}>⏳ Pending</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#856404', margin: 0 }}>{pendingCount}</p>
        </div>
        <div className="dashboard-card" style={{ background: '#d4edda', padding: '14px', borderRadius: '10px' }}>
          <h3 style={{ color: '#155724', fontSize: '16px', marginBottom: '6px' }}>✅ Approved</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724', margin: 0 }}>{approvedCount}</p>
        </div>
        <div className="dashboard-card" style={{ background: '#f8d7da', padding: '14px', borderRadius: '10px' }}>
          <h3 style={{ color: '#721c24', fontSize: '16px', marginBottom: '6px' }}>❌ Rejected</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#721c24', margin: 0 }}>{rejectedCount}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by employee name, email, leave type..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#555' }}>Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            if (!hideData) {
              // Clear UI by hiding rows and resetting filters
              setQuery("");
              setSelectedMonth(new Date().toISOString().slice(0,7));
              setHideData(true);
              try { console.debug('Admin LeaveRequests: table cleared (UI only)'); } catch {}
            } else {
              // Show data again (DB untouched)
              setHideData(false);
              loadLeaveRequests();
              try { console.debug('Admin LeaveRequests: table restored'); } catch {}
            }
          }}
        >
          {hideData ? 'Show Data' : 'Clear Table'}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="leave-requests-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Submitted</th>
              <th style={{ width: '180px' }}>Employee & Leaves</th>
              <th style={{ width: '100px' }}>Leave Type</th>
              <th style={{ width: '90px' }}>Start Date</th>
              <th style={{ width: '90px' }}>End Date</th>
              <th style={{ width: '60px' }}>Days</th>
              <th style={{ width: '200px' }}>Reason</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '100px' }}>Manager</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No leave requests found.
                </td>
              </tr>
            ) : (
              filtered.map((request) => (
                <tr key={request.id}>
                  <td style={{ fontSize: '12px' }}>
                    {formatDMY(request.createdAt)}
                  </td>
                  <td>
                    <div style={{ lineHeight: '1.3' }}>
                      <strong style={{ fontSize: '13px' }}>{request.employeeName}</strong>
                      <br />
                      {(() => {
                        const leaveBalance = calculateRemainingLeaves(request.employeeEmail);
                        const balanceColor = leaveBalance.remaining === 0 ? '#dc3545' : 
                                           leaveBalance.remaining === 1 ? '#ffa500' : '#28a745';
                        return (
                          <small style={{ 
                            color: balanceColor, 
                            fontSize: '11px', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>📅</span>
                            {leaveBalance.remaining} leaves left this month
                            <span style={{ color: '#666', fontWeight: '400' }}>
                              ({leaveBalance.used}/{leaveBalance.allowance} used)
                            </span>
                          </small>
                        );
                      })()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span 
                        className="leave-type-badge"
                        style={{
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          width: 'fit-content'
                        }}
                      >
                        {request.leaveType}
                      </span>
                      {Number(request.days) === 0.5 && (
                        <small style={{ color: '#555' }}>Half Day {request.partOfDay ? `(${request.partOfDay})` : ''}</small>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {formatDMY(request.startDate)}
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {formatDMY(request.endDate)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '14px', color: '#1976d2' }}>{request.days}</strong>
                  </td>
                  <td style={{ fontSize: '12px', maxWidth: '200px', wordWrap: 'break-word' }}>
                    {request.reason}
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(request.status),
                        color: 'white',
                        textTransform: 'capitalize',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}
                    >
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {request.projectManager || request.approvedBy || '-'}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexDirection: 'column', alignItems: 'stretch' }}>
                      {(request.status === 'pending' || request.status === 'manager_pending' || request.status === 'admin_pending') && (
                        <>
                          <button 
                            className="btn-primary"
                            onClick={() => updateStatus(request.id, 'approved', 'Admin')}
                            style={{ fontSize: '10px', padding: '3px 6px', minHeight: '24px' }}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-outline"
                            onClick={() => updateStatus(request.id, 'rejected', 'Admin')}
                            style={{ fontSize: '10px', padding: '3px 6px', minHeight: '24px' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-outline"
                        onClick={() => remove(request.id)}
                        style={{ fontSize: '10px', padding: '3px 6px', minHeight: '24px', color: '#dc3545' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Statistics */}
      {/* <div className="dashboard-card" style={{ marginTop: '20px' }}>
        <h3>📊 Leave Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Total Requests:</strong> {leaveRequests.length}
          </div>
          <div>
            <strong>Approval Rate:</strong> {leaveRequests.length > 0 ? Math.round((approvedCount / leaveRequests.length) * 100) : 0}%
          </div>
          <div>
            <strong>Average Days:</strong> {leaveRequests.length > 0 ? Math.round(leaveRequests.reduce((sum, r) => sum + r.days, 0) / leaveRequests.length) : 0}
          </div> 
        </div>
      </div>*/}
    </div>
  );
}
