"use client";

import React, { useState } from "react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, text: "" });
    setSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          type: "success",
          text: data.message || "Your message has been sent successfully.",
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus({
          type: "error",
          text:
            data.message ||
            "Message could not be sent. Please check and try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: "Network error. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ========================== */}
      {/*       PAGE HEADER         */}
      {/* ========================== */}
      <div className="py-2 top-header">
        <div className="container">
          <h1 className="text-center m-0" id="step-title">
            Support
          </h1>
        </div>
      </div>

      <div className="container">
        <h2 className="faq-title">Frequently Asked Questions</h2>

        {/* ========================== */}
        {/*        FAQ SECTION         */}
        {/* ========================== */}
        <div className="row">
          <div className="col-md-1" />

          {/* LEFT FAQ COLUMN */}
          <div className="col-md-5">
            <div className="accordion" id="faqLeft">
              <div className="accordion-item">
                <h2 className="accordion-header" id="faq1-heading">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq1"
                  >
                    What is Meta Partner Demos?
                  </button>
                </h2>
                <div
                  id="faq1"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">
                    Meta Partner Demos is a platform designed for Meta resellers
                    to create and manage demo kits featuring Meta Quest headsets
                    and applications. It's ideal for showcasing immersive and
                    mixed reality experiences during client meetings, events, or
                    training sessions.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq2"
                  >
                    How do I create a demo kit?
                  </button>
                </h2>
                <div
                  id="faq2"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">
                    Follow these steps:
                    <br />
                    1. Log in to your account.
                    <br />
                    2. Navigate to the "Create Demo Kit" section.
                    <br />
                    3. Choose your preferred Meta Quest headset.
                    <br />
                    4. Select relevant apps.
                    <br />
                    5. Submit your request.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq3"
                  >
                    How many headsets can I add per order?
                  </button>
                </h2>
                <div
                  id="faq3"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">
                    A maximum of 4 headsets per instance (2 Quest 3 + 2 Quest
                    3S).
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq4"
                  >
                    Can I select apps for my demo?
                  </button>
                </h2>
                <div
                  id="faq4"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">
                    Yes, you can select online and offline apps.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq5"
                  >
                    Can I exclude offline apps?
                  </button>
                </h2>
                <div
                  id="faq5"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">Yes.</div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq6"
                  >
                    How many online apps per order?
                  </button>
                </h2>
                <div
                  id="faq6"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">Up to 4 online apps.</div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq7"
                  >
                    Who can I contact for support?
                  </button>
                </h2>
                <div
                  id="faq7"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqLeft"
                >
                  <div className="accordion-body">
                    Email{" "}
                    <a href="mailto:support@metapartnerdemos.com">
                      support@metapartnerdemos.com
                    </a>{" "}
                    — replies usually within 2 business days.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FAQ COLUMN */}
          <div className="col-md-5">
            <div className="accordion" id="faqRight">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq8"
                  >
                    What happens once I submit an order?
                  </button>
                </h2>
                <div
                  id="faq8"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    Your order is reviewed, approved, and shipped within 7
                    working days.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq9"
                  >
                    What is included in the demo kit?
                  </button>
                </h2>
                <div
                  id="faq9"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    Headset, cables, hand controllers. Selected apps preloaded.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq10"
                  >
                    How is the kit shipped?
                  </button>
                </h2>
                <div
                  id="faq10"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    Shipped in secure cases via FedEx.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq11"
                  >
                    Where is tracking sent?
                  </button>
                </h2>
                <div
                  id="faq11"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    Tracking info is emailed once shipped.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq12"
                  >
                    What is the demo duration?
                  </button>
                </h2>
                <div
                  id="faq12"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">Up to 30 days.</div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq13"
                  >
                    How do I return the demo kit?
                  </button>
                </h2>
                <div
                  id="faq13"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    1. Complete the Returns form.
                    <br />
                    2. Request prepaid return label.
                    <br />
                    3. Pack everything.
                    <br />
                    4. Ship using the provided label.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq14"
                  >
                    Are devices reset after return?
                  </button>
                </h2>
                <div
                  id="faq14"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqRight"
                >
                  <div className="accordion-body">
                    Yes, all devices are factory reset.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-1" />
        </div>

        {/* ============================== */}
        {/*      CONTACT FORM SECTION      */}
        {/* ============================== */}
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-1" />
            <div className="col-md-10">
              <h5>
                Still have questions? Fill out the form below or email{" "}
                <a href="mailto:support@metapartnerdemos.com">
                  support@metapartnerdemos.com
                </a>
                .
              </h5>

              {status.type && (
                <div
                  className={`alert mt-3 ${
                    status.type === "success"
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {status.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="row g-3 mt-3" noValidate>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <textarea
                    className="form-control"
                    name="message"
                    rows={5}
                    placeholder="Message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 text-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5 sub-button"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-1" />
          </div>
        </div>
      </div>

      {/* =============================== */}
      {/*            PAGE CSS             */}
      {/* =============================== */}
      <style jsx>{`
        body {
          font-family: "Segoe UI", sans-serif;
          background: linear-gradient(to bottom right, #f2f4f8, #ffffff);
          padding: 40px 0;
        }
        .faq-title {
          text-align: center;
          font-weight: 500;
          font-size: 36px;
          margin-bottom: 30px;
          margin-top: 30px;
          color: #222;
        }
        .accordion-button {
          font-weight: 500;
          font-size: 18px;
          padding: 20px 36px;
        }
        .accordion-body {
          font-size: 16px;
          color: #6a6a6a;
          font-weight: 400;
          line-height: 26px;
          font-family: "Poppins", Sans-serif;
          padding: 20px 50px 30px 30px;
        }
        .accordion-item {
          border: none;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .accordion-button:not(.collapsed) {
          background-color: #e9f0fb;
          color: #0d6efd;
        }
      `}</style>
    </>
  );
}
