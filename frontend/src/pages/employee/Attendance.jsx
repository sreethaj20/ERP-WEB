// src/pages/employee/Attendance.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import AttendanceCircle from "../../components/AttendanceCircle";
import { getHolidaysForMonth } from "../../utils/holidays";

export default function EmployeeAttendance() {
  const { currentUser, logAttendance, getUserMetrics, getAttendanceForUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Present");
  const [hours, setHours] = useState("8");
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Helper: get DOJ date (Date object) for the current user
  const getDOJ = () => {
    const dojStr = currentUser?.dateOfJoining || (JSON.parse(localStorage.getItem("erpUsers") || "[]").find(u => (u.email||'').toLowerCase() === (currentUser?.email||'').toLowerCase())?.dateOfJoining) || "";
    if (!dojStr) return null;
    const d = new Date(dojStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const toYMD = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10));

  // Helper: is developer based on designation
  const isDeveloper = () => String(currentUser?.designation || '').toLowerCase().includes('developer');

  // Helper: check if a given date (Date) is weekly off for current user
  const isWeeklyOff = (dateObj) => {
    const dow = dateObj.getDay(); // 0 Sun .. 6 Sat
    return isDeveloper() ? (dow === 0 || dow === 6) : (dow === 3);
  };

  // Helper: count working days excluding weekly off and company holidays
  const countWorkingDaysExcludingWeekOff = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const monthHolidays = getHolidaysForMonth(year, monthIndex).map(h => h.date);
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d);
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const weekOff = isWeeklyOff(date);
      const isHoliday = monthHolidays.includes(dateStr);
      if (!weekOff && !isHoliday) count++;
    }
    return count;
  };

  // Helper: working days for a month considering DOJ (excludes days before joining)
  const workingDaysConsideringDOJ = (year, monthIndex) => {
    const doj = getDOJ();
    const base = countWorkingDaysExcludingWeekOff(year, monthIndex);
    if (!doj) return base;
    const dojY = doj.getFullYear();
    const dojM = doj.getMonth();
    if (dojY > year || (dojY === year && dojM > monthIndex)) {
      return 0; // DOJ after this month
    }
    if (dojY === year && dojM === monthIndex) {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const monthHolidays = getHolidaysForMonth(year, monthIndex).map(h => h.date);
      let count = 0;
      for (let d = doj.getDate(); d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const weekOff = isWeeklyOff(date);
        const isHoliday = monthHolidays.includes(dateStr);
        if (!weekOff && !isHoliday) count++;
      }
      return count;
    }
    return base;
  };

  // Helper: get status for a given date string (YYYY-MM-DD)
  const getStatusForDate = (dateStr) => {
    const rec = records.find(r => r.date?.slice(0,10) === dateStr);
    if (rec?.status) return rec.status;
    // If before DOJ, do not count as anything (Not Marked)
    const doj = getDOJ();
    if (doj && dateStr < toYMD(doj)) return 'Not Marked';
    // If no record and it's a weekly off day, treat as Week Off for display
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayDate = new Date(y, (m || 1) - 1, d || 1);
    if (isWeeklyOff(dayDate)) return 'Week Off';
    return "Not Marked";
  };

  // Helper: current week range (Mon-Sun) considering Sunday as weekly off
  const getCurrentWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = (day === 0 ? -6 : 1) - day; // If Sunday, go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const toYMD = (d) => d.toISOString().slice(0,10);
    return { start: toYMD(monday), end: toYMD(sunday), monday, sunday };
  };

  // Load attendance from DB for signed-in employee
  useEffect(() => {
    const load = async () => {
      try {
        if (!currentUser?.email) { setRecords([]); setSummary(null); return; }
        const rows = await getAttendanceForUser(currentUser.email);
        setRecords(Array.isArray(rows) ? rows : []);
        setSummary(getUserMetrics(currentUser.email));
      } catch {
        setRecords([]);
        setSummary(null);
      }
    };
    load();
  }, [currentUser, getUserMetrics, getAttendanceForUser]);

  // Refetch on cross-page attendance updates
  useEffect(() => {
    const onUpdate = async () => {
      try {
        if (!currentUser?.email) return;
        const rows = await getAttendanceForUser(currentUser.email);
        setRecords(Array.isArray(rows) ? rows : []);
      } catch {}
    };
    window.addEventListener('erp-attendance-updated', onUpdate);
    return () => window.removeEventListener('erp-attendance-updated', onUpdate);
  }, [currentUser, getAttendanceForUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser?.email) return;
    // Prevent marking on weekly off per designation
    if (isWeeklyOff(new Date())) {
      alert(isDeveloper() ? "Saturday/Sunday are weekly off for Developers. Attendance cannot be marked on this day." : "Wednesday is a weekly off. Attendance cannot be marked on this day.");
      return;
    }

    const toYMD = (d) => {
      const dt = d instanceof Date ? d : new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    };
    logAttendance({
      email: currentUser.email,
      date: toYMD(new Date()),
      status,
      hours,
    });

    // Broadcast to other open pages (admin/team lead) to refresh
    try { window.dispatchEvent(new Event('erp-attendance-updated')); } catch {}

    // Reset form fields
    setStatus("Present");
    setHours("8");

    // DB-backed views will refetch via the emitted event; summary can be recomputed lazily if needed
  };

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    if (!records.length) return {};
    return records.reduce((acc, record) => {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
      if (!acc[key]) {
        acc[key] = { total: 0, present: 0, absent: 0, leave: 0, hours: 0 };
      }
      acc[key].total++;
      acc[key].hours += Number(record.hours) || 0;
      if (record.status === "Present") acc[key].present++;
      if (record.status === "Absent") acc[key].absent++;
      if (record.status === "Leave") acc[key].leave++;
      return acc;
    }, {});
  }, [records]);

  // Get current month's data (working days adjusted by DOJ)
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7);
    const workingDays = workingDaysConsideringDOJ(now.getFullYear(), now.getMonth());
    const m = monthlySummary[monthKey] || { present: 0, absent: 0, leave: 0, hours: 0 };
    return { ...m, total: workingDays };
  }, [monthlySummary]);

  // Weekly hours for current week
  const weeklyHours = useMemo(() => {
    if (!records.length) return { totalHours: 0, start: '', end: '' };
    const { start, end } = getCurrentWeekRange();
    const inWeek = records.filter(r => {
      const d = r.date?.slice(0,10);
      return d >= start && d <= end;
    });
    const rawHours = inWeek.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const presentDays = inWeek.filter(r => r.status === 'Present').length;
    // Deduct 1 hour per present day for lunch
    const totalHours = Math.max(0, rawHours - presentDays * 1);
    return { totalHours, start, end };
  }, [records]);

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>📅 My Attendance</h2>
          {/* <p>Track your daily attendance and working hours.</p> */}
        </div>
        <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
          ← Back to Home
        </button>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <h3>📊 This Month's Attendance</h3>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <AttendanceCircle 
            presentDays={currentMonthData.present} 
            totalDays={currentMonthData.total || 22}
            size={180}
            strokeWidth={16}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div className="attendance-metric">
            <div className="metric-value" style={{ color: '#10B981' }}>{currentMonthData.present || 0}</div>
            <div className="metric-label">Present Days</div>
          </div>
          <div className="attendance-metric">
            <div className="metric-value" style={{ color: '#EF4444' }}>{currentMonthData.absent || 0}</div>
            <div className="metric-label">Absent Days</div>
          </div>
          <div className="attendance-metric">
            <div className="metric-value" style={{ color: '#F59E0B' }}>{currentMonthData.leave || 0}</div>
            <div className="metric-label">Leave Days</div>
          </div>
          <div className="attendance-metric">
            <div className="metric-value">{currentMonthData.hours || 0}</div>
            <div className="metric-label">Total Hours (Month)</div>
          </div>
        </div>
      </div>

      {/* Weekly Hours Widget */}
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <h3>🕒 This Week's Hours</h3>
        <p>Week: {weeklyHours.start} to {weeklyHours.end}</p>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{weeklyHours.totalHours} hours</div>
      </div>

      {/* Month selector */}
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <h3>📆 View Attendance by Month</h3>
        <div style={{ margin: '15px 0' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        {(() => {
          const doj = getDOJ();
          const dojYM = doj ? toYMD(doj).slice(0,7) : null;
          const isBeforeDOJ = dojYM ? (selectedMonth < dojYM) : false;
          if (isBeforeDOJ) {
            return (
              <div className="dashboard-card" style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ margin: 0, color: '#334155' }}>
                  Attendance not available before your Date of Joining ({dojYM}).
                </p>
              </div>
            );
          }
          return monthlySummary[selectedMonth] ? (
          <div className="monthly-summary">
            <h4>{new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
            {/* Calendar for the selected month */}
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              {(() => {
                const year = Number(selectedMonth.split('-')[0]);
                const monthIdx = Number(selectedMonth.split('-')[1]) - 1;
                const firstDay = new Date(year, monthIdx, 1);
                const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
                const startWeekday = firstDay.getDay(); // 0 Sun ... 6 Sat
                const weeks = [];
                let dayCounter = 1;
                while (dayCounter <= daysInMonth) {
                  const week = [];
                  for (let wd = 0; wd < 7; wd++) {
                    if (weeks.length === 0 && wd < startWeekday) {
                      week.push(null);
                    } else if (dayCounter <= daysInMonth) {
                      week.push(dayCounter++);
                    } else {
                      week.push(null);
                    }
                  }
                  weeks.push(week);
                }
                const cellStyle = {
                  width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #eee', fontSize: 12
                };
                const getBg = (d) => {
                  if (!d) return 'transparent';
                  const ds = `${selectedMonth}-${String(d).padStart(2,'0')}`;
                  const status = getStatusForDate(ds);
                  // Force weekly off to be red regardless of lack of record
                  const [yy, mm, dd] = ds.split('-').map(Number);
                  const dDate = new Date(yy, (mm || 1) - 1, dd || 1);
                  const doj = getDOJ();
                  if (doj && ds < toYMD(doj)) return 'transparent';
                  if (isWeeklyOff(dDate)) return '#FEE2E2';
                  if (status === 'Present') return '#D1FAE5'; // light green
                  if (status === 'Leave') return '#FEF3C7'; // light yellow
                  if (status === 'Absent') return '#FEE2E2'; // light red
                  if (status === 'Week Off') return '#FEE2E2'; // light red for weekly off
                  return 'transparent';
                };
                return (
                  <table className="user-table attendance-calendar" style={{ minWidth: 320 }}>
                    <thead>
                      <tr>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => (
                          <th key={h} style={{ textAlign: 'center' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((w,i) => (
                        <tr key={i}>
                          {w.map((d, j) => (
                            <td key={j} style={{ textAlign: 'center' }}>
                              <div 
                                style={{ ...cellStyle, background: getBg(d) }} 
                                title={d ? `${d} ${new Date(year, monthIdx, d).toLocaleDateString('en-US', { month: 'short' })} ${year}` : ''}
                              >
                                {d || ''}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                  <th>Working Days</th>
                  <th>Total Hours</th>
                  <th>Avg Hours/Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{monthlySummary[selectedMonth].present}</td>
                  <td>{monthlySummary[selectedMonth].absent}</td>
                  <td>{monthlySummary[selectedMonth].leave}</td>
                  <td>{(() => { const [y,m]=selectedMonth.split('-').map(Number); return workingDaysConsideringDOJ(y, m-1); })()}</td>
                  <td>{monthlySummary[selectedMonth].hours}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ) : (
            <p>No attendance data available for the selected month.</p>
          );
        })()}
      </div>
    </div>
  );
}
