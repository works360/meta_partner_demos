"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";

interface ReturnRow {
  id: number;
  order_id: number;
  submitted_by: string;
  submit_return: string;
  return_from: string;
  demo_purpose: string;
  demo_count: string;
  is_ongoing: string;
  is_registered: string;
  event_demo_count: string;
  unit_count: string;
  estimated_value: string;
  deal_reg_number: string;
  notes: string;
  submitted_at: string;
  return_tracking: string | null;
  return_tracking_link: string | null;
  return_label: string | null;
}

export default function ReturnTrackingPage() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useSearchParams();

  const isEmbed = params.get("embed") === "1";
  const search = params.get("q") || "";

  // Auth check only when NOT embedded
  useEffect(() => {
    const email =
      typeof window !== "undefined"
        ? localStorage.getItem("userEmail") ||
          sessionStorage.getItem("userEmail")
        : null;

    if (!isEmbed && !email) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [isEmbed, search]);

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/return-tracking?q=${search}`);
      const data = await res.json();
      setRows(data);
    } catch (e) {
      console.error("Error fetching return tracking:", e);
    } finally {
      setLoading(false);
    }
  };

  // Excel Export
  const exportToExcel = () => {
    const table = document.getElementById("trackingTable") as HTMLTableElement | null;
    if (!table) return;

    const rowsData: string[][] = [];

    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent?.trim() || ""
    );
    rowsData.push(headers);

    const bodyRows = Array.from(table.querySelectorAll("tbody tr")) as HTMLTableRowElement[];
    bodyRows.forEach((tr) => {
      const cells = Array.from(tr.cells).map((td) => td.textContent?.trim() || "");
      rowsData.push(cells);
    });

    const ws = XLSX.utils.aoa_to_sheet(rowsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Return Tracking");

    XLSX.writeFile(wb, `return-tracking-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <main className={isEmbed ? "embed-layout" : "container mt-5"}>
      <div className="card shadow-sm">
        {/* HEADER */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Return Tracking</h3>

          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            {/* SEARCH BAR */}
            <form
              method="GET"
              className="d-flex search-row"
              style={{ gap: 10 }}
              onSubmit={(e) => {
                e.preventDefault();
                const q = (document.getElementById("searchInput") as HTMLInputElement).value;
                const url = `/return-tracking?q=${encodeURIComponent(q)}${
                  isEmbed ? "&embed=1" : ""
                }`;
                router.push(url);
              }}
            >
              <input
                id="searchInput"
                type="text"
                placeholder="Search by Order ID, Return From, Demo Purpose"
                defaultValue={search}
                className="form-control"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              {search !== "" && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => router.push(`/return-tracking${isEmbed ? "?embed=1" : ""}`)}
                >
                  Clear
                </button>
              )}
            </form>

            {/* EXCEL EXPORT */}
            <button className="btn btn-excel" onClick={exportToExcel}>
              <img src="/productimages/excelicon.png" className="icon" alt="" /> Export
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="card-body">
          <div className="table-responsive">
            <table id="trackingTable" className="table table-bordered text-nowrap mb-0">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Return From</th>
                  <th>Date Submitted</th>
                  <th>Demo Purpose</th>
                  <th>Feedback?</th>
                  <th>Return Tracking #</th>
                  <th>Return Label</th>
                </tr>
              </thead>

              <tbody>
                {rows.length > 0 ? (
                  rows.map((row) => {
                    const submittedAt = row.submitted_at
                      ? new Date(row.submitted_at).toLocaleString()
                      : "";

                    const submitDisplay =
                      row.submit_return === "1" || row.submit_return?.toLowerCase() === "yes"
                        ? "Yes"
                        : row.submit_return?.toLowerCase() === "no" ||
                          row.submit_return === "0"
                        ? "No"
                        : row.submit_return || "—";

                    return (
                      <tr key={row.id}>
                        <td>
                          {row.order_id ? (
                            <a
                              href={`/return-details?order_id=${row.order_id}${
                                isEmbed ? "&embed=1" : ""
                              }`}
                            >
                              #{row.order_id}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>{row.return_from}</td>
                        <td>{submittedAt}</td>
                        <td>{row.demo_purpose}</td>
                        <td>{submitDisplay}</td>

                        <td>
                          {row.return_tracking && row.return_tracking_link ? (
                            <a href={row.return_tracking_link} target="_blank" rel="noopener">
                              {row.return_tracking}
                            </a>
                          ) : (
                            row.return_tracking || "—"
                          )}
                        </td>

                        <td>
                          {row.return_label ? (
                            <a href={row.return_label} download>
                              Download
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No return requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .embed-layout {
          padding: 0 !important;
          margin: 0 !important;
          width: 100%;
        }
        .embed-layout .card {
          border-radius: 0;
          border-left: 0;
          border-right: 0;
          border-bottom: 0;
          box-shadow: none;
        }
        .card-title {
          font-weight: 600;
          font-size: 22px;
        }
        .btn-excel {
          background: transparent !important;
          color: #000 !important;
          border: 1px solid #000;
          padding: 8px 14px;
        }
        img.icon {
          width: 20px !important;
          margin-right: 6px;
        }
        .table td,
        .table th {
          font-size: 13px;
          vertical-align: middle;
        }
        .table thead th {
          background: #f8fafc;
        }
      `}</style>
    </main>
  );
}
