import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";


export default function Quality() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>✅ Quality Metrics</h2>
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
            We are building rich Quality analytics with targets, trends and insights.
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
// export default function Quality() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [qualityData, setQualityData] = useState({
//     overallScore: 92,
//     accuracy: 95,
//     completeness: 88,
//     timeliness: 94,
//     monthlyTarget: 90
//   });

//   const displayName =
//     currentUser?.name?.trim() ||
//     (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

//   return (
//     <div className="dashboard fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h2>✅ Quality Metrics - {displayName}</h2>
//         <button 
//           className="btn btn-secondary"
//           onClick={() => navigate("/employee/mydesk")}
//         >
//           ← Back to My Desk
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <h3>🎯 Overall Score</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: qualityData.overallScore >= 90 ? '#28a745' : '#ffc107' }}>
//             {qualityData.overallScore}%
//           </div>
//           <p>Current quality rating</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>🎯 Accuracy</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
//             {qualityData.accuracy}%
//           </div>
//           <p>Work accuracy score</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>📝 Completeness</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
//             {qualityData.completeness}%
//           </div>
//           <p>Task completion rate</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>⏰ Timeliness</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
//             {qualityData.timeliness}%
//           </div>
//           <p>On-time delivery score</p>
//         </div>

//         <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
//           <h3>📊 Quality Breakdown</h3>
//           <div style={{ textAlign: 'left', padding: '10px' }}>
//             <div style={{ marginBottom: '10px' }}>
//               <strong>Monthly Target:</strong> {qualityData.monthlyTarget}%
//               <div style={{ 
//                 width: '100%', 
//                 backgroundColor: '#e0e0e0', 
//                 borderRadius: '5px', 
//                 height: '10px', 
//                 marginTop: '5px' 
//               }}>
//                 <div style={{ 
//                   width: `${(qualityData.overallScore / qualityData.monthlyTarget) * 100}%`, 
//                   backgroundColor: qualityData.overallScore >= qualityData.monthlyTarget ? '#28a745' : '#ffc107', 
//                   height: '100%', 
//                   borderRadius: '5px' 
//                 }}></div>
//               </div>
//             </div>
//             <p><strong>Status:</strong> {qualityData.overallScore >= qualityData.monthlyTarget ? 'Exceeding Target! 🌟' : 'Working towards target'}</p>
//             <p><strong>Improvement Area:</strong> {qualityData.completeness < 90 ? 'Focus on task completeness' : 'Maintain current standards'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
