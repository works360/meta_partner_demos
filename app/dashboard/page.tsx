"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- 1. Constants and Route Mapping (Replacing PHP URL Mappings) ---
const ROUTES = {
  summary: "summary-data-url", // will be replaced by encoded summary page
  inventory: "/live-inventory?embed=1",
  prospectorders: "/kit-orderdetails?embed=1",
  eventorders: "/event-orderdetails?embed=1",
  returns: "/return-tracking?embed=1",
  users: "/alluser?embed=1",
  overdue: "/overdue-orders?embed=1",
};

const TITLES: Record<keyof typeof ROUTES, string> = {
  summary: "Summary Page",
  inventory: "Live Inventory",
  prospectorders: "Order Details Prospects",
  eventorders: "Order Details Events",
  returns: "Return Tracking",
  users: "User List",
  overdue: "Overdue Orders",
};

// Encoded data URL for "Summary Page"
const SUMMARY_CONTENT = `
<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Summary</title>
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:24px; color:#0f172a; }
  .card { border:1px solid #e5e7eb; border-radius:10px; padding:18px; margin-bottom:14px; }
  h2 { margin:0 0 12px; font-size:18px; }
  .muted { color:#6b7280; font-size:14px; }
</style></head><body>
  <div class="card"><h2>Welcome to the 360 Dashboard</h2>
  <div class="muted">Use the sidebar to open Live Inventory, Order Details, Return Tracking, User list, and Overdue Orders without leaving this page.</div>
  </div>
  <div class="card"><h2>Quick Tips</h2>
  <ul><li>URL shows <code>?view=...</code> for sharable state.</li>
      <li>Use the “Reload” button to refresh the current view.</li></ul>
  </div>
</body></html>
`;

ROUTES.summary = "data:text/html;charset=utf-8," + encodeURIComponent(SUMMARY_CONTENT);
// --- End Constants ---

const DashboardPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<keyof typeof ROUTES>("summary");
  const [iframeSrc, setIframeSrc] = useState<string>(ROUTES.summary);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  // --- 2. Navigation logic ---
  const loadView = useCallback((view: keyof typeof ROUTES, push = true) => {
    const url = ROUTES[view] || ROUTES.summary;
    setCurrentView(view);
    setIframeSrc(url); // ✅ sets src dynamically, never empty

    if (push && typeof window !== "undefined" && window.history.pushState) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("view", view);
      window.history.pushState({ view }, "", newUrl.toString());
    }
  }, []);

  // --- 3. Lifecycle ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialView = (params.get("view") as keyof typeof ROUTES) || "summary";
    loadView(initialView, false);

    const handlePopstate = (evt: PopStateEvent) => {
      const view =
        (evt.state && (evt.state.view as keyof typeof ROUTES)) ||
        (new URLSearchParams(location.search).get("view") as keyof typeof ROUTES) ||
        "summary";
      loadView(view, false);
    };

    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [loadView]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const view = e.currentTarget.getAttribute("data-view") as keyof typeof ROUTES;
    if (view) loadView(view);
  };

  const handleReload = () => {
    if (frameRef.current) {
      frameRef.current.src = iframeSrc; // reloads safely
    }
  };

  // --- 4. JSX Render ---
  return (
    <>
      <div className="dashboard-wrap">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand">360 Dashboard</div>
          <ul className="nav-list" id="sidebarNav">
            {Object.keys(ROUTES).map((viewKey) => {
              const view = viewKey as keyof typeof ROUTES;
              return (
                <li key={view}>
                  <Link
                    href={`?view=${view}`}
                    data-view={view}
                    className={currentView === view ? "active" : ""}
                    onClick={handleNavClick}
                  >
                    {TITLES[view]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* CONTENT */}
        <main className="content-area">
          <div className="content-card">
            <div className="content-header">
              {/* <h3 className="content-title" id="contentTitle">
                {TITLES[currentView]}
              </h3> */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                id="reloadBtn"
                title="Back"
                onClick={handleReload}
              >
                Back
              </button>
            </div>
            <div className="content-body">
              {/* ✅ Iframe only rendered with valid src */}
              {iframeSrc && (
                <iframe
                  ref={frameRef}
                  id="contentFrame"
                  className="content-frame"
                  src={iframeSrc}
                  title={TITLES[currentView]}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- 5. Inline Global CSS --- */}
      <style global jsx>{`
        :root {
          --sidebar-width: 260px;
        }
        .dashboard-wrap {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr;
          grid-template-rows: auto 1fr;
          min-height: 100vh;
        }
        .sidebar {
          grid-row: 1 / span 2;
          background: #0f172a;
          color: #e5e7eb;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          padding: 16px 0;
          font-family: Inter, sans-serif;
        }
        .sidebar .brand {
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.3px;
          padding: 0 16px 12px 24px;
          color: #fff;
        }
        .nav-list {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
        }
        .nav-list li a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px 12px 24px;
          color: #e5e7eb;
          text-decoration: none;
          border-left: 3px solid transparent;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .nav-list li a:hover {
          background: #111827;
          color: #fff;
        }
        .nav-list li a.active {
          background: #111827;
          border-left-color: #3b82f6;
          color: #fff;
          font-weight: 600;
        }
        .content-area {
          background: #f8fafc;
          padding: 16px;
          flex: 1;
        }
        .content-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
          overflow: hidden;
          height: calc(100vh - 32px);
          display: flex;
          margin-top: 50px;
          flex-direction: column;
        }
        .content-header {
          padding: 14px 18px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .content-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
        }
        .content-body {
          flex: 1;
          position: relative;
        }
        .content-frame {
          width: 100%;
          height: 100%;
          border: 0;
          background: #fff;
        }
        @media (max-width: 992px) {
          .dashboard-wrap {
            grid-template-columns: 1fr;
          }
          .sidebar {
            position: relative;
            height: auto;
          }
          .content-card {
            height: auto;
            min-height: 70vh;
          }
        }
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  );
};

export default DashboardPage;
