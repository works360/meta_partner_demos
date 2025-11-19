"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    if (form.new_password !== form.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match." })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")

      setMessage({ type: "success", text: data.message })
      setForm({ current_password: "", new_password: "", confirm_password: "" })
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="password-page">
      <div className="overlay"></div>
      <div className="form-card">
        <h2 className="title">Change Password</h2>

        {message.text && (
          <div
            className={`alert ${
              message.type === "error" ? "alert-danger" : "alert-success"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="current_password"
              className="form-control"
              value={form.current_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="new_password"
              className="form-control"
              value={form.new_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              className="form-control"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .password-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url("https://orange-sardine-913553.hostingersite.com/assets/images/loginimage.png")
            center/cover no-repeat;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(2px);
        }

        .form-card {
          position: relative;
          z-index: 1;
          background: white;
          padding: 40px;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          text-align: left;
        }

        .title {
          text-align: center;
          font-weight: 700;
          font-size: 24px;
          margin-bottom: 24px;
          color: #111827;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-control {
          border-radius: 8px;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          font-size: 15px;
        }

        .btn-primary {
          background-color: #006eff;
          border: none;
          border-radius: 25px;
          padding: 10px 0;
          font-weight: 600;
          font-size: 15px;
          margin-top: 10px;
        }

        .btn-primary:hover {
          background-color: #0058d4;
        }

        .alert {
          font-size: 14px;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }

        .alert-danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .alert-success {
          background: #dcfce7;
          color: #166534;
        }
      `}</style>
    </div>
  )
}
