"use client";

export function TechnologyPartners() {
  return (
    <section className="technology-section w-full">
      <div
        className="container px-4 sm:px-6 lg:px-10"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div className="row flex flex-col md:flex-row items-center w-full">
          {/* Left text section */}
          <div className="col-lg-6 col-md-7 text-section w-full md:w-1/2 md:text-left px-4">
            <h2 className="main-heading text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug max-w-xl mx-auto md:mx-0">
              Solve your most important organizational challenges with our ecosystem of technology partners
            </h2>
          </div>

          {/* You can keep your right-side image / content here if needed */}
        </div>
      </div>
    </section>
  );
}
{/* MOBILE ONLY SECTION */}
<section className="technology-mobile-section d-md-none">
  <div className="technology-mobile-overlay">
    <h6 className="technology-mobile-subheading">TECHNOLOGY PARTNERS</h6>

    <h2 className="technology-mobile-heading">
      Solve your most important organizational challenges with our ecosystem of technology partners
    </h2>
  </div>
</section>

