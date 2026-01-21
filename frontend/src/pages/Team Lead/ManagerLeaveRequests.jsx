import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { formatDMY } from "../../utils/date";
import { getHolidaysForMonth } from "../../utils/holidays";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function AdminLeaveHistory() {
  const { currentUser, getMyLeaves, getMyLeaveBalance, createLeave } = useAuth();
  const location = useLocation();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [monthlyLeavesTaken, setMonthlyLeavesTaken] = useState(0);
  const [yearlyTotalLeaves, setYearlyTotalLeaves] = useState(18);
  const [yearlyLeavesRemaining, setYearlyLeavesRemaining] = useState(18);
  const [activeSection, setActiveSection] = useState("history");

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    partOfDay: 'AM'
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const today = new Date();
  const monthLabel = today.toLocaleString("default", { month: "long" });
  const monthHolidays = getHolidaysForMonth(today.getFullYear(), today.getMonth());

  const MONTHLY_LEAVE_LIMIT = 1.5;

  useEffect(() => {
    loadLeaveHistory();
    calculateMonthlyLeaves();
  }, [currentUser]);

  useEffect(() => {
    const section = new URLSearchParams(location.search || '').get('section');
    if (section === 'holidays') {
      setShowLeaveModal(false);
      setActiveSection('holidays');
    }
  }, [location.search]);

  useEffect(() => {
    const interval = setInterval(() => {
      calculateMonthlyLeaves();
      loadLeaveHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadLeaveHistory = async () => {
    if (!currentUser?.email) { setLeaveHistory([]); return; }
    try {
      const rows = await getMyLeaves();
      const mapped = (rows || []).map(r => ({
        id: r.id,
        leaveType: r.type || 'Leave',
        startDate: r.from,
        endDate: r.to,
        days: r.duration != null ? Number(r.duration) : calculateDays(String(r.from).slice(0,10), String(r.to).slice(0,10)),
        status: String(r.status || '').toLowerCase(),
        approvedBy: r.approverEmail || '',
        approvedAt: r.updatedAt || r.createdAt,
        createdAt: r.createdAt,
      }));
      setLeaveHistory(mapped);
    } catch (e) {
      console.warn('Failed to load leave history', e);
      setLeaveHistory([]);
    }
  };

  const calculateMonthlyLeaves = async () => {
    if (!currentUser?.email) return;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    try {
      const rows = await getMyLeaves();
      const normalizeDuration = (r) => {
        if (r && r.duration != null) {
          const d = Number(r.duration);
          return isNaN(d) ? 0 : Math.max(0.5, d);
        }
        return calculateDays(String(r.from).slice(0,10), String(r.to).slice(0,10));
      };

      const relevant = (rows || []).filter(r => {
        const st = String(r.status || '').toLowerCase();
        return st === 'approved' || st === 'pending';
      });

      const approvedOnly = (rows || []).filter(r => String(r.status || '').toLowerCase() === 'approved');

      const monthlyUsedDays = relevant
        .filter(r => {
          const d = new Date(r.from);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + normalizeDuration(r), 0);
      setMonthlyLeavesTaken(monthlyUsedDays);

      const approvedYearlyDays = approvedOnly
        .filter(r => {
          const d = new Date(r.from);
          return d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + normalizeDuration(r), 0);

      let annualAllowance = 18;
      let annualRemaining = Math.max(0, annualAllowance - approvedYearlyDays);
      try {
        const bal = await getMyLeaveBalance(currentYear);
        if (bal && typeof bal.annualAllowance !== 'undefined') {
          annualAllowance = Number(bal.annualAllowance);
        }
        if (bal && typeof bal.remaining !== 'undefined') {
          annualRemaining = Number(bal.remaining);
        } else {
          annualRemaining = Math.max(0, annualAllowance - approvedYearlyDays);
        }
      } catch {
        annualRemaining = Math.max(0, annualAllowance - approvedYearlyDays);
      }
      setYearlyTotalLeaves(isNaN(annualAllowance) ? 18 : annualAllowance);
      setYearlyLeavesRemaining(isNaN(annualRemaining) ? Math.max(0, (isNaN(annualAllowance) ? 18 : annualAllowance) - approvedYearlyDays) : annualRemaining);
    } catch (e) {
      console.warn('Failed to compute monthly leaves', e);
      setMonthlyLeavesTaken(0);
      setYearlyTotalLeaves(18);
      setYearlyLeavesRemaining(18);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (start === end) return 1;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const submitLeaveRequest = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill in all required fields');
      return;
    }
    if (leaveForm.isHalfDay && leaveForm.startDate !== leaveForm.endDate) {
      alert('For half day, Start and End date must be the same.');
      return;
    }

    try {
      setSubmittingLeave(true);
      const payload = {
        from: new Date(leaveForm.startDate).toISOString(),
        to: new Date(leaveForm.endDate).toISOString(),
        type: leaveForm.isHalfDay ? 'half-day' : leaveForm.leaveType,
        reason: leaveForm.reason,
      };
      if (leaveForm.isHalfDay) {
        payload.duration = 0.5;
        payload.partOfDay = leaveForm.partOfDay || 'AM';
      }

      await createLeave(payload);
      alert('Leave request submitted successfully');
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '', isHalfDay: false, partOfDay: 'AM' });
      await loadLeaveHistory();
      await calculateMonthlyLeaves();
      setActiveSection('history');
    } catch (err) {
      alert(err?.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const pendingRequests = (leaveHistory || []).filter(r => (r.status === 'pending' || r.status === 'manager_pending' || r.status === 'admin_pending'));

  return (
    <div className="dashboard fade-in">
      <h2>🏖️ Leave History</h2>
      {/* <p>Review your leave history and track your leave balances.</p> */}

      {/* Leave Statistics */}
      <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
        <div className="dashboard-card stats-card" style={{ background: monthlyLeavesTaken >= MONTHLY_LEAVE_LIMIT ? '#f8d7da' : '#d4edda' }}>
          <h3 style={{ color: monthlyLeavesTaken >= MONTHLY_LEAVE_LIMIT ? '#721c24' : '#155724' }}>📅 Monthly Leaves</h3>
          <p style={{ color: monthlyLeavesTaken >= MONTHLY_LEAVE_LIMIT ? '#721c24' : '#155724' }}>
            {monthlyLeavesTaken} / {MONTHLY_LEAVE_LIMIT}
          </p>
          {monthlyLeavesTaken >= MONTHLY_LEAVE_LIMIT && (
            <small style={{ color: '#721c24', textAlign: 'center', marginTop: 10 }}>Limit reached - Team Lead approval required</small>
          )}
        </div>
        <div className="dashboard-card stats-card" style={{ background: '#fff3cd' }}>
          <h3 style={{ color: '#856404' }}>📋 Yearly Leaves</h3>
          <p style={{ color: '#856404' }}>
            {yearlyLeavesRemaining} / {yearlyTotalLeaves}
          </p>
        </div>
        <div className="dashboard-card stats-card" style={{ background: '#d1ecf1' }}>
          <h3 style={{ color: '#0c5460' }}>⏳ Pending</h3>
          <p style={{ color: '#0c5460' }}>
            {pendingRequests.filter(r => r.status === 'pending' || r.status === 'manager_pending').length}
          </p>
        </div>
      </div>

      <div className="dashboard-actions" style={{ marginBottom: 12 }}>
        <button
          className={activeSection === 'history' && !showLeaveModal ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveSection('history')}
          type="button"
        >
          Leave History
        </button>
        <button
          className={showLeaveModal ? 'btn-primary' : 'btn-outline'}
          onClick={() => setShowLeaveModal(true)}
          type="button"
        >
          Leave Request
        </button>
        <button
          className={activeSection === 'holidays' && !showLeaveModal ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveSection('holidays')}
          type="button"
        >
          Holidays
        </button>
      </div>

      {showLeaveModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal leave-modal" style={{ width: 'min(760px, 96%)' }}>
            <div className="leave-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0 }}>📝 Leave Request</h3>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowLeaveModal(false)}
                style={{ padding: '6px 10px' }}
              >
                Close
              </button>
            </div>

            <form onSubmit={submitLeaveRequest} style={{ marginTop: 14 }}>
              <div className="leave-modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div>
                  <label>Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    disabled={leaveForm.isHalfDay}
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLeaveForm(prev => ({
                        ...prev,
                        startDate: v,
                        endDate: prev.isHalfDay ? v : prev.endDate,
                      }));
                    }}
                    required
                  />
                </div>

                <div>
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    min={leaveForm.startDate || undefined}
                    disabled={leaveForm.isHalfDay}
                    required
                  />
                </div>

                <div>
                  <label>Half Day</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input
                      type="checkbox"
                      checked={leaveForm.isHalfDay}
                      onChange={(e) => {
                        const isHalf = e.target.checked;
                        setLeaveForm(prev => ({
                          ...prev,
                          isHalfDay: isHalf,
                          endDate: isHalf ? (prev.startDate || prev.endDate) : prev.endDate,
                        }));
                      }}
                    />
                    <span>Request 0.5 day</span>
                  </div>
                </div>

                {leaveForm.isHalfDay && (
                  <div>
                    <label>Part of Day</label>
                    <select
                      value={leaveForm.partOfDay}
                      onChange={(e) => setLeaveForm({ ...leaveForm, partOfDay: e.target.value })}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="leave-modal-reason" style={{ marginTop: 12 }}>
                <label>Reason *</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Please provide reason for leave..."
                  required
                />
              </div>

              <div className="leave-modal-actions" style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingLeave}>
                  {submittingLeave ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSection === 'history' && (
        <div className="dashboard-card">
          <h3>📚 Leave History</h3>
          {leaveHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>No leave history found.</p>
          ) : (
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Approved By</th>
                    <th>Approved Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory
                    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt))
                    .map(leave => (
                    <tr key={leave.id}>
                      <td>
                        <span className={`status-badge ${leave.leaveType.toLowerCase().replace(' ', '-')}`}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        {formatDMY(leave.startDate)} - {formatDMY(leave.endDate)}
                      </td>
                      <td><strong>{leave.days}</strong></td>
                      <td>
                        {(() => {
                          const st = String(leave.status || '').toLowerCase();
                          const badgeClass = st === 'approved' ? 'approved' : st === 'rejected' ? 'rejected' : 'pending';
                          const label = st ? (st.charAt(0).toUpperCase() + st.slice(1)) : 'Pending';
                          return <span className={`status-badge leave-status ${badgeClass}`}>{label}</span>;
                        })()}
                      </td>
                      <td>{leave.approvedBy || '-'}</td>
                      <td>{formatDMY(leave.approvedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSection === 'holidays' && (
        <div className="dashboard-card" style={{ background: '#eef2ff' }}>
          <h3 style={{ color: '#1e3a8a' }}>🎉 Holidays in {monthLabel}</h3>
          {monthHolidays.length > 0 ? (
            <div style={{ marginTop: 8, maxHeight: 260, overflowY: 'auto', paddingRight: 6 }}>
              {monthHolidays.map((h, i) => (
                <div
                  key={`${h.date}-${i}`}
                  style={{
                    padding: '8px 10px',
                    margin: '6px 0',
                    background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.14), rgba(239, 246, 255, 0.75))',
                    borderLeft: '5px solid #6366f1',
                    borderRadius: 10,
                    fontSize: 14,
                    color: '#1e3a8a'
                  }}
                >
                  <strong>{formatDMY(h.date)}</strong> – {h.name}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 8, color: '#1e3a8a' }}>No holidays this month.</p>
          )}
        </div>
      )}
    </div>
  );
}
