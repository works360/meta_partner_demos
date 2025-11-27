"use client"

import { useState, useEffect } from "react"
import "./page.css"

interface AppCard {
  id: number
  name: string
  categories: string[]
  bgColor: string
  image: string
}

export default function AllAppsPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("Show all")
  const [selectedApps, setSelectedApps] = useState<number[]>([])
  const [appsData, setAppsData] = useState<AppCard[]>([]) // State for fetched apps
  const [isLoading, setIsLoading] = useState<boolean>(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state

  // Fetch apps data based on selected filter
  useEffect(() => {
    const fetchAppsData = async () => {
      setIsLoading(true) // Set loading state to true while fetching data

      let url = "/api/getOfflineApps"; // Default to Offline apps
      if (selectedFilter === "Online apps") {
        url = "/api/getOnlineApps"; // Change to Online apps if selected

      }

      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch apps data");
        }
        const data = await response.json();
        setAppsData(data); // Update apps data from API
      } catch (error: any) {
        setError(error.message); // If an error occurs, set the error message
      } finally {
        setIsLoading(false); // Set loading state to false after the data is fetched
      }
    };

    fetchAppsData();
  }, [selectedFilter]); // Effect will run when selectedFilter changes

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value); // Update the selected filter
    setFilterOpen(false); // Close the dropdown after selection
  };

  const handleClearAll = () => {
    setSelectedFilter("Show all"); // Reset the filter to 'Show all'
  };

  // ⭐ FILTER LOGIC
  const filteredApps = appsData.filter((app) => {
    if (selectedFilter === "Show all") return true;
    if (selectedFilter === "Offline apps") return app.categories.includes("Offline");
    if (selectedFilter === "Online apps") return app.categories.includes("Online");
    return true;
  });

  const toggleAppSelection = (id: number) => {
    setSelectedApps((prev) =>
      prev.includes(id)
        ? prev.filter((appId) => appId !== id)
        : [...prev, id]
    );
  };

  return (
    <main className="all-apps-container">
      <header>
        <h1 className="page-header mb-8">Apps</h1>
      </header>

      {/* Description */}
      <div className="page-description p-6 rounded-xl shadow-md mb-8">
        <p className="text-gray-600">
          Explore the education applications of mixed reality with Meta and
          discover opportunities to boost innovation.
        </p>
      </div>

      <section className="content-wrapper">
        {/* ⭐ LEFT–RIGHT LAYOUT */}
        <div className="apps-layout">
          {/* RIGHT SIDE */}
          <div className="apps-right">
            {/* FILTER SECTION */}
            <div className="filter-section">
              <label className="filter-label">FILTER BY:</label>

              <div className="filter-controls">
                <div className="filter-dropdown-wrapper">
                  <button
                    className="filter-dropdown"
                    onClick={() => setFilterOpen(!filterOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={filterOpen ? "true" : "false"} // Updated aria-expanded
                  >
                    <span>{selectedFilter}</span>
                    <svg
                      className="dropdown-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* ⭐ DROPDOWN OPTIONS */}
                  {filterOpen && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => handleFilterChange("Show all")}
                      >
                        Show all
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleFilterChange("Offline apps")}
                      >
                        Offline apps
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleFilterChange("Online apps")}
                      >
                        Online apps
                      </button>
                    </div>
                  )}
                </div>

                <button className="clear-all-btn" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>
            </div>

            {/* ⭐ APPS GRID (Using filtered list) */}
            <div className="apps-grid">
              {isLoading && <p>Loading apps...</p>}
              {error && <div className="error-message">{error}</div>}
              {!isLoading && !error && filteredApps.length === 0 && (
                <p>No apps found</p>
              )}
              {!isLoading && !error && filteredApps.length > 0 && (
                <div className="apps-grid-container">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className={`app-card relative bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        selectedApps.includes(app.id)
                          ? "ring-4 ring-blue-500 transform scale-[1.02]"
                          : "hover:shadow-xl hover:ring-2 hover:ring-gray-300"
                      }`}
                      onClick={() => toggleAppSelection(app.id)}
                    >
                      <div className="app-image h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={app.image ? `/productimages/${app.image}` : "https://placehold.co/400x160/cbd5e1/475569?text=App+Image"}
                          alt={app.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      </div>

                      <div className="app-info text-left">
                        <h4
                          className="app-name text-lg font-semibold text-gray-900 truncate"
                          title={app.name}
                        >
                          {app.name}
                        </h4>

                        <div className="flex justify-left items-center space-x-2">
                          <input
                            type="checkbox"
                            readOnly
                            checked={selectedApps.includes(app.id)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded-md border-gray-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
