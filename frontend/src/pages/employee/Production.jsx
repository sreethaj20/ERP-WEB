import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";


export default function Production() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>🏭 Production Metrics</h2>
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
            We are building rich Production analytics with targets, trends and insights.
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
// export default function Production() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [productionData, setProductionData] = useState({
//     dailyTarget: 50,
//     completed: 38,
//     pending: 12,
//     efficiency: 76
//   });

//   const displayName =
//     currentUser?.name?.trim() ||
//     (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

//   return (
//     <div className="dashboard fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h2>🏭 Production Metrics - {displayName}</h2>
//         <button 
//           className="btn btn-secondary"
//           onClick={() => navigate("/employee/mydesk")}
//         >
//           ← Back to My Desk
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         <div className="dashboard-card">
//           <h3>📊 Daily Target</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
//             {productionData.dailyTarget}
//           </div>
//           <p>Units to complete today</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>✅ Completed</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
//             {productionData.completed}
//           </div>
//           <p>Units completed today</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>⏳ Pending</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
//             {productionData.pending}
//           </div>
//           <p>Units remaining</p>
//         </div>

//         <div className="dashboard-card">
//           <h3>📈 Efficiency</h3>
//           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: productionData.efficiency >= 80 ? '#28a745' : '#ffc107' }}>
//             {productionData.efficiency}%
//           </div>
//           <p>Current efficiency rate</p>
//         </div>

//         <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
//           <h3>📋 Production Summary</h3>
//           <div style={{ textAlign: 'left', padding: '10px' }}>
//             <p><strong>Progress:</strong> {Math.round((productionData.completed / productionData.dailyTarget) * 100)}% of daily target</p>
//             <p><strong>Status:</strong> {productionData.completed >= productionData.dailyTarget ? 'Target Achieved! 🎉' : 'In Progress'}</p>
//             <p><strong>Estimated Completion:</strong> {productionData.pending > 0 ? '2:30 PM' : 'Completed'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
