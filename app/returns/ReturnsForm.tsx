"use client";
import { useEffect, useState } from "react";

interface Order {
  id: number;
}

interface OrderDetails {
  products?: string;
  address?: string;
  purpose?: string;
}

export default function ReturnsForm() {
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [details, setDetails] = useState<OrderDetails>({});
  const [demoPurpose, setDemoPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Prospect/Meeting extra fields
  const [demoCount, setDemoCount] = useState("");
  const [isOngoing, setIsOngoing] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [isRegistered, setIsRegistered] = useState("");
  const [dealRegNumber, setDealRegNumber] = useState("");

  // Event/Other extra fields
  const [eventDemoCount, setEventDemoCount] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch logged-in user
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        // /api/me returns { loggedIn, email, ... }
        if (data?.loggedIn && data?.email) {
          setUserEmail(data.email);
        }
      })
      .catch((err) => console.error("Error fetching /api/me:", err));
  }, []);

  // Fetch user orders
  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/returns/orders?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => console.error("Error fetching orders:", err));
  }, [userEmail]);

  // Fetch order details
  useEffect(() => {
    if (!selectedOrder) return;

    fetch(`/api/returns/order-details?order_id=${selectedOrder}`)
      .then(async (res) => {
        const text = await res.text();
        if (!text) return {};
        return JSON.parse(text);
      })
      .then((data) => {
        setDetails(data);
        setDemoPurpose(data.purpose || "");
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        setDetails({});
      });
  }, [selectedOrder]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      submitted_by: userEmail,
      order_id: selectedOrder,
      products_demod: details.products,
      return_from: details.address,
      demo_purpose: demoPurpose,
      demo_count: demoCount,
      is_ongoing: isOngoing,
      unit_count: unitCount,
      estimated_value: estimatedValue,
      is_registered: isRegistered,
      deal_reg_number: dealRegNumber,
      event_demo_count: eventDemoCount,
      notes,
    };

    try {
      const res = await fetch("/api/returns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      alert(
        json.success
          ? "✅ Return submitted successfully!"
          : `❌ ${json.error || "Something went wrong"}`
      );
    } catch (err) {
      console.error("Error submitting return:", err);
      alert("❌ Network error while submitting return.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="returns-form">
      {/* Submitted By */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Submitted by:
        </label>
        <input
          type="email"
          value={userEmail}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 focus:outline-none"
        />
      </div>

      {/* Order Reference Number */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Order Reference Number:
        </label>
        <select
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        >
          <option value="">Select Your Order #</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.id}
            </option>
          ))}
        </select>
      </div>

      {/* Products Demod */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Products Demod:
        </label>
        <textarea
          value={details.products || ""}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 focus:outline-none"
        />
      </div>

      {/* Return From */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Initiate Return Order from:
        </label>
        <input
          type="text"
          value={details.address || ""}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 focus:outline-none"
        />
      </div>

      {/* Ship To */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Ship Return Order to:
        </label>
        <input
          type="text"
          value="15345 Anacapa Rd Unit A Victorville, CA 92392"
          readOnly
          className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 focus:outline-none"
        />
      </div>

      {/* Demo Purpose */}
      <div>
        <label className="block text-[15px] font-medium mb-1">
          Demo Purpose:
        </label>
        <select
          value={demoPurpose}
          onChange={(e) => setDemoPurpose(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        >
          <option value="">Select</option>
          <option value="Prospect/Meeting">Prospect/Meeting</option>
          <option value="Event">Event</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Conditional Sections */}
      {demoPurpose === "Prospect/Meeting" && (
        <div className="conditional">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <label>Actual # of demos done:</label>
              <input
                type="number"
                value={demoCount}
                onChange={(e) => setDemoCount(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5"
              />
            </div>

            <div>
              <label>Is this opportunity still ongoing?</label>
              <select
                value={isOngoing}
                onChange={(e) => setIsOngoing(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {isOngoing === "yes" && (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4">
              <div>
                <label>
                  How many units is your customer looking to purchase?
                </label>
                <input
                  type="number"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5"
                />
              </div>

              <div>
                <label>Estimated Opportunity Value</label>
                <input
                  type="text"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4">
            <div>
              <label>Is this opportunity/deal now registered?</label>
              <select
                value={isRegistered}
                onChange={(e) => setIsRegistered(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {isRegistered === "yes" && (
              <div>
                <label>If yes, provide deal reg number</label>
                <input
                  type="text"
                  value={dealRegNumber}
                  onChange={(e) => setDealRegNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {(demoPurpose === "Event" || demoPurpose === "Other") && (
        <div className="conditional">
          <label>How many demos did you actually do?</label>
          <input
            type="number"
            value={eventDemoCount}
            onChange={(e) => setEventDemoCount(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5"
          />
        </div>
      )}

      {/* Notes */}
      <div className="conditional">
        <label className="block text-[15px] font-medium mb-1">Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2.5"
        />
      </div>

      {/* Submit Button */}
      <div className="conditional btn">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0057ff] hover:bg-[#0045cc] text-white px-16 py-2.5 rounded-full mt-6 transition-all duration-200 shadow-sm disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
