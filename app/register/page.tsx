"use client";
import React, { useState } from "react";
import { Navbar } from "../Components/navbar";
import { Footer } from "../Components/footer";

export default function Register() {
  const [salesExecutive, setSalesExecutive] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reseller, setReseller] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword, reseller, salesExecutive }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Registration successful!");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-10 position-relative"
      style={{
    marginTop: "3rem",
    paddingBottom: "3rem",
    backgroundImage: "url('/bg-pov.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }} >
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6" style={{
              marginTop: "3rem",
              paddingBottom: "3rem",
            }} >
            <div
              style={{
                backgroundColor: "white",
                padding: "3rem",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 className="mb-4 text-center" style={{ fontWeight: 600 }}>
                Create Account
              </h2>

              {error && <div className="alert alert-danger text-center">{error}</div>}
              {message && <div className="alert alert-success text-center">{message}</div>}

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="salesExecutive" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="salesExecutive"
                    value={salesExecutive}
                    onChange={(e) => setSalesExecutive(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email (username)
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="reseller" className="form-label">
                    Reseller
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="reseller"
                    value={reseller}
                    onChange={(e) => setReseller(e.target.value)}
                    placeholder="e.g., CDW"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  style={{
                    backgroundColor: "#1463FF",
                    border: "none",
                    borderRadius: "50px",
                    fontWeight: 700,
                    padding: "12px",
                  }}
                >
                  Create Account
                </button>

                <div className="text-center mt-3">
                  <a href="/login" style={{ textDecoration: "none", color: "#1463FF" }}>
                    Back to login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
