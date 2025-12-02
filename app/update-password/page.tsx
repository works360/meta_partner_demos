// app/update-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../Components/navbar";
import { Footer } from "../Components/footer";

export default function UpdatePassword() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const validateForm = () => {
    let valid = true;
    setPasswordError("");
    setConfirmError("");

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    if (!confirm) {
      setConfirmError("Confirm Password is required");
      valid = false;
    } else if (password !== confirm) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!token) {
      setStatus({ type: "error", msg: "Invalid or missing reset token." });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          msg: "Your password has been updated successfully. Redirecting to login...",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setStatus({ type: "error", msg: data.error || "Error updating password." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          backgroundImage:
            "url('https://orange-sardine-913553.hostingersite.com/assets/images/loginimage.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
      >
        {/* gradient overlay */}
        <div
          style={{
            content: '""',
            position: "fixed",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.88) 55%, rgba(255,255,255,.40) 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <main
          className="page"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            padding: "60px 0",
          }}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-3" />
              <div className="col-md-6 login-page">
                <div
                  className="formcard"
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    padding: "30px 30px 40px",
                    boxShadow: "0 4px 18px rgba(15,23,42,0.08)",
                    maxWidth: "400px",
                    margin: "0 auto",
                  }}
                >
                  {status && (
                    <div
                      className={`alert text-center ${
                        status.type === "success" ? "alert-success" : "alert-danger"
                      }`}
                      role="alert"
                      style={{ marginBottom: "20px" }}
                    >
                      {status.msg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} id="UpdatePasswordForm">
                    <h1
                      style={{
                        textAlign: "center",
                        fontSize: "22px",
                        marginBottom: "20px",
                      }}
                    >
                      Update Password
                    </h1>

                    <div className="form-group" style={{ marginBottom: "15px" }}>
                      <label className="form-label" style={{ fontSize: "12px" }}>
                        New Password
                      </label>
                      <input
                        name="pass"
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          borderRadius: "10px",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                        }}
                      />
                      {passwordError && (
                        <span className="error" id="passwordError" style={{ color: "red", fontSize: "12px" }}>
                          {passwordError}
                        </span>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: "15px" }}>
                      <label className="form-label" style={{ fontSize: "12px" }}>
                        Confirm Password
                      </label>
                      <input
                        name="cpas"
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        style={{
                          borderRadius: "10px",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                        }}
                      />
                      {confirmError && (
                        <span
                          className="error"
                          id="confirmPasswordError"
                          style={{ color: "red", fontSize: "12px" }}
                        >
                          {confirmError}
                        </span>
                      )}
                    </div>

                    <div className="submit" style={{ textAlign: "center", marginTop: "30px" }}>
                      <button
                        type="submit"
                        name="submit"
                        className="btn btn-primary d-grid"
                        disabled={loading}
                        style={{
                          width: "50%",
                          backgroundColor: "#1463FF",
                          border: "none",
                          borderRadius: "50px",
                          fontWeight: 700,
                          padding: "8px",
                        }}
                      >
                        {loading ? "Updating..." : "Submit"}
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-dark mb-0" style={{ fontSize: "15px" }}>
                        Forgot It?
                        <a className="text-primary ms-1" href="/login">
                          Send me Back
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-md-3" />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
