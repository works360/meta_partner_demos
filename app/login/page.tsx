"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Navbar } from "../Components/navbar";
import { Footer } from "../Components/footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // ✅ Handle redirect after login (if user was redirected from proxy)
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save session in storage for client-side usage
        if (keepSignedIn) {
          localStorage.setItem("userEmail", email);
        } else {
          sessionStorage.setItem("userEmail", email);
        }

        // ✅ Redirect user back to intended page or /my-orders
     
        window.location.href = redirectPath || "/my-orders";
      } else {
        alert(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <Navbar />
      <div className="w-full position-relative login-center-container"
            style={{
              backgroundImage: "url('/bg-pov.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              justifyContent: "center",
              paddingLeft: 0,
              paddingRight: 0,
              width: "100vw",     // 👈 Forces full width
              marginLeft: "calc(50% - 50vw)", // 👈 Removes page side padding from Next.js layouts
            }}>
        <div className="row g-4 container">
          {/* Left Section - Welcome Content */}
          <div className="col-lg-6 col-md-12 d-flex flex-column justify-content-center" style={{ marginTop:"5rem", }}>
            <h1
              className="mb-4"
              style={{ fontSize: "1.9rem", fontWeight: "600", }}
            >
              Welcome,{" "}
              <span style={{ color: "#0066FF" }}>Meta</span> Elite & Premier
              Partners!
            </h1>

            <div className="mb-4">
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                Register on our{" "}
                <a
                  href="https://view-su2.highspot.com/viewer/78dd45d6490a4b2f7294515b1762ef2f"
                  style={{
                    color: "#0066FF",
                    textDecoration: "underline",
                    fontWeight: "700",
                  }}
                >
                  Partner Portal / Resource Centre
                </a>
              </p>
            </div>

            <div className="mb-4">
              <p style={{ fontSize: "1.1rem", lineHeight: "0" }}>
                Complete the Partner{" "}
                <a
                  href="https://meta.highspot.com/signin#/training/learner"
                  style={{
                    
                    color: "#0066FF",
                    textDecoration: "underline",
                    fontWeight: "700",
                  }}
                >
                  Meta Demo Certification Training
                </a>
              </p>
              <p>
                (a short 10-15 minute module) available on the Partner Portal
              </p>
            </div>

            <div>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "30px" }}>
                Once both steps are complete, please reach out to your Meta
                point of contact or{" "}
                <a
                  href="https://metapartnerdemos.com/support/"
                  style={{
                    color: "#0066FF",
                    textDecoration: "underline",
                    fontWeight: "700",
                  }}
                >
                  submit a request through our Support Page
                </a>
                . We'll verify your details and grant access promptly.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                Only users that have completed the{" "}
                <a
                  href="https://meta.highspot.com/signin#/training/learner"
                  style={{
                    color: "#0066FF",
                    textDecoration: "underline",
                    fontWeight: "700",
                  }}
                >
                  Meta Demo Certification Training
                </a>
                . are allowed to handle Meta demos.
              </p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="col-lg-6 col-md-12 d-flex justify-content-center">
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                marginTop:"3rem",
                width:"75%",

              }}
            >
              <h2
                className="mb-4"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Login
              </h2>

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="form-label"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      padding: "0.75rem",
                      fontSize: "1rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="form-label"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      padding: "0.75rem",
                      fontSize: "1rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                    required
                  />
                </div>

                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="keepSignedIn"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="keepSignedIn"
                    style={{ fontSize: "1rem", cursor: "pointer" }}
                  >
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn w-100 mb-3"
                  style={{
                    backgroundColor: "#0066FF",
                    color: "white",
                    padding: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>

                <div style={{ textAlign: "center" }}>
                  <a
                    href="#"
                    style={{
                      color: "#999",
                      textDecoration: "none",
                      fontSize: "1rem",
                    }}
                  >
                    Forgot your password?
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
