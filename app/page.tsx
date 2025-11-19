import { Footer } from "./Components/footer"
import { HeadsetCards } from "./Components/headset-cards"
import { HeroBanner } from "./Components/hero-banner"
import { HowItWorks } from "./Components/how-it-works"

import { PickOptions } from "./Components/pick-options"
import { TechnologyPartners } from "./Components/technology-partners"

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "white" }}>

      <HeroBanner />
      <PickOptions />
      <HeadsetCards />
      <TechnologyPartners />
      <HowItWorks />
   
    </main>
  )
}



// import Link from "next/link"
// import Image from "next/image"


// export default function HomePage() {
//   return (
//     <>
    
//       {/* Desktop Banner */}
//       <div className="text-white py-5 bg-light banner">
//         <div className="container">
//           <img 
//             src="/Meta-logo-white.png" 
//             alt="Meta Logo" 
//             width={140} 
//             height={40}
//             style={{ marginBottom: '15px' }}
//           />
//           <h1 className="bannerhead">
//             Let&apos;s Put Mixed<br />Reality To Work
//           </h1>
//           <p className="text-white mb-4" style={{ width: '40%' }}>
//             Bring your business to life with fully immersive content and blended experiences, 
//             supported by security and privacy features you can trust. Create a Demo Kit for 
//             your prospect meeting, event or training session.
//           </p>
//           <Link href="/create-kit" className="btn btn-primary">
//             Create Demo Kit
//           </Link>
//           <img 
//             src="works360-pro-1-white.png" 
//             alt="Works360 Logo" 
//             width={180}
//             height={60}
//             className="works360-logo"
//           />
//         </div>
//       </div>

//       {/* Mobile Banner */}
//       <div className="text-white py-5 bg-light mobilebanner"></div>
//       <div className="container conmobile">
//         <Image 
//           src="/metamoblogo.jpg" 
//           alt="Meta Logo" 
//           width={180}
//           height={50}
//           style={{ marginBottom: '15px', marginTop: '20px' }}
//         />
//         <h1 className="bannerhead" style={{ fontSize: '29px' }}>
//           Let&apos;s Put Mixed<br />Reality To Work
//         </h1>
//         <p className="text-black mb-4">
//           Bring your business to life with fully immersive content and blended experiences, 
//           supported by security and privacy features you can trust. Create a Demo Kit for 
//           your prospect meeting, event or training session.
//         </p>
//         <Link href="/create-kit" className="btn btn-primary">
//           Create Demo Kit
//         </Link>
//       </div>

//       {/* Pick Options Section */}
//       <section className="pick-options py-5" style={{ marginTop: '115px' }}>
//         <div className="container">
//           <div className="row g-4 justify-content-center">
//             {/* Pick Headset */}
//             <div className="col-md-6 col-lg-5">
//               <div className="option-box text-center p-4">
//                 <Image 
//                   src="/headset.png" 
//                   alt="Pick Headset" 
//                   width={200}
//                   height={150}
//                   className="img-fluid mb-3 option-img"
//                 />
//                 <h3>
//                   <Link href="/create-kit" className="option-link">
//                     Pick Headset
//                   </Link>
//                 </h3>
//                 <p>
//                   First, choose the Meta Quest headset that suits your needs—pick the 
//                   best model and move on to the next step.
//                 </p>
//               </div>
//             </div>

