"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import "./my-orders.css";

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
  headsets: string[];
  onlineApps: string[];
  offlineApps: string[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | number>("");
  const router = useRouter();   

  // ✅ Load user email from session/local storage
  useEffect(() => {
    const email =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");

    if (!email) {
      console.warn("⚠️ No user email found — redirecting to login.");
      router.push("/login");
      return;
    }

    setUserEmail(email);
  }, [router]);

  // ✅ Fetch orders once userEmail is available
  useEffect(() => {
    if (!userEmail) return;

    async function fetchOrders() {
      try {
        const res = await fetch(`/api/my-orders?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Unexpected API response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userEmail]);

  // ✅ Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "My Orders");
    XLSX.writeFile(wb, "my-orders.xlsx");
  };

  // ✅ UI States
  if (loading)
    return <div className="loading-screen">Loading your orders...</div>;

  if (!orders.length)
    return (
      <div className="loading-screen text-gray-600">
        No orders found.
      </div>
    );

  // ✅ Main UI
  return (
    <div className="my-orders-body">
      <div className="container myorders-container">
        <div className="header-row">
          <h2>My Kit Orders</h2>
          <button onClick={exportToExcel} className="excel-btn">
            <img
              src="/productimages/excelicon.png"
              alt="Excel"
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />{" "}
            Export to Excel
          </button>
        </div>

        <div className="table-responsive">
          <table id="ordersTable" className="table table-bordered">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Sales Executive</th>
                <th>Email</th>
                <th>Reseller</th>
                <th>Purpose</th>
                <th>Expected Demos</th>
                <th>Audience</th>
                <th>Company</th>
                <th>Return Date</th>
                <th>Products</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Zip</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.sales_executive}</td>
                  <td>{order.sales_email}</td>
                  <td>{order.reseller}</td>
                  <td>{order.demo_purpose}</td>
                  <td>{order.expected_demos}</td>
                  <td>{order.intended_audience}</td>
                  <td>{order.company}</td>
                  <td>{order.return_date}</td>
                  <td style={{ width: "20px"}}>
                    {order.headsets?.length > 0 && (
                      <>
                        {order.headsets.join(", ")} <br />
                      </>
                    )}
                    {order.onlineApps?.length > 0 && (
                      <>
                        <strong>Managed App Store Demos:</strong>{" "}
                        {order.onlineApps.join(", ")} <br />
                      </>
                    )}
                    {order.offlineApps?.length > 0 && (
                      <>
                        <strong>Pre-Packaged App Demos:</strong>{" "}
                        {order.offlineApps.join(", ")}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
