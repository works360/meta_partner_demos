"use client";

import { useState, useEffect, useRef } from "react";
import "./page.css";

interface AppCard {
  id: number;
  name: string;
  category: "Online Apps" | "Offline Apps";
  usecase: string;  // <-- IMPORTANT
  image: string;
  link?: string;
}

export default function AllAppsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  // FILTER BY (Dropdown)
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  // TOGGLE BUTTONS
  const [selectedToggle, setSelectedToggle] = useState<
    "All" | "Pre-Packaged" | "Managed"
  >("All");

  const [apps, setApps] = useState<AppCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load apps from API
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const offlineData = await fetch("/api/getOfflineApps", { cache: "no-store" }).then(r => r.json());
        const onlineData = await fetch("/api/getOnlineApps", { cache: "no-store" }).then(r => r.json());
        setApps([...offlineData, ...onlineData]);
      } catch (err) {
        console.error("Failed to load apps", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, []);

  // FILTER LOGIC
  const filteredApps = apps.filter(app => {
  // DROPDOWN FILTER
  if (selectedFilter === "online" && app.category !== "Online Apps") return false;
  if (selectedFilter === "offline" && app.category !== "Offline Apps") return false;

  // TOGGLE FILTER — ONLY APPLY WHEN selectedFilter = "all"
  if (selectedFilter === "all") {
    if (selectedToggle === "Pre-Packaged" && app.category !== "Offline Apps") return false;
    if (selectedToggle === "Managed" && app.category !== "Online Apps") return false;
  }

  return true;
});

  // DYNAMIC USECASE BASED ON FILTERED RESULTS
  const selectedUsecase = filteredApps[0]?.usecase || "Usecase";

  return (
    <main>
      <header className="page-header mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Apps</h1>
      </header>

      <p className="apps-description">
        Explore the education applications of mixed reality with Meta and discover opportunities to boost innovation.
      </p>

      <div className="container all-apps-section">

        <div className="apps-top-row">
          
          {/* LEFT SIDE — FILTER DROPDOWN */}
          <div className="apps-filter-row" ref={dropdownRef}>
            <label className="filter-label">FILTER BY:</label>

            <div className="filter-dropdown-wrapper">
              <button className="filter-dropdown" onClick={() => setFilterOpen(!filterOpen)}>
                {selectedUsecase}
                <span className="arrow">▾</span>
              </button>

              {filterOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => { setSelectedFilter("all"); setFilterOpen(false); }}>
                    Show all
                  </button>
                  <button onClick={() => { setSelectedFilter("online"); setFilterOpen(false); }}>
                    Online apps
                  </button>
                  <button onClick={() => { setSelectedFilter("offline"); setFilterOpen(false); }}>
                    Offline apps
                  </button>
                </div>
              )}
            </div>

            <button
                  className="clear-all-btn"
                  onClick={() => {
                    setSelectedFilter("all");
                    setSelectedToggle("All");   // <-- ADD THIS
                  }}
                >
                  Clear all
                </button>
          </div>

          {/* RIGHT SIDE — TOGGLE BUTTONS */}
          <div className="apps-toggle-wrapper">
            <button
              className={`toggle-btn-hide ${selectedToggle === "All" ? "active" : ""}`}
              onClick={() => setSelectedToggle("All")}
            >
              All Apps
            </button>

            <button
              className={`toggle-btn ${selectedToggle === "Pre-Packaged" ? "active" : ""}`}
              onClick={() => setSelectedToggle("Pre-Packaged")}
            >
              Pre-Packaged App Demos
            </button>

            <button
              className={`toggle-btn ${selectedToggle === "Managed" ? "active" : ""}`}
              onClick={() => setSelectedToggle("Managed")}
            >
              Managed App Store Demos
            </button>
          </div>
        </div>

        {/* APPS GRID */}
        <div className="apps-grid">
          {isLoading && <p>Loading apps...</p>}

          {!isLoading &&
            filteredApps.map(app => (
              <div
                className="app-page-card"
                onClick={() => app.link && window.open(app.link, "_blank")}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={app.image || "https://placehold.co/400x200?text=No+Image"}
                  className="app-card-image"
                  alt={app.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x200?text=No+Image";
                  }}
                />
                <div className="app-card-info">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-category">Apps • {app.category}</p>
                  <a
                className="hover-underline-animation left"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // <-- Prevent selecting headset
                style={{
                  color: "#0066ff",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                <img src="/Arrow.png" alt="arrow" style={{ width: "1.6rem", height: "auto" }} />
                <span className="underline-text">Learn More</span>
                 </a>
             
                </div>
                </div>
            ))}
        </div>
        

      </div>
    </main>
  );
}
