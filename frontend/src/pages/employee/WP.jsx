import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";


export default function WP() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>📋 WP (Work Plan)</h2>
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
            We are building rich WP analytics with targets, trends and insights.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/employee/mydesk")}
              style={{ padding: "10px 16px", borderRadius: 8 }}
            >
              Back to My Desk
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


// export default function WP() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [wpData, setWpData] = useState({
//     planAdherence: 89,
//     targetAdherence: 85,
//     tasksCompleted: 12,
//     totalTasks: 15,
//     scheduledBreaks: 3,
//     takenBreaks: 3,
//     productiveHours: 6.5,
//     plannedHours: 7.0
//   });

//   const displayName =
//     currentUser?.name?.trim() ||
//     (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

//   return (
//     <div className="dashboard fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h2>📋 WP (Work Plan) - {displayName}</h2>
//         <button 
//           className="btn btn-secondary"
//           onClick={() => navigate("/employee/mydesk")}
//         >
//           ← Back to My Desk
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <h3>📊 Plan Adherence</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: wpData.planAdherence >= wpData.targetAdherence ? '#28a745' : '#ffc107' }}>
//             {wpData.planAdherence}%
//           </div>
//           <p>Work plan compliance</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>✅ Tasks Progress</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
//             {wpData.tasksCompleted}/{wpData.totalTasks}
//           </div>
//           <p>{Math.round((wpData.tasksCompleted / wpData.totalTasks) * 100)}% completed</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>☕ Break Schedule</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: wpData.takenBreaks === wpData.scheduledBreaks ? '#28a745' : '#ffc107' }}>
//             {wpData.takenBreaks}/{wpData.scheduledBreaks}
//           </div>
//           <p>Breaks taken as planned</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>⏰ Productive Hours</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
//             {wpData.productiveHours}h
//           </div>
//           <p>Out of {wpData.plannedHours}h planned</p>
//         </div>

//         <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
//           <h3>📈 Work Plan Analysis</h3>
//           <div style={{ textAlign: 'left', padding: '10px' }}>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Daily Progress:</strong>
//               <div style={{ 
//                 width: '100%', 
//                 backgroundColor: '#e0e0e0', 
//                 borderRadius: '5px', 
//                 height: '15px', 
//                 marginTop: '5px',
//                 position: 'relative'
//               }}>
//                 <div style={{ 
//                   width: `${(wpData.tasksCompleted / wpData.totalTasks) * 100}%`, 
//                   backgroundColor: wpData.tasksCompleted >= wpData.totalTasks * 0.8 ? '#28a745' : '#ffc107', 
//                   height: '100%', 
//                   borderRadius: '5px' 
//                 }}></div>
//               </div>
//             </div>
//             <p><strong>Status:</strong> {wpData.planAdherence >= wpData.targetAdherence ? 'On Track! 🎯' : 'Needs adjustment'}</p>
//             <p><strong>Efficiency:</strong> {Math.round((wpData.productiveHours / wpData.plannedHours) * 100)}% of planned hours</p>
//             <p><strong>Remaining Tasks:</strong> {wpData.totalTasks - wpData.tasksCompleted} tasks pending</p>
//             <p><strong>Break Management:</strong> {wpData.takenBreaks === wpData.scheduledBreaks ? 'Perfect adherence ✨' : 'Adjust break timing'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
