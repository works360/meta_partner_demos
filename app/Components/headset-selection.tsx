"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Headset {
  id: number
  name: string
  image: string
  specs: string
  category?: string
}

export default function HeadsetSelection() {
  const [headsets, setHeadsets] = useState<Headset[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // --- Fetch headsets from API ---
  useEffect(() => {
    const fetchHeadsets = async () => {
      try {
        const res = await fetch("/api/getHeadsets", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch headsets")
        const data = await res.json()
        setHeadsets(data)
      } catch (err) {
        console.error("API Fetch Error:", err)
        setFetchError("Failed to load headsets from database.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHeadsets()
  }, [])

  const toggleSelect = (id: number) => {
    setError(false)
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError(true)
      return
    }

    const selectedHeadsets = headsets.filter((h) => selected.includes(h.id))
    localStorage.setItem("selectedHeadsets", JSON.stringify(selectedHeadsets))
    window.location.href = "/pre-package-apps"
  }

  return (
    <div style={{ paddingTop: "55px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "linear-gradient(to right, #fff3f7, #e0f0ff, #edfff9)",
          padding: "0.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.1rem", fontWeight: "500", color: "#1a1a1a", margin: 0 }}>
          Headset
        </h1>
      </div>

      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-buttons">
          <button className="stepper-nav-btn" onClick={() => window.history.back()} style={{visibility:"hidden"}}>
            <img src="/back-arrow.png" alt="Back" width={18} /> Back
          </button>
          <button className="stepper-nav-btn" onClick={handleNext}>
            Next <img src="/Arrow.png" alt="Next" width={18} />
          </button>
        </div>
        <div className="stepper">
          <div className="step active">
            <div className="step-circle">1</div>
            <div className="step-label">Pick Headset</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle">2</div>
            <div className="step-label">Select Apps</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
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

      <p style={{ textAlign: "center", color: "#666", fontSize: "1rem", padding: "0 2rem" }}>
        Pick type of headset for your demo. You may pick one or both.
      </p>

      {error && (
        <p style={{ textAlign: "center", color: "red", fontWeight: 500, marginTop: "0.5rem" }}>
          Please select at least one headset to continue.
        </p>
      )}

      {isLoading && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "1rem" }}>Loading headsets...</p>
      )}

      {fetchError && (
        <p style={{ textAlign: "center", color: "red", marginTop: "1rem" }}>{fetchError}</p>
      )}

      {/* Headset cards */}
      {!isLoading && !fetchError && (
        <div style={{ flex: 1, padding: "0 2rem", margin: "1.25rem 0 3rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            {headsets.map((headset, index) => {
              const isSelected = selected.includes(headset.id)
              const isLast = index === headsets.length - 1
              return (
                <div key={headset.id} style={{ display: "flex", alignItems: "stretch" }}>
                  <div
                    onClick={() => toggleSelect(headset.id)}
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "all .25s ease",
                      maxWidth: "650px",
                      width: "100%",
                      padding: "1rem",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: "13px",
                        left: "13px",
                        width: "33px",
                        height: "33px",
                        borderRadius: "50%",
                        border: isSelected ? "2px solid #0064e0" : "2px solid #cfcfcf",
                        background: isSelected ? "#0064e0" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .25s ease",
                      }}
                    >
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.285 2.859l-11.85 11.859-4.715-4.718-2.285 2.285 7 7 14-14z" />
                        </svg>
                      )}
                    </span>

                    <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                      <Image
                        src={headset.image}
                        alt={headset.name}
                        width={650}
                        height={650}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1a1a1a", marginBottom: "1rem" }}>
                      {headset.name}
                    </h3>

                    <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem", flex: 1 }}>
                      {headset.specs}
                    </p>

               <a className="hover-underline-animation left" 
                  href={`/single-product?id=${headset.id}`}
                  style={{
                    color: "#0066ff",
                    textDecoration: "none",
                    fontWeight: "500",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    }}>
                    Learn More <img src="/Arrow.png" alt="arrow" style={{ width: "2rem", height: "auto" }} />
                </a>
                  </div>
                  
                  {/* Divider */}
                  {!isLast && (
                    <div
                      style={{
                        width: "1px",
                        backgroundColor: "#ddd",
                        margin: "0 2rem",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

        </div>
      )}
    </div>
  )
}
