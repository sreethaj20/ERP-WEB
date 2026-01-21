import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { formatDMY } from "../../utils/date";
import { getHolidaysForMonth } from "../../utils/holidays";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function AdminLeaveHistory() {
  const { currentUser, getMyLeaves, getMyLeaveBalance } = useAuth();
  const location = useLocation();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [monthlyLeavesTaken, setMonthlyLeavesTaken] = useState(0);
  const [yearlyTotalLeaves, setYearlyTotalLeaves] = useState(18);
  const [yearlyLeavesRemaining, setYearlyLeavesRemaining] = useState(18);
  const [activeSection, setActiveSection] = useState("history");

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
          className={activeSection === 'history' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveSection('history')}
          type="button"
        >
          Leave History
        </button>
        <button
          className={activeSection === 'holidays' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveSection('holidays')}
          type="button"
        >
          Holidays
        </button>
      </div>

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
