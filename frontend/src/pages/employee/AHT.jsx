import { useNavigate } from "react-router-dom";
import "../../App.css";


export default function AHT() {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>⏱️ AHT (Average Handle Time)</h2>
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
            We are building rich AHT analytics with targets, trends and insights.
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
