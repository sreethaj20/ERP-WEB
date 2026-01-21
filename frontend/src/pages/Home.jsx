// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import { getHolidaysForMonth } from "../utils/holidays";
import { getEffectiveRole } from "../utils/dashboardPath";

export default function Home() {
  const { currentUser, users, getAttendanceForUser, getMyLeaves, getMyLeaveBalance, listUpdates } = useAuth();
  const navigate = useNavigate();

  // Only redirect if user is not authenticated (show login/signup page)
  // Authenticated users can access the home page directly

  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]); // [{startDate,endDate,days}]
  const [savedUpdates, setSavedUpdates] = useState([]);

  // 🎉 Holidays are sourced from centralized registry in utils/holidays

  // ✅ Helpers
  const getDOJ = () => {
    try {
      const u = (users || []).find(u => (u.email || '').toLowerCase() === (currentUser?.email || '').toLowerCase());
      const v = u?.dateOfJoining;
      if (!v) return null;
      const s = String(v);
      // If already a plain YYYY-MM-DD, construct a LOCAL date to avoid UTC shift
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [yy, mm, dd] = s.split('-').map(Number);
        return new Date(yy, (mm || 1) - 1, dd || 1);
      }
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  };

  // Weekly off per current user: Developers => Sat/Sun; Others => Wednesday
  const isDeveloper = () => String(currentUser?.designation || '').toLowerCase().includes('developer');
  const isWeeklyOff = (dateObj) => {
    const dow = (dateObj instanceof Date ? dateObj : new Date(dateObj)).getDay();
    return isDeveloper() ? (dow === 0 || dow === 6) : (dow === 3);
  };

  // ✅ Working days in month (exclude weekly off per designation, exclude company holidays, respect DOJ)
  const getWorkingDays = (year, month) => {
    let count = 0;
    const monthHolidays = getHolidaysForMonth(year, month).map(h => h.date);
    const d = new Date(year, month, 1);
    const doj = getDOJ();
    while (d.getMonth() === month) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const weekOff = isWeeklyOff(d);
      const isHoliday = monthHolidays.includes(dateStr);
      const beforeDOJ = doj ? d < new Date(doj.getFullYear(), doj.getMonth(), doj.getDate()) : false;
      if (!weekOff && !isHoliday && !beforeDOJ) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  };

  // Helper: get current week range Mon–Sun and a stable week key (Monday's YYYY-MM-DD)
  const getWeekRange = (date) => {
    const today = new Date(date);
    const dow = today.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = (dow === 0 ? -6 : 1) - dow; // If Sunday, go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: monday, end: sunday, key: toYMD(monday) };
  };

  // Helper function to get working days in current week (exclude weekly off per designation, holidays, respect DOJ)
  // Counts the full Mon–Sun window, not just days up to today
  const getWorkingDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    // Set to Monday of the current week; fix Sunday handling
    const dow = date.getDay(); // 0 Sun .. 6 Sat
    const diffToMonday = (dow === 0 ? -6 : 1) - dow; // if Sunday, go back 6 days
    startOfWeek.setDate(date.getDate() + diffToMonday);
    let workingDays = 0;
    const doj = getDOJ();
    for (let i = 0; i < 7; i++) { // Full week
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const monthHolidays = getHolidaysForMonth(day.getFullYear(), day.getMonth()).map(h => h.date);
      const weekOff = isWeeklyOff(day);
      const isHoliday = monthHolidays.includes(dateStr);
      const beforeDOJ = doj ? day < new Date(doj.getFullYear(), doj.getMonth(), doj.getDate()) : false;
      if (!weekOff && !isHoliday && !beforeDOJ) workingDays++;
    }
    return workingDays;
  };

  // ✅ Initialize tracker - User specific and dynamic
  const recomputeFromSource = async () => {
    if (!currentUser?.email) return;

    const today = new Date();
    const monthKey = today.getMonth() + 1;
    const year = today.getFullYear();
    const { start: weekStart, end: weekEnd, key: weekKey } = getWeekRange(today);
    // Always fetch from DB; do not rely on localStorage or users[*].attendance
    let fetched = [];
    try {
      const serverRows = await getAttendanceForUser(currentUser.email);
      if (Array.isArray(serverRows)) fetched = serverRows;
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) {
        fetched = [];
      } else {
        fetched = [];
      }
    }
    // Avoid triggering renders if nothing changed
    const same = (() => {
      if (!Array.isArray(attendanceRecords) || attendanceRecords.length !== fetched.length) return false;
      for (let i = 0; i < fetched.length; i++) {
        const a = fetched[i] || {};
        const b = attendanceRecords[i] || {};
        if (
          ((a.id || a.date) !== (b.id || b.date)) ||
          (String(a.status || '') !== String(b.status || '')) ||
          (Number(a.hours || 0) !== Number(b.hours || 0))
        ) return false;
      }
      return true;
    })();
    if (!same) setAttendanceRecords(fetched);

    // Calculate actual attendance metrics from ERP data
    // Treat stored dates as local YYYY-MM-DD strings to avoid UTC shift
    const ymd = (val) => (typeof val === 'string' && val.length >= 10) ? val.slice(0,10) : `${new Date(val).getFullYear()}-${String(new Date(val).getMonth()+1).padStart(2,'0')}-${String(new Date(val).getDate()).padStart(2,'0')}`;
    const monthKeyNow = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
    const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth()+1).padStart(2,'0')}-${String(weekEnd.getDate()).padStart(2,'0')}`;

    const currentMonthRecords = fetched.filter(record => {
      const d = ymd(record.date).slice(0,7);
      return d === monthKeyNow;
    });

    const currentWeekRecords = fetched.filter(record => {
      const d = ymd(record.date);
      return d >= weekStartStr && d <= weekEndStr;
    });

    const actualDaysWorked = currentMonthRecords.filter(r => r.status === "Present").length;
    const actualWeeklyDaysWorked = currentWeekRecords.filter(r => r.status === "Present").length;
    // Sum raw hours then subtract 1 hour per present day for lunch deduction
    // IMPORTANT: treat 0 as valid (Leave/Absent). Only default to 8 when hours is null/undefined.
    const rawMonthlyHours = currentMonthRecords.reduce((sum, r) => {
      const h = (r.hours != null) ? Number(r.hours) : 8;
      return sum + (isNaN(h) ? 8 : h);
    }, 0);
    const actualHoursWorked = Math.max(0, rawMonthlyHours - actualDaysWorked * 1);

    // Fetch approved leaves from backend and compute monthly/yearly
    let myLeaves = [];
    try { myLeaves = await getMyLeaves(); } catch { myLeaves = []; }
    const approvedOnly = (Array.isArray(myLeaves) ? myLeaves : []).filter(l => String(l.status || '').toLowerCase() === 'approved');
    const daysOf = (l) => (l && l.duration != null)
      ? Math.max(0.5, Number(l.duration))
      : Math.max(1, Math.ceil((new Date(String(l.to||'').slice(0,10)) - new Date(String(l.from||'').slice(0,10))) / (1000*60*60*24)) + 1);
    // Save ranges for calendar tiles
    setApprovedLeaves(approvedOnly.map(l => ({
      startDate: String(l.from || '').slice(0,10),
      endDate: String(l.to || '').slice(0,10),
      days: Math.max(1, Math.ceil((new Date(String(l.to||'').slice(0,10)) - new Date(String(l.from||'').slice(0,10))) / (1000*60*60*24)) + 1)
    })));

    const approvedMonthlyDays = approvedOnly
      .filter(l => {
        const d = new Date(String(l.from || '').slice(0,10));
        return d.getMonth() === today.getMonth() && d.getFullYear() === year;
      })
      .reduce((sum, l) => sum + daysOf(l), 0);

    const approvedYearlyDays = approvedOnly
      .filter(l => new Date(String(l.from || '').slice(0,10)).getFullYear() === year)
      .reduce((sum, l) => sum + daysOf(l), 0);

    // Keep history for visual marking from Home quick leaves if needed
    const homeLeaves = JSON.parse(localStorage.getItem(`erpHomeLeaves_${currentUser.email}`) || "[]");
    const currentMonthHomeLeaves = homeLeaves.filter(leave => {
      const leaveDate = new Date(leave.date);
      return leaveDate.getMonth() === today.getMonth() && leaveDate.getFullYear() === year;
    });
    // Fetch annual balance from server (leave_balances)
    let annualAllowance = 18;
    let annualRemaining = 18 - approvedYearlyDays;
    try {
      const bal = await getMyLeaveBalance(year);
      if (bal && typeof bal.remaining !== 'undefined') {
        annualRemaining = Number(bal.remaining);
        if (typeof bal.annualAllowance !== 'undefined') annualAllowance = Number(bal.annualAllowance);
      }
    } catch {}

    const newSummary = {
      year,
      month: monthKey,
      weekKey,
      workingDays: getWorkingDays(year, today.getMonth()),
      daysWorked: actualDaysWorked,
      weeklyWorkingDays: getWorkingDaysInWeek(today),
      weeklyDaysWorked: actualWeeklyDaysWorked,
      hoursWorked: actualHoursWorked,
      targetHoursPerMonth: getWorkingDays(year, today.getMonth()) * 8,
      leavesPerMonth: 1.5,
      totalLeavesYearly: annualAllowance,
      leavesTakenMonth: approvedMonthlyDays,
      leavesTakenYearly: approvedYearlyDays,
      remainingMonthlyLeaves: Math.max(0, 1.5 - approvedMonthlyDays),
      remainingYearlyLeaves: annualRemaining,
      history: currentMonthHomeLeaves,
    };

    setAttendance(newSummary);
  };

  // (Rolled back) No backend fetch here; rely on local users[*].attendance

  // Recompute when inputs change (avoid depending on attendanceRecords to prevent loops)
  useEffect(() => {
    recomputeFromSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, users]);

  // Also recompute when month changes via calendar navigation
  useEffect(() => {
    if (!currentUser?.email) return;
    recomputeFromSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Recompute immediately when attendance/leaves are updated elsewhere (admin/employee pages)
  useEffect(() => {
    const onUpdate = () => recomputeFromSource();
    const onLeavesUpdate = () => recomputeFromSource();
    window.addEventListener('erp-attendance-updated', onUpdate);
    window.addEventListener('erp-leaves-updated', onLeavesUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('erp-attendance-updated', onUpdate);
      window.removeEventListener('erp-leaves-updated', onLeavesUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [currentUser]);

  // ✅ Sync holidays with month
  useEffect(() => {
    const base = activeStartDate instanceof Date ? activeStartDate : date;
    const monthKey = `${base.getFullYear()}-${String(
      base.getMonth() + 1
    ).padStart(2, "0")}`;
    setHolidays(getHolidaysForMonth(base.getFullYear(), base.getMonth()));
  }, [activeStartDate, date]);

  useEffect(() => {
    let alive = true;
    const fetchUpdates = async () => {
      try {
        if (!currentUser) { setSavedUpdates([]); return; }
        const rows = await listUpdates();
        if (!alive) return;
        setSavedUpdates(Array.isArray(rows) ? rows : []);
      } catch {
        if (!alive) return;
        setSavedUpdates([]);
      }
    };
    fetchUpdates();
    const t = setInterval(fetchUpdates, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [currentUser, listUpdates]);

  // ✅ Calendar styling
// Helper function for local YYYY-MM-DD format
const formatDate = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

// ✅ Tile class logic - Weekly off per designation (red)
const getTileClassName = ({ date: day, view }) => {
  if (view === "month") {
    const dateStr = formatDate(day);        // Local date string
    const selectedStr = formatDate(date);   // Selected date string
    const todayStr = formatDate(new Date()); // Today's date string
    const weekOff = isWeeklyOff(day);
    
    // Priority 1 → Today's date (always show circle)
    if (dateStr === todayStr) return "today-tile";

    // Priority 2 → Selected date
    if (dateStr === selectedStr) return "selected-tile";

    // Priority 3 → Weekly off
    if (weekOff) return "wednesday-off-tile";

    // Priority 4 → Holiday
    if (holidays.some((h) => h.date === dateStr)) return "holiday-tile";

    // Priority 5 → Approved leaves from server (approvedLeaves state)
    const isApprovedLeave = approvedLeaves.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const currentDate = new Date(dateStr);
      return currentDate >= startDate && currentDate <= endDate;
    });

    if (isApprovedLeave) {
      return "approved-leave-tile";
    }

    // Priority 6 → Home page leave history
    if (attendance?.history?.some((a) => a.date === dateStr)) {
      return "leave-tile";
    }

    // Priority 7 → Present attendance (green) — normalize record date to local
    const isPresent = attendanceRecords.some(r => {
      if (!r?.date) return false;
      const localRec = (typeof r.date === 'string' && r.date.length >= 10) ? r.date.slice(0,10) : formatDate(new Date(r.date));
      return localRec === dateStr && r.status === 'Present';
    });
    if (isPresent) return "present-tile";

    // Priority 8 → Loss of Pay (LOP): past working day with no attendance and no approved/quick leave
    const isPast = dateStr < todayStr;
    // DOJ check: don't show LOP before date of joining
    const dojStr = (() => {
      try {
        const u = (users || []).find(u => u.email === currentUser?.email);
        if (!u?.dateOfJoining) return null;
        const d = new Date(u.dateOfJoining);
        return formatDate(d);
      } catch { return null; }
    })();
    const isHoliday = holidays.some((h) => h.date === dateStr);
    // Compare using local YYYY-MM-DD to avoid timezone-induced previous-day shifts
    const hasAnyAttendance = attendanceRecords.some(r => {
      if (!r?.date) return false;
      const rd = typeof r.date === 'string' ? r.date.slice(0,10) : formatDate(new Date(r.date));
      return rd === dateStr;
    });
    const isQuickLeave = attendance?.history?.some((a) => a.date === dateStr);
    if (isPast && !weekOff && !isHoliday && !hasAnyAttendance && !isQuickLeave && (!dojStr || dateStr >= dojStr)) {
      return "lop-tile";
    }

    // Default → Working days
    return "workingday-tile";
  }
  return null;
};

const getTileContent = ({ date: day, view }) => {
  if (view !== 'month') return null;
  const dateStr = formatDate(day);
  const isHolidayDate = holidays.some((h) => h.date === dateStr);
  if (!isHolidayDate) return null;
  return <span className="holiday-dot" aria-hidden />;
};

  const handleToday = () => {
    const now = new Date();
    setDate(now);
    setActiveStartDate(now);
  };

  const handleHolidays = () => {
    const eff = (getEffectiveRole(currentUser || {}) || '').toLowerCase();
    const path = eff === 'admin'
      ? '/admin/leave-history'
      : eff === 'teamlead'
        ? '/teamlead/leave-requests'
        : '/leave-request';
    navigate(`${path}?section=holidays`);
  };

  // ✅ Apply leave request - Navigate to Leave Request page
  const handleApplyLeave = () => {
    navigate('/leave-request');
  };

  const quickLinks = (() => {
    const role = (getEffectiveRole(currentUser || {}) || '').toLowerCase();
    const designation = String(currentUser?.designation || currentUser?.position || '').trim().toLowerCase();
    const isHRBP = designation === 'hrbp' || designation === 'hrbp lead';
    const isHrFamily = role === 'hr' || designation.includes('hr') || designation.includes('recruiter');
    const canSeeUpdates = isHrFamily;

    // Admin: show ALL admin modules (same as AdminDashboard)
    if (role === 'admin') {
      return [
        // { label: 'Admin Dashboard', to: '/admin/dashboard', icon: '🏠' },
        { label: 'Performance Analytics', to: '/admin/performance-analytics', icon: '📊' },
        { label: 'Reports', to: '/admin/reports', icon: '📑' },
        { label: 'Payroll', to: '/admin/payroll', icon: '💰' },
        { label: 'Attendance', to: '/admin/attendance', icon: '🕒' },
        { label: 'Policies', to: '/policies', icon: '📜' },
        { label: 'Leave Requests', to: '/admin/leave-requests', icon: '🏖️' },
        { label: 'Leave History', to: '/admin/leave-history', icon: '📚' },
        { label: 'Admin Query Inbox', to: '/admin/queries', icon: '📮' },
        { label: 'Team Management', to: '/admin/team-management', icon: '👥' },
        { label: 'Team Leads Attendance', to: '/admin/team-attendance', icon: '🕒' },
        { label: 'Task Management', to: '/admin/task-management', icon: '📋' },
      ];
    }

    // Non-admin: show Unified Dashboard modules (same logic as UnifiedDashboard)
    const tasksPath = role === 'hr'
      ? '/hr/tasks'
      : (role === 'teamlead' ? '/teamlead/my-tasks' : '/employee/tasks');
    const deskPath = role === 'hr' ? '/hr/mydesk' : '/employee/mydesk';
    const lcrmPath = role === 'teamlead'
      ? '/teamlead/lcrm'
      : ((role === 'hr' || isHRBP) ? '/hr/lcrm' : '/employee/lcrm');

    // Core modules (always shown in UnifiedDashboard)
    const base = [
      { label: 'My Tasks', to: tasksPath, icon: '📝' },
      { label: 'Policies', to: '/policies', icon: '📜' },
      { label: 'My Desk', to: deskPath, icon: '📊' },
      { label: 'ICRM', to: lcrmPath, icon: '🌐' },
      { label: 'Leave History', to: '/leave-request', icon: '🏖️' },
    ];

    const updatesLink = canSeeUpdates ? [{ label: 'Updates', to: '/updates', icon: '🆕' }] : [];

    if (role === 'employee') {
      return [
        ...base,
        ...updatesLink,
        // { label: 'Profile Settings', to: '/profile', icon: '⚙️' },
        { label: 'Team Management', to: '/teamlead/team', icon: '👥' },
        { label: 'Team Attendance', to: '/teamlead/attendance', icon: '🕒' },
        { label: 'Task Management', to: '/teamlead/tasks', icon: '📋' },
        { label: 'Shift Extension', to: '/teamlead/shift-extensions', icon: '⏱️' },
        { label: 'Lead Approval', to: '/teamlead/lead-approval', icon: '✅' },
      ];
    }

    if (role === 'hr') {
      return [
        ...base,
        ...updatesLink,
        ...(isHRBP
          ? [
              { label: 'Recruitment', to: '/hr/recruitment', icon: '🧑‍🎓' },
              { label: 'Team Performance', to: '/teamlead/performance', icon: '📈' },
            ]
          : [{ label: 'Recruitment', to: '/hr/recruitment', icon: '🧑‍🎓' }]),
        // { label: 'Profile Settings', to: '/profile', icon: '⚙️' },
        { label: 'Team Management', to: '/teamlead/team', icon: '👥' },
        { label: 'Team Attendance', to: '/teamlead/attendance', icon: '🕒' },
        { label: 'Task Management', to: '/teamlead/tasks', icon: '📋' },
        { label: 'Shift Extension', to: '/teamlead/shift-extensions', icon: '⏱️' },
        { label: 'Lead Approval', to: '/teamlead/lead-approval', icon: '✅' },
      ];
    }

    if (role === 'teamlead') {
      return [
        ...base,
        ...updatesLink,
        { label: 'Team Management', to: '/teamlead/team', icon: '👥' },
        { label: 'Team Attendance', to: '/teamlead/attendance', icon: '🕒' },
        { label: 'Team Performance', to: '/teamlead/performance', icon: '📈' },
        { label: 'Task Management', to: '/teamlead/tasks', icon: '📋' },
        { label: 'Shift Extension', to: '/teamlead/shift-extensions', icon: '⏱️' },
        { label: 'Lead Approval', to: '/teamlead/lead-approval', icon: '✅' },
        // { label: 'Profile Settings', to: '/profile', icon: '⚙️' },
      ];
    }

    // Any other non-admin roles: keep parity with UnifiedDashboard by also showing Team Lead modules
    return [
      ...base,
      ...updatesLink,
      { label: 'Team Management', to: '/teamlead/team', icon: '👥' },
      { label: 'Team Attendance', to: '/teamlead/attendance', icon: '🕒' },
      { label: 'Task Management', to: '/teamlead/tasks', icon: '📋' },
      { label: 'Shift Extension', to: '/teamlead/shift-extensions', icon: '⏱️' },
      { label: 'Lead Approval', to: '/teamlead/lead-approval', icon: '✅' },
    ];
  })();

  return (
    <div className="home-container">
      {(() => {
        const empName = (
          `${(currentUser?.firstName || '').trim()} ${(currentUser?.lastName || '').trim()}`.trim() ||
          (currentUser?.name || '').trim() ||
          (currentUser?.username ? currentUser.username.split('@')[0] : '') ||
          (currentUser?.email ? currentUser.email.split('@')[0] : '') ||
          'User'
        );
      })()}

      <div className="home-grid">
        {/* 📅 Calendar */}
        <div className="home-card calendar-card">
          <h3>📅 Monthly Calendar</h3>
          <div className="calendar-layout">
            <Calendar
              value={date}
              onChange={(d) => {
                setDate(d);
                if (d) setActiveStartDate(d);
              }}
              activeStartDate={activeStartDate}
              onActiveStartDateChange={({ activeStartDate: next }) => {
                if (next) setActiveStartDate(next);
              }}
              tileClassName={getTileClassName}
              tileContent={getTileContent}
            />
          </div>

          <div className="calendar-actions">
            <button className="btn-primary" onClick={handleToday}>
              Today
            </button>
            <button className="btn-outline" onClick={handleHolidays}>
              Holidays
            </button>
            <button className="btn-outline" onClick={handleApplyLeave}>
              Apply Leave
            </button>
          </div>

          <div className="calendar-legend">
            <div className="calendar-legend-items">
              <div className="calendar-legend-item"><span className="legend-swatch today-tile" />Today</div>
              {/* <div className="calendar-legend-item"><span className="legend-swatch selected-tile" />Selected</div> */}
              <div className="calendar-legend-item"><span className="legend-swatch present-tile" />Present</div>
              <div className="calendar-legend-item"><span className="legend-swatch approved-leave-tile" />Approved Leave</div>
              {/* <div className="calendar-legend-item"><span className="legend-swatch leave-tile" />Quick Leave</div> */}
              <div className="calendar-legend-item"><span className="legend-swatch holiday-tile" />Holiday</div>
              <div className="calendar-legend-item"><span className="legend-swatch wednesday-off-tile" />Weekly Off</div>
              <div className="calendar-legend-item"><span className="legend-swatch lop-tile" />LOP</div>
            </div>
          </div>
        </div>

        <div className="home-card updates-card">
          <h3>🆕 Updates</h3>
          {(() => {
            const today = new Date();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = formatDate(today);

            const birthdayUpdates = (() => {
              const arr = Array.isArray(users) ? users : [];
              const getMD = (v) => {
                if (!v) return null;
                const s = String(v).trim();
                // Prefer YYYY-MM-DD or ISO
                const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (m1) return { m: m1[2], d: m1[3] };
                // Fallback dd-mm-yyyy or dd/mm/yyyy
                const m2 = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
                if (m2) return { d: m2[1], m: m2[2] };
                // Last resort: Date parse
                const dt = new Date(s);
                if (isNaN(dt.getTime())) return null;
                return { m: String(dt.getMonth() + 1).padStart(2, '0'), d: String(dt.getDate()).padStart(2, '0') };
              };

              const matches = arr.filter((u) => {
                const md = getMD(u?.dateOfBirth);
                return md && md.m === mm && md.d === dd;
              });

              return matches.map((u) => {
                const fullName = `${String(u?.firstName || '').trim()} ${String(u?.lastName || '').trim()}`.trim() || (u?.email ? String(u.email).split('@')[0] : '');
                return {
                  key: `birthday-${todayStr}-${String(u?.email || fullName)}`,
                  date: todayStr,
                  title: '🎂 Birthday',
                  message: `Happy Birthday ${fullName}`,
                };
              });
            })();

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = formatDate(sevenDaysAgo);

            const list = (Array.isArray(savedUpdates) ? savedUpdates : [])
              .map((u) => ({
                key: u?.id || `${u?.date}-${u?.title}`,
                date: String(u?.date || ''),
                title: String(u?.title || ''),
                message: String(u?.message || ''),
                createdAt: u?.createdAt ? new Date(u.createdAt) : new Date()
              }))
              .filter((u) => u.date && (u.title || u.message))
              .filter((u) => u.date >= sevenDaysAgoStr) // Only show updates from last 7 days
              .sort((a, b) => b.date.localeCompare(a.date));

            const merged = [...birthdayUpdates, ...list]
              .filter((u) => u && u.date)
              .slice(0, 6);
            const upcoming = (holidays || [])
              .filter(h => String(h.date || '') >= todayStr)
              .slice(0, 6);

            return (
              <div style={{ display: 'grid', gap: 10 }}>
                {merged.length > 0 ? (
                  <div className="updates-list">
                    {merged.map((u) => (
                      <div key={u.key} className="updates-item">
                        <div className="updates-title-row">
                          <div className="updates-title">{u.title}</div>
                          <div className="updates-title-date">
                            {(() => {
                              try {
                                // Debug: Log the raw date value and its type
                                console.log('Raw date value:', u.date, 'Type:', typeof u.date);

                                const now = new Date();

                                // Format the update date
                                const updateDate = String(u.date).trim();
                                console.log('Update date string:', updateDate);

                                // Format the date manually
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                                // Try different date formats
                                let day, month, year;

                                // Try YYYY-MM-DD format
                                const yyyy_mm_dd = updateDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                                if (yyyy_mm_dd) {
                                  year = yyyy_mm_dd[1];
                                  month = yyyy_mm_dd[2];
                                  day = yyyy_mm_dd[3];
                                } else {
                                  // Try DD-MM-YYYY format
                                  const dd_mm_yyyy = updateDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
                                  if (dd_mm_yyyy) {
                                    console.log('Matched DD-MM-YYYY format');
                                    day = dd_mm_yyyy[1];
                                    month = dd_mm_yyyy[2];
                                    year = dd_mm_yyyy[3];
                                  } else {
                                    // Handle formats like "Mon Jan 05" (no year) by using the posted year
                                    // from createdAt. If we still can't parse, keep the original.
                                    const monNameNoYear = updateDate.match(/^(?:[A-Za-z]{3}\s+)?([A-Za-z]{3})\s+(\d{1,2})$/);
                                    if (!monNameNoYear) return updateDate;

                                    const createdYear = (() => {
                                      try {
                                        const dt = u?.createdAt instanceof Date ? u.createdAt : new Date(u?.createdAt);
                                        if (isNaN(dt.getTime())) return null;
                                        return String(dt.getFullYear());
                                      } catch {
                                        return null;
                                      }
                                    })();
                                    if (!createdYear) return updateDate;

                                    const mName = monNameNoYear[1];
                                    const dStr = monNameNoYear[2];
                                    const dNum = parseInt(dStr, 10);
                                    if (isNaN(dNum)) return updateDate;
                                    const monthIndex = monthNames.findIndex((m) => String(m).toLowerCase() === String(mName).toLowerCase());
                                    if (monthIndex < 0) return updateDate;

                                    return `${monthNames[monthIndex]} ${dNum}, ${createdYear}`;
                                  }
                                }

                                console.log('Extracted values - Day:', day, 'Month:', month, 'Year:', year);

                                const dayNum = parseInt(day, 10);
                                const monthNum = parseInt(month, 10);

                                if (isNaN(dayNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                                  console.warn('Invalid day or month:', { day, month });
                                  return updateDate; // Return original if invalid
                                }

                                const formattedDate = `${monthNames[monthNum - 1]} ${dayNum}, ${year}`;
                                console.log('Formatted date:', formattedDate);
                                return formattedDate;
                              } catch (e) {
                                console.error('Error formatting date:', e);
                                return u.date; // Fallback to original if error
                              }
                            })()}
                          </div>
                        </div>
                        <div className="updates-message">{u.message}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {upcoming.length > 0 ? (
                  <ul className="updates-list">
                    {upcoming.map((h) => (
                      <li key={`${h.date}-${h.name || h.title || ''}`} className="updates-item">
                        <span className="updates-date">{h.date}</span>
                        <span className="updates-text">{h.name || h.title || 'Holiday'}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {merged.length === 0 && upcoming.length === 0 ? (
                  <div className="updates-empty">No new updates.</div>
                ) : null}
              </div>
            );
          })()}
        </div>

        <div className="home-card quick-access">
          <h3>⚡ Quick Access</h3>
          <div className="quick-links">
            {quickLinks.map((l) => (
              <button
                key={l.to}
                type="button"
                className="quick-link"
                onClick={() => navigate(l.to)}
                aria-label={l.label}
                title={l.label}
              >
                <span className="quick-link-icon" aria-hidden>{l.icon}</span>
                <span className="quick-tooltip" role="tooltip">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}