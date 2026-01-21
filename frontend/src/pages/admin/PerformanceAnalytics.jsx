import React from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext"; // reserved for future analytics
// import { isHoliday } from "../../utils/holidays";    // reserved for future analytics
import "../../App.css";

export default function PerformanceAnalytics() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📈 Performance Analytics</h2>
        <div style={{ display: "flex", gap: 12 }}>
          {/* <button
            className="btn btn-secondary"
            onClick={() => navigate("/employee/mydesk")}
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
              onClick={() => navigate("/admin/dashboard")}
              style={{ padding: "10px 16px", borderRadius: 8 }}
            >
              Back to Admin Dashboard
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

 // Admin Performance Analytics (Team-wise, Tabular)
// export default function PerformanceAnalytics() {
//   const { users, getAllAttendanceOverview, currentUser } = useAuth();

//   const [selectedPeriod, setSelectedPeriod] = useState("month");
//   const [rows, setRows] = useState([]);
//   const [expanded, setExpanded] = useState({}); // key: teamLeadEmail -> bool
//   // Bump this version whenever attendance updates elsewhere to recompute
//   const [version, setVersion] = useState(0);

//   const getPeriodBounds = (period) => {
//     const end = new Date();
//     const start = new Date();
//     switch (period) {
//       case "week":
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
//       case "month":
//         start.setMonth(end.getMonth());
//         start.setDate(1);
//         break;
//       case "quarter": {
//         const m = end.getMonth();
//         const qStart = m - (m % 3);
//         start.setMonth(qStart, 1);
//         break;
//       }
//       case "year":
//         start.setMonth(0, 1);
//         break;
//       default:
//         start.setMonth(end.getMonth());
//         start.setDate(1);
//     }
//     // Hours already normalized for week; normalize for other periods
//     if (selectedPeriod !== "week") {
//       start.setHours(0, 0, 0, 0);
//       end.setHours(23, 59, 59, 999);
//     }
//     return { start, end };
//   };

//   const computeMetricsForPeriod = (attendance = [], bounds, user) => {
//     const parseLocalYMD = (s) => {
//       if (!s) return null;
//       if (typeof s === "string" && s.length === 10) {
//         const [yy, mm, dd] = s.split("-").map(Number);
//         return new Date(yy, (mm || 1) - 1, dd || 1);
//       }
//       return new Date(s);
//     };

//     const inRange = attendance.filter((a) => {
//       const d = parseLocalYMD(a.date);
//       return d && d >= bounds.start && d <= bounds.end;
//     });

//     // Compute working days in period (exclude Wednesday weekly-off, holidays; respect DOJ)
//     const countWorkingDaysInRange = (start, end, dojStr) => {
//       const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
//       const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
//       const doj = dojStr ? new Date(dojStr) : null;
//       let count = 0;
//       for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
//         const dow = d.getDay();
//         const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
//         const beforeDOJ = doj ? d < new Date(doj.getFullYear(), doj.getMonth(), doj.getDate()) : false;
//         if (dow === 3) continue; // Wednesday weekly off
//         if (isHoliday(ymd)) continue;
//         if (beforeDOJ) continue;
//         count++;
//       }
//       return count;
//     };

//     const workingDays = countWorkingDaysInRange(bounds.start, bounds.end, user?.dateOfJoining);
//     const presentDays = inRange.filter((a) => String(a.status).toLowerCase() === "present").length;
//     const leaveDays = inRange.filter((a) => String(a.status).toLowerCase() === "leave").length;
//     const hoursRaw = inRange.reduce((sum, a) => sum + (Number(a.hours) || 0), 0);
//     // Deduct 1 hour per Present day for lunch
//     const hours = Math.max(0, hoursRaw - presentDays * 1);
//     const attendanceRate = workingDays ? Math.round((presentDays / workingDays) * 100) : 0;
//     // Match TeamAttendance: average hours per PRESENT day (post-lunch)
//     const avgHours = presentDays > 0 ? Number((hours / presentDays).toFixed(1)) : 0;
//     return { totalDays: workingDays, presentDays, leaveDays, hours, avgHours, attendanceRate };
//   };

//   const getPeriodMultiplier = (period) => {
//     switch (period) {
//       case "week":
//         return 0.8;
//       case "month":
//         return 1.0;
//       case "quarter":
//         return 1.1;
//       case "year":
//         return 1.2;
//       default:
//         return 1.0;
//     }
//   };

//   const calcPerformanceScore = (metrics, period) => {
//     if (!metrics) return 0;
//     const attendanceWeight = 0.4;
//     const hoursWeight = 0.6;
//     const periodMultiplier = getPeriodMultiplier(period);
//     const attendanceScore = metrics.attendanceRate || 0;
//     const hoursScore = Math.min(((metrics.avgHours || 0) / 8) * 100, 100);
//     const base = attendanceScore * attendanceWeight + hoursScore * hoursWeight;
//     return Math.min(100, Math.round(base * periodMultiplier));
//   };

//   const getTeamLeadUsers = useMemo(() => {
//     const isTL = (u) => (u.designation || "").toLowerCase() === "team lead" || (u.role || "").toLowerCase() === "manager";
//     return users.filter(isTL);
//   }, [users]);

//   // Removed TL dashboard link (undo previous update)

//   // Listen for global attendance updates dispatched from Team/Lead screens
//   useEffect(() => {
//     const handler = () => setVersion((v) => v + 1);
//     window.addEventListener("erp-attendance-updated", handler);
//     return () => window.removeEventListener("erp-attendance-updated", handler);
//   }, []);

//   useEffect(() => {
//     // Build team-wise rows
//     const bounds = getPeriodBounds(selectedPeriod);
//     const overview = getAllAttendanceOverview();

//     // Map employees by teamLeadEmail
//     const employees = users.filter((u) => (u.role || "").toLowerCase() === "employee");
//     const teamMap = new Map();
//     for (const tl of getTeamLeadUsers) {
//       teamMap.set((tl.email || '').toLowerCase(), { teamLead: tl, members: [] });
//     }
//     for (const emp of employees) {
//       const key = (emp.teamLeadEmail || "").toLowerCase();
//       if (!key) continue;
//       if (!teamMap.has(key)) continue; // skip if TL not registered
//       teamMap.get(key).members.push(emp);
//     }

//     const rows = [];
//     for (const [, group] of teamMap.entries()) {
//       const { teamLead, members } = group;
//       // Include TL rows even if team has 0 members so the name always shows

//       // Aggregate metrics per member
//       const memberMetrics = members.map((m) => {
//         // Always read authoritative attendance from users context
//         const userRec = users.find((u) => u.email === m.email);
//         const attendance = userRec?.attendance || [];
//         const metrics = computeMetricsForPeriod(attendance, bounds, m);
//         const performanceScore = calcPerformanceScore(metrics, selectedPeriod);
//         const productivity = Math.min(Math.round(((metrics.hours || 0) / ((metrics.totalDays || 1) * 8)) * 100), 100);
//         const name = `${m.firstName || ""} ${m.lastName || ""}`.trim() || (m.username || m.email);
//         return { email: m.email, name, department: m.department || "Not specified", metrics, performanceScore, productivity };
//       });

//       // Aggregate using sums to avoid bias: attendance = sum(present)/sum(workingDays),
//       // avgHours = sum(hours)/sum(presentDays)
//       const totals = memberMetrics.reduce(
//         (acc, m) => {
//           acc.present += m.metrics.presentDays || 0;
//           acc.working += m.metrics.totalDays || 0;
//           acc.hours += m.metrics.hours || 0;
//           acc.presentForHours += m.metrics.presentDays || 0;
//           acc.performance += m.performanceScore || 0;
//           acc.productivity += m.productivity || 0;
//           return acc;
//         },
//         { present: 0, working: 0, hours: 0, presentForHours: 0, performance: 0, productivity: 0 }
//       );
//       const count = memberMetrics.length || 1;
//       rows.push({
//         teamLeadName: `${teamLead.firstName || ""} ${teamLead.lastName || ""}`.trim() || teamLead.email,
//         teamLeadEmail: teamLead.email,
//         teamSize: members.length,
//         avgAttendance: totals.working > 0 ? Math.round((totals.present / totals.working) * 100) : 0,
//         avgHours: totals.presentForHours > 0 ? Number((totals.hours / totals.presentForHours).toFixed(1)) : 0,
//         avgPerformance: Math.round(totals.performance / count),
//         avgProductivity: Math.round(totals.productivity / count),
//         members: memberMetrics,
//       });
//     }

//     // Sort by avgPerformance desc
//     rows.sort((a, b) => b.avgPerformance - a.avgPerformance);
//     setRows(rows);
//   }, [users, getAllAttendanceOverview, selectedPeriod, getTeamLeadUsers, version]);

//   const getPerformanceColor = (v) => {
//     if (v >= 90) return "#22c55e";
//     if (v >= 75) return "#eab308";
//     if (v >= 60) return "#f59e0b";
//     return "#ef4444";
//   };

//   const b = getPeriodBounds(selectedPeriod);
//   const periodLabel = `${b.start.toLocaleDateString()} — ${b.end.toLocaleDateString()}`;

//   return (
//     <div className="dashboard fade-in">
//       <div className="dashboard-header">
//         <div>
//           <h2>📊 Performance Analytics (Team-wise)</h2>
//           <p>Aggregated employee performance by Team Lead.</p>
//           <small style={{ color: "#6c757d" }}>Period: {periodLabel}</small>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginTop: 8 }}>
//         <div className="form-group" style={{ minWidth: 220 }}>
//           <label>Time Period</label>
//           <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ width: 200 }}>
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//             <option value="quarter">This Quarter</option>
//             <option value="year">This Year</option>
//           </select>
//         </div>
//       </div>

//       <div className="dashboard-card" style={{ marginTop: 16 }}>
//         <h3>Team-wise Performance</h3>
//         <table className="user-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
//           <thead>
//             <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd", width: 48 }}></th>
//               <th style={{ padding: 12, textAlign: "left", border: "1px solid #ddd" }}>Team Lead</th>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Team Size</th>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Avg Attendance</th>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Avg Hours</th>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Avg Performance</th>
//               <th style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>Avg Productivity</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.length === 0 ? (
//               <tr>
//                 <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
//                   No team data found for the selected period.
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r) => (
//                 <React.Fragment key={r.teamLeadEmail}>
//                   <tr style={{ borderBottom: "1px solid #eee" }}>
//                     <td style={{ padding: 0, textAlign: "center", border: "1px solid #ddd" }}>
//                       <button
//                         onClick={() => setExpanded((e) => ({ ...e, [r.teamLeadEmail]: !e[r.teamLeadEmail] }))}
//                         aria-label={expanded[r.teamLeadEmail] ? "Collapse" : "Expand"}
//                         style={{
//                           background: "transparent",
//                           border: "none",
//                           cursor: "pointer",
//                           fontSize: 18,
//                           width: "100%",
//                           padding: 8,
//                         }}
//                       >
//                         {expanded[r.teamLeadEmail] ? "−" : "+"}
//                       </button>
//                     </td>
//                     <td style={{ padding: 12, border: "1px solid #ddd" }}>
//                       <strong>{r.teamLeadName}</strong>
//                       <div style={{ color: "#6b7280", fontSize: 12 }}>{r.teamLeadEmail}</div>
//                     </td>
//                     <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>{r.teamSize}</td>
//                     <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd", color: getPerformanceColor(r.avgAttendance), fontWeight: 600 }}>
//                       {r.avgAttendance}%
//                     </td>
//                     <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd" }}>{r.avgHours}h</td>
//                     <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd", color: getPerformanceColor(r.avgPerformance), fontWeight: 600 }}>
//                       {r.avgPerformance}%
//                     </td>
//                     <td style={{ padding: 12, textAlign: "center", border: "1px solid #ddd", color: getPerformanceColor(r.avgProductivity), fontWeight: 600 }}>
//                       {r.avgProductivity}%
//                     </td>
//                   </tr>
//                   {expanded[r.teamLeadEmail] && (
//                     <tr>
//                       <td colSpan={7} style={{ padding: 0, background: "#fafafa", border: "1px solid #ddd" }}>
//                         <div style={{ padding: 12 }}>
//                           <h4 style={{ marginTop: 0, marginBottom: 8 }}>Members</h4>
//                           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                             <thead>
//                               <tr style={{ background: "#f9fafb" }}>
//                                 <th style={{ padding: 8, textAlign: "left", border: "1px solid #e5e7eb" }}>Employee</th>
//                                 <th style={{ padding: 8, textAlign: "left", border: "1px solid #e5e7eb" }}>Department</th>
//                                 <th style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>Attendance</th>
//                                 <th style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>Avg Hours</th>
//                                 <th style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>Performance</th>
//                                 <th style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>Productivity</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {r.members.map((m) => (
//                                 <tr key={m.email}>
//                                   <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
//                                     <strong>{m.name}</strong>
//                                     <div style={{ color: "#6b7280", fontSize: 12 }}>{m.email}</div>
//                                   </td>
//                                   <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>{m.department}</td>
//                                   <td style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb", color: getPerformanceColor(m.metrics?.attendanceRate || 0), fontWeight: 600 }}>
//                                     {m.metrics?.attendanceRate || 0}%
//                                   </td>
//                                   <td style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb" }}>{m.metrics?.avgHours || 0}h</td>
//                                   <td style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb", color: getPerformanceColor(m.performanceScore || 0), fontWeight: 600 }}>
//                                     {m.performanceScore || 0}%
//                                   </td>
//                                   <td style={{ padding: 8, textAlign: "center", border: "1px solid #e5e7eb", color: getPerformanceColor(m.productivity || 0), fontWeight: 600 }}>
//                                     {m.productivity || 0}%
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
