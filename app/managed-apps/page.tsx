"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

interface AppData {
  id: string;
  name: string;
  image: string;
  level: string;
  useCase: string[];
  wifi: string;
  category?: string;
}

const FILTER_OPTIONS = {
  level: ["Beginner", "Intermediate"],
  useCase: [
    "Creativity & Design",
    "Meetings & Collaboration",
    "Education",
    "Learning & Training",
    "Building Community",
    "Other",
  ],
  wifi: ["Yes", "No - Offline"],
};

export default function ManagedAppsPage() {
  const [appsData, setAppsData] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    level: [] as string[],
    useCase: [] as string[],
    wifi: [] as string[],
  });

  const router = useRouter();

  // --- Fetch apps from API ---
  useEffect(() => {
    const fetchAppsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/getOnlineApps", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch apps from API");
        const data = await response.json();

        const formattedData = data
          .filter((item: any) => item.category?.toLowerCase().includes("online"))
          .map((item: any) => ({
            id: String(item.id ?? ""),
            name: item.name ?? "Unnamed App",
            image: item.image
              ? `/productimages/${item.image}`
              : "https://placehold.co/400x160/cbd5e1/475569?text=No+Image",
            level: item.level || "",
            useCase: Array.isArray(item.usecase)
              ? item.usecase
              : typeof item.usecase === "string" && item.usecase.length > 0
              ? item.usecase.split(",").map((v: string) => v.trim())
              : [],
            wifi: item.wifi || "",
            category: item.category || "",
          }));

        setAppsData(formattedData);
      } catch (e) {
        console.error("API Fetch Error:", e);
        setError("Failed to load online apps data from database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppsData();
  }, []);

  // --- Load saved selections when returning to page ---
  useEffect(() => {
    const storedSelections = localStorage.getItem("selectedOnlineApps");
    if (storedSelections) {
      try {
        const savedApps = JSON.parse(storedSelections);
        const savedIds = savedApps.map((a: AppData) => a.id);
        setSelectedApps(savedIds);
      } catch {
        localStorage.removeItem("selectedOnlineApps");
      }
    }
  }, []);

  // --- Persist selections to localStorage ---
  useEffect(() => {
    if (selectedApps.length > 0) {
      localStorage.setItem(
        "selectedOnlineApps",
        JSON.stringify(appsData.filter((app) => selectedApps.includes(app.id)))
      );
    } else {
      localStorage.removeItem("selectedOnlineApps");
    }
  }, [selectedApps, appsData]);

  // --- Handle filter changes ---
  const handleFilterChange = (
    category: "level" | "useCase" | "wifi",
    value: string
  ) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  // --- Filtering Logic ---
  const filteredApps = useMemo(() => {
  return appsData.filter((app) => {
    const levelValue = app.level?.trim().toLowerCase();
    const wifiValue = app.wifi?.trim().toLowerCase();

    const levelMatch =
      filters.level.length === 0 ||
      filters.level.map((l) => l.toLowerCase()).includes(levelValue);

    const wifiMatch =
      filters.wifi.length === 0 ||
      filters.wifi.map((w) => w.toLowerCase()).includes(wifiValue);

    const useCaseMatch =
      filters.useCase.length === 0 ||
      app.useCase?.some((uc) =>
        filters.useCase.map((u) => u.toLowerCase()).includes(uc.toLowerCase())
      );

    return levelMatch && wifiMatch && useCaseMatch;
  });
}, [appsData, filters]);

  // --- Selection logic with 4 limit ---
  const toggleAppSelection = (appId: string) => {
    setSelectedApps((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      } else {
        if (prev.length >= 4) {
          alert("You can select up to 4 apps only.");
          return prev;
        }
        return [...prev, appId];
      }
    });
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredApps.map((app) => app.id);
    setSelectedApps(filteredIds.slice(0, 4)); // Limit to 4 apps only
  };

  const deselectAll = () => {
    setSelectedApps([]);
  };

  // --- Next Button ---
  function handleNext(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    if (selectedApps.length === 0) {
      alert("Please select at least one app before proceeding.");
      return;
    }
    if (selectedApps.length > 4) {
      alert("You can select up to 4 apps only.");
      return;
    }
    router.push("/review-kit");
  }

  // --- Render ---
  return (
    <div className="app-demos-page p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Managed (Online) Apps
          </h1>
        </div>

        {/* Progress Stepper */}
        <div className="stepper-container">
          <div className="stepper-buttons">
            <button
              className="stepper-nav-btn"
              onClick={() => window.history.back()}
            >
              <img src="/back-arrow.png" alt="Back" width={18} /> Back
            </button>
            <button
              className="stepper-nav-btn flex items-center gap-2 text-blue-600 hover:text-blue-800"
              onClick={handleNext}
            >
              Next <img src="/Arrow.png" alt="Next" width={18} />
            </button>
          </div>

          <div className="stepper">
            <div className="step completed">
              <div className="step-circle">1</div>
              <div className="step-label">Pick Headset</div>
            </div>
            <div className="step-line completed"></div>
            <div className="step active">
              <div className="step-circle">2</div>
              <div className="step-label">Select Apps</div>
            </div>
            <div className="step-line "></div>
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

        {/* Description */}
        <div className="page-description p-6 rounded-xl shadow-md mb-8">
          <p className="text-gray-600">
            Browse available online apps to enhance your Meta Quest demo kit.
            These require internet connectivity for setup or usage.
          </p>
        </div>

        {/* Main Content */}
        <div className="content-wrapper grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside
            className="filters-sidebar lg:col-span-1 bg-white p-6 rounded-xl h-fit sticky top-6"
            style={{ boxShadow: "0 2px 8px #0000002b" }}
          >
            <h2
              className="text-xl font-bold text-gray-900 mb-4 border-b pb-2"
              style={{ fontSize: "20px" }}
            >
              Filter Apps
            </h2>

            {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
              <div key={key} className="filter-section mb-6">
                <h3 className="filter-title text-lg font-semibold text-gray-700 mb-2 capitalize">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (c) => c.toUpperCase())}
                </h3>
                {options.map((value) => (
                  <label
                    key={value}
                    className="filter-checkbox flex items-center space-x-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      checked={filters[key as keyof typeof filters].includes(
                        value
                      )}
                      onChange={() =>
                        handleFilterChange(
                          key as "level" | "useCase" | "wifi",
                          value
                        )
                      }
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            ))}
          </aside>

          {/* Apps Grid */}
          <div className="apps-content lg:col-span-3">
            <div className="apps-header mb-4 bg-white rounded-xl shadow-md">
              <p className="apps-count text-lg font-medium text-gray-700">
                Showing {filteredApps.length} apps | {selectedApps.length}{" "}
                selected
              </p>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {!isLoading && !error && filteredApps.length > 0 && (
              <div className="apps-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className={`app-card relative bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer 
                      ${
                        selectedApps.includes(app.id)
                          ? "ring-4 ring-blue-500 transform scale-[1.02]"
                          : "hover:shadow-xl hover:ring-2 hover:ring-gray-300"
                      }`}
                    onClick={() => toggleAppSelection(app.id)}
                  >
                    <div className="app-image h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={app.image}
                        alt={app.name}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/400x160/cbd5e1/475569?text=App+Image";
                        }}
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

            {!isLoading && filteredApps.length === 0 && (
              <div className="no-results bg-white p-10 rounded-xl text-center text-gray-500">
                <p className="text-xl">
                  No online apps match your selected filters.
                </p>
                <p className="mt-2">
                  Try adjusting your filter options in the sidebar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}