"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Product {
  product_name: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  sales_executive: string;
  sales_email: string;
  reseller: string;
  contact: string;
  contact_email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  demo_purpose: string;
  expected_demos: string;
  intended_audience: string;
  company: string;
  opportunity_size: string;
  revenue_size: string;
  use_case: string;
  meta_registered: string;
  deal_id: string;
  return_date: string;
  notes: string;
  order_status: string;
  tracking_number: string;
  tracking_number_link: string;
  return_tracking: string;
  return_tracking_link: string;
  return_label: string;
  approved_by?: string;
  approved_date?: string;
  rejected_by?: string;
  rejected_date?: string;
}

export default function KitUpdateOrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [hasReturn, setHasReturn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderid");
const isEmbed = params.get("embed") === "1";
  // ---- 1️⃣ Load user role and email from /api/me
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!data.loggedIn) {
          router.push("/login");
          return;
        }

        setUserEmail(data.email);
        setUserRole(data.role?.toLowerCase() || "user");

        if (typeof window !== "undefined") {
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userRole", data.role?.toLowerCase() || "user");
        }
      } catch (err) {
        console.error("Error fetching /api/me:", err);
      }
    };

    fetchUser();
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 2️⃣ Fetch order and items
  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/order?id=${orderId}`);
      const data = await res.json();

      const normalizedItems = (data.items || []).map((i: Product) => ({
        ...i,
        category: i.category ? i.category.toLowerCase() : "",
      }));

      setOrder(data.order);
      setItems(normalizedItems);
      setHasReturn(Boolean(data.hasSubmittedReturn));
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- 3️⃣ Role permissions
  const canEdit =
    (userRole || "").toLowerCase() === "shop manager" &&
    order?.order_status?.toLowerCase() !== "awaiting approval";

  // const canViewReturn = ["shop manager", "program manager"].includes(
  //   (userRole || "").toLowerCase()
  // );

  // ---- 4️⃣ Submit (includes user role headers)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderId) return;

    const formData = new FormData(e.currentTarget);
    formData.append("id", orderId);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-role": (userRole || "").toLowerCase(),
          "x-user-email": userEmail || "",
        },
      });

      const data = await res.json();

     if (data.success) {
  alert("✅ Order updated successfully!");
  router.refresh();

  const newStatus = formData.get("order_status");

  // 🚀 Send shipped email
  if (newStatus === "Shipped") {
    await fetch(`/api/send-shipped-email?orderid=${orderId}`);
  }

  // 🚀 Send returned email
  if (newStatus === "Returned") {
    await fetch(`/api/send-returned-email?orderid=${orderId}`);
  }
}
 else {
        alert(data.error || "⚠️ Failed to update order.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating the order.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!order)
    return <div className="text-center mt-5 text-danger">Order not found.</div>;

  const headsets = items.filter((p) => p.category === "headset");
  const offlineApps = items.filter((p) => p.category === "offline apps");
  const onlineApps = items.filter((p) => p.category === "online apps");
  const totalHeadsetQty = headsets.reduce(
    (acc, h) => acc + (h.quantity || 0),
    0
  );

  const statusLower = (order.order_status || "").toLowerCase();
  const isAwaiting = statusLower === "awaiting approval";

  const approvedDateText =
    order.approved_date && new Date(order.approved_date).toLocaleString();
  const rejectedDateText =
    order.rejected_date && new Date(order.rejected_date).toLocaleString();

  // ✅ Only show decision info when NOT Awaiting Approval
  const showApprovedInfo = !isAwaiting && !!order.approved_by;
  const showRejectedInfo = !isAwaiting && !!order.rejected_by;

  return (
    <main className={isEmbed ? "p-0 m-0 w-100" : "container py-5"}>
      <h4 className={isEmbed ? "mb-4 mt-2" : "mb-4 mt-5"}>
  Order #{order.id}
</h4>

      {/* === Program Manager Approval Buttons (only when awaiting approval) === */}
      {userRole?.toLowerCase() === "program manager" && isAwaiting && (
        <div className="mb-4 text-center">
          <div className="d-flex justify-content-left gap-3">
            <button
              className="btn btn-success"
              onClick={async () => {
                try {
                  const formData = new FormData();
                  formData.append("id", order.id.toString());
                  formData.append("order_status", "Processing");

                  const res = await fetch("/api/order", {
                    method: "POST",
                    body: formData,
                    headers: {
                      "x-user-role": "program manager",
                      "x-user-email": userEmail || "",
                    },
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("✅ Order Approved!");

// 🚀 Trigger approved email
await fetch(`/api/send-approved-email?orderid=${order.id}`);
                    setOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            order_status: "Processing",
                            approved_by: userEmail || "",
                            approved_date: new Date().toISOString(),
                            rejected_by: null as any,
                            rejected_date: null as any,
                          }
                        : prev
                    );
                  }
                } catch (err) {
                  alert("Error approving order.");
                  console.error(err);
                }
              }}
            >
              Approve Order
            </button>

            <button
              className="btn btn-danger"
              onClick={async () => {
                try {
                  const formData = new FormData();
                  formData.append("id", order.id.toString());
                  formData.append("order_status", "Cancelled");

                  const res = await fetch("/api/order", {
                    method: "POST",
                    body: formData,
                    headers: {
                      "x-user-role": "program manager",
                      "x-user-email": userEmail || "",
                    },
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("❌ Order Rejected!");

// 🚀 Trigger rejected email
await fetch(`/api/send-rejected-email?orderid=${order.id}`);
                    setOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            order_status: "Cancelled",
                            rejected_by: userEmail || "",
                            rejected_date: new Date().toISOString(),
                            approved_by: null as any,
                            approved_date: null as any,
                          }
                        : prev
                    );
                  }
                } catch (err) {
                  alert("Error rejecting order.");
                  console.error(err);
                }
              }}
            >
              Reject Order
            </button>
          </div>
        </div>
      )}

      {/* 🔔 Global Approved / Rejected Info visible to everyone (except when Awaiting Approval) */}
      
{(showApprovedInfo || showRejectedInfo) && (
  <div className="mb-3">
    <table className="table table-borderless" style={{ marginBottom: 0 }}>
      <tbody>
        {/* APPROVED STATE */}
        {showApprovedInfo && order.approved_by && (
          <>
            <tr>
              <td style={{ width: "160px", fontWeight: 600 }}>Approved By:</td>
              <td>{order.approved_by}</td>
            </tr>
            {approvedDateText && (
              <tr>
                <td style={{ width: "160px", fontWeight: 600 }}>Date Approved:</td>
                <td>{approvedDateText}</td>
              </tr>
            )}
          </>
        )}

        {/* REJECTED STATE */}
        {!showApprovedInfo && showRejectedInfo && order.rejected_by && (
          <>
            <tr>
              <td style={{ width: "160px", fontWeight: 600 }}>Rejected By:</td>
              <td>{order.rejected_by}</td>
            </tr>
            {rejectedDateText && (
              <tr>
                <td style={{ width: "160px", fontWeight: 600 }}>Date Rejected:</td>
                <td>{rejectedDateText}</td>
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  </div>
)}


      {/* Summary */}
      <table className="table table-bordered mb-4">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {headsets
                .map((h) => `${h.product_name} (x${h.quantity})`)
                .join(", ")}
              {offlineApps.length > 0 && (
                <>
                  <br />
                  <small>
                    <strong>Pre-Packaged App Demos:</strong>{" "}
                    {offlineApps.map((a) => a.product_name).join(", ")}
                  </small>
                </>
              )}
              {onlineApps.length > 0 && (
                <>
                  <br />
                  <small>
                    <strong>Managed App Store Demos:</strong>{" "}
                    {onlineApps.map((a) => a.product_name).join(", ")}
                  </small>
                </>
              )}
            </td>
            <td>{totalHeadsetQty}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== 2-COLUMN LAYOUT ===== */}
      <div className="row mt-4">
        {/* LEFT: Order Details */}
        <div className="col-md-7 mb-4">
          <h4 className="mt-3">Order Details</h4>
          <table className="table table-bordered mb-4">
            <tbody>
              {Object.entries({
                "Sales Executive": order.sales_executive,
                Email: order.sales_email,
                Reseller: order.reseller,
                Contact: order.contact,
                "Contact Email": order.contact_email,
                "Demo Purpose": order.demo_purpose,
                "Expected Demos": order.expected_demos,
                Audience: order.intended_audience,
                Company: order.company,
                "Opportunity Size": order.opportunity_size,
                "Revenue Size": order.revenue_size,
                "Use Case": order.use_case,
                "Meta Registered": order.meta_registered,
                "Deal ID": order.deal_id,
                "Expected Return Date": order.return_date,
                Notes: order.notes,
              }).map(([k, v]) =>
                v ? (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ) : null
              )}

              {/* ✅ Approved/Rejected Info in details table (also hidden when Awaiting Approval) */}
              {showApprovedInfo && order.approved_by && (
                <>
                  <tr>
                    <th>Approved By</th>
                    <td>{order.approved_by}</td>
                  </tr>
                  {approvedDateText && (
                    <tr>
                      <th>Date Approved</th>
                      <td>{approvedDateText}</td>
                    </tr>
                  )}
                </>
              )}

              {showRejectedInfo && order.rejected_by && (
                <>
                  <tr>
                    <th>Rejected By</th>
                    <td>{order.rejected_by}</td>
                  </tr>
                  {rejectedDateText && (
                    <tr>
                      <th>Date Rejected</th>
                      <td>{rejectedDateText}</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Shipping / Tracking / Return Form */}
        <div className="col-md-5 mb-4 mt-5">
          <div className="border p-4 rounded shadow-sm bg-white">
           

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Order Status */}
              <div className="mb-3">
                <label className="form-label fw-bold">Order Status</label>
                {canEdit ? (
                  <select
                    name="order_status"
                    className="form-select"
                    defaultValue={order.order_status}
                  >
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div className="border rounded px-3 py-2 bg-light">
                    {order.order_status}
                  </div>
                )}
              </div>

              {/* Tracking fields */}
              {[
                { key: "tracking_number", label: "Tracking #" },
                { key: "tracking_number_link", label: "Tracking Link" },
                { key: "return_tracking", label: "Return Tracking #" },
                { key: "return_tracking_link", label: "Return Tracking Link" },
              ].map(({ key, label }) => (
                <div className="mb-3" key={key}>
                  <label className="form-label fw-bold">{label}</label>
                  {canEdit ? (
                    <input
                      type="text"
                      name={key}
                      defaultValue={(order as any)[key]}
                      className="form-control"
                    />
                  ) : (
                    <div className="border rounded px-3 py-2 bg-light">
                      {key.includes("link") && (order as any)[key] ? (
                        <a
                          href={(order as any)[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#007bff", textDecoration: "none" }}
                        >
                          {(order as any)[key]}
                        </a>
                      ) : (
                        (order as any)[key] || "N/A"
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Return label */}
              <div className="mb-3">
                <label className="form-label fw-bold">Return Label</label>
                {canEdit ? (
                  <>
                    <input
                      type="file"
                      name="return_label"
                      className="form-control"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    {order.return_label && (
                      <small className="d-block mt-1">
                        Uploaded:{" "}
                        <a
                          href={order.return_label}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View File
                        </a>
                      </small>
                    )}
                    <input
                      type="hidden"
                      name="existing_label"
                      value={order.return_label || ""}
                    />
                  </>
                ) : order.return_label ? (
                  <a
                    href={`/returnlabelimages/${order.return_label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View File
                  </a>
                ) : (
                  "N/A"
                )}
              </div>

              {canEdit && (
                <button type="submit" className="btn btn-success mt-3 w-100">
                  Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table th {
          background: #f8f9fa;
          width: 300px;
        }
        .table td {
          vertical-align: middle;
        }
      `}</style>
    </main>
  );
}
