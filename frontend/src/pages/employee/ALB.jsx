import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function ALB() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>⚖️ ALB (Adherence to Line of Business)</h2>
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
            We are building rich ALB analytics with targets, trends and insights.
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
// export default function ALB() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [albData, setAlbData] = useState({
//     adherenceScore: 87,
//     targetAdherence: 85,
//     scheduledHours: 8,
//     actualHours: 7.8,
//     breakCompliance: 95,
//     loginCompliance: 92
//   });

//   const displayName =
//     currentUser?.name?.trim() ||
//     (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

//   return (
//     <div className="dashboard fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h2>⚖️ ALB (Adherence to Line of Business) - {displayName}</h2>
//         <button 
//           className="btn btn-secondary"
//           onClick={() => navigate("/employee/mydesk")}
//         >
//           ← Back to My Desk
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <h3>📊 Adherence Score</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: albData.adherenceScore >= albData.targetAdherence ? '#28a745' : '#ffc107' }}>
//             {albData.adherenceScore}%
//           </div>
//           <p>Overall adherence rating</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>🎯 Target</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
//             {albData.targetAdherence}%
//           </div>
//           <p>Required adherence level</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>⏰ Schedule Adherence</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
//             {Math.round((albData.actualHours / albData.scheduledHours) * 100)}%
//           </div>
//           <p>{albData.actualHours}h / {albData.scheduledHours}h</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>☕ Break Compliance</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: albData.breakCompliance >= 90 ? '#28a745' : '#ffc107' }}>
//             {albData.breakCompliance}%
//           </div>
//           <p>Break schedule adherence</p>
//         </div>

//         <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
//           <h3>📈 ALB Performance Summary</h3>
//           <div style={{ textAlign: 'left', padding: '10px' }}>
//             <div style={{ marginBottom: '15px' }}>
//               <strong>Adherence Progress:</strong>
//               <div style={{ 
//                 width: '100%', 
//                 backgroundColor: '#e0e0e0', 
//                 borderRadius: '5px', 
//                 height: '15px', 
//                 marginTop: '5px',
//                 position: 'relative'
//               }}>
//                 <div style={{ 
//                   width: `${(albData.adherenceScore / 100) * 100}%`, 
//                   backgroundColor: albData.adherenceScore >= albData.targetAdherence ? '#28a745' : '#ffc107', 
//                   height: '100%', 
//                   borderRadius: '5px' 
//                 }}></div>
//               </div>
//             </div>
//             <p><strong>Status:</strong> {albData.adherenceScore >= albData.targetAdherence ? 'Exceeding Target! 🌟' : 'Working towards target'}</p>
//             <p><strong>Login Compliance:</strong> {albData.loginCompliance}%</p>
//             <p><strong>Areas of Strength:</strong> {albData.breakCompliance >= 90 ? 'Break Management' : 'Schedule Adherence'}</p>
//             <p><strong>Focus Area:</strong> {albData.loginCompliance < 95 ? 'Login punctuality' : 'Maintain current performance'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
