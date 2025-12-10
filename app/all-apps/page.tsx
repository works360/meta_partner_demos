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

  // CATEGORY FILTER (all, online, offline)
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  // USECASE FILTER
  const [selectedUsecaseFilter, setSelectedUsecaseFilter] = useState<string>("all");

  // TOGGLE BUTTON FILTER
  const [selectedToggle, setSelectedToggle] = useState<
    "All" | "Pre-Packaged" | "Managed"
  >("All");

  const [apps, setApps] = useState<AppCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // helper: normalize strings for comparison
  const normalize = (value: string | undefined | null) =>
    (value || "").trim().toLowerCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load apps
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const offlineData = await fetch("/api/getOfflineApps", { cache: "no-store" }).then(r => r.json());
        const onlineData = await fetch("/api/getOnlineApps", { cache: "no-store" }).then(r => r.json());
        const combined = [...offlineData, ...onlineData];

        // optional debug: see usecases coming from API
        console.log("Loaded apps:", combined.map((a: AppCard) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          usecase: a.usecase
        })));

        setApps(combined);
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
    // If a usecase is selected, ONLY filter by usecase (ignore category & toggle)
    if (selectedUsecaseFilter !== "all") {
      return normalize(app.usecase) === normalize(selectedUsecaseFilter);
    }

    // Otherwise apply category filter
    if (selectedFilter === "online" && app.category !== "Online Apps") return false;
    if (selectedFilter === "offline" && app.category !== "Offline Apps") return false;

    // Then toggle filter — only when no usecase is selected and category = all
    if (selectedFilter === "all") {
      if (selectedToggle === "Pre-Packaged" && app.category !== "Offline Apps") return false;
      if (selectedToggle === "Managed" && app.category !== "Online Apps") return false;
    }

    return true;
  });

  // Dropdown label
  const selectedUsecaseName =
    selectedUsecaseFilter !== "all"
      ? selectedUsecaseFilter
      : filteredApps[0]?.usecase || "Usecase";

  return (
    <main>
      <header className="page-header mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Apps</h1>
      </header>

      {/* <p className="apps-description">
        Explore the education applications of mixed reality with Meta and discover opportunities to boost innovation.
      </p> */}

      <div className="container all-apps-section">

        <div className="apps-top-row">
          
          {/* FILTER DROPDOWN */}
          <div className="apps-filter-row" ref={dropdownRef}>
            <label className="filter-label">FILTER BY:</label>

            <div className="filter-dropdown-wrapper">
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
                  <button
                    onClick={() => {
                      setSelectedFilter("all");
                      setSelectedUsecaseFilter("all");
                      setFilterOpen(false);
                    }}
                  >
                    Show all
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("online");
                      setSelectedUsecaseFilter("all");
                      setFilterOpen(false);
                    }}
                  >
                    Online apps
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("offline");
                      setSelectedUsecaseFilter("all");
                      setFilterOpen(false);
                    }}
                  >
                    Offline apps
                  </button>

                  <hr />

                  {/* USECASE FILTERS */}
                  <button
                    onClick={() => {
                      setSelectedUsecaseFilter("Creativity & Design");
                      setFilterOpen(false);
                    }}
                  >
                    Creativity & Design
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUsecaseFilter("Meetings & Collaboration");
                      setFilterOpen(false);
                    }}
                  >
                    Meetings & Collaboration
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUsecaseFilter("Education");
                      setFilterOpen(false);
                    }}
                  >
                    Education
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUsecaseFilter("Learning & Training");
                      setFilterOpen(false);
                    }}
                  >
                    Learning & Training
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUsecaseFilter("Building Community");
                      setFilterOpen(false);
                    }}
                  >
                    Building Community
                  </button>

                </div>
              )}
            </div>

            <button
              className="clear-all-btn"
              onClick={() => {
                setSelectedFilter("all");
                setSelectedToggle("All");
                setSelectedUsecaseFilter("all");
              }}
            >
              Clear all
            </button>
          </div>

          {/* TOGGLE BUTTONS */}
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

          {!isLoading && filteredApps.length === 0 && (
            <p>No apps found for this filter.</p>
          )}

          {!isLoading &&
            filteredApps.map(app => (
              <div
                key={app.id}
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
                    href={app.link}
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: "#0066ff",
                      textDecoration: "none",
                      fontWeight: "500",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      alignSelf: "flex-start",
                    }}
                  >
                    <img
                      src="/Arrow.png"
                      alt="arrow"
                      style={{ width: "1.6rem", height: "auto" }}
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
