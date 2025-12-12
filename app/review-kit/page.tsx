"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Headset {
  id: string;
  name: string;
  image: string;
  sku?: string;
  product_sku?: string;
  sku_id?: string;
  quantity?: number;
}

interface App {
  id: string;
  name: string;
}

export default function ReviewKitPage() {
  const router = useRouter();

  const [headsets, setHeadsets] = useState<Headset[]>([]);
  const [offlineApps, setOfflineApps] = useState<App[]>([]);
  const [onlineApps, setOnlineApps] = useState<App[]>([]);
  const [loaded, setLoaded] = useState(false);

  // NEW — controls visibility of checkout button
  const [canCheckout, setCanCheckout] = useState(true);

  // ✅ VALID useEffect (not nested)
  
  useEffect(() => {
 const parseSafe = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // Ensure it is always an array
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

  const rawHeadsets = parseSafe("selectedHeadsets");

  // IMPORTANT: Add quantity always
  const hs = rawHeadsets.map((h: Headset) => ({
    ...h,
    quantity: h.quantity ?? 1,
  }));

  setHeadsets(hs);
  setOfflineApps(parseSafe("selectedOfflineApps"));
  setOnlineApps(parseSafe("selectedOnlineApps"));

  // Enable / disable checkout button
  setCanCheckout(hs.length > 0);
  setLoaded(true);
  console.log("Loaded headsets from localStorage:", hs);
}, []);


  // REMOVE HEADSET
  function removeHeadset(id: string) {
    const updated = headsets.filter((h) => h.id !== id);
    setHeadsets(updated);
    localStorage.setItem("selectedHeadsets", JSON.stringify(updated));

    // update checkout state
    setCanCheckout(updated.length > 0);
  }


// 🟦 Remove Offline App
function removeOfflineApp(id: string) {
  const updated = offlineApps.filter((a) => a.id !== id);
  setOfflineApps(updated);
  localStorage.setItem("selectedOfflineApps", JSON.stringify(updated));
}

// 🟦 Remove Online App
function removeOnlineApp(id: string) {
  const updated = onlineApps.filter((a) => a.id !== id);
  setOnlineApps(updated);
  localStorage.setItem("selectedOnlineApps", JSON.stringify(updated));
}

function updateHeadsetQty(id: string, qty: number) {
  const updated = headsets.map(h =>
    h.id === id ? { ...h, quantity: qty } : h
  );

  console.log("Before Update:", headsets);
  console.log("After Update:", updated);

  setHeadsets(updated);

  // VERY IMPORTANT: Save EXACT object back into localStorage
  localStorage.setItem("selectedHeadsets", JSON.stringify(updated));
}

  return (
    <div className="app-demos-page p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Review Order
          </h1>
        </div>

        {/* Progress Stepper */}
        <div className="stepper-container">
        <div className="stepper-buttons">
          <button className="stepper-nav-btn" onClick={() => window.history.back()}>
            <img src="/back-arrow.png" alt="Back" width={18} /> Back
          </button>
          {/* <button
            className="stepper-nav-btn flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={handleNext} >
            Next <img src="/arrow.png" alt="Next" width={18} />
          </button> */}
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
      </div>

      {/* Main Content */}
      <div
        className="max-w-6xl mx-auto"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "3rem",
          marginBottom: "3rem",
        }}
      >
        {/* Left - Review Details */}
        <div
          className="flex-1"
          style={{
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "2rem",
            background: "#fff",
            width: "53rem",
          }}
        >
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
            You can add a maximum of (2) of each type of headset.
          </p>

          {headsets.length > 0 ? (
              headsets.map((headset) => {
                const skuValue = headset.sku || "Not available";

                return (
                  <div
                    key={headset.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "1.2rem",
                      marginBottom: "1.2rem",
                      position: "relative",
                    }}
                  >
                    <img
                      src={headset.image}
                      alt={headset.name}
                      style={{
                        width: "160px",
                        height: "130px",
                        objectFit: "contain",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          color: "#222",
                        }}
                      >
                        {headset.name}
                      </h3>

                      <p style={{ color: "#777", fontSize: "0.9rem" }}>
                        SKU: {skuValue}
                      </p>

                      {/* Quantity + Delete Basket Icon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginTop: "0.3rem",
                        }}
                      >
                        <input
                          type="number"
                          min={1}
                          max={2}
                          value={headset.quantity ?? 1}
                          onChange={(e) => updateHeadsetQty(headset.id, Number(e.target.value))}
                          style={{
                            width: "50px",
                            textAlign: "center",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            padding: "5px 0",
                          }}
                        />

                        {/* Delete Basket Icon */}
                        <svg
                          onClick={() => removeHeadset(headset.id)}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#888"
                          viewBox="0 0 24 24"
                          style={{ cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.fill = "#e63946")}
                          onMouseLeave={(e) => (e.currentTarget.style.fill = "#888")}
                        >
                          <path d="M3 6h18M9 6V4h6v2m-8 4v10m4-10v10m4-10v10M5 6l1 14h12l1-14" />
                        </svg>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <p>No headsets selected.</p>
            )}

          {/* Pre-Packaged App Demos */}
          {offlineApps.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  marginBottom: "0.8rem",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                Pre-Packaged App Demos:
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {offlineApps.map((app) => (
                  <span
                    key={app.id}
                    style={{
                      padding: "5px 9px",
                      background: "rgb(244, 244, 244)",
                      borderRadius: "30px",
                      fontSize: "0.7rem",
                      border: "1px solid rgb(221, 221, 221)",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {app.name}
                    <button
  onClick={() => removeOfflineApp(app.id)}
  style={{ color: "#999", cursor: "pointer", border: "none", background: "transparent", fontSize: "0.9rem" }}
  title="Remove app"
>
  ✕
</button>

                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Managed App Store Demos */}
          {onlineApps.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  marginBottom: "0.8rem",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                Managed App Store Demos:
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {onlineApps.map((app) => (
                  <span
                    key={app.id}
                    style={{
                      padding: "5px 9px",
                      background: "rgb(244, 244, 244)",
                      borderRadius: "30px",
                      fontSize: "0.7rem",
                      border: "1px solid rgb(221, 221, 221)",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {app.name}
                    <button
  onClick={() => removeOnlineApp(app.id)}
  style={{ color: "#777", cursor: "pointer", border: "none", background: "transparent", fontSize: "0.9rem" }}
  title="Remove app"
>
  ✕
</button>

                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Again */}
          <button
  onClick={() => {
    localStorage.clear();
    window.location.href = "/create-kit";
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#0066ff";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.color = "#0066ff";
  }}
  style={{
    marginTop: "2rem",
    padding: "9px 24px",
    borderRadius: "30px",
    border: "1px solid #0066ff",
    background: "#fff",
    color: "#0066ff",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease", // ✅ smooth hover animation
  }}
>
  Start Again
</button>
        </div>

        {/* Right - Order Summary */}
        <div
          style={{
            width: "320px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "1.5rem",
            height: "fit-content",

          }}
        >
          <h3
            style={{
              fontWeight: 600,
              fontSize: "1.2rem",
              borderBottom: "2px solid #f1f3f5",
              paddingBottom: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Order Summary
          </h3>

          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Arrives within</span> <span>7 Days</span>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Carrier</span> <span>FedEx</span>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Shipment Method</span> <span>Next-Day</span>
          </p>

          {canCheckout ? (
                <button
                  onClick={() => (window.location.href = "/checkout")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#0066ff";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 102, 255, 0.2)";
                    e.currentTarget.style.border = "1px solid #0066ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#0066ff";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.border = "none";
                  }}
                  style={{
                    width: "100%",
                    background: "#0066ff",
                    color: "#fff",
                    padding: "10px 0",
                    borderRadius: "30px",
                    marginTop: "1rem",
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px dashed #f5b5b5",
                    background: "#fff5f5",
                    color: "#c53030",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Heads up!</strong> To proceed with your order, please select a headset first.
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
