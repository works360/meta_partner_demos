// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { Navbar } from "../Components/navbar";
import { Footer } from "../Components/footer";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          msg: "Your password reset email has been sent successfully! Please check your inbox.",
        });
      } else {
        setStatus({ type: "error", msg: data.error || "Something went wrong." });
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
            <div className="row align-items-center">
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

                  <form onSubmit={handleSubmit}>
                    <h1 style={{ textAlign: "center", fontSize: "22px", marginBottom: "10px" }}>
                      Reset Password
                    </h1>
                    <p
                      className="text-muted"
                      style={{
                        fontSize: "14px",
                        textAlign: "center",
                        marginBottom: "20px",
                      }}
                    >
                      To reset your password, please enter your email address or username below.
                    </p>

                    <div className="form-group" style={{ marginBottom: "20px" }}>
                      <input
                        name="emails"
                        type="email"
                        className="form-control"
                        placeholder="Enter Your Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          borderRadius: "10px",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>

                    <div className="submit" style={{ textAlign: "center", marginTop: "30px" }}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary d-grid"
                        style={{
                          width: "100%",
                          backgroundColor: "#1463FF",
                          border: "none",
                          borderRadius: "50px",
                          fontWeight: 700,
                          padding: "8px",
                        }}
                      >
                        {loading ? "Sending..." : "Submit"}
                      </button>
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
