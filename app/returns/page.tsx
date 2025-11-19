"use client";
import "./returns.css";
import ReturnsForm from "./ReturnsForm";

export default function ReturnsPage() {
  return (
    <div className="returns-container">
      <div
        style={{
          width: "100%",
          background: "linear-gradient(to right, #fff3f7, #e0f0ff, #edfff9)",
          textAlign: "center",
          padding: "4rem 0 0.7rem 0",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2.1rem", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>Returns</h1>
      </div>
      <div className="container" style={{
          maxWidth:"1140px",
          border:"1px solid #e1e1e1",
          padding:"20px 20px 30px 20px",
          borderRadius:"10px",


        }}>
        
        <ReturnsForm />
      </div>
     
    </div>
  );
}
