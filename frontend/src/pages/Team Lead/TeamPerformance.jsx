import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/dashboardPath";
import "../../App.css";

const modules = [
  {
    id: 'performance',
    title: 'Performance Analytics',
    description: 'Track and analyze team performance metrics and KPIs',
    icon: '📊',
    path: '/teamlead/performance/analytics',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Manage team connections and RAG status',
    icon: '🤝',
    path: '/teamlead/connections',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
  }
];

export default function TeamPerformance() {
  const navigate = useNavigate();
  const { currentUser, users } = useAuth();
  const [searchParams] = useSearchParams();
  const leadEmailParam = String(searchParams.get('leadEmail') || '').toLowerCase().trim();

  const designation = String(currentUser?.designation || currentUser?.position || '').toLowerCase();
  const isHRBPFamily = designation.replace(/\s+/g, '').includes('hrbp');

  const selectedLead = leadEmailParam
    ? (users || []).find(u => String(u?.email || '').toLowerCase() === leadEmailParam)
    : null;
  const viewer = selectedLead || currentUser;

  const displayName =
    viewer?.name?.trim() ||
    ((viewer?.firstName || viewer?.lastName)
      ? `${viewer?.firstName || ''} ${viewer?.lastName || ''}`.trim()
      : (viewer?.email ? String(viewer.email).split("@")[0] : "Team Lead"));

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Team Performance - {displayName} 📈 </h2>
          {/* <p>Manage HR queries submitted by employees.</p> */}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>
      <div className="dashboard-grid">
        {modules.map((module) => (
          <div
            key={module.id}
            className="dashboard-card"
            role="button"
            tabIndex={0}
            onClick={() => {
              if (module.id === 'performance' && isHRBPFamily) {
                navigate('/hrbp/performance/analytics');
                return;
              }
              navigate(module.path);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (module.id === 'performance' && isHRBPFamily) {
                  navigate('/hrbp/performance/analytics');
                  return;
                }
                navigate(module.path);
              }
            }}
          >
            <h3>{module.icon} {module.title}</h3>
            <p>{module.description}</p>
          </div>
        ))}

        {isHRBPFamily ? (
          <div
            className="dashboard-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/hrbp/reports')}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate('/hrbp/reports');
              }
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.15) 100%)',
              border: '1px solid rgba(16,185,129,0.30)'
            }}
          >
            <h3>📋 HRMS</h3>
            {/* <p>Open HRBP metrics view (5 types of metrics).</p> */}
          </div>
        ) : null}

        {/* <div
          className="dashboard-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate(leadEmailParam ? '/hrbp/performance/analytics' : getDashboardPath(currentUser))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(leadEmailParam ? '/hrbp/performance/analytics' : getDashboardPath(currentUser));
            }
          }}
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <h3>🏠 Back to Home</h3>
          <p>Return to home.</p>
        </div> */}
      </div>
    </div>
  );
}