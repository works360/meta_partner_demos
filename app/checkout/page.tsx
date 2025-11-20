"use client";

import React, { useState, useEffect } from "react";

export default function CheckoutPage() {

  const [selectedHeadsets, setSelectedHeadsets] = useState<any[]>([]);
  const [selectedOffline, setSelectedOffline] = useState<any[]>([]);
  const [selectedOnline, setSelectedOnline] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    sales_executive: "",
    sales_email: "",
    reseller: "",
    demo_purpose: "",
    expected_demos: "",
    intended_audience: "",
    company: "",
    opportunity_size: "",
    return_date: "",
    revenue_size: "",
    use_case: [] as string[],
    meta_registered: "",
    deal_id: "",
    contact: "",
    contact_email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  const [showMeetingFields, setShowMeetingFields] = useState(false);
  const [showDemoAudience, setShowDemoAudience] = useState(false);
  const [showDealId, setShowDealId] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // 🔐 Prefill from /api/me (session user)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();

        if (data.loggedIn) {
          setFormData((prev) => ({
            ...prev,
            sales_executive: data.salesExecutive || prev.sales_executive,
            sales_email: data.salesEmail || data.email || prev.sales_email,
            reseller: data.reseller || prev.reseller,
          }));
        }
      } catch (err) {
        console.error("Error fetching /api/me:", err);
      }
    };

    fetchMe();
  }, []);

  // 🧩 Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dynamic sections logic
    if (name === "demo_purpose") {
      setShowMeetingFields(value === "Prospect/Meeting");
      setShowDemoAudience(value === "Event" || value === "Other");
    }

    if (name === "meta_registered") {
      setShowDealId(value === "Yes");
    }
  };

  // 🧩 Handle multi-select use_case
  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, use_case: selected }));
  };

  // 🧩 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("Submitting...");

    try {
      const fd = new FormData();

      // Append all normal form fields
      for (const key in formData) {
        const value = (formData as any)[key];
        if (Array.isArray(value)) value.forEach((v) => fd.append(`${key}[]`, v));
        else fd.append(key, value);
      }

      // ✅ Pull selected products from localStorage (from Review step)
      const selectedHeadsets = JSON.parse(localStorage.getItem("selectedHeadsets") || "[]");
      const selectedOffline = JSON.parse(localStorage.getItem("selectedOfflineApps") || "[]");
      const selectedOnline = JSON.parse(localStorage.getItem("selectedOnlineApps") || "[]");

      // ✅ Combine all into one unified products[] array
      const allProducts = [
        ...selectedHeadsets.map((p: any) => ({ id: p.id, qty: p.qty || 1 })),
        ...selectedOffline.map((p: any) => ({ id: p.id, qty: 1 })),
        ...selectedOnline.map((p: any) => ({ id: p.id, qty: 1 })),
      ];

      // ✅ Append them as products[] and quantity[]
      allProducts.forEach((p) => {
        fd.append("products[]", String(p.id));
        fd.append("quantity[]", String(p.qty));
      });

      // Optional: send original arrays for debugging
      fd.append("headsets", JSON.stringify(selectedHeadsets));
      fd.append("offlineApps", JSON.stringify(selectedOffline));
      fd.append("onlineApps", JSON.stringify(selectedOnline));

      console.log("🧾 Sending to API:", allProducts);

      const response = await fetch("/api/finalize-order", {
        method: "POST",
        body: fd,
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Clear kit selection only on success
        localStorage.removeItem("selectedHeadsets");
        localStorage.removeItem("selectedOfflineApps");
        localStorage.removeItem("selectedOnlineApps");

        localStorage.setItem("orderConfirmation", JSON.stringify(result.order));
        setSubmitStatus("✅ Order submitted successfully!");
        setTimeout(() => (window.location.href = "/thank-you"), 1500);
      }
      else {
        setSubmitStatus("❌ Failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus("❌ Network error submitting order.");
    }
  };

  // 🗓 Limit return date
  useEffect(() => {
    const input = document.getElementById("return_date") as HTMLInputElement | null;
    if (input) {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      input.min = format(today);
      input.max = format(endDate);
    }
  }, []);

  useEffect(() => {
  if (typeof window === "undefined") return;

  try {
    const headsets = JSON.parse(localStorage.getItem("selectedHeadsets") || "[]");
    const offline = JSON.parse(localStorage.getItem("selectedOfflineApps") || "[]");
    const online = JSON.parse(localStorage.getItem("selectedOnlineApps") || "[]");

    console.log("💾 Checkout loaded:", { headsets, offline, online });

    // If nothing is selected, send user back to create-kit
    if (!headsets.length && !offline.length && !online.length) {
      alert("Your kit is empty. Please create a kit first.");
      window.location.href = "/create-kit";
      return;
    }

    setSelectedHeadsets(headsets);
    setSelectedOffline(offline);
    setSelectedOnline(online);
  } catch (err) {
    console.error("Error reading localStorage on checkout:", err);
  }
}, []);


  return (
    <div className="app-demos-page p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-buttons" style={{ marginTop: "2rem" }}></div>

        <div className="stepper">
          <div className="step completed">
            <div className="step-circle">1</div>
            <div className="step-label">Pick Headset</div>
          </div>
          <div className="step-line completed"></div>
          <div className="step completed">
            <div className="step-circle">2</div>
            <div className="step-label">Select Apps</div>
          </div>
          <div className="step-line completed"></div>
          <div className="step completed">
            <div className="step-circle">3</div>
            <div className="step-label">Review Order</div>
          </div>
          <div className="step-line completed"></div>
          <div className="step active">
            <div className="step-circle">4</div>
            <div className="step-label">Checkout</div>
          </div>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Requestor Details */}
          <div className="title">
            <h5
              style={{
                fontWeight: 600,
                color: "#5e5e5e",
                margin: "0rem",
                padding: "10px",
                backgroundColor: "#F4F4F4",
              }}
            >
              Requestor Details
            </h5>
          </div>
          <div className="mb-4 p-3 border rounded">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Sales Executive *</label>
                <input
                  name="sales_executive"
                  type="text"
                  className="form-control"
                  required
                  value={formData.sales_executive}
                  onChange={handleChange}
                  // readOnly   // 👉 uncomment if you want it locked
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sales Executive Email *</label>
                <input
                  name="sales_email"
                  type="email"
                  className="form-control"
                  required
                  value={formData.sales_email}
                  onChange={handleChange}
                  // readOnly   // 👉 uncomment if you want it locked
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Reseller *</label>
                <input
                  name="reseller"
                  type="text"
                  className="form-control"
                  required
                  value={formData.reseller}
                  onChange={handleChange}
                  // readOnly   // 👉 uncomment if you want it locked
                />
              </div>
            </div>
          </div>

        {/* Opportunity Details */}
        <div className="title">
          <h5 style={{ fontWeight: 600, color: "#5e5e5e",margin:"0rem", padding:"10px", backgroundColor:"#F4F4F4" }}>Opportunity Details</h5>
        </div>
        <div className="mb-4 p-3 border rounded">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Demo Purpose *</label>
              <select
                name="demo_purpose"
                className="form-select"
                required
                value={formData.demo_purpose}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Prospect/Meeting">Prospect/Meeting</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Expected number of demos to be done? *
              </label>
              <input
                name="expected_demos"
                type="number"
                className="form-control"
                required
                value={formData.expected_demos}
                onChange={handleChange}
              />
            </div>

            {/* Intended Audience */}
            {showDemoAudience && (
              <div className="col-md-6">
                <label className="form-label">Intended demo audience? *</label>
                <select
                  name="intended_audience"
                  className="form-select"
                  required
                  value={formData.intended_audience}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Internal team">Internal team</option>
                  <option value="External audience">External audience</option>
                </select>
              </div>
            )}

            {/* Prospect/Meeting fields */}
            {showMeetingFields && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Company *</label>
                  <input
                    name="company"
                    type="text"
                    className="form-control"
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Expected Opportunity Size *</label>
                  <input
                    name="opportunity_size"
                    type="number"
                    className="form-control"
                    required
                    value={formData.opportunity_size}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Revenue Opportunity Size *</label>
                  <input
                    name="revenue_size"
                    type="number"
                    className="form-control"
                    required
                    value={formData.revenue_size}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Expected Use Case(s) *</label>
                  <select
                    name="use_case"
                    multiple
                    size={6}
                    className="form-select"
                    required
                    onChange={handleUseCaseChange}
                  >
                    <option value="Creativity & Design">Creativity & Design</option>
                    <option value="Learning & Training">Learning & Training</option>
                    <option value="Meetings & Collaboration">Meetings & Collaboration</option>
                    <option value="Building Community">Building Community</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Is the deal registered with Meta? *</label>
                  <select
                    name="meta_registered"
                    className="form-select"
                    required
                    value={formData.meta_registered}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {showDealId && (
                  <div className="col-md-6">
                    <label className="form-label">
                      Please provide opportunity ID or deal reg #
                    </label>
                    <input
                      name="deal_id"
                      type="text"
                      className="form-control"
                      required
                      value={formData.deal_id}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </>
            )}

            <div className="col-md-6">
              <label className="form-label">Expected Return Date *</label>
              <input
                name="return_date"
                id="return_date"
                type="date"
                className="form-control"
                required
                value={formData.return_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="title">
          <h5 style={{ fontWeight: 600, color: "#5e5e5e",margin:"0rem", padding:"10px", backgroundColor:"#F4F4F4" }}>Shipping Details</h5>
        </div>
        <div className="mb-4 p-3 border rounded">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Point of Contact *</label>
              <input
                name="contact"
                type="text"
                className="form-control"
                required
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email *</label>
              <input
                name="contact_email"
                type="email"
                className="form-control"
                required
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Address *</label>
              <input
                name="address"
                type="text"
                className="form-control"
                required
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">State *</label>
            <select
              name="state"
              className="form-select"
              required
              value={formData.state}
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="AL">Canada</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">City *</label>
              <input
                name="city"
                type="text"
                className="form-control"
                required
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Zip *</label>
              <input
                name="zip"
                type="text"
                className="form-control"
                required
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>
        {/* Terms & Conditions Checkbox */}
<div className="mb-4 d-flex align-items-center" style={{ gap: "8px" }}>
  <input 
    type="checkbox" 
    id="agree"
    required
    style={{ width: "16px", height: "16px", cursor: "pointer" }}
  />
  <label htmlFor="agree" style={{ fontSize: "14px", color: "#4a4a4a", cursor: "pointer" }}>
    I have read and agree to the website{" "}
    <a 
      href="/t&c" 
      target="_blank"
      style={{ color: "#0066ff", textDecoration: "none", fontWeight: 500 }}
    >
      Terms & Conditions
    </a>.
    <span style={{ color: "red", marginLeft: "2px" }}>*</span>
  </label>
</div>


        <div className="text-center mb-5">
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "25%",
              background: "#0066ff",
              border: "none",
              borderRadius: "30px",
              padding: "10px",
              fontWeight: 500,
            }}
             onMouseEnter={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#0066ff";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 102, 255, 0.2)";
                e.currentTarget.style.border = "1px solid #0066ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0066ff";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.border = "none";
              }}
          >
            Place order
          </button>
          {submitStatus && (
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.95rem",
                color:
                  submitStatus.includes("✅")
                    ? "green"
                    : submitStatus.includes("❌")
                    ? "red"
                    : "#555",
              }}
            >
              {submitStatus}
            </div>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
function setSelectedApps(arg0: never[]) {
  throw new Error("Function not implemented.");
}

