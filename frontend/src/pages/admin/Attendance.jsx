// src/pages/admin/Attendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { isHoliday } from "../../utils/holidays";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function AdminAttendance() {
  const { users, currentUser, logAttendance, getAttendanceByDate, getAttendanceForUser } = useAuth();
  // Primary controls
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]); // YYYY-MM-DD (daily actions)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7));   // YYYY-MM (overview)
  const [showDailyPreview, setShowDailyPreview] = useState(false);

  // Manual update form
  const [formEmail, setFormEmail] = useState("");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formStatus, setFormStatus] = useState("Present");
  const [formHours, setFormHours] = useState("09:00:00"); // HH:MM:SS

  // Loaded daily attendance records keyed by email
  const [attendanceData, setAttendanceData] = useState({});
  const [refreshTick, setRefreshTick] = useState(0);
  // Monthly overview (DB-backed)
  const [monthlyOverview, setMonthlyOverview] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Restrict view to Admin's own data only
  const subjects = useMemo(() => (currentUser ? [currentUser] : []), [currentUser]);
  // Ensure form picks admin email by default
  useEffect(() => {
    if (currentUser?.email) setFormEmail(currentUser.email);
  }, [currentUser]);

  // Weekly-off helpers retained for default status derivation
  const formatEmpId = (u) => {
    const raw = (u?.empId || (u?.email || '').split('@')[0] || '').toString().toUpperCase();
    // Trim UUID-like ids to first block for readability
    if (raw.includes('-')) return raw.split('-')[0];
    return raw;
  };
  const isDeveloperFor = (email) => {
    const u = users.find(u => (u.email || '').toLowerCase() === String(email || '').toLowerCase());
    const desig = String(u?.designation || '').toLowerCase();
    return desig === 'developer' || desig.includes('developer');
  };
  const isWeeklyOffFor = (email, dateObj) => {
    const dow = (dateObj instanceof Date ? dateObj : new Date(dateObj)).getDay();
    return isDeveloperFor(email) ? (dow === 0 || dow === 6) : (dow === 3);
  };

  // Load attendance for selected date from DB
  useEffect(() => {
    const load = async () => {
      try {
        const rows = await getAttendanceByDate(date);
        const byEmail = {};
        (rows || []).forEach(r => { byEmail[(r.email || '').toLowerCase()] = r; });

        const initialData = {};
        subjects.forEach((u) => {
          const key = (u.email || '').toLowerCase();
          const record = byEmail[key];

          // Determine default based on whether the selected date is past, today, or future
          const selected = new Date(date);
          const today = new Date();
          const toYMD = (d) => d.toISOString().slice(0,10);
          const isWeekOff = isWeeklyOffFor(u.email, selected);
          let status = record?.status || "Not Marked";
          let hours = (record?.hours ?? "8");

          if (!record) {
            if (isWeekOff) {
              status = "Week Off";
              hours = "0";
            } else if (toYMD(selected) < toYMD(today)) {
              status = "Absent";
              hours = "0";
            } else if (toYMD(selected) === toYMD(today)) {
              status = "Not Marked";
              hours = "0";
            }
          }

          initialData[u.email] = { status, hours };
        });
        setAttendanceData(initialData);
      } catch {
        // Fallback: mark all as Not Marked
        const initialData = {};
        filteredEmployees.forEach((u) => { initialData[u.email] = { status: 'Not Marked', hours: '0' }; });
        setAttendanceData(initialData);
      }
    };
    load();
  }, [users, date, subjects, refreshTick, getAttendanceByDate]);

  // Listen for broadcast updates from other pages (employee/TL/Admin)
  useEffect(() => {
    const onUpdate = () => setRefreshTick((x) => x + 1);
    window.addEventListener('erp-attendance-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('erp-attendance-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  // Helpers
  const toMinutes = (timeHHMM) => {
    if (!timeHHMM) return 0;
    const [h,m] = String(timeHHMM).split(":");
    return (parseInt(h||'0',10)*60) + (parseInt(m||'0',10));
  };
  const toHHMM = (mins) => {
    const h = Math.floor(Math.max(0, mins)/60);
    const m = Math.max(0, mins)%60;
    const pad = (n)=>String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}`;
  };
  // Convert HH:MM to decimal hours
  const parseHHMMToHours = (t) => {
    try {
      if (!t) return 0;
      const parts = String(t).split(":");
      const hh = Number(parts[0] || 0);
      const mm = Number(parts[1] || 0);
      const ss = Number(parts[2] || 0);
      return hh + mm/60 + ss/3600;
    } catch { return 0; }
  };

  // Badge helpers for colored pills
  const pillStyle = (bg, color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    background: bg,
    color,
    fontWeight: 600,
    minWidth: 36,
    textAlign: 'center'
  });
  const rateColors = (v) => {
    if (v >= 85) return ['#DCFCE7', '#065F46']; // green
    if (v >= 60) return ['#FEF3C7', '#92400E']; // yellow
    return ['#FEE2E2', '#B91C1C']; // red
  };

  // Load monthly overview for Admin from DB
  useEffect(() => {
    const loadMonthly = async () => {
      if (!currentUser?.email) { setMonthlyOverview([]); return; }
      setLoadingMonthly(true);
      try {
        const rows = await getAttendanceForUser(currentUser.email);
        const yyyymm = String(month).slice(0,7);
        const inMonth = (Array.isArray(rows) ? rows : []).filter(r => String(r.date || '').startsWith(yyyymm));
        const present = inMonth.filter(r => String(r.status).toLowerCase() === 'present');
        const absent = inMonth.filter(r => String(r.status).toLowerCase() === 'absent');
        const leave = inMonth.filter(r => String(r.status).toLowerCase() === 'leave');
        const totalMins = present.reduce((sum,r)=> sum + toMinutes(r.hours), 0);

        // Working days for the month: exclude weekly off (per designation) and holidays, respect DOJ if present
        const d0 = new Date(yyyymm + '-01');
        const d1 = new Date(d0.getFullYear(), d0.getMonth() + 1, 0);
        const doj = currentUser?.dateOfJoining ? new Date(currentUser.dateOfJoining) : null;
        let workingDays = 0;
        for (let d = new Date(d0); d <= d1; d.setDate(d.getDate() + 1)) {
          const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          if (doj && d < new Date(doj.getFullYear(), doj.getMonth(), doj.getDate())) continue;
          if (isWeeklyOffFor(currentUser.email, d)) continue;
          if (isHoliday(ymd)) continue;
          workingDays++;
        }

        const avgMins = present.length > 0 ? Math.round(totalMins / present.length) : 0;
        const overviewRow = [{
          email: currentUser.email,
          empId: formatEmpId(currentUser),
          name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || currentUser.email,
          department: currentUser.department || '-',
          present: present.length,
          absent: absent.length,
          leave: leave.length,
          hours: toHHMM(totalMins),
          workingDays,
          attendanceRate: workingDays ? Math.round((present.length / workingDays) * 100) : 0,
          avgPerDay: toHHMM(avgMins),
        }];
        setMonthlyOverview(overviewRow);
      } catch {
        setMonthlyOverview([]);
      } finally {
        setLoadingMonthly(false);
      }
    };
    loadMonthly();
  }, [currentUser?.email, month, refreshTick, getAttendanceForUser]);

  const toYMD = (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return x.toISOString().slice(0,10);
  };

  const handleChange = (email, field, value) => {
    setAttendanceData((prev) => {
      const current = prev[email] || {};
      let next = { ...current, [field]: value };
      // Auto-adjust hours on status changes for consistency
      if (field === 'status') {
        const v = String(value);
        if (v === 'Present') {
          const h = Number(next.hours || 0);
          if (isNaN(h) || h < 9) next.hours = '9';
        } else if (v === 'Absent' || v === 'Leave' || v === 'Week Off') {
          next.hours = '0';
        }
      }
      return {
        ...prev,
        [email]: next,
      };
    });
  };

  const handleSave = async (email) => {
    const entry = attendanceData[email];
    if (!entry) return;

    // Prevent saving on weekly off per employee
    if (isWeeklyOffFor(email, new Date(date))) return;

    // Past dates only, except Leave
    const isPast = toYMD(date) < toYMD(new Date());
    if (!isPast && String(entry.status) !== 'Leave') {
      alert('You can update attendance only for past dates (except Leave).');
      return;
    }

    await logAttendance({
      email,
      date: date, // send YYYY-MM-DD to avoid timezone shifts
      status: entry.status,
      hours: entry.hours,
    });
  };

  // Save All Button
  const handleSaveAll = async () => {
    // Prevent saving on weekly off per employee (skip those users)
    const day = new Date(date);
    const isPast = toYMD(date) < toYMD(new Date());
    for (const email of Object.keys(attendanceData)) {
      if (isWeeklyOffFor(email, day)) continue;
      const entry = attendanceData[email];
      if (entry && (isPast || String(entry.status) === 'Leave')) {
        await logAttendance({
          email,
          date: date, // send YYYY-MM-DD
          status: entry.status,
          hours: entry.hours,
        });
      }
    }
    alert(" Attendance saved for all employees");
  };

  // Manual submit
  const handleManualSave = async () => {
    // Mirror Team Lead manual update behavior
    if (!formEmail) { alert('Please select an EMP ID'); return; }
    if (!formDate) { alert('Please select a date'); return; }
    // Weekly off restriction
    if (isWeeklyOffFor(formEmail, new Date(formDate))) {
      alert(isDeveloperFor(formEmail) ? 'Saturday/Sunday are weekly off for Developers.' : 'Wednesday is a weekly off.');
      return;
    }
    // Past dates only (except Leave)
    const toYMD = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10));
    const isPast = toYMD(formDate) < toYMD(new Date());
    if (!isPast && String(formStatus) !== 'Leave') {
      alert('You can update attendance only for past dates (except Leave).');
      return;
    }
    // Normalize hours similar to TL
    let hrs = parseHHMMToHours(formHours);
    if (formStatus === 'Present' && hrs < 9) hrs = 9;
    if (formStatus === 'Absent' || formStatus === 'Leave') hrs = 0;
    await logAttendance({ email: formEmail, date: formDate, status: formStatus, hours: hrs });
    alert(`Saved ${formStatus} for ${formDate}`);
    setRefreshTick(x=>x+1);
  };

  const handleManualReset = () => {
    setFormEmail("");
    setFormDate(date);
    setFormStatus("Present");
    setFormHours("09:00:00");
  };

  // Removed quick action buttons for a cleaner overview

  // Hard guard: render only for admins even if the route is accessed directly
  if ((currentUser?.role || '').toLowerCase() !== 'admin') {
    return (
      <div className="dashboard fade-in" style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <p>This page is restricted to Admins.</p>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <h2>Admin Attendance</h2>
      <p>Update daily attendance and view monthly overview.</p>

      {/* Filters - styled exactly like TeamLead */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Select Date (for daily actions):</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setFormDate(e.target.value); }}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Select Month (for overview):</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Day-wise Preview</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={showDailyPreview} onChange={(e)=>setShowDailyPreview(e.target.checked)} />
            <span>Show Selected Date Table</span>
          </label>
        </div>
      </div>

      {/* Manual Attendance Update */}
      {/* Manual Update Panel - same layout as TeamLead */}
      <div className="dashboard-card" style={{ padding: 16, marginBottom: 16, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Manual Attendance Update</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ fontWeight: 600 }}>Select EMP ID</label>
            <select
              value={formEmail}
              onChange={(e)=>setFormEmail(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            >
              {subjects.map(u => (
                <option key={u.email} value={u.email}>{formatEmpId(u)}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 200 }}>
            <label style={{ fontWeight: 600 }}>Date</label>
            <input type="date" value={formDate} onChange={(e)=>setFormDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '90%' }} />
          </div>
          <div style={{ minWidth: 200 }}>
            <label style={{ fontWeight: 600 }}>Status</label>
            <select value={formStatus} onChange={(e)=>setFormStatus(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          <div style={{ minWidth: 200 }}>
            <label style={{ fontWeight: 600 }}>Hours Worked</label>
            <input
              type="time"
              step="1"
              value={formHours}
              onChange={(e)=>setFormHours(e.target.value)}
              disabled={formStatus !== 'Present'}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '90%' }}
            />
            {/* <small style={{ color: '#6b7280' }}>HH:MM:SS (24h)</small> */}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', gridColumn: '1 / -1', marginTop: 8 }}>
            <button className="btn-primary" onClick={handleManualSave} style={{ minWidth: 96 }}>Save</button>
            <button className="btn" onClick={handleManualReset} style={{ border: '1px solid #d1d5db', minWidth: 96 }}>Reset</button>
          </div>
        </div>
      </div>

      {/* Day-wise Preview table */}
      {showDailyPreview && (
        <div className="dashboard-card" style={{ marginBottom: 16, borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Selected Date: {date}</h3>
          <div className="table-wrapper">
            <table className="user-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>Emp ID</th>
                  <th style={{ width: '24%' }}>Emp Name</th>
                  <th style={{ width: '14%' }}>Status</th>
                  <th style={{ width: '14%' }}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(u => {
                  const rec = attendanceData[u.email] || { status: 'Not Marked', hours: '0' };
                  const empId = formatEmpId(u);
                  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email;
                  return (
                    <tr key={`day-${u.email}`} style={{ borderBottom: '#e5e7eb 1px solid' }}>
                      <td style={{ padding: '8px 10px' }}>{empId}</td>
                      <td style={{ padding: '8px 10px' }}>{name}</td>
                      <td style={{ padding: '8px 10px' }}>{rec.status}</td>
                      <td style={{ padding: '8px 10px' }}>{typeof rec.hours === 'number' ? `${rec.hours}:00` : (rec.hours || '0')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Attendance Overview table (hidden before DOJ) */}
      {(() => {
        const dojStr = currentUser?.dateOfJoining || '';
        const doj = dojStr ? new Date(dojStr) : null;
        const dojYM = doj ? doj.toISOString().slice(0,7) : null;
        const isBeforeDOJ = dojYM ? (String(month).slice(0,7) < dojYM) : false;
        if (isBeforeDOJ) {
          return (
            <div className="dashboard-card" style={{ marginBottom: 16, borderRadius: 10, padding: 16, background: '#f8fafc' }}>
              <h3 style={{ marginTop: 0 }}>📅 Attendance Overview — {new Date(month+"-01").toLocaleString(undefined,{ month:'long', year:'numeric'})}</h3>
              <p style={{ margin: 0, color: '#334155' }}>Attendance details are not available before your Date of Joining ({dojYM}).</p>
            </div>
          );
        }
        return (
          <div className="dashboard-card" style={{ marginBottom: 16, borderRadius: 10 }}>
            <h3 style={{ marginTop: 0, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>📅 Attendance Overview — {new Date(month+"-01").toLocaleString(undefined,{ month:'long', year:'numeric'})}</h3>
            <div className="table-wrapper">
              <table className="user-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#eef2ff' }}>
                    <th style={{ width: '20%' }}>Employee</th>
                    <th style={{ width: '14%' }}>Department</th>
                    <th style={{ width: '10%' }}>Working Days</th>
                    <th style={{ width: '10%' }}>Present Days</th>
                    <th style={{ width: '10%' }}>Leave Days</th>
                    <th style={{ width: '10%' }}>Absent Days</th>
                    <th style={{ width: '10%' }}>Attendance Rate</th>
                    <th style={{ width: '10%' }}>Avg Time/Day</th>
                    <th style={{ width: '12%' }}>{date} Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyOverview.map(r => {
                    const dayRec = attendanceData[currentUser?.email || ''] || { status: 'Not Marked', hours: '0' };
                    return (
                      <tr key={`mon-${r.email}`} style={{ borderBottom: '#e5e7eb 1px solid' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{r.empId}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{r.department}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{r.workingDays}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={pillStyle('#DCFCE7', '#065F46')}>{r.present}</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={pillStyle('#FEF3C7', '#92400E')}>{r.leave}</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={pillStyle('#FEE2E2', '#B91C1C')}>{r.absent}</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {(() => { const [bg, fg] = rateColors(r.attendanceRate || 0); return (
                            <span style={pillStyle(bg, fg)}>{r.attendanceRate}%</span>
                          ); })()}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', textAlign: 'center' }}>{r.avgPerDay}</td>
                        <td style={{ padding: '10px 12px' }}>{dayRec.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Removed Live Presence section as requested */}
    </div>
  );
}
