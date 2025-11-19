import "./terms.css";

export default function TermsConditions() {
  return (
    <div className="">
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
        <h1 style={{ fontSize: "2.1rem", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>Program Terms & Conditions</h1>
      </div>

      <div className="tc-card">
        <ol className="tc-list">
          <li>
            <strong>Individual Access:</strong> Program access is granted on a
            one-to-one basis exclusively for each approved user only.
          </li>

          <li>
            <strong>Eligibility and Use:</strong> Devices are only for use by
            individuals who have successfully completed the required demo
            certification and have active access to the official order site.
          </li>

          <li>
            <strong>Intended Use & Content:</strong> The devices are provided
            solely for demo’ing the device itself and content that has been
            officially approved and made available through the order site.
            <ul>
              <li>
                To maintain optimal performance and program integrity, please do
                not perform a factory reset on the devices or attempt to install
                unauthorized content.
              </li>
              <li>
                Only approved content from the order site may be demo’d on these
                devices.
              </li>
            </ul>
          </li>

          <li>
            <strong>Device Ordering and Collection:</strong> All demo device
            orders must be placed by the program participant and shipped
            directly to the participant for personal collection.
            <ul>
              <li>
                <strong>Event Shipping Exception:</strong> Devices may be
                advance-shipped to an event location (with a different pickup
                contact); however, the participant is responsible for collection,
                return, and security.
              </li>
            </ul>
          </li>

          <li>
            <strong>Demo Supervision:</strong> To ensure a quality and safe
            experience, program participants must guide all demos.
            Customers/Prospects and those being trained should not operate the
            devices without direct supervision.
          </li>

          <li>
            <strong>Return Policy:</strong> Devices are loaned for a 30-day
            period. All devices must be returned by the end of this tenure. If
            a device is needed longer, a new order must be placed. Extensions
            cannot be granted. Concurrent orders are allowed.
          </li>

          <li>
            <strong>Program Compliance and Continued Access:</strong> Adherence
            to all terms and conditions is essential for continued participation.
            <strong className="highlight">
              {" "}
              Failure to comply may result in suspension or revocation of Demo
              Program access.
            </strong>
          </li>
        </ol>
      </div>
    </div>
  );
}
