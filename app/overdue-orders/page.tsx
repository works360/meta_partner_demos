"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../Components/navbar";
import { Footer } from "../Components/footer";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";

export default function OverdueOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  // embed mode detection
  const isEmbed = params.get("embed") === "1";

  // AUTH (block only when not embedded)
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

    loadOrders();
  }, [isEmbed]);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/overdue");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setFlash("Failed to load overdue orders.");
      }
    } catch (err) {
      setFlash("Error loading overdue orders.");
      console.error(err);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function sendReminders() {
    if (selected.length === 0) {
      alert("Please select at least one order.");
      return;
    }

    if (!confirm(`Send reminders to ${selected.length} overdue orders?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/send-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selected }),
      });

      const data = await res.json();
      setFlash(data.message || "Processed reminders.");

      loadOrders();
      setSelected([]);
    } catch (err) {
      console.error(err);
      setFlash("Failed to send reminders.");
    } finally {
      setLoading(false);
    }
  }

  function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Overdue Orders");
    XLSX.writeFile(wb, `overdue-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <>
      {/* Show Navbar only when NOT embedded */}
      {!isEmbed && <Navbar />}

      <main className={isEmbed ? "embed-layout" : "container mt-5"}>
        <div className="card shadow-sm">
          {/* HEADER */}
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">Overdue Orders</h3>

            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
              <button className="btn btn-excel" onClick={exportToExcel}>
                <img src="/productimages/excelicon.png" className="icon" alt="" /> Export
              </button>

              <button
                className="btn btn-primary"
                disabled={selected.length === 0 || loading}
                onClick={sendReminders}
              >
                {loading ? "Sending..." : "Send Reminder"}
              </button>
            </div>
          </div>

          {/* FLASH MESSAGE */}
          {flash && (
            <div className="alert alert-info m-3" role="alert">
              {flash}
            </div>
          )}

          {/* BODY */}
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered text-nowrap mb-0">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Sales Executive</th>
                    <th>Email</th>
                    <th>Reseller</th>
                    <th>Company</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length > 0 ? (
                    orders.map((o: any) => (
                      <tr key={o.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(o.id)}
                            onChange={() => toggleSelect(o.id)}
                          />
                        </td>
                        <td>{o.id}</td>
                        <td>{o.created_at?.slice(0, 10)}</td>
                        <td>{o.sales_executive}</td>
                        <td>{o.sales_email}</td>
                        <td>{o.reseller}</td>
                        <td>{o.company}</td>
                        <td>{o.return_date}</td>
                        <td>{o.order_status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">
                        No overdue orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* STYLES */}
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

      {/* Show Footer only when NOT embedded */}
      {!isEmbed && <Footer />}
    </>
  );
}