//             {/* Select Apps */}
//             <div className="col-md-6 col-lg-5">
//               <div className="option-box text-center p-4">
//                 <Image 
//                   src="/Appp.png" 
//                   alt="Select Apps" 
//                   width={200}
//                   height={150}
//                   className="img-fluid mb-3 option-img"
//                 />
//                 <h3>
//                   <Link href="/create-kit" className="option-link">
//                     Select Apps
//                   </Link>
//                 </h3>
//                 <p>
//                   Pick relevant apps that will match appropriate use cases for your 
//                   event or meeting.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Headset Section */}
//       <section className="headset-section py-5">
//         <div className="container">
//           <h1 className="mb-4" style={{ fontWeight: '600' }}>
//             Pick Meta Quest Headset
//           </h1>
//           <div className="row g-4 align-items-stretch">
//             {/* Card 1 - Meta Quest 3S */}
//             <div className="col-md-6">
//               <div className="headset-card h-100">
//                 <Image 
//                   src="/Meta-3s.png" 
//                   alt="Meta Quest 3S" 
//                   width={600}
//                   height={400}
//                   className="img-fluid w-100 rounded"
//                 />
//                 <div className="headset-content p-4">
//                   <h3>Meta Quest 3S</h3>
//                   <p>
//                     Meta Quest 3S offers endless possibilities to collaborate, create and 
//                     learn at an incredible price, so now the whole team can experience its power.
//                   </p>
//                   <div className="d-flex align-items-center gap-3 mt-3">
//                     <Link href="/create-kit" className="btn btn-primary">
//                       Get Started
//                     </Link>
//                     <Image 
//                       src="/rightarrow.svg" 
//                       alt="Arrow"
//                       width={25}
//                       height={25}
//                       className="icons"
//                     />
//                     <Link href="/single_product?id=4" className="learn-more d-flex align-items-center">
//                       Learn More
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Card 2 - Meta Quest 3 */}
//             <div className="col-md-6">
//               <div className="headset-card h-100">
//                 <Image 
//                   src="/meta-3.png" 
//                   alt="Meta Quest 3" 
//                   width={600}
//                   height={400}
//                   className="img-fluid w-100 rounded"
//                 />
//                 <div className="headset-content p-4">
//                   <h3>Meta Quest 3</h3>
//                   <p>
//                     Meta Quest 3 is where high performance meets incredible value. Discover 
//                     the inspiring new way to create together, work together or just be together 
//                     in mixed reality.
//                   </p>
//                   <div className="d-flex align-items-center gap-3 mt-3">
//                     <Link href="/create-kit" className="btn btn-primary">
//                       Get Started
//                     </Link>
//                     <Image 
//                       src="/rightarrow.svg" 
//                       alt="Arrow"
//                       width={25}
//                       height={25}
//                       className="icons"
//                     />
//                     <Link href="/single_product?id=6" className="learn-more d-flex align-items-center">
//                       Learn More
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Technology Partners Banner */}
//       <div className="py-5 bg-light banner-bottom">
//         <div className="container desktop">
//           <h2 className="mt-4" style={{ fontSize: '19px', fontWeight: 500 }}>
//             TECHNOLOGY PARTNERS
//           </h2>
//           <p className="bannerhead" style={{ 
//             fontSize: '27px', 
//             fontWeight: 500, 
//             color: '#2E2E2E', 
//             lineHeight: 1.5 
//           }}>
//             Solve your most important<br />
//             organizational challenges<br />
//             with our ecosystem of<br />
//             technology partners.
//           </p>
//         </div>
//       </div>

//       {/* Mobile Technology Partners */}
//       <div className="container mobile" style={{ backgroundColor: '#ececec', padding: '10px' }}>
//         <h2 className="mt-4" style={{ fontSize: '19px', fontWeight: 500 }}>
//           TECHNOLOGY PARTNERS
//         </h2>
//         <p className="bannerhead" style={{ 
//           fontSize: '17px', 
//           fontWeight: 500, 
//           color: '#2E2E2E', 
//           lineHeight: 1.5 
//         }}>
//           Solve your most important<br />
//           organizational challenges with our ecosystem of technology partners.
//         </p>
//       </div>

//       {/* How it Works Section */}
//       <div className="container py-5">
//         <h1 className="mb-4">How it Works</h1>
//         <div className="row g-4">
//           {/* Card 1 - Login */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-file-lines"></i>
//               </div>
//               <h3>LOGIN</h3>
//               <p>
//                 Sign in with your account created on Meta Partner Demos to start using 
//                 the portal.
//               </p>
//               <div className="card-step-number">1</div>
//             </div>
//           </div>

//           {/* Card 2 - Pick Headset */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-vr-cardboard"></i>
//               </div>
//               <h3>PICK HEADSET</h3>
//               <p>
//                 Create a 30-day demo kit; start by choosing a Meta Quest headset that 
//                 suits your needs.
//               </p>
//               <div className="card-step-number">2</div>
//             </div>
//           </div>

//           {/* Card 3 - Select Apps */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-layer-group"></i>
//               </div>
//               <h3>SELECT APPS</h3>
//               <p>
//                 Pick relevant apps that will match appropriate use cases for your event 
//                 or meeting.
//               </p>
//               <div className="card-step-number">3</div>
//             </div>
//           </div>

//           {/* Card 4 - Review & Checkout */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-clipboard-check"></i>
//               </div>
//               <h3>REVIEW & CHECKOUT</h3>
//               <p>
//                 Enter details for opportunity, event & purpose for this demo kit and 
//                 submit checkout form.
//               </p>
//               <div className="card-step-number">4</div>
//             </div>
//           </div>

//           {/* Card 5 - Shipment & Tracking */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-plane-departure"></i>
//               </div>
//               <h3>Shipment & Tracking</h3>
//               <p>
//                 Once reviewed, order will be shipped within a week. Tracking details will 
//                 be emailed once it goes out.
//               </p>
//               <div className="card-step-number">5</div>
//             </div>
//           </div>

//           {/* Card 6 - Feedback & Return */}
//           <div className="col-md-6 col-lg-4">
//             <div className="card-step">
//               <div className="card-icon">
//                 <i className="fa-solid fa-rotate-left"></i>
//               </div>
//               <h3>FEEDBACK & RETURN</h3>
//               <p>
//                 Request a prepaid label to return the demo kit by filling the Feedback Form 
//                 once you are ready to return the devices. Devices are factory reset upon return.
//               </p>
//               <div className="card-step-number">6</div>
//             </div>
//           </div>
//         </div>
        
//       </div>
//       <Footer/>
//     </>
//   )
// }