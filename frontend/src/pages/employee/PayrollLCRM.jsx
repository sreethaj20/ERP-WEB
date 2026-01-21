// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import "../../App.css";

// export default function PayrollLCRM() {
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [payrollData, setPayrollData] = useState({
//     lastPayDate: "2024-09-01",
//     nextPayDate: "2024-10-01",
//     ytdEarnings: "₹4,50,000",
//     monthlyGross: "₹50,000",
//     monthlyNet: "₹42,500"
//   });

//   const displayName =
//     currentUser?.name?.trim() ||
//     (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

//   // Immediately redirect to Razorpay Payroll when this page is opened
//   useEffect(() => {
//     try {
//       window.location.assign("https://payroll.razorpay.com/login");
//     } catch {}
//   }, []);

//   const handlePayrollRedirect = () => {
//     window.open("https://payroll.razorpay.com/login", "_blank", "noopener");
//   };

//   return (
//     <div className="dashboard fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h2>💰 Payroll Services - {displayName}</h2>
//         <button 
//           className="btn btn-secondary"
//           onClick={() => navigate(-1)}
//         >
//           ← Back to ICRM
//         </button>
//       </div>

//       <div className="dashboard-grid">
//         {/* Payroll Summary */}
//         <div className="dashboard-card">
//           <h3>📊 Payroll Summary</h3>
//           <div style={{ textAlign: 'left' }}>
//             <p><strong>Last Pay Date:</strong> {payrollData.lastPayDate}</p>
//             <p><strong>Next Pay Date:</strong> {payrollData.nextPayDate}</p>
//             <p><strong>Monthly Gross:</strong> {payrollData.monthlyGross}</p>
//             <p><strong>Monthly Net:</strong> {payrollData.monthlyNet}</p>
//             <p><strong>YTD Earnings:</strong> {payrollData.ytdEarnings}</p>
//           </div>
//         </div>

//         {/* External Payroll System */}
//         <div className="dashboard-card">
//           <h3>🌐 External Payroll System</h3>
//           <p>Access the payroll management system powered by Razorpay.</p>
//           <button 
//             className="btn btn-primary"
//             onClick={handlePayrollRedirect}
//             style={{ marginTop: '10px', width: '100%' }}
//           >
//             🔗 Open Razorpay Payroll
//           </button>
//         </div>

//         {/* Quick Actions */}
//         <div className="dashboard-card">
//           <h3>⚡ Quick Actions</h3>
//           <div style={{ textAlign: 'left' }}>
//             <button 
//               className="btn btn-outline-primary"
//               style={{ width: '100%', marginBottom: '10px' }}
//               onClick={() => alert("Feature coming soon!")}
//             >
//               📄 Download Pay Slip
//             </button>
//             <button 
//               className="btn btn-outline-primary"
//               style={{ width: '100%', marginBottom: '10px' }}
//               onClick={() => alert("Feature coming soon!")}
//             >
//               📊 Tax Documents
//             </button>
//             <button 
//               className="btn btn-outline-primary"
//               style={{ width: '100%', marginBottom: '10px' }}
//               onClick={() => alert("Feature coming soon!")}
//             >
//               💳 Bank Details
//             </button>
//           </div>
//         </div>

//         {/* Payroll Support */}
//         <div className="dashboard-card">
//           <h3>🆘 Payroll Support</h3>
//           <div style={{ textAlign: 'left' }}>
//             <p><strong>Payroll Team:</strong> ext. 3000</p>
//             <p><strong>Email:</strong> payroll@company.com</p>
//             <p><strong>Support Hours:</strong> 9:00 AM - 5:00 PM</p>
//             <p><strong>Emergency:</strong> ext. 3911</p>
//           </div>
//         </div>

//         {/* Important Information */}
//         <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
//           <h3>ℹ️ Important Payroll Information</h3>
//           <div style={{ textAlign: 'left' }}>
//             <div style={{ 
//               backgroundColor: '#fff3cd', 
//               border: '1px solid #ffeaa7', 
//               borderRadius: '8px', 
//               padding: '15px',
//               marginBottom: '15px'
//             }}>
//               <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📅 Payroll Schedule</h4>
//               <ul style={{ paddingLeft: '20px', margin: 0 }}>
//                 <li>Salary processing: 25th of every month</li>
//                 <li>Salary credit: 1st of following month</li>
//                 <li>Pay slip generation: 2nd of following month</li>
//               </ul>
//             </div>
            
//             <div style={{ 
//               backgroundColor: '#d1ecf1', 
//               border: '1px solid #bee5eb', 
//               borderRadius: '8px', 
//               padding: '15px'
//             }}>
//               <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>🔗 External System Access</h4>
//               <p style={{ margin: 0 }}>
//                 For detailed payroll management, tax calculations, and comprehensive reports, 
//                 use our integrated Razorpay Payroll system. Click the "Open Razorpay Payroll" button 
//                 above to access the full-featured payroll platform.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function Payroll() {
  const navigate = useNavigate();
  useEffect(() => {
    // Open Razorpay Payroll in a new tab
    try {
      window.open("https://payroll.razorpay.com/login", "_blank", "noopener");
    } catch {}
  }, []);

  return (
    <div className="dashboard fade-in">
      <h2>Opening Payroll in a new tab…</h2>
      <p>If it didn't open, <a href="https://payroll.razorpay.com/login" target="_blank" rel="noreferrer">click here</a>.</p>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>← Back to Home</button>
      </div>
    </div>
  );
}

