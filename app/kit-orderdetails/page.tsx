"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderItem {
  product_name: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  sales_executive: string;
  sales_email: string;
  reseller: string;
  demo_purpose: string;
  expected_demos: string;
  intended_audience: string;
  company: string;
  return_date: string;
  contact: string;
  order_status: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  products: OrderItem[];
}

export default function KitOrderDetailsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Check authentication
  useEffect(() => {
    const userEmail =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");

    if (!userEmail) {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, []);

  // ✅ Fetch orders from API
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export table to Excel
const exportToExcel = () => {
  const table = document.getElementById("datatable") as HTMLTableElement | null;
  if (!table) return;

  const rows: string[][] = [];

  // ✅ Get headers
  const headers = Array.from(table.querySelectorAll("thead th")).map(
    (th) => th.textContent?.trim() || ""
  );
  rows.push(headers);

  // ✅ Get all rows safely
  const bodyRows = Array.from(
    table.querySelectorAll("tbody tr")
  ) as HTMLTableRowElement[];

  bodyRows.forEach((tr) => {
    const cells = Array.from(tr.cells) as HTMLTableCellElement[];
    const row = cells.map((td) => td.textContent?.trim() || "");
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kit Orders");
  XLSX.writeFile(wb, "kit-orders.xlsx");
};

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <main className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Kit Order Details</h3>
          <button className="btn btn-excel" onClick={exportToExcel}>
            <img
              src="/productimages/excelicon.png"
              className="icon"
              alt="Excel"
            />{" "}
            Export to Excel
          </button>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table
              id="datatable"
              className="table table-bordered text-nowrap mb-0"
            >
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Sales Executive</th>
                  <th>Email</th>
                  <th>Reseller</th>
                  <th>Demo Purpose</th>
                  <th>Expected Demos</th>
                  <th>Audience</th>
                  <th>Company</th>
                  <th>Return Date</th>
                  <th>Products</th>
                  <th>Contact</th>
                  <th>Order Status</th>
                  <th>Shipping Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Zip</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const headsets = order.products
                    .filter((p) => p.category === "headset")
                    .map((p) => `${p.quantity} x ${p.product_name}`);

                  const onlineApps = order.products
                    .filter((p) => p.category === "online apps")
                    .map((p) => p.product_name);

                  const offlineApps = order.products
                    .filter((p) => p.category === "offline apps")
                    .map((p) => p.product_name);

                  return (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/kit-updateorder?orderid=${order.id}`}>
                          {order.id}
                        </Link>
                      </td>
                      <td>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : ""}
                      </td>
                      <td>{order.sales_executive}</td>
                      <td>{order.sales_email}</td>
                      <td>{order.reseller}</td>
                      <td>{order.demo_purpose}</td>
                      <td>{order.expected_demos}</td>
                      <td>{order.intended_audience}</td>
                      <td>{order.company}</td>
                      <td>{order.return_date}</td>
                      <td>
                        {headsets.length > 0 && (
                          <>
                            {headsets.join(", ")} <br />
                          </>
                        )}
                        {onlineApps.length > 0 && (
                          <>
                            <strong>Managed App Store Demos:</strong>{" "}
                            {onlineApps.join(", ")} <br />
                          </>
                        )}
                        {offlineApps.length > 0 && (
                          <>
                            <strong>Pre-Packaged App Demos:</strong>{" "}
                            {offlineApps.join(", ")}
                          </>
                        )}
                      </td>
                      <td>{order.contact}</td>
                      <td>{order.order_status}</td>
                      <td>{order.address}</td>
                      <td>{order.city}</td>
                      <td>{order.state}</td>
                      <td>{order.zip}</td>
                      <td>{order.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        .table td {
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
