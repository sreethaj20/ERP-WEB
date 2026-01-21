import React, { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function DemoHistory() {
  const { currentUser } = useAuth();

  const myRequests = useMemo(() => {
    const raw = JSON.parse(localStorage.getItem("erpDemoRequests") || "[]");
    if (!currentUser) return [];
    // match by email (primary) or fallback username if present in payload
    return raw
      .filter((r) => {
        if (!r) return false;
        const byEmail = r.email && r.email === currentUser.email;
        const byUserObj =
          r.byUser &&
          (r.byUser.email === currentUser.email ||
            r.byUser.username === currentUser.username);
        return byEmail || byUserObj;
      })
      .sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)));
  }, [currentUser]);

  return (
    <div className="dashboard fade-in">
      <h2>🗓️ Demo History</h2>
      <p>Review your previous demo requests and their current status.</p>

      <div style={{ marginTop: 16 }}>
        {myRequests.length === 0 ? (
          <div className="dashboard-card">
            <p>No demo requests yet. Use <strong>Book a Demo</strong> on the Home page to create one.</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.company}</td>
                  <td>{r.phone}</td>
                  <td style={{ maxWidth: 350, whiteSpace: "pre-wrap" }}>{r.message}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background:
                          r.status === "Done"
                            ? "#dcfce7"
                            : r.status === "Scheduled"
                            ? "#fef9c3"
                            : r.status === "Contacted"
                            ? "#e0e7ff"
                            : "#f3f4f6",
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
