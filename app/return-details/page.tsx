"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ReturnDetails {
  id: number;
  order_id: number;
  submitted_by: string;
  submitted_at: string;
  return_from: string;
  demo_purpose: string;
  products_demod: string;
  demo_count: string;
  is_ongoing: string;
  is_registered: string;
  event_demo_count: string;
  unit_count: string;
  estimated_value: string;
  deal_reg_number: string;
  submit_return: string;
  notes: string;
  return_tracking: string | null;
  return_tracking_link: string | null;
  return_label: string | null;
}

export default function ReturnDetailsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order_id");
  const isEmbed = params.get("embed") === "1";

  const [details, setDetails] = useState<ReturnDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // AUTH CHECK ONLY WHEN NOT EMBEDDED
  useEffect(() => {
    const email =
      typeof window !== "undefined"
        ? localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail")
        : null;

    if (!isEmbed && !email) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/return-details?order_id=${orderId}`);
      const data = await res.json();
      setDetails(data);
    } catch (e) {
      console.error("Error loading details:", e);
    } finally {
      setLoading(false);
    }
  };

  const ynDisplay = (value: any) => {
    if (!value) return "—";
    const v = String(value).toLowerCase();
    if (v === "1" || v === "yes") return "Yes";
    if (v === "0" || v === "no") return "No";
    return value;
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!details) return <div className="text-center mt-5">No return details found.</div>;

  const submittedAt = details.submitted_at
    ? new Date(details.submitted_at).toLocaleString()
    : "";

  return (
    <main className={isEmbed ? "embed-layout" : "container mt-5"}>
      <div className="card w-100 shadow-sm" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="card-header">
          <h3 className="card-title mb-0">Return Details — Order #{details.order_id}</h3>
        </div>

        <div className="card-body">
          <table className="table table-bordered">
            <tbody>
              <tr>
  <th style={{ width: "30%" }}>Order Ref#</th>
  <td>#{details.order_id}</td>
</tr>
              <tr><th>Submitted By</th><td>{details.submitted_by || "—"}</td></tr>
              <tr><th>Date Submitted</th><td>{submittedAt}</td></tr>
              <tr><th>Return From</th><td>{details.return_from}</td></tr>
              <tr><th>Demo Purpose</th><td>{details.demo_purpose}</td></tr>
              <tr><th>Products Demo'd</th><td>{details.products_demod || "—"}</td></tr>
              <tr><th>Demo Count</th><td>{details.demo_count}</td></tr>
              <tr><th>Is Ongoing?</th><td>{ynDisplay(details.is_ongoing)}</td></tr>
              <tr><th>Is Registered?</th><td>{ynDisplay(details.is_registered)}</td></tr>
              <tr><th>Event Demo Count</th><td>{details.event_demo_count}</td></tr>
              <tr><th>Unit Count</th><td>{details.unit_count}</td></tr>
              <tr><th>Estimated Value</th><td>{details.estimated_value}</td></tr>
              <tr><th>Deal Reg #</th><td>{details.deal_reg_number}</td></tr>
              <tr><th>Feedback Submitted?</th><td>{ynDisplay(details.submit_return)}</td></tr>
              <tr><th>Notes</th><td>{details.notes || "—"}</td></tr>

              <tr>
                <th>Return Tracking #</th>
                <td>
                  {details.return_tracking && details.return_tracking_link ? (
                    <a href={details.return_tracking_link} target="_blank" rel="noopener">
                      {details.return_tracking}
                    </a>
                  ) : (
                    details.return_tracking || "—"
                  )}
                </td>
              </tr>

              <tr>
                <th>Return Label</th>
                <td>
                  {details.return_label ? (
                    <a href={details.return_label} download>Download Return Label</a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* BACK BUTTON */}
          {!isEmbed ? (
            <button className="btn btn-outline-secondary" onClick={() => router.push("/return-tracking")}>
              Back to Tracking
            </button>
          ) : (
            <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
              Back
            </button>
          )}
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
        .table td,
        .table th {
          font-size: 13px;
          vertical-align: top;
        }
        .table thead th {
          background: #f8fafc;
        }
      `}</style>
    </main>
  );
}
