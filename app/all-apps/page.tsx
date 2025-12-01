"use client";

import { useState, useEffect, useRef } from "react";
import "./page.css";

interface AppCard {
  id: number;
  name: string;
  category: "Online" | "Offline";
  image: string;
  link?: string; // <-- added link support
}

export default function AllAppsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Show all");
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

  // Load apps
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

  // Filter Logic
  const filteredApps = apps.filter(app => {
    if (selectedFilter === "Online apps") return app.category === "Online";
    if (selectedFilter === "Offline apps") return app.category === "Offline";
    return true; // Show all
  });

  return (
    <main>
      <header className="page-header mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Apps</h1>
      </header>

      <p className="apps-description">
        Explore the education applications of mixed reality with Meta and discover opportunities to boost innovation.
      </p>

      <div className="container all-apps-section">

        {/* FILTER ROW */}
        <div className="apps-filter-row" ref={dropdownRef}>
          <label className="filter-label">FILTER BY:</label>

          <div className="filter-dropdown-wrapper">
            <button
              className="filter-dropdown"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {selectedFilter}
              <span className="arrow">▾</span>
            </button>

            {filterOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setSelectedFilter("Show all"); setFilterOpen(false); }}>
                  Show all
                </button>
                <button className="dropdown-item" onClick={() => { setSelectedFilter("Online apps"); setFilterOpen(false); }}>
                  Online apps
                </button>
                <button className="dropdown-item" onClick={() => { setSelectedFilter("Offline apps"); setFilterOpen(false); }}>
                  Offline apps
                </button>
              </div>
            )}
          </div>

          <button className="clear-all-btn" onClick={() => setSelectedFilter("Show all")}>Clear all</button>
        </div>

        {/* APPS GRID */}
        <div className="apps-grid">
          {isLoading && <p>Loading apps...</p>}

          {!isLoading &&
            filteredApps.map(app => (
              <a
                key={app.id}
                className="app-card"
                href={app.link ? app.link : "#"} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={app.image ? `/productimages/${app.image}` : "/placeholder.png"}
                  className="app-card-image"
                  alt={app.name}
                />

                <div className="app-card-info">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-category">Apps • {app.category}</p>
                </div>
              </a>
            ))}
        </div>

      </div>
    </main>
  );
}
