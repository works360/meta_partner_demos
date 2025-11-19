"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch("/api/logout", { method: "GET" });
        localStorage.removeItem("userEmail");
        sessionStorage.removeItem("userEmail");
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };
    doLogout();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        color: "#333",
      }}
    >
      Logging you out...
    </div>
  );
}
