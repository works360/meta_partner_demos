"use client"

import { useState } from "react"

export default function SupportPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    { question: "What is Meta Partner Demos?", answer: "Meta Partner Demos is a platform designed for Meta resellers to create and manage demo kits featuring Meta Quest headsets and applications. It's ideal for showcasing immersive and mixed reality experiences during client meetings, events, or training sessions." },
    { question: "How do I create a demo kit?", answer: `Follow these steps:
                    1. Log in to your account.
                    2. Navigate to the Create Demo Kit section.
                    3. Choose your preferred Meta Quest headset.
                    4. Select relevant apps that suit your demo needs.
                    5. Provide details and submit your request.`,},
    { question: "How many headsets can I add per order?", answer: "A maximum of (4) headsets can be checked out per instance. Two of the Meta Quest 3 and two of the Meta Quest 3S." },
    { question: "Can I select apps for my demo?", answer: "Yes, you can select online and offline apps that align with your specific use case or event requirements." },
    { question: "Can I exclude any of the offline apps from my demo?", answer: "Yes, you can deselect Pre-packaged apps that you don't need during the app selection step." },
    { question: "How many online apps can I add per order?", answer: "Up to 4 online apps can be added per order." },
    { question: "Who can I contact for support?", answer: "You can reach out to support@metapartnerdemos.com for any questions - responses are usually received within two working days." },
    { question: "What happens once I submit an order?", answer: "Once you submit your order it will be reviewed, approved and shipped within 7 working days." },
    { question: "What will be included in my demo kit?", answer: "Headset, cables and hand controllers. Selected apps will be preloaded on the headsets." },
    { question: "How is the demo kit shipped?", answer: "The demo kit is shipped in secure cases via trusted courier services such as FedEx." },
    { question: "Where will I receive tracking information?", answer: "Tracking info will be sent via email once the order ships." },
    { question: "What is the duration of the demo?", answer: "Up to 30 days" },
    { question: "How do I return the demo kit?", answer: `To return:
                    1. Complete the Returns form on the portal.
                    2. Request a prepaid return label.
                    3. Place the headset, cables and hand controllers in the case.
                    4. Use the provided label to ship the kit back.`,},
    { question: "Are the devices reset upon return?", answer: "Yes, all devices are factory reset upon return." }
  ]

  const toggleFAQ = (index: number) => {
  // If the same index is clicked again, close it; otherwise, open only that one.
  setActiveIndex(prevIndex => (prevIndex === index ? null : index))
}
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  };

  const res = await fetch("/api/sendEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    alert("Your message has been submitted successfully! Please check your email for confirmation.");
    form.reset();
  } else {
    alert("There was an error sending your message. Please try again later.");
  }
};

  return (
    <div
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header Row with Gradient Background */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(to right, #fff3f7, #e0f0ff, #edfff9)",
          textAlign: "center",
          padding: "4rem 0 0.7rem 0",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2.1rem", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>Support</h1>
      </div>

      <div style={{ maxWidth: "1250px", width: "100%", backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "12px", padding: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem", textAlign: "start" }}>Frequently Asked Questions</h2>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "1rem",
          }}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
                >
                {faq.question}
                <span style={{ fontSize: "1.5rem", fontWeight: 400, color: "#333" }}>
                    {activeIndex === index ? "−" : "+"}
                </span>
                </button>
                {activeIndex === index && (
                <div
                    style={{
                        padding: "0 1rem 1rem",
                        color: "#555",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                    }}
                    >
                    {faq.answer}
                </div>
                )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1rem", color: "#333" }}>
            Still have questions? Get in touch by filling out the form below or reaching us at <b style={{ color: "#0D6EFD" }}>support@metapartnerdemos.com</b>
          </p>

          <form onSubmit={handleSubmit}
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
                width: "100%",
              }}
            >
            <input type="email" name="email" placeholder="Email" required style={inputStyle} />
            <input type="text" name="name" placeholder="Name" required style={inputStyle} />
            <input type="text" name="phone" placeholder="Phone Number" style={inputStyle} />
            </div>

            <textarea name="message" placeholder="Message" required style={{ ...inputStyle, minHeight: "120px", width: "100%" }} />
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                type="submit"
                style={buttonStyle}
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
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: "0.8rem 1rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#0066FF",
  color: "#fff",
  border: "none",
  borderRadius: "30px",
  padding: "10px 85px",
  cursor: "pointer",
  fontWeight: 500,
  transition: "all 0.3s ease",
}
