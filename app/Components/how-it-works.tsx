import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faVrCardboard,
  faLayerGroup,
  faClipboardCheck,
  faPlaneDeparture,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';

export function HowItWorks() {
  const steps = [
    { id: 1, number: "1", title: "Login after Training & Registration", description: "Login to the Meta Partner Demos portal once you’ve completed the Meta Demo Certification Training and have been registered.", icon: faFileLines },
    { id: 2, number: "2", title: "Pick Headset", description: "Create a 30-day demo kit; start by choosing a Meta Quest headset that suits your needs.", icon: faVrCardboard },
    { id: 3, number: "3", title: "Select Apps", description: "Pick relevant apps that will match appropriate use cases for your event or meeting.", icon: faLayerGroup },
    { id: 4, number: "4", title: "Review & Checkout", description: "Fill details on checkout – kits can only be sent to users who have completed the Meta Demo Certification.", icon: faClipboardCheck },
    { id: 5, number: "5", title: "Shipment & Tracking", description: "Once reviewed & approved, order is shipped within a week. Tracking details are emailed as the order goes out.", icon: faPlaneDeparture },
    { id: 6, number: "6", title: "Feedback & Return", description: "Request a prepaid label to return the demo kit by filling the Feedback Form once you are ready to return the devices. Devices are factory reset upon return.", icon: faRotateLeft },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4" style={{ fontSize: "1.8rem" }}>How it Works</h1>
        <div className="row g-4">
          {steps.map((step) => (
            <div key={step.id} className="col-md-6 col-lg-4">
              <div className="card-step">
                <div className="card-icon">
                  <FontAwesomeIcon icon={step.icon} size="2x" color="#007bff" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="card-step-number">{step.number}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
