import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function ForgotPassword() {
  const { users, resetPassword } = useAuth(); 
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const userExists = users.find((u) => u.email === email);

    if (!userExists) {
      setError("❌ No account found with this email.");
      setMessage("");
      return;
    }

    if (!newPassword) {
      setError("⚠️ Please enter a new password.");
      setMessage("");
      return;
    }

    // ✅ Update password via AuthContext
    const success = resetPassword(email, newPassword);

    if (success) {
      setMessage("✅ Password updated successfully! You can now log in.");
      setError("");
      setTimeout(() => navigate("/login"), 2000); 
    } else {
      setError("❌ Failed to update password. Try again.");
      setMessage("");
    }
  };

  return (
    <div className="auth-container fade-in">
      <h2>Forgot Password</h2>
      <p style={{ marginBottom: "10px", textAlign: "center" }}>
        Enter your email and set a new password.
      </p>

      {/* Success / Error messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
          <button type="submit" className="btn-primary">
            Reset Password
          </button>
        </div>
      </form>
    </div>
  );
}
