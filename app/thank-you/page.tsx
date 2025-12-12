"use client";
import { useEffect, useState } from "react";

interface OrderData {
  orderId: string;
  orderDate: string;
  headsets: string[];
  onlineApps: string[];
  offlineApps: string[];
}

export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("orderConfirmation");
    if (saved) setOrder(JSON.parse(saved));
  }, []);

  if (!order)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        No order found. Please go back to checkout.
      </div>
    );

  const { orderId, orderDate, headsets, onlineApps, offlineApps } = order;
  const formatList = (arr?: any[]) =>
  arr && arr.length
    ? arr
        .map((item) =>
          typeof item === "object"
            ? `${item.name || item.product_name || "Unnamed"}${item.qty ? ` (x${item.qty})` : ""}`
            : item
        )
        .join(", ")
    : "None";

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        backgroundImage: "url('/assets/images/BG Image 1.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        minHeight: "100vh",
        margin: 0,
      }}
    >
      <div
        style={{
          maxWidth: "70rem",
          margin: "145px auto",
          padding: "40px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 0 30px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ marginTop: "-80px", marginBottom: "16px" }}>
          <img
            src="./success.webp"
            alt="Success"
            style={{ width: "80px", height: "80px" }}
          />
        </div>

        <h1 style={{ marginBottom: "20px", fontWeight: 600, fontSize: "1.6rem" }}>
          Order Submitted
        </h1>

        <div
          style={{
            textAlign: "left",
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ width: "25%", textAlign: "center" }}>
            <strong>Order No#</strong>
            <p>{orderId}</p>
          </div>

          <div style={{ width: "50%", textAlign: "center" }}>
            <div>
              <strong>Order Details:</strong>
              <br />
              {formatList(headsets)}
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>Pre-Packaged App Demos:</strong>
              <br />
              {formatList(offlineApps)}
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>Managed App Store Demos:</strong>
              <br />
              {formatList(onlineApps)}
            </div>
          </div>

          <div style={{ width: "25%", textAlign: "center" }}>
            <strong>Date</strong>
            <p>{orderDate}</p>
          </div>
        </div>

        <p style={{ marginTop: "20px", fontSize: "0.95rem" }}>
          Track order details on{" "}
          <a
            href="/my-orders"
            target="blank"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            My Orders
          </a>
        </p>
      </div>
    </div>
  );
}
