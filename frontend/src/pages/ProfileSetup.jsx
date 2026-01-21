import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/dashboardPath";
import "../App.css";

export default function ProfileSetup() {
  const { updateProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: currentUser?.username || "",
    address: "",
    phone: "",
    department: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    alert("✅ Profile setup completed!");
    navigate(getDashboardPath({ ...(currentUser || {}), ...formData }));
  };

  return (
    <div
      className="auth-background fade-in"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="auth-container"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "30px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Complete Your Profile
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label style={{ textAlign: "left", display: "block" }}>First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label style={{ textAlign: "left", display: "block" }}>Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label style={{ textAlign: "left", display: "block" }}>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label style={{ textAlign: "left", display: "block" }}>Address</label>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <label style={{ textAlign: "left", display: "block" }}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label style={{ textAlign: "left", display: "block" }}>Department</label>
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />

          <div className="form-actions" style={{ marginTop: "15px" }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
