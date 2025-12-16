"use client";

import { useState, useEffect, useRef } from "react";
import "./page.css";

interface AppCard {
  id: number;
  name: string;
  category: "Online Apps" | "Offline Apps";
  usecase: string;
  image: string;
  link?: string;
}

export default function AllAppsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  const [selectedUsecaseFilter, setSelectedUsecaseFilter] = useState<string>("all");

  const [selectedToggle, setSelectedToggle] = useState<
  "All" | "Pre-Packaged" | "Managed"
>("Pre-Packaged");

  const [apps, setApps] = useState<AppCard[]>([]);
  const [usecases, setUsecases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FIX: ref ONLY around dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalize = (value: string | undefined | null) =>
    (value || "").trim().toLowerCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load apps + DB usecases
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const offline = await fetch("/api/getOfflineApps", {
          cache: "no-store",
        }).then((r) => r.json());

        const online = await fetch("/api/getOnlineApps", {
          cache: "no-store",
        }).then((r) => r.json());

        setApps([...offline, ...online]);
      } catch (err) {
        console.error("Failed to load apps", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsecases = async () => {
      try {
        const values = await fetch("/api/getUsecases", {
          cache: "no-store",
        }).then((r) => r.json());
        setUsecases(values);
      } catch (err) {
        console.error("Failed to load usecases", err);
      }
    };

    fetchApps();
    fetchUsecases();
  }, []);

  // FILTER LOGIC
const filteredApps = apps.filter((app) => {
  // 1️⃣ USECASE FILTER (if selected)
  if (selectedUsecaseFilter !== "all") {
    if (normalize(app.usecase) !== normalize(selectedUsecaseFilter)) {
      return false;
    }
  }

  // 2️⃣ CATEGORY FILTER (online/offline — NOT from dropdown anymore)
  if (selectedFilter === "online" && app.category !== "Online Apps") {
    return false;
  }

  if (selectedFilter === "offline" && app.category !== "Offline Apps") {
    return false;
  }

  // 3️⃣ TOGGLE FILTER (Pre-Packaged = Offline, Managed = Online)
  if (selectedToggle === "Pre-Packaged" && app.category !== "Offline Apps") {
    return false;
  }

  if (selectedToggle === "Managed" && app.category !== "Online Apps") {
    return false;
  }

  return true;
});


  const selectedUsecaseName =
    selectedUsecaseFilter !== "all" ? selectedUsecaseFilter : "Usecase";
      // DEBUG: check if dropdown state is changing
  console.log("filterOpen =", filterOpen);

  return (
    <main>
      <header className="page-header mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Apps</h1>
      </header>

      <div className="container all-apps-section">
        <div className="apps-top-row">
          {/* FILTER DROPDOWN */}
          <div className="apps-filter-row" style={{ position: "relative", zIndex: 9999 }}>
            <label className="filter-label">FILTER BY:</label>

            {/* THE FIX: ref moved here */}
            <div className="filter-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="filter-dropdown"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                {selectedUsecaseName}
                <span className="arrow">▾</span>
              </button>

              {filterOpen && (
                <div className="dropdown-menu">
                  {/* CATEGORY FILTERS */}
                  {/* <button
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedFilter("all");
                      setSelectedUsecaseFilter("all");
                      setFilterOpen(false);
                    }}
                  >
                  </button> */}

                  {/* 🔥 USECASES FROM DATABASE */}
                  {usecases.length > 0 ? (
                    usecases.map((usecase) => (
                      <button
                        key={usecase}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedUsecaseFilter(usecase);
                          setFilterOpen(false);
                        }}
                      >
                        {usecase}
                      </button>
                    ))
                  ) : (
                    <p className="dropdown-item">Loading...</p>
                  )}
                </div>
              )}
            </div>

            {/* <button
              className="clear-all-btn"
              onClick={() => {
                setSelectedFilter("all");
                setSelectedToggle("All");
                setSelectedUsecaseFilter("all");
              }}
            >
              Clear all
            </button> */}
          </div>

          {/* TOGGLE BUTTONS */}
          <div className="apps-toggle-wrapper">
            {/* <button
              className={`toggle-btn-hide ${
                selectedToggle === "All" ? "active" : ""
              }`}
              onClick={() => setSelectedToggle("All")}
            >
              All Apps
            </button> */}

            <button
              className={`toggle-btn ${
                selectedToggle === "Pre-Packaged" ? "active" : ""
              }`}
              onClick={() => setSelectedToggle("Pre-Packaged")}
            >
              Pre-Packaged App Demos
            </button>

            <button
              className={`toggle-btn ${
                selectedToggle === "Managed" ? "active" : ""
              }`}
              onClick={() => setSelectedToggle("Managed")}
            >
              Managed App Store Demos
            </button>
          </div>
        </div>

        {/* APPS GRID */}
        <div className="apps-grid">
          {isLoading && <p>Loading apps...</p>}

          {!isLoading && filteredApps.length === 0 && (
            <p>No apps found for this filter.</p>
          )}

          {!isLoading &&
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="app-page-card"
                onClick={() => app.link && window.open(app.link, "_blank")}
              >
                <img
                  src={app.image || "https://placehold.co/400x200?text=No+Image"}
                  className="app-card-image"
                  alt={app.name}
                />

                <div className="app-card-info">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-category">{app.usecase}</p>

                  <a
                    className="hover-underline-animation left"
                    href={app.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src="/Arrow.png"
                      style={{ width: "1.6rem" }}
                      alt=""
                    />
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
