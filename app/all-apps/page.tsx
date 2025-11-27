"use client";

import React, { useEffect, useMemo, useState } from "react";

interface RawAppItem {
  id?: string | number;
  name?: string;
  image?: string;
  level?: string;
  usecase?: string[] | string;
  wifi?: string;
  category?: string;
}

type AppSource = "offline" | "online";

interface AppData {
  id: string;
  name: string;
  image: string;
  source: AppSource;      // offline / online
  level: string;
  wifi: string;
  useCase: string[];      // normalized usecase array
  labelLine: string;      // e.g. "Apps • Productivity"
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x160/cbd5e1/475569?text=App+Image";

export default function AllAppsPage() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<"all" | AppSource>("all");

  const normalizeUseCase = (value: RawAppItem["usecase"]): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter((v) => v.length > 0);
    if (typeof value === "string" && value.trim().length > 0) {
      return value
        .split(/[•,;]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return [];
  };

  const buildLabel = (useCase: string[]): string => {
    if (!useCase || useCase.length === 0) return "Apps";
    const parts = useCase.filter(Boolean).map((s) => s.trim()).filter((s) => s.length > 0);
    const top = parts.slice(0, 2).join(" • ");
    return `Apps • ${top}`;
  };

  useEffect(() => {
    const fetchAllApps = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [offlineRes, onlineRes] = await Promise.all([
          fetch("/api/getOfflineApps", { cache: "no-store" }),
          fetch("/api/getOnlineApps", { cache: "no-store" }),
        ]);

        if (!offlineRes.ok || !onlineRes.ok) {
          throw new Error("Failed to fetch apps from API");
        }

        const offlineJson: RawAppItem[] = await offlineRes.json();
        const onlineJson: RawAppItem[] = await onlineRes.json();

        // OFFLINE apps
        const offlineApps: AppData[] = offlineJson.map((item) => {
          const useCaseArr = normalizeUseCase(item.usecase);
          return {
            id: String(item.id ?? ""),
            name: item.name ?? "Unnamed App",
            image: item.image ? `/productimages/${item.image}` : PLACEHOLDER_IMAGE,
            source: "offline",
            level: item.level || "",
            wifi: item.wifi || "",
            useCase: useCaseArr,
            labelLine: buildLabel(useCaseArr),
          };
        });

        // ONLINE apps – keep only where category mentions "online" (same logic as your page)
        const onlineApps: AppData[] = onlineJson
          .filter(
            (item) =>
              item.category &&
              item.category.toLowerCase().includes("online")
          )
          .map((item) => {
            const useCaseArr = normalizeUseCase(item.usecase);
            return {
              id: String(item.id ?? ""),
              name: item.name ?? "Unnamed App",
              image: item.image ? `/productimages/${item.image}` : PLACEHOLDER_IMAGE,
              source: "online",
              level: item.level || "",
              wifi: item.wifi || "",
              useCase: useCaseArr,
              labelLine: buildLabel(useCaseArr),
            };
          });

        // Merge
        const all = [...offlineApps, ...onlineApps];
        setApps(all);
      } catch (err) {
        console.error("ALL APPS API error:", err);
        setError("Failed to load apps from database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllApps();
  }, []);

  // Filtered list by source
  const filteredApps = useMemo(() => {
    if (filterSource === "all") return apps;
    return apps.filter((a) => a.source === filterSource);
  }, [apps, filterSource]);

  const handleClearFilter = () => setFilterSource("all");

  return (
    <div className="min-h-screen bg-white apps-page-wrapper">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page Title + Intro */}
        <header className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ letterSpacing: "0.02em" }}
          >
            Apps
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the education applications of mixed reality with Meta and
            discover opportunities to boost innovation.
          </p>
        </header>

        {/* Filter Bar (Show all / Offline / Online) */}
        <section className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span style={{ fontWeight: 500, color: "#555" }}>FILTER BY:</span>
            <select
              value={filterSource}
              onChange={(e) =>
                setFilterSource(e.target.value as "all" | AppSource)
              }
              aria-label="Filter apps by source"
              className="border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              style={{ minWidth: "140px" }}
            >
              <option value="all">Show all</option>
              <option value="offline">Pre-Packaged (Offline)</option>
              <option value="online">Managed (Online)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleClearFilter}
            className="text-sm text-blue-500 hover:underline bg-transparent border-0 p-0"
          >
            Clear all
          </button>
        </section>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center text-gray-500 py-10">
            Loading apps…
          </div>
        )}

        {/* Apps Grid */}
        {!isLoading && filteredApps.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div
                key={`${app.source}-${app.id}`}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-default"
              >
                {/* Image */}
                <div className="h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).onerror = null;
                      (e.currentTarget as HTMLImageElement).src =
                        PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>

                {/* Text block */}
                <div className="px-4 py-3">
                  <h3
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={app.name}
                  >
                    {app.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {app.labelLine}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* No results */}
        {!isLoading && filteredApps.length === 0 && !error && (
          <div className="text-center text-gray-500 py-10">
            No apps found for the current filter.
          </div>
        )}
        <footer className="mt-12 text-center text-xs text-gray-500">
          © 2025 All Rights Reserved. Design by Works360
        </footer>
      </div>
    </div>
  );
}
