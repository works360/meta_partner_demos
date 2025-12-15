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

// ✅ Safe JSON parsing helper
const safeParseSelection = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === "string") return parsed;
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0]?.id)
        return parsed.map((a: any) => String(a.id));
    }
  } catch {
    return [];
  }
  return [];
};

export default function AppDemosPage() {
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

  // --- Fetch apps and restore selections ---
  useEffect(() => {
    const fetchAppsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/getOfflineApps", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch apps from API");
        const data = await response.json();

const formattedData = data.map((item: any) => ({
  id: String(item.id ?? ""),
  name: item.name ?? "Unnamed App",

  // ✅ FIXED IMAGE PATH HANDLING (works for blob + local folder)
  image:
    item.image && item.image.startsWith("http")
      ? item.image
      : item.image
      ? `/productimages/${item.image}`
      : "https://placehold.co/400x160/cbd5e1/475569?text=No+Image",

  level: item.level || "",
  useCase: Array.isArray(item.usecase)
    ? item.usecase
    : typeof item.usecase === "string" && item.usecase.length > 0
    ? item.usecase.split(",").map((v: string) => v.trim())
    : [],
  wifi: item.wifi || "",
}));


        setAppsData(formattedData);

        // ✅ Restore last saved selection or default 25
        const savedIds = safeParseSelection(localStorage.getItem("selectedOfflineApps"));
        if (savedIds.length > 0) {
          setSelectedApps(savedIds);
        } else {
          setSelectedApps(formattedData.slice(0, 25).map((a: { id: any; }) => a.id));
        }
      } catch (e) {
        console.error("API Fetch Error:", e);
        setError("Failed to load apps data from database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppsData();
  }, []);

  // --- Persist latest selections ---
  useEffect(() => {
    if (appsData.length > 0) {
      localStorage.setItem(
        "selectedOfflineApps",
        JSON.stringify(appsData.filter((app) => selectedApps.includes(app.id)))
      );
    }
  }, [selectedApps, appsData]);

  // --- Handle filter changes ---
  const handleFilterChange = (category: "level" | "useCase" | "wifi", value: string) => {
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
      const levelMatch =
        filters.level.length === 0 || filters.level.includes(app.level || "");
      const useCaseMatch =
        filters.useCase.length === 0 ||
        filters.useCase.some((uc) =>
          (app.useCase || []).some((a) => (a || "").includes(uc))
        );
      const wifiMatch =
        filters.wifi.length === 0 || filters.wifi.includes(app.wifi || "");
      return levelMatch && useCaseMatch && wifiMatch;
    });
  }, [appsData, filters]);

  // --- Selection Logic ---
  const toggleAppSelection = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredApps.map((app) => app.id);
    setSelectedApps(filteredIds);
  };

  const deselectAll = () => {
    setSelectedApps([]);
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    localStorage.setItem(
      "selectedOfflineApps",
      JSON.stringify(appsData.filter((app) => selectedApps.includes(app.id)))
    );
    router.push("/managed-apps/");
  };

  // --- Render ---
  return (
    <div className="app-demos-page p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Pre-Packaged App Demos
          </h1>
        </div>

        {/* Progress Stepper */}
        <div className="stepper-container">
          <div className="stepper-buttons">
            <button className="stepper-nav-btn" onClick={() => window.history.back()}>
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
            Browse our prebuilt demo app packages to find the best fit for your
            Meta Quest demo experience. All prepackaged apps are available by
            default on the Meta Quest headsets shipped.
          </p>
        </div>

        {/* Main Content */}
        <div className="content-wrapper grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside
            className="filters-sidebar lg:col-span-1 bg-white p-6 rounded-xl h-fit sticky top-6"
            style={{ boxShadow: "0 2px 8px #0000002b" }}
          >

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
                      checked={filters[key as keyof typeof filters].includes(value)}
                      onChange={() =>
                        handleFilterChange(key as "level" | "useCase" | "wifi", value)
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
                Showing {filteredApps.length} apps | {selectedApps.length} selected
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
                    className={`app-card relative bg-white rounded-xl overflow-visible transition-all duration-300 cursor-pointer 
                      ${
                        selectedApps.includes(app.id)
                          ? "ring-4 ring-blue-500 transform scale-[1.02]"
                          : "hover:shadow-xl hover:ring-2 hover:ring-gray-300"
                      }`}
                    onClick={() => toggleAppSelection(app.id)}
                  >
                    {/* Selection Circle */}
                      <div
                        className="select-circle absolute"
                        style={{
                          borderColor: selectedApps.includes(app.id) ? "#0064e0" : "#cfcfcf",
                          backgroundColor: selectedApps.includes(app.id) ? "#0064e0" : "transparent",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAppSelection(app.id);
                        }}
                      >
                        {selectedApps.includes(app.id) && (
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
                      </div>
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
                <p className="text-xl">No apps match your selected filters.</p>
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
