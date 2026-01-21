import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveRole, getDashboardPath } from "../../utils/dashboardPath";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../App.css";
import { isHoliday } from "../../utils/holidays";

export default function PerformanceAnalytics() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const leadEmailParam = String(searchParams.get('leadEmail') || '').toLowerCase().trim();

  useEffect(() => {
    const d = String(currentUser?.designation || currentUser?.position || "").toLowerCase().replace(/\s+/g, " ").trim();
    const compact = d.replace(/\s+/g, "");
    const isHRBPLead = compact.includes("hrbplead") || (d.includes("hrbp") && d.includes("lead"));
    if (isHRBPLead && !leadEmailParam) {
      navigate("/hrbp/performance/analytics", { replace: true });
    }
  }, [currentUser, navigate, leadEmailParam]);

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📈 Performance Analytics</h2>
        <div style={{ display: "flex", gap: 12 }}>
          {/* <button
            className="btn btn-secondary"
            onClick={() => navigate(getDashboardPath(currentUser))}
            style={{ padding: "8px 14px", borderRadius: 8 }}
          >
            ← Back to My Desk
          </button> */}
          {/* <button
            className="btn"
            onClick={() => navigate(-1)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db" }}
          >
            ← Go Back
          </button> */}
        </div>
      </div>

      <div style={{ display: "grid", placeItems: "center", height: "60vh" }}>
        <div
          style={{
            textAlign: "center",
            padding: 32,
            borderRadius: 14,
            background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 60%)",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            maxWidth: 640,
          }}
        >
          <div style={{ fontSize: 56 }}>🚧</div>
          <h3 style={{ margin: "12px 0", fontSize: 24 }}>Feature Coming Soon</h3>
          <p style={{ color: "#6b7280" }}>
            We are building rich 📈 Performance Analytics , trends and insights.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/teamlead/performance")}
              style={{ padding: "10px 16px", borderRadius: 8 }}
            >
              Back to Team Performance
            </button>
            {/* <button
              className="btn"
              onClick={() => navigate(-1)}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db" }}
            >
              Go Back
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// export default function PerformanceAnalytics() {
//   const { users, currentUser, getAllAttendanceOverview } = useAuth();
//   const navigate = useNavigate();
//   const [teamPerformance, setTeamPerformance] = useState([]);
//   const [selectedPeriod, setSelectedPeriod] = useState("month");
//   const [selectedProject, setSelectedProject] = useState("all");

//   // Derive available projects from saved tasks (use task.category as project)
//   const getProjectOptions = () => {
//     try {
//       const adminTasks = JSON.parse(localStorage.getItem("erpAdminTasks") || "[]");
//       const managerTasks = JSON.parse(localStorage.getItem("erpManagerTasks") || "[]");
//       const allTasks = [...adminTasks, ...managerTasks];
//       const unique = Array.from(
//         new Set(
//           allTasks
//             .map(t => (t.category || "").trim())
//             .filter(Boolean)
//         )
//       );
//       return unique;
//     } catch {
//       return [];
//     }
//   };

//   const isManagerRole = (currentUser?.role || "").toLowerCase() === "manager";
//   const effective = getEffectiveRole(currentUser || {});
//   const hasDirectReports = users.some(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
//   const isTeamLeadByDesignation = (currentUser?.designation || "").toLowerCase() === "team lead";
//   const isLeadViewer = isTeamLeadByDesignation || hasDirectReports; // Only TLs with team

//   useEffect(() => {
//     const overview = getAllAttendanceOverview();
//     let employeeData = overview.filter(emp => 
//       users.find(u => u.email === emp.email)?.role === "employee"
//     );
//     // Only Team Leads can view and only their assigned employees
//     if (isLeadViewer) {
//       employeeData = employeeData.filter(emp => (users.find(u => u.email === emp.email)?.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
//     } else {
//       employeeData = [];
//     }

//     // If a project is selected, filter employees to those associated with tasks in that project
//     if (selectedProject !== "all") {
//       try {
//         const adminTasks = JSON.parse(localStorage.getItem("erpAdminTasks") || "[]");
//         const managerTasks = JSON.parse(localStorage.getItem("erpManagerTasks") || "[]");
//         const allTasks = [...adminTasks, ...managerTasks];
//         const emailsOnProject = new Set(
//           allTasks
//             .filter(t => (t.category || "").trim() === selectedProject)
//             .map(t => t.assignedTo)
//             .filter(Boolean)
//         );
//         if (emailsOnProject.size > 0) {
//           employeeData = employeeData.filter(emp => emailsOnProject.has(emp.email));
//         } else {
//           // No matching tasks, show empty list
//           employeeData = [];
//         }
//       } catch {
//         // ignore errors, leave employeeData as-is
//       }
//     }
    
//     // Compute period-specific metrics straight from attendance records
//     const bounds = getPeriodBounds(selectedPeriod);
//     const enhancedData = employeeData.map(emp => {
//       const user = users.find(u => u.email === emp.email);
//       const periodMetrics = computeMetricsForPeriod(user?.attendance || [], bounds, user);
//       const baseQuality = Math.floor(Math.random() * 30) + 70;
//       const baseEfficiency = Math.floor(Math.random() * 25) + 75;

//       return {
//         ...emp,
//         user,
//         metrics: periodMetrics,
//         performanceScore: calculatePerformanceScore(periodMetrics, selectedPeriod),
//         productivity: calculateProductivity(periodMetrics, selectedPeriod),
//         quality: getRandomVariation(baseQuality, selectedPeriod),
//         efficiency: getRandomVariation(baseEfficiency, selectedPeriod),
//       };
//     });
    
//     setTeamPerformance(enhancedData);
//   }, [users, getAllAttendanceOverview, selectedPeriod, selectedProject, currentUser, isLeadViewer]);

//   const calculatePerformanceScore = (metrics, period) => {
//     if (!metrics) return 0;
//     const attendanceWeight = 0.4;
//     const hoursWeight = 0.6;
    
//     // Adjust metrics based on time period
//     const periodMultiplier = getPeriodMultiplier(period);
//     const attendanceScore = metrics.attendanceRate || 0;
//     const hoursScore = Math.min((metrics.avgHours / 8) * 100, 100);
    
//     const baseScore = attendanceScore * attendanceWeight + hoursScore * hoursWeight;
//     const adjustedScore = baseScore * periodMultiplier;
//     return Math.min(100, Math.round(adjustedScore));
//   };

//   const calculateProductivity = (metrics, period) => {
//     if (!metrics) return 0;
//     const periodMultiplier = getPeriodMultiplier(period);
//     const baseProductivity = Math.min(Math.round((metrics.hours / (metrics.totalDays * 8)) * 100), 100);
//     const adjustedProductivity = baseProductivity * periodMultiplier;
//     return Math.min(100, Math.round(adjustedProductivity));
//   };

//   const getPeriodMultiplier = (period) => {
//     switch (period) {
//       case 'week': return 0.8; // Weekly performance tends to be lower
//       case 'month': return 1.0; // Base multiplier
//       case 'quarter': return 1.1; // Quarterly shows sustained performance
//       case 'year': return 1.2; // Annual shows long-term consistency
//       default: return 1.0;
//     }
//   };

//   // Get date bounds for the selected period (start inclusive, end inclusive)
//   const getPeriodBounds = (period) => {
//     const end = new Date();
//     const start = new Date();
//     switch (period) {
//       case 'week':
//         // Align to current week Monday 00:00 through Sunday 23:59:59
//         {
//           const today = new Date();
//           const dow = today.getDay(); // 0 Sun ... 6 Sat
//           const diffToMonday = (dow === 0 ? -6 : 1) - dow; // If Sunday, go back 6 days
//           const monday = new Date(today);
//           monday.setDate(today.getDate() + diffToMonday);
//           monday.setHours(0, 0, 0, 0);
//           const sunday = new Date(monday);
//           sunday.setDate(monday.getDate() + 6);
//           sunday.setHours(23, 59, 59, 999);
//           start.setTime(monday.getTime());
//           end.setTime(sunday.getTime());
//         }
//         break;
//       case 'month':
//         start.setMonth(end.getMonth());
//         start.setDate(1);
//         break;
//       case 'quarter': {
//         const currentMonth = end.getMonth();
//         const quarterStartMonth = currentMonth - (currentMonth % 3);
//         start.setMonth(quarterStartMonth, 1);
//         break;
//       }
//       case 'year':
//         start.setMonth(0, 1);
//         break;
//       default:
//         start.setMonth(end.getMonth());
//         start.setDate(1);
//     }
//     // zero-out times for comparison (week already normalized above)
//     if (period !== 'week') {
//       start.setHours(0,0,0,0);
//       end.setHours(23,59,59,999);
//     }
//     return { start, end };
//   };

//   // Compute metrics from raw attendance entries within period bounds
//   const computeMetricsForPeriod = (attendance = [], bounds, user) => {
//     const parseLocalYMD = (s) => {
//       if (!s) return null;
//       if (typeof s === 'string' && s.length === 10) {
//         const [yy, mm, dd] = s.split('-').map(Number);
//         return new Date(yy, (mm || 1) - 1, dd || 1);
//       }
//       return new Date(s);
//     };

//     const inRange = attendance.filter((a) => {
//       const d = parseLocalYMD(a.date);
//       return d && d >= bounds.start && d <= bounds.end;
//     });

//     // Working days within period excluding Wednesday (weekly off), holidays; honoring DOJ
//     const countWorkingDaysInRange = (start, end, dojStr) => {
//       const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
//       const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
//       const doj = dojStr ? new Date(dojStr) : null;
//       let count = 0;
//       for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
//         const dow = d.getDay();
//         const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
//         const beforeDOJ = doj ? d < new Date(doj.getFullYear(), doj.getMonth(), doj.getDate()) : false;
//         if (dow === 3) continue; // Wednesday off
//         if (isHoliday(ymd)) continue;
//         if (beforeDOJ) continue;
//         count++;
//       }
//       return count;
//     };

//     const workingDays = countWorkingDaysInRange(bounds.start, bounds.end, user?.dateOfJoining);
//     const presentDays = inRange.filter((a) => String(a.status).toLowerCase() === 'present').length;
//     const rawHours = inRange.reduce((sum, a) => sum + (Number(a.hours) || 0), 0);
//     // Deduct 1 hour per Present day for lunch
//     const hours = Math.max(0, rawHours - presentDays * 1);
//     const attendanceRate = workingDays ? Math.round((presentDays / workingDays) * 100) : 0;
//     const avgHours = presentDays > 0 ? Number((hours / presentDays).toFixed(1)) : 0;
//     return { totalDays: workingDays, presentDays, hours, avgHours, attendanceRate };
//   };

//   const getRandomVariation = (base, period) => {
//     const variations = {
//       week: () => Math.floor(Math.random() * 20) - 10, // ±10%
//       month: () => Math.floor(Math.random() * 15) - 7, // ±7%
//       quarter: () => Math.floor(Math.random() * 10) - 5, // ±5%
//       year: () => Math.floor(Math.random() * 8) - 4, // ±4%
//     };
//     return Math.max(0, Math.min(100, base + (variations[period] || variations.month)()));
//   };

//   const getPerformanceColor = (score) => {
//     if (score >= 90) return "#4CAF50"; // Green
//     if (score >= 75) return "#FFC107"; // Yellow
//     if (score >= 60) return "#FF9800"; // Orange
//     return "#F44336"; // Red
//   };

//   const getTopPerformers = () => {
//     // Sort by performance score and apply period-based adjustments
//     const sortedPerformers = teamPerformance
//       .map(emp => ({
//         ...emp,
//         adjustedScore: Math.min(100, emp.performanceScore + getRandomVariation(0, selectedPeriod))
//       }))
//       .sort((a, b) => b.adjustedScore - a.adjustedScore)
//       .slice(0, 5);
    
//     return sortedPerformers;
//   };

//   const getAverageMetrics = () => {
//     if (teamPerformance.length === 0) return {};
    
//     // Use actual period metrics for attendance (no randomization)
//     const totals = teamPerformance.reduce((acc, emp) => ({
//       attendance: acc.attendance + (emp.metrics?.attendanceRate || 0),
//       performance: acc.performance + emp.performanceScore,
//       productivity: acc.productivity + emp.productivity,
//       quality: acc.quality + emp.quality,
//       efficiency: acc.efficiency + emp.efficiency,
//     }), { attendance: 0, performance: 0, productivity: 0, quality: 0, efficiency: 0 });

//     const count = teamPerformance.length;
//     const baseAverages = {
//       attendance: Math.round(totals.attendance / count),
//       performance: Math.round(totals.performance / count),
//       productivity: Math.round(totals.productivity / count),
//       quality: Math.round(totals.quality / count),
//       efficiency: Math.round(totals.efficiency / count),
//     };

//     // Keep period multiplier for non-attendance metrics; attendance stays raw average
//     const periodMultiplier = getPeriodMultiplier(selectedPeriod);
//     return {
//       attendance: Math.min(100, Math.round(baseAverages.attendance)),
//       performance: Math.min(100, Math.round(baseAverages.performance * periodMultiplier)),
//       productivity: Math.min(100, Math.round(baseAverages.productivity * periodMultiplier)),
//       quality: Math.min(100, Math.round(baseAverages.quality * periodMultiplier)),
//       efficiency: Math.min(100, Math.round(baseAverages.efficiency * periodMultiplier)),
//     };
//   };

//   const averageMetrics = getAverageMetrics();
//   const topPerformers = getTopPerformers();

//   const handleBackToDashboard = () => {
//     if (currentUser?.role === "admin") {
//       navigate("/admin/dashboard");
//     } else {
//       navigate("/teamlead/dashboard");
//     }
//   };

//   if (!isLeadViewer) {
//     return (
//       <div className="dashboard fade-in" style={{ padding: 20 }}>
//         <div className="dashboard-header">
//           <div>
//             <h2>📈 Performance Analytics</h2>
//             <p>Only Team Leads can view performance for their team.</p>
//           </div>
//           <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
//             ← Back to Dashboard
//           </button>
//         </div>
//         <div className="card" style={{ padding: 16, marginTop: 12 }}>
//           <p style={{ margin: 0 }}>You are not assigned as a Team Lead or do not have any direct reports yet.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard fade-in">
//       <div className="dashboard-header">
//         <div>
//           <h2>📈 Performance Analytics</h2>
//           <p>Analyze team performance metrics and KPIs.</p>
//           {(() => {
//             const b = getPeriodBounds(selectedPeriod);
//             const fmt = (d) => new Date(d).toLocaleDateString();
//             return (
//               <small style={{ color: '#6c757d' }}>
//                 Period: {fmt(b.start)} — {fmt(b.end)}
//               </small>
//             );
//           })()}
//         </div>
//         <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
//           ← Back to Dashboard
//         </button>
//       </div>

//       <div className="analytics-controls" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
//         <div className="form-group" style={{ minWidth: 220, width: 'auto', flex: '0 0 auto' }}>
//           <label>Time Period:</label>
//           <select 
//             value={selectedPeriod} 
//             onChange={(e) => setSelectedPeriod(e.target.value)}
//             style={{ width: 200 }}
//           >
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//             <option value="quarter">This Quarter</option>
//             <option value="year">This Year</option>
//           </select>
//         </div>
//         <div className="form-group" style={{ minWidth: 260, width: 'auto', flex: '0 0 auto' }}>
//           <label>Project:</label>
//           <select 
//             value={selectedProject} 
//             onChange={(e) => setSelectedProject(e.target.value)}
//             style={{ width: 240 }}
//           >
//             <option value="all">All Projects</option>
//             {getProjectOptions().map(p => (
//               <option key={p} value={p}>{p}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Team Performance Overview - Table */}
//       <div className="metrics-overview">
//         <h3>Team Performance Overview</h3>
//         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Metric</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Average Score</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Performance Level</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Average Attendance</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.attendance), fontWeight: 'bold' }}>
//                 {averageMetrics.attendance}%
//               </td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                 {averageMetrics.attendance >= 90 ? "Excellent" : averageMetrics.attendance >= 75 ? "Good" : averageMetrics.attendance >= 60 ? "Fair" : "Poor"}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Average Performance</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.performance), fontWeight: 'bold' }}>
//                 {averageMetrics.performance}%
//               </td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                 {averageMetrics.performance >= 90 ? "Excellent" : averageMetrics.performance >= 75 ? "Good" : averageMetrics.performance >= 60 ? "Fair" : "Poor"}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Average Productivity</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.productivity), fontWeight: 'bold' }}>
//                 {averageMetrics.productivity}%
//               </td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                 {averageMetrics.productivity >= 90 ? "Excellent" : averageMetrics.productivity >= 75 ? "Good" : averageMetrics.productivity >= 60 ? "Fair" : "Poor"}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Average Quality</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.quality), fontWeight: 'bold' }}>
//                 {averageMetrics.quality}%
//               </td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                 {averageMetrics.quality >= 90 ? "Excellent" : averageMetrics.quality >= 75 ? "Good" : averageMetrics.quality >= 60 ? "Fair" : "Poor"}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Average Efficiency</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.efficiency), fontWeight: 'bold' }}>
//                 {averageMetrics.efficiency}%
//               </td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                 {averageMetrics.efficiency >= 90 ? "Excellent" : averageMetrics.efficiency >= 75 ? "Good" : averageMetrics.efficiency >= 60 ? "Fair" : "Poor"}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Top Performers */}
//       <div className="top-performers">
//         <h3>🏆 Top Performers</h3>
//         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Rank</th>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Performance Score</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Attendance</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Productivity</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Quality</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Efficiency</th>
//             </tr>
//           </thead>
//           <tbody>
//             {topPerformers.map((performer, index) => (
//               <tr key={performer.email} style={{ borderBottom: '1px solid #ddd' }}>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '16px' }}>
//                   #{index + 1}
//                 </td>
//                 <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                   <strong>{performer.user?.firstName} {performer.user?.lastName}</strong>
//                 </td>
//                 <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                   {performer.user?.department || "Not specified"}
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(performer.adjustedScore || performer.performanceScore), fontWeight: 'bold' }}>
//                   {Math.round(performer.adjustedScore || performer.performanceScore)}%
//                 </td>
//                 <td
//                   style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(performer.metrics?.attendanceRate || 0), fontWeight: 'bold' }}
//                   title={`Present ${performer.metrics?.presentDays || 0} of ${performer.metrics?.totalDays || 0} days, ${performer.metrics?.hours || 0} hrs`}
//                 >
//                   {performer.metrics?.attendanceRate || 0}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(performer.productivity), fontWeight: 'bold' }}>
//                   {performer.productivity}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(performer.quality), fontWeight: 'bold' }}>
//                   {performer.quality}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(performer.efficiency), fontWeight: 'bold' }}>
//                   {performer.efficiency}%
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Detailed Team Performance */}
//       <div className="detailed-performance">
//         <h3>Detailed Team Performance</h3>
//         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Attendance</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Performance</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Productivity</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Quality</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Efficiency</th>
//             </tr>
//           </thead>
//           <tbody>
//             {teamPerformance.map(emp => (
//               <tr key={emp.email} style={{ borderBottom: '1px solid #ddd' }}>
//                 <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                   <strong>{emp.user?.firstName} {emp.user?.lastName}</strong>
//                 </td>
//                 <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.user?.department || "Not specified"}</td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
//                   <div style={{ color: getPerformanceColor(emp.metrics?.attendanceRate || 0), fontWeight: 'bold' }}>
//                     {emp.metrics?.attendanceRate || 0}%
//                   </div>
//                   <small style={{ color: '#6c757d' }}>
//                     {emp.metrics?.presentDays || 0}/{emp.metrics?.totalDays || 0} days • {emp.metrics?.hours || 0}h ({emp.metrics?.avgHours || 0}h avg)
//                   </small>
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(emp.performanceScore), fontWeight: 'bold' }}>
//                   {emp.performanceScore}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(emp.productivity), fontWeight: 'bold' }}>
//                   {emp.productivity}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(emp.quality), fontWeight: 'bold' }}>
//                   {emp.quality}%
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(emp.efficiency), fontWeight: 'bold' }}>
//                   {emp.efficiency}%
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Performance Insights */}
//       <div className="performance-insights">
//         <h3>📈 Performance Insights</h3>
//         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Insight Category</th>
//               <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Current Value</th>
//               <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Analysis & Recommendation</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Attendance Trends</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.attendance), fontWeight: 'bold' }}>
//                 {averageMetrics.attendance}%
//               </td>
//               <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                 {averageMetrics.attendance >= 90 ? "Excellent performance!" : 
//                  averageMetrics.attendance >= 75 ? "Good, but room for improvement." : 
//                  "Needs attention and improvement."}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Productivity Analysis</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.productivity), fontWeight: 'bold' }}>
//                 {averageMetrics.productivity}%
//               </td>
//               <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                 {averageMetrics.productivity >= 85 ? "Team is highly productive!" : 
//                  averageMetrics.productivity >= 70 ? "Solid productivity levels." : 
//                  "Consider productivity enhancement strategies."}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Quality Metrics</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: getPerformanceColor(averageMetrics.quality), fontWeight: 'bold' }}>
//                 {averageMetrics.quality}%
//               </td>
//               <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                 {averageMetrics.quality >= 90 ? "Outstanding quality standards!" : 
//                  averageMetrics.quality >= 80 ? "Good quality maintenance." : 
//                  "Focus on quality improvement needed."}
//               </td>
//             </tr>
//             <tr style={{ borderBottom: '1px solid #ddd' }}>
//               <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Team Size</td>
//               <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>
//                 {teamPerformance.length} members
//               </td>
//               <td style={{ padding: '12px', border: '1px solid #ddd' }}>
//                 {teamPerformance.length > 10 ? "Large team - consider delegation strategies." : 
//                  teamPerformance.length > 5 ? "Medium-sized team - good for collaboration." : 
//                  "Small team - focus on individual development."}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
