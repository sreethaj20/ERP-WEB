import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveRole } from "../../utils/dashboardPath";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { isHoliday as isDeclaredHoliday } from "../../utils/holidays";

export default function TeamAttendance() {
  const { users, currentUser, minuteTick, getAllAttendanceOverview, logAttendance, getAttendanceByDate, getAttendanceForUser } = useAuth();
  const navigate = useNavigate();
  const [teamAttendance, setTeamAttendance] = useState([]);

  const allUsers = useMemo(() => {
    const arr = Array.isArray(users) ? users : [];
    if (arr.length > 0) return arr;
    try {
      const raw = localStorage.getItem('erpUsers');
      const cached = raw ? JSON.parse(raw) : [];
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  }, [users]);
  // Use LOCAL date string to avoid timezone shifting to previous day
  const localTodayYMD = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const [selectedDate, setSelectedDate] = useState(localTodayYMD());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);
  // DB-backed caches
  const [dailyRecordsMap, setDailyRecordsMap] = useState({}); // { emailLower: {status, hours, date} }
  const [monthlyRecordsMap, setMonthlyRecordsMap] = useState({}); // { emailLower: Array<records for selectedMonth> }
  const [recentSelectedRecords, setRecentSelectedRecords] = useState([]); // recent for selected employee
  // Manual edit form state
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");
  const [manualStatus, setManualStatus] = useState("Present");
  // Time input as HH:MM:SS
  const [manualTime, setManualTime] = useState("09:00:00");
  // Toggle for showing daily preview table
  const [showDailyPreview, setShowDailyPreview] = useState(false);
  // Searchable combobox state
  const [empOpen, setEmpOpen] = useState(false);
  const [empQuery, setEmpQuery] = useState("");
  // No per-lead filter: only Team Leads can view their own team

  const isManagerRole = (currentUser?.role || "").toLowerCase() === "teamlead";
  const effective = getEffectiveRole(currentUser || {});
  const normalizeDesignation = (s = "") => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
  const isHRBPLeadDesignation = (val) => {
    const d = normalizeDesignation(val);
    const compact = d.replace(/\s+/g, "");
    return compact.includes("hrbplead") || (d.includes("hrbp") && d.includes("lead"));
  };
  const isHRBPLeadUser = isHRBPLeadDesignation(currentUser?.designation || currentUser?.position || "");
  const isHRBPUser = (() => {
    const d = normalizeDesignation(currentUser?.designation || currentUser?.position || "");
    const compact = d.replace(/\s+/g, "");
    return compact === 'hrbp' || (d.includes('hrbp') && !isHRBPLeadDesignation(d));
  })();
  const normalizeEmail = (v = "") => String(v || "").trim().toLowerCase();
  const getFullName = (u = {}) => (`${String(u?.firstName || "").trim()} ${String(u?.lastName || "").trim()}`.trim()).toLowerCase();
  const getDirectReports = (allUsers = []) => {
    const meEmail = normalizeEmail(currentUser?.email);
    const meName = getFullName(currentUser);
    if (!meEmail && !meName) return [];

    const matchesMe = (raw) => {
      const v = String(raw ?? "").trim();
      if (!v) return false;
      const vLower = v.toLowerCase();
      const vNorm = vLower.replace(/\s+/g, ' ').trim();
      const emailHit = meEmail && (vNorm === meEmail || vNorm.includes(meEmail));
      const nameHit = meName && (vNorm === meName || vNorm.includes(meName) || meName.includes(vNorm));
      return emailHit || nameHit;
    };

    const eligibleUsers = (allUsers || []).filter(u => {
      const role = String(u?.role || '').toLowerCase();
      return role !== 'admin' && role !== 'teamlead';
    });
    return eligibleUsers.filter((u) => {
      const tl = normalizeEmail(u?.teamLeadEmail);
      if (meEmail && tl && tl === meEmail) return true;
      const candidates = [
        u?.reportingTo,
        u?.reporting_to,
        u?.reportingToEmail,
        u?.reporting_to_email,
        u?.managerEmail,
        u?.manager,
        u?.['Reporting To'],
        u?.['ReportingTo'],
        u?.['ReportingToEmail'],
      ];
      return candidates.some(matchesMe);
    });
  };

  const fallbackScopedByDesignation = (overview = []) => {
    // If reporting mapping isn't maintained, fall back to common HRBP Lead visibility bucket
    return (overview || []).filter((emp) => {
      const u = allUsers.find(x => normalizeEmail(x?.email) === normalizeEmail(emp?.email));
      if (!u) return false;
      const d = normalizeDesignation(u?.designation || u?.position || '');
      if (!d) return false;
      if (isHRBPLeadDesignation(d)) return false;
      return d.includes('hrbp') || d.includes('hr recruiter') || d.includes('it recruiter') || d.includes('developer');
    });
  };

  const hasDirectReports = allUsers.some(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
  const isTeamLeadByDesignation = (currentUser?.designation || "").toLowerCase() === "team lead";
  const isLeadViewer = isTeamLeadByDesignation || hasDirectReports || isHRBPLeadUser || isHRBPUser;
  const isAdmin = (currentUser?.role || "").toLowerCase() === "admin";

  // Weekly-off helpers: Developers => Sat/Sun, others => Wednesday
  // const isDeveloperFor = (email) => {
  //   try {
  //     const u = users.find(u => (u.email || '').toLowerCase() === String(email || '').toLowerCase());
  //     const desig = String(u?.designation || '').toLowerCase();
  //     return desig === 'developer' || desig.includes('developer');
  //   } catch { return false; }
  // };
  // const isWeeklyOffFor = (email, dateObj) => {
  //   const d = (dateObj instanceof Date ? dateObj : new Date(dateObj));
  //   const dow = d.getDay(); // 0 Sun .. 6 Sat
  //   return isDeveloperFor(email) ? (dow === 0 || dow === 6) : (dow === 3);
  // };
  const isDeveloperFor = (email) => {
  try {
    const u = allUsers.find(u => (u.email || '').toLowerCase() === String(email || '').toLowerCase());
    const desig = String(u?.designation || '').toLowerCase();
    const dept = String(u?.department || '').toLowerCase();
    return desig === 'developer' || desig.includes('developer') || dept === 'it';
  } catch { return false; }
};

const isWeeklyOffFor = (email, dateObj) => {
  const d = (dateObj instanceof Date ? dateObj : new Date(dateObj));
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  return isDeveloperFor(email) ? (dow === 0 || dow === 6) : (dow === 3);
};

  // Build selectable leads list (include Team Lead, Manager, HR, Developer as pseudo-leads)
  // selectableLeads and filter removed per requirement

  useEffect(() => {
    const overview = (allUsers.length > 0
      ? allUsers.map((u) => ({
          email: u.email,
          username: u.username,
          attendance: Array.isArray(u.attendance) ? u.attendance : [],
        }))
      : getAllAttendanceOverview());
    // Build employees list for Team Lead view
    const allEmp = overview.filter(emp => (allUsers.find(u => u.email === emp.email)?.role || '').toLowerCase() === "employee");
    // Build team leads list for Admin view
    const allLeads = overview.filter(emp => {
      const u = allUsers.find(u => u.email === emp.email);
      if (!u) return false;
      const role = (u.role || '').toLowerCase();
      const desig = (u.designation || '').toLowerCase();
      return role === 'teamlead' || desig === 'team lead';
    });

    // If the viewer is a Team Lead, scope to their team and include HR + Developers + Employees
    // If admin, show leads themselves (optionally filter by selected lead)
    let scoped = allEmp;
    if (isLeadViewer) {
      // Team Lead view: exclude Developers from their team
      if (isHRBPLeadUser || isHRBPUser) {
        const direct = getDirectReports(allUsers);
        const memberEmails = new Set(direct.map(u => normalizeEmail(u?.email)).filter(Boolean));
        scoped = overview.filter(emp => memberEmails.has(normalizeEmail(emp?.email)));
        if (scoped.length === 0) {
          scoped = fallbackScopedByDesignation(overview);
        }
      } else {
        scoped = overview.filter(emp => {
          const u = allUsers.find(u => u.email === emp.email);
          if (!u) return false;
          const tlMatch = (u.teamLeadEmail || '').toLowerCase() === (currentUser?.email || '').toLowerCase();
          if (!tlMatch) return false;
          const role = (u.role || '').toLowerCase();
          const desig = (u.designation || '').toLowerCase();
          const dept = (u.department || '').toLowerCase();
          const isEmployee = role === 'employee';
          const isHrVariant = desig === 'hr' || desig.includes('hr executive') || desig.includes('hr manager') || desig.includes('it recruiter') || dept === 'hr';
          const isDeveloper = desig === 'developer' || desig.includes('developer') || desig.includes('java developer');
          return (isEmployee || isHrVariant) && !isDeveloper;
        });
      }
    } else if (isAdmin) {
      // Admin view: show Team Leads + HR family + Developers
      scoped = overview.filter(emp => {
        const u = allUsers.find(u => u.email === emp.email);
        if (!u) return false;
        const role = (u.role || '').toLowerCase();
        const desig = (u.designation || '').toLowerCase();
        const dept = (u.department || '').toLowerCase();
        const isLead = role === 'teamlead' || desig === 'team lead';
        const isHrVariant = desig === 'hr' || desig.includes('hr executive') || desig.includes('hr manager') || desig.includes('it recruiter') || dept === 'hr';
        const isDeveloper = desig === 'developer' || desig.includes('developer') || desig.includes('java developer');
        return isLead || isHrVariant || isDeveloper;
      });
    } else {
      // Non-admin and not a Team Lead cannot view
      scoped = [];
    }
    setTeamAttendance(scoped);
    // Clear any legacy localStorage reliance
    try {
      const savedRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
      setLeaveRequests(Array.isArray(savedRequests) ? savedRequests : []);
    } catch { setLeaveRequests([]); }
  }, [allUsers, getAllAttendanceOverview, currentUser, isLeadViewer, isAdmin, refreshTick, minuteTick]);

  useEffect(() => {
    const onUpdate = () => setRefreshTick(x => x + 1);
    window.addEventListener('erp-attendance-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('erp-attendance-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  // Fetch daily records for selected date from DB
  useEffect(() => {
    const loadDaily = async () => {
      try {
        const rows = await getAttendanceByDate(selectedDate);
        const map = {};
        (rows || []).forEach(r => { map[(r.email || '').toLowerCase()] = r; });
        setDailyRecordsMap(map);
      } catch { setDailyRecordsMap({}); }
    };
    loadDaily();
  }, [selectedDate, getAttendanceByDate, refreshTick, minuteTick]);

  // Fetch monthly records per user in scope from DB
  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const emails = teamAttendance.map(e => (e.email || '').toLowerCase());
        const results = await Promise.all(emails.map(e => getAttendanceForUser(e).then(rows => ({ e, rows: Array.isArray(rows) ? rows : [] })).catch(() => ({ e, rows: [] }))));
        const month = String(selectedMonth || '').slice(0,7);
        const map = {};
        results.forEach(({ e, rows }) => {
          map[e] = rows.filter(r => String(r.date || '').slice(0,7) === month);
        });
        setMonthlyRecordsMap(map);
      } catch { setMonthlyRecordsMap({}); }
    };
    loadMonthly();
  }, [teamAttendance, selectedMonth, getAttendanceForUser, refreshTick, minuteTick]);

  // Fetch recent records for selected employee
  useEffect(() => {
    const loadRecent = async () => {
      try {
        if (!selectedEmployeeEmail) { setRecentSelectedRecords([]); return; }
        const rows = await getAttendanceForUser(selectedEmployeeEmail);
        const arr = Array.isArray(rows) ? rows.slice().sort((a,b)=> String(b.date||'').localeCompare(String(a.date||''))).slice(0,30) : [];
        setRecentSelectedRecords(arr);
      } catch { setRecentSelectedRecords([]); }
    };
    loadRecent();
  }, [selectedEmployeeEmail, getAttendanceForUser, refreshTick]);

  const scopedEmployees = (() => {
    // For Admin: allow HR family, Team Leads/Managers, and Developers (e.g., Java Developer)
    if (isAdmin) {
      return allUsers.filter(u => {
        const role = (u.role || '').toLowerCase();
        const desig = (u.designation || '').toLowerCase();
        const dept = (u.department || '').toLowerCase();
        const isHrVariant = desig === 'hr' || desig.includes('hr executive') || desig.includes('hr manager') || desig.includes('it recruiter') || dept === 'hr';
        const isLead = role === 'manager' || desig === 'team lead';
        const isDeveloper = desig === 'developer' || desig.includes('developer') || desig.includes('java developer');
        return isHrVariant || isLead || isDeveloper;
      });
    }
    // For Team Leads: only their team (employees)
    if (!isLeadViewer) return [];
    const all = allUsers.filter(u => (u.role || '').toLowerCase() === 'employee');
    if (isHRBPLeadUser) return getDirectReports(allUsers);
    return all.filter(u => (u.teamLeadEmail || '').toLowerCase() === (currentUser?.email || '').toLowerCase());
  })();

  const filteredEmployees = (() => {
    const q = (empQuery || "").toLowerCase().trim();
    if (!q) return scopedEmployees;
    return scopedEmployees.filter(emp => {
      const id = (emp.empId || '').toLowerCase();
      const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      return id.includes(q) || name.includes(q) || email.includes(q);
    });
  })();

  // Helpers to convert between HH:MM:SS and decimal hours
  const parseTimeToHours = (t) => {
    try {
      if (!t) return 0;
      const parts = t.split(":");
      const hh = Number(parts[0] || 0);
      const mm = Number(parts[1] || 0);
      const ss = Number(parts[2] || 0);
      return hh + mm / 60 + ss / 3600;
    } catch { return 0; }
  };

  // Helper: get recorded hours for a specific date (in decimal hours)
  const getAttendanceHours = (email, date) => {
    const key = (email || '').toLowerCase();
    const ymd = (typeof date === 'string' ? date.slice(0,10) : new Date(date).toISOString().slice(0,10));
    // Prefer daily map when matching selected date
    if (ymd === String(selectedDate).slice(0,10)) {
      const rec = dailyRecordsMap[key];
      if (!rec) return null;
      const hrs = parseTimeToHours(String(rec.hours || '0:00:00'));
      if (rec.status === 'Absent' || rec.status === 'Leave') return 0;
      return hrs;
    }
    // Fallback: monthly cache
    const recs = monthlyRecordsMap[key] || [];
    const rec = recs.find(r => String(r.date || '').slice(0,10) === ymd);
    if (!rec) return null;
    const hrs = parseTimeToHours(String(rec.hours || '0:00:00'));
    if (rec.status === 'Absent' || rec.status === 'Leave') return 0;
    return hrs;
  };
  const hoursToHMS = (h) => {
    // Accept TIME strings or numeric hours
    if (typeof h === 'string' && h.includes(':')) {
      const parts = h.split(':');
      const pad = (n) => String(Number(n) || 0).padStart(2, '0');
      const hh = pad(parts[0]);
      const mm = pad(parts[1] ?? '0');
      const ss = pad(parts[2] ?? '0');
      return `${hh}:${mm}:${ss}`;
    }
    const num = Number(h || 0);
    if (!isFinite(num)) return '00:00:00';
    const totalSeconds = Math.max(0, Math.round(num * 3600));
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleAttendanceUpdate = (email, status, hours = 8) => {
    // Prevent marking on weekly off per employee
    if (isWeeklyOffFor(email, new Date(selectedDate))) return;
    // Past dates only, except Leave
    // Local YYYY-MM-DD formatter (no UTC conversion)
  const toYMD = (d) => {
    try {
      if (typeof d === 'string' && d.length >= 10) return d.slice(0,10);
      const dt = d instanceof Date ? d : new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const dy = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${dy}`;
    } catch { return String(d || '').slice(0,10); }
  };
    const isPast = toYMD(selectedDate) < toYMD(new Date());
    if (!isPast && String(status) !== 'Leave') {
      alert('You can update attendance only for past dates (except Leave).');
      return;
    }

    // Normalize hours based on status
    let hrs = Number(hours) || 0;
    if (status === "Present" && hrs < 9) hrs = 9;
    if (status === "Absent" || status === "Leave") hrs = 0;

    // Persist
    logAttendance({
      email,
      date: selectedDate,
      status,
      hours: hrs,
    });

    // Defer refresh to allow context state to update
    setTimeout(() => {
      const overview = (allUsers.length > 0
        ? allUsers.map((u) => ({
            email: u.email,
            username: u.username,
            attendance: Array.isArray(u.attendance) ? u.attendance : [],
          }))
        : getAllAttendanceOverview());
      const allEmp = overview.filter(emp => (allUsers.find(u => u.email === emp.email)?.role || '').toLowerCase() === "employee");
      let scoped = allEmp;
      if (isLeadViewer) {
        if (isHRBPLeadUser) {
          const direct = getDirectReports(allUsers);
          const memberEmails = new Set(direct.map(u => normalizeEmail(u?.email)).filter(Boolean));
          scoped = overview.filter(emp => memberEmails.has(normalizeEmail(emp?.email)));
          if (scoped.length === 0) scoped = fallbackScopedByDesignation(overview);
        } else {
          scoped = allEmp.filter(emp => (allUsers.find(u => u.email === emp.email)?.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
        }
      } else if (isAdmin) {
        scoped = overview.filter(emp => {
          const u = allUsers.find(u => u.email === emp.email);
          if (!u) return false;
          const role = (u.role || '').toLowerCase();
          const desig = (u.designation || '').toLowerCase();
          return role === 'teamlead' || desig === 'team lead';
        });
      } else {
        scoped = [];
      }
      setTeamAttendance(scoped);
      try { window.dispatchEvent(new Event('erp-attendance-updated')); } catch {}
    }, 0);
  };

  const submitManualUpdate = (e) => {
    e.preventDefault();
    if (!selectedEmployeeEmail) {
      alert('Please select an employee');
      return;
    }
    // Weekly off restriction per employee
    if (isWeeklyOffFor(selectedEmployeeEmail, new Date(selectedDate))) {
      alert(isDeveloperFor(selectedEmployeeEmail) ? 'Saturday/Sunday are weekly off for Developers.' : 'Wednesday is a weekly off.');
      return;
    }
    // Past dates only, except Leave
    const toYMD = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10));
    const isPast = toYMD(selectedDate) < toYMD(new Date());
    if (!isPast && String(manualStatus) !== 'Leave') {
      alert('You can update attendance only for past dates (except Leave).');
      return;
    }
    // Convert HH:MM:SS to decimal hours
    let hrs = parseTimeToHours(manualTime);
    // Normalize hours based on status
    if (manualStatus === 'Absent' || manualStatus === 'Leave') hrs = 0;
    logAttendance({ email: selectedEmployeeEmail, date: selectedDate, status: manualStatus, hours: hrs });
    // Light UX feedback
    alert(`Saved ${manualStatus} (${hoursToHMS(hrs)} hh:mm:ss) for ${selectedDate}`);
    // Keep current selections; refresh table view via overview reload
    setTimeout(() => {
      const overview = (allUsers.length > 0
        ? allUsers.map((u) => ({
            email: u.email,
            username: u.username,
            attendance: Array.isArray(u.attendance) ? u.attendance : [],
          }))
        : getAllAttendanceOverview());
      const allEmp = overview.filter(emp => (allUsers.find(u => u.email === emp.email)?.role || '').toLowerCase() === "employee");
      let scoped = allEmp;
      if (isLeadViewer) {
        if (isHRBPLeadUser) {
          const direct = getDirectReports(allUsers);
          const memberEmails = new Set(direct.map(u => normalizeEmail(u?.email)).filter(Boolean));
          scoped = overview.filter(emp => memberEmails.has(normalizeEmail(emp?.email)));
          if (scoped.length === 0) scoped = fallbackScopedByDesignation(overview);
        } else {
          scoped = allEmp.filter(emp => (allUsers.find(u => u.email === emp.email)?.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
        }
      } else if (isAdmin) {
        scoped = overview.filter(emp => {
          const u = allUsers.find(u => u.email === emp.email);
          if (!u) return false;
          const role = (u.role || '').toLowerCase();
          const desig = (u.designation || '').toLowerCase();
          return role === 'teamlead' || desig === 'team lead';
        });
      } else {
        scoped = [];
      }
      setTeamAttendance(scoped);
      try { window.dispatchEvent(new Event('erp-attendance-updated')); } catch {}
    }, 0);
  };

  const handleLeaveApproval = (requestId, approved) => {
    const updatedRequests = leaveRequests.map(request => 
      request.id === requestId 
        ? { ...request, status: approved ? "Approved" : "Rejected", approvedBy: "Manager" }
        : request
    );
    
    setLeaveRequests(updatedRequests);
    localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests));

    if (approved) {
      const request = leaveRequests.find(r => r.id === requestId);
      if (request) {
        handleAttendanceUpdate(request.email, "Leave", 0);
      }
    }
  };

  const downloadExcel = (data, filename) => {
    // Convert data to CSV format
    const csvContent = data.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAttendanceOverview = () => {
    const headers = ['Employee', 'Department', 'Working Days', 'Present Days', 'Leave Days', 'Absent Days', 'Attendance Rate', 'Avg Time/Day'];
    const data = [headers];
    
    teamAttendance.forEach(employee => {
      const user = allUsers.find(u => u.email === employee.email);
      const monthlyMetrics = getMonthlyAttendanceMetrics(employee.email, selectedMonth);
      
      data.push([
        `${user?.firstName} ${user?.lastName}`,
        user?.department || "Not specified",
        monthlyMetrics.totalWorkingDays,
        monthlyMetrics.presentDays,
        monthlyMetrics.leaveDays,
        monthlyMetrics.absentDays,
        `${monthlyMetrics.attendanceRate}%`,
        hoursToHMS(monthlyMetrics.avgHours)
      ]);
    });
    
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    downloadExcel(data, `Team_Attendance_Overview_${monthName.replace(' ', '_')}`);
  };

  const downloadTeamSummary = () => {
    const headers = ['Metric', 'Count', 'Percentage'];
    const data = [headers];
    
    const totalEmployees = teamAttendance.length;
    const presentToday = teamAttendance.filter(emp => 
      getAttendanceStatus(emp.email, selectedDate) === "Present"
    ).length;
    const onLeave = teamAttendance.filter(emp => 
      getAttendanceStatus(emp.email, selectedDate) === "Leave"
    ).length;
    const absent = teamAttendance.filter(emp => 
      getAttendanceStatus(emp.email, selectedDate) === "Absent"
    ).length;
    const notMarked = teamAttendance.filter(emp => 
      getAttendanceStatus(emp.email, selectedDate) === "Not Marked"
    ).length;
    
    data.push(['Total Employees', totalEmployees, '100%']);
    data.push(['Present Today', presentToday, `${totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%`]);
    data.push(['On Leave', onLeave, `${totalEmployees > 0 ? Math.round((onLeave / totalEmployees) * 100) : 0}%`]);
    data.push(['Absent', absent, `${totalEmployees > 0 ? Math.round((absent / totalEmployees) * 100) : 0}%`]);
    data.push(['Not Marked', notMarked, `${totalEmployees > 0 ? Math.round((notMarked / totalEmployees) * 100) : 0}%`]);
    
    downloadExcel(data, `Team_Summary_${selectedDate}`);
  };

  const getAttendanceStatus = (email, date) => {
    const user = allUsers.find(u => u.email === email);
    const selected = new Date(date);
    const today = new Date();
    // Weekly off per employee
    const isWeekOff = isWeeklyOffFor(email, selected);
    // Company-declared holiday
    const holiday = isDeclaredHoliday(`${selected.getFullYear()}-${String(selected.getMonth()+1).padStart(2,'0')}-${String(selected.getDate()).padStart(2,'0')}`);
    // Use local YYYY-MM-DD for all comparisons to avoid UTC day shifts
    const toYMD = (val) => {
      if (!val) return '';
      if (typeof val === 'string' && val.length === 10) return val;
      const d = val instanceof Date ? val : new Date(val);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    if (!user) return "Not Marked";

    // Respect DOJ: before joining, do not consider absent
    const doj = user?.dateOfJoining || '';
    if (doj && toYMD(selected) < toYMD(doj)) return "Not Marked";

    // Exact match if recorded (local)
    const ymd = (typeof date === 'string' ? date.slice(0,10) : new Date(date).toISOString().slice(0,10));
    // Prefer daily records map when matching selectedDate
    if (ymd === toYMD(selected)) {
      const rec = dailyRecordsMap[(email || '').toLowerCase()];
      if (rec) return rec.status;
    }
    // Fallback to monthly cache for other dates in the same month
    const recs = monthlyRecordsMap[(email || '').toLowerCase()] || [];
    const rec = recs.find(r => String(r.date || '').slice(0,10) === ymd);
    if (rec) return rec.status;

    // Weekly off or Holiday: never Absent/LOP
    if (isWeekOff) return "Week Off";
    if (holiday) return "Holiday";

    // For past working days (not weekly off), treat as Absent (LOP) from DOJ onward
    if (toYMD(selected) < toYMD(today)) return "Absent";

    // Today or future: not marked yet
    return "Not Marked";
  };

  // Presence: treat as online if heartbeat within last 3 minutes
  const isOnline = (email) => {
    try {
      const ts = Number(localStorage.getItem(`erpPresence_${email}`) || 0);
      if (!ts) return false;
      return Date.now() - ts < 3 * 60 * 1000;
    } catch { return false; }
  };

  const toYMD = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10));

  // Note: monthly metrics below compute weekly off per employee directly

  const getMonthlyAttendanceMetrics = (email, month) => {
    const recs = monthlyRecordsMap[(email || '').toLowerCase()] || [];
    const monthAttendance = recs.filter(a => String(a.date || '').slice(0,7) === String(month).slice(0,7));

    // Calendar working days for the whole month (exclude weekly off per employee and holidays) with DOJ adjustment
    const [y, m] = String(month).split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const baseWorkingDaysFull = (() => {
      let count = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(y, m - 1, d);
        const ymd = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const holiday = isDeclaredHoliday(ymd);
        if (!isWeeklyOffFor(email, dt) && !holiday) count++;
      }
      return count;
    })();
    let totalWorkingDays = baseWorkingDaysFull;
    const userObj = allUsers.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
    const doj = (() => {
      const v = userObj?.dateOfJoining;
      if (!v) return null;
      const s = String(v);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [yy, mm, dd] = s.split('-').map(Number);
        return new Date(yy, (mm || 1) - 1, dd || 1);
      }
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    })();
    if (doj) {
      const dojY = doj.getFullYear();
      const dojM = doj.getMonth() + 1;
      if (dojY > y || (dojY === y && dojM > m)) {
        totalWorkingDays = 0; // DOJ after this month
      } else if (dojY === y && dojM === m) {
        // Count from DOJ to end of month excluding weekly off and holidays
        let count = 0;
        for (let d = doj.getDate(); d <= daysInMonth; d++) {
          const dt = new Date(y, m - 1, d);
          const ymd = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const holiday = isDeclaredHoliday(ymd);
          if (!isWeeklyOffFor(email, dt) && !holiday) count++;
        }
        totalWorkingDays = count;
      }
    }

    const presentDays = monthAttendance.filter(a => String(a.status).toLowerCase() === 'present').length;
    const leaveDays = monthAttendance.filter(a => String(a.status).toLowerCase() === 'leave').length;

    // Absent (up to date): if not Present or Leave on a working day up to today, treat as Absent
    const now2 = new Date();
    const isCurrMonth2 = now2.getFullYear() === y && (now2.getMonth() + 1) === m;
    const endDayUpTo = isCurrMonth2 ? now2.getDate() : daysInMonth;
    // Working days up to today (weekly off/holidays excluded) with DOJ adjustment
    const workingDaysUpTo = (() => {
      let count = 0;
      // start day: 1 or DOJ day if DOJ in the same month
      let startDay = 1;
      if (doj && doj.getFullYear() === y && (doj.getMonth() + 1) === m) {
        startDay = doj.getDate();
      }
      for (let d = startDay; d <= endDayUpTo; d++) {
        const dt = new Date(y, m - 1, d);
        const ymd = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const holiday = isDeclaredHoliday(ymd);
        if (!isWeeklyOffFor(email, dt) && !holiday) count++;
      }
      return count;
    })();
    // Present/Leave up to today
    const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const todayYMD2 = toYMD(now2);
    const upToRows = monthAttendance.filter(a => String(a.date || '').slice(0,10) <= todayYMD2);
    const presentUpTo = upToRows.filter(a => String(a.status).toLowerCase() === 'present').length;
    const leaveUpTo = upToRows.filter(a => String(a.status).toLowerCase() === 'leave').length;
    const absentDays = Math.max(0, workingDaysUpTo - presentUpTo - leaveUpTo);

    // Sum TIME hours only for Present days
    let totalHours = monthAttendance.reduce((sum, a) => {
      if (String(a.status).toLowerCase() !== 'present') return sum;
      return sum + parseTimeToHours(String(a.hours || '0:00:00'));
    }, 0);

    // Include today's live minutes when viewing the current month and the employee is present/logged in today
    try {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0,7);
      if (String(month).slice(0,7) === currentMonth) {
        const toYMD = (d) => {
          const dt = d instanceof Date ? d : new Date(d);
          return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
        };
        const todayYMD = toYMD(now);
        const todayRec = monthAttendance.find(a => String(a.date || '').slice(0,10) === todayYMD);
        const statusToday = getAttendanceStatus(email, todayYMD);
        const isPresentLike = String(statusToday).toLowerCase() === 'present' || String(statusToday).toLowerCase() === 'logged in';
        const hasRecordToday = Boolean(todayRec);
        // Only add live time if present/logged in and there isn't already a record with hours (during live session)
        if (isPresentLike) {
          const lsLoginTime = localStorage.getItem('erpLoginTime');
          const lsLoginDate = localStorage.getItem('erpLoginDate');
          const lsPresence = localStorage.getItem('erpPresence');
          // Only for the currently logged-in user's live session
          if ((currentUser?.email || '').toLowerCase() === (email || '').toLowerCase() && lsLoginTime && lsLoginDate === todayYMD && lsPresence && lsPresence.toLowerCase() !== 'loggedout') {
            const start = new Date(lsLoginTime);
            const liveMins = Math.max(0, Math.floor((now - start) / 60000));
            totalHours += liveMins / 60;
            // If no record yet for today, count today as a present day for averaging
            if (!hasRecordToday) {
              // presentDays is const; compute denom separately below
              // We'll add +1 to denom if no record exists for today but user is present/logged in
              
            }
          }
        }
      }
    } catch {}

    // Denominator: present days; if user is present today without a stored row yet, add +1
    const todayDenomBump = (() => {
      try {
        const now = new Date();
        const currentMonth = now.toISOString().slice(0,7);
        if (String(month).slice(0,7) !== currentMonth) return 0;
        const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const todayYMD = toYMD(now);
        const hasRecordToday = monthAttendance.some(a => String(a.date || '').slice(0,10) === todayYMD && String(a.status).toLowerCase() === 'present');
        const statusToday = getAttendanceStatus(email, todayYMD);
        const isPresentLike = String(statusToday).toLowerCase() === 'present' || String(statusToday).toLowerCase() === 'logged in';
        return isPresentLike && !hasRecordToday ? 1 : 0;
      } catch { return 0; }
    })();

    // Average should include Absent days too: use workingDaysUpTo (past working days up to today) as denominator
    const denomWorking = Math.max(0, workingDaysUpTo);
    const avgHours = denomWorking > 0 ? Math.round((totalHours / denomWorking) * 100) / 100 : 0;

    return {
      totalWorkingDays,
      presentDays,
      leaveDays,
      absentDays,
      attendanceRate: totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0,
      avgHours,
    };
  };

  const pendingRequests = leaveRequests.filter(req => req.status === "Pending");

  const handleBackToDashboard = () => {
    if (currentUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  if (!isLeadViewer && !isAdmin) {
    return (
      <div className="dashboard fade-in" style={{ padding: 20 }}>
        <div className="dashboard-header">
          <div>
            <h2>📊 Team Attendance</h2>
            {/* <p>Only Team Leads can view and manage their team attendance.</p> */}
          </div>
          <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
            ← Back to Home
          </button>
        </div>
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <p style={{ margin: 0 }}>You don't have a Team Lead assignment. Please sign in as a Team Lead to view your team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>📊 {isAdmin ? 'Team Leads Attendance' : 'Team Attendance'}</h2>
          <p>{isAdmin ? 'View attendance records for Team Leads.' : 'Monitor and manage team attendance records.'}</p>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
          ← Back to Home
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Select Date (for daily actions):</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Select Month (for overview):</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
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
        {/* Filter removed: Only signed-in Team Leads can view their team */}
      </div>

      {/* Manual Update Panel (Team Leads and Admin) */}
      {(isLeadViewer || isAdmin) && (
        <div className="dashboard-card" style={{ padding: 16, marginBottom: 16, borderRadius: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Manual Attendance Update</h3>
          <form onSubmit={submitManualUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => { setEmpOpen(v => !v); setEmpQuery(""); }}
                onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setEmpOpen(v=>!v);} }}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
                aria-expanded={empOpen}
                aria-haspopup="listbox"
              >
                {(() => {
                  const sel = allUsers.find(u => u.email === selectedEmployeeEmail);
                  return sel ? `${sel.empId || 'N/A'} - ${(sel.firstName || '') + ' ' + (sel.lastName || '')}`.trim() : 'Select EMP ID';
                })()}
              </div>
              {empOpen && (
                <div style={{ position: 'absolute', zIndex: 20, top: '100%', marginTop: 4, left: 0, right: 0, width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 20px rgba(0,0,0,0.12)', padding: 8, boxSizing: 'border-box' }}>
                  <input
                    autoFocus
                    type="text"
                    value={empQuery}
                    onChange={(e)=>setEmpQuery(e.target.value)}
                    onKeyDown={(e)=>{ if(e.key==='Escape'){ e.stopPropagation(); setEmpOpen(false);} }}
                    placeholder="Search EMP ID / Name / Email"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 6, boxSizing: 'border-box', display: 'block' }}
                  />
                  <div role="listbox" style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {filteredEmployees.length === 0 ? (
                      <div style={{ padding: 8, color: '#6b7280' }}>No results</div>
                    ) : filteredEmployees.map(emp => (
                      <div
                        key={emp.email}
                        role="option"
                        onClick={()=>{ setSelectedEmployeeEmail(emp.email); setEmpOpen(false); }}
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ setSelectedEmployeeEmail(emp.email); setEmpOpen(false); } }}
                        tabIndex={0}
                        style={{ padding: '8px', borderRadius: 6, cursor: 'pointer' }}
                        onMouseDown={(e)=>e.preventDefault()}
                      >
                        <div style={{ fontWeight: 600 }}>{emp.empId || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()} · {emp.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} />
            <select value={manualStatus} onChange={(e)=>setManualStatus(e.target.value)}>
              <option>Present</option>
              <option>Absent</option>
              <option>Leave</option>
            </select>
            <input type="time" step="1" value={manualTime} onChange={(e)=>setManualTime(e.target.value)} placeholder="HH:MM:SS" />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-outline" onClick={()=>{ setManualStatus('Present'); setManualTime('09:00:00'); }}>Reset</button>
            </div>
          </form>
          {/* Quick history for selected employee */}
          {selectedEmployeeEmail ? (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '8px 0' }}>Recent Attendance (Last 30 entries)</h4>
              <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Hours</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rows = recentSelectedRecords;
                    return rows.map((r) => (
                      <tr key={`${r.date}`}>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{(r.date || '').slice(0,10)}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{r.status}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{hoursToHMS(r.hours)}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                          <button className="btn-outline" onClick={()=>{ setSelectedDate((r.date || '').slice(0,10)); setManualStatus(r.status); setManualTime(hoursToHMS(r.hours)); }}>Prefill</button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Date Attendance (Daily view) */}
      {showDailyPreview && (
        <div className="attendance-overview">
          <h3>Selected Date Attendance - {selectedDate}</h3>
          <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Login Time</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Logout Time</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Worked Hours</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {teamAttendance.map(employee => {
                const user = allUsers.find(u => u.email === employee.email);
                const rec = dailyRecordsMap[(employee.email || '').toLowerCase()];
                const statusBase = getAttendanceStatus(employee.email, selectedDate);
                const status = (toYMD(selectedDate) === toYMD(new Date()) && isOnline(employee.email)) ? 'Logged In' : statusBase;
                const loginTime = rec?.loginTime || '-';
                const logoutTime = rec?.logoutTime || '-';
                const hrs = getAttendanceHours(employee.email, selectedDate);
                // Deduct 1 hour for lunch for display only
                const adj = hrs === null ? null : Math.max(0, (Number(hrs) || 0) - 1);
                const timeStr = adj === null ? '-' : hoursToHMS(adj);
                return (
                  <tr key={`daily-${employee.email}`} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <strong>{user?.firstName} {user?.lastName}</strong>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user?.department || 'Not specified'}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                      <span className={`status ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{loginTime}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{logoutTime}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{timeStr}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setSelectedEmployeeEmail(employee.email);
                          setManualStatus(statusBase);
                          // For manualTime use raw hours without lunch deduction if available
                          const rawHrs = getAttendanceHours(employee.email, selectedDate);
                          setManualTime(hoursToHMS(rawHrs || 0));
                        }}
                      >
                        Prefill
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Attendance Overview (hidden during Day-wise Preview) */}
      {!showDailyPreview && (
      <div className="attendance-overview">
        <h3>{isAdmin ? 'Team Leads Attendance Overview' : 'Team Attendance Overview'} - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Working Days</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Present Days</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Leave Days</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Absent Days</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Attendance Rate</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Avg Time/Day</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{selectedDate} Status</th>
            </tr>
          </thead>
          <tbody>
            {teamAttendance.map(employee => {
              const user = allUsers.find(u => u.email === employee.email);
              // DOJ month check per employee
              const dojYM = (() => {
                const v = user?.dateOfJoining;
                if (!v) return null;
                try {
                  const d = new Date(v);
                  return isNaN(d.getTime()) ? String(v).slice(0,7) : d.toISOString().slice(0,7);
                } catch { return String(v).slice(0,7); }
              })();
              const isBeforeDOJ = dojYM ? (String(selectedMonth).slice(0,7) < dojYM) : false;

              if (isBeforeDOJ) {
                return (
                  <tr key={employee.email} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <strong>{user?.firstName} {user?.lastName}</strong>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user?.department || "Not specified"}</td>
                    <td colSpan={8} style={{ padding: '12px', border: '1px solid #ddd', color: '#334155' }}>
                      Attendance not available before employee's Date of Joining ({dojYM}).
                    </td>
                  </tr>
                );
              }

              const monthlyMetrics = getMonthlyAttendanceMetrics(employee.email, selectedMonth);
              const todayStatusBase = getAttendanceStatus(employee.email, selectedDate);
              const todayStatus = (toYMD(selectedDate) === toYMD(new Date()) && isOnline(employee.email)) ? 'Logged In' : todayStatusBase;
              
              return (
                <tr key={employee.email} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <strong>{user?.firstName} {user?.lastName}</strong>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user?.department || "Not specified"}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{monthlyMetrics.totalWorkingDays}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>{monthlyMetrics.presentDays}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span style={{ color: '#ffc107' }}>{monthlyMetrics.leaveDays}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span style={{ color: '#dc3545' }}>{monthlyMetrics.absentDays}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span style={{ 
                      color: monthlyMetrics.attendanceRate >= 90 ? '#28a745' : 
                             monthlyMetrics.attendanceRate >= 75 ? '#ffc107' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {monthlyMetrics.attendanceRate}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{hoursToHMS(monthlyMetrics.avgHours)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span className={`status ${todayStatus.toLowerCase().replace(' ', '-')}`}>
                      {todayStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Download Button for Attendance Overview */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            className="btn-primary"
            onClick={downloadAttendanceOverview}
            style={{ padding: '10px 20px' }}
          >
            📊 Download Attendance Overview (Excel)
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
