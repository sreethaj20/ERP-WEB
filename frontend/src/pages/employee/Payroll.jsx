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
