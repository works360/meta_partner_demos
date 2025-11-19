"use client"

import { useState } from "react"
import Image from "next/image"

interface OrderItem {
  id: string
  name: string
  type: "headset" | "pre-packaged" | "managed"
  quantity?: number
  sku?: string
}

export default function OrderSummary() {
  // Mock data - in a real app, this would come from context, localStorage, or query params
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: "1",
      name: "Meta Quest 3",
      type: "headset",
      quantity: 1,
      sku: "899-00583-01",
    },
    { id: "pre-1", name: "Sentio VR", type: "pre-packaged" },
    { id: "pre-2", name: "Shapes XR", type: "pre-packaged" },
    { id: "pre-3", name: "Arthur One", type: "pre-packaged" },
    { id: "pre-4", name: "Nanome", type: "pre-packaged" },
    { id: "pre-5", name: "BadVR_AROC", type: "pre-packaged" },
    { id: "pre-6", name: "Caddy", type: "pre-packaged" },
    { id: "pre-7", name: "Resolve", type: "pre-packaged" },
    { id: "pre-8", name: "Fracture Reality", type: "pre-packaged" },
    { id: "pre-9", name: "ThingLink", type: "pre-packaged" },
    { id: "pre-10", name: "Inspirit", type: "pre-packaged" },
    { id: "man-1", name: "Altoura", type: "managed" },
  ])

  const headsets = orderItems.filter((item) => item.type === "headset")
  const prePackagedApps = orderItems.filter((item) => item.type === "pre-packaged")
  const managedApps = orderItems.filter((item) => item.type === "managed")

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id))
  }

  return (
    <div style={{ paddingTop: "55px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Gradient Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #e0f2ff 0%, #e0ffe0 100%)",
          padding: "0.5rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.1rem",
            fontWeight: "600",
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          Review Order
        </h1>
      </div>

      {/* Progress Stepper */}
      <div className="stepper-container">
        <div className="stepper-buttons">
          <button className="stepper-nav-btn">
            <i className="bi bi-chevron-left"></i>
            <a href="/managed-apps"> Back</a>
          </button>
          
        </div>

        <div className="stepper">
          <div className="step completed">
            <div className="step-circle">1</div>
            <div className="step-label">Pick Headset</div>
          </div>
          <div className="step-line completed"></div>
          <div className="step completed">
            <div className="step-circle">2</div>
            <div className="step-label">Select Apps</div>
          </div>
          <div className="step-line completed"></div>
          <div className="step active">
            <div className="step-circle">3</div>
            <div className="step-label">Review Order</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">4</div>
            <div className="step-label">Checkout</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Order Items Section */}
          <div>
            {/* Instruction Text */}
            <p
              style={{
                color: "#666",
                fontSize: "1rem",
                marginBottom: "2rem",
              }}
            >
              You can add a maximum of (2) of each type of headset.
            </p>

            <div>
            {/* Headsets Section */}
            {headsets.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "1rem",
                    borderBottom: "2px solid #efefefff",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Headset
                </h2>
                {headsets.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1.5rem",
                      padding: "1.5rem",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    {/* Product Image */}
                    <div
                      style={{
                        minWidth: "120px",
                        width: "120px",
                        height: "120px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src="/meta-quest-headset.jpg"
                        alt={item.name}
                        width={120}
                        height={120}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          margin: "0 0 0.5rem 0",
                        }}
                      >
                        {item.name}
                      </h3>
                      {item.sku && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#666",
                            margin: "0",
                          }}
                        >
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>

                    {/* Quantity and Delete */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          style={{
                            padding: "0.25rem 0.5rem",
                            border: "none",
                            backgroundColor: "#f0f0f0",
                            cursor: "pointer",
                            fontSize: "1rem",
                          }}
                        >
                          −
                        </button>
                        <div
                          style={{
                            padding: "0.25rem 0.75rem",
                            minWidth: "40px",
                            textAlign: "center",
                            borderLeft: "1px solid #ddd",
                            borderRight: "1px solid #ddd",
                          }}
                        >
                          {item.quantity}
                        </div>
                        <button
                          style={{
                            padding: "0.25rem 0.5rem",
                            border: "none",
                            backgroundColor: "#f0f0f0",
                            cursor: "pointer",
                            fontSize: "1rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pre-Packaged Apps Section */}
            {prePackagedApps.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "1rem",
                    borderBottom: "2px solid #efefefff",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Pre-Packaged App Demos:
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  {prePackagedApps.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => removeItem(item.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ddd",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        color: "#1a1a1a",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e8e8e8"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0"
                      }}
                    >
                      {item.name}
                      <span style={{ fontSize: "1.1rem", marginLeft: "0.25rem" }}>×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Managed Apps Section */}
            {managedApps.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "1rem",
                    borderBottom: "2px solid #efefefff",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Managed App Store Demos:
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  {managedApps.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => removeItem(item.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ddd",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        color: "#1a1a1a",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e8e8e8"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0"
                      }}
                    >
                      {item.name}
                      <span style={{ fontSize: "1.1rem", marginLeft: "0.25rem" }}>×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
</div>
            {/* Start Again Button */}
            <button
              onClick={() => (window.location.href = "/headset-selection")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                border: "2px solid #0064e0",
                color: "#0064e0",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              Start Again
            </button>
          </div>

          {/* Order Summary Sidebar */}
          <div
            style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "1.5rem",
              height: "fit-content",
              position: "sticky",
              top: "100px",
            }}
          >
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              Order Summary
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span style={{ color: "#666", fontSize: "0.95rem" }}>Arrives within</span>
              <span style={{ fontWeight: "600", color: "#1a1a1a" }}>7 Days</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span style={{ color: "#666", fontSize: "0.95rem" }}>Carrier:</span>
              <span style={{ fontWeight: "600", color: "#1a1a1a" }}>FedEx</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span style={{ color: "#666", fontSize: "0.95rem" }}>Shipment Method:</span>
              <span style={{ fontWeight: "600", color: "#1a1a1a" }}>Next-Day</span>
            </div>

            <button
              onClick={() => (window.location.href = "/checkout")}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "#0064e0",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="display: grid"][style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: flex"][style*="alignItems: flex-start"][style*="gap: 1.5rem"] {
            flex-direction: column;
          }
          
          div[style*="position: sticky"] {
            position: static !important;
            margin-top: 1rem;
          }

          h1 {
            font-size: 1.8rem !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="padding: 2rem"] {
            padding: 1rem !important;
          }

          h2[style*="fontSize: 1.3rem"] {
            font-size: 1.1rem !important;
          }

          div[style*="display: flex"][style*="flexWrap"] {
            gap: 0.5rem !important;
          }

          button[style*="display: inline-flex"] {
            font-size: 0.8rem !important;
            padding: 0.4rem 0.6rem !important;
          }
        }
      `}</style>
    </div>
  )
}
