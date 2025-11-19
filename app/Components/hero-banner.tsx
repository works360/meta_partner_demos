import Link from "next/link"

export function HeroBanner() {
  return (
    <>
      <div className="d-none d-md-block banner text-white py-5">
      <div className="container">
        <img
          src="/Meta-logo-white.png"
          alt="Meta Logo"
          className="meta-logo"
        />

        <h1 className="bannerhead">
          Let's Put Mixed
          <br />
          Reality To Work
        </h1>

        <p className="mb-4 bannertext" style={{ width: "40%" }}>
          Bring your business to life with fully immersive content and blended experiences, supported by security and privacy features you can trust. Get certified & create a demo kit for your prospect meeting, event or training session with the Partner Demos program by Meta in just a few simple steps!
        </p>

        <Link href="/create-kit" className="btn btn-primary create-kit" >
          Create Demo Kit
        </Link>

        <img src="/works360-pro-1-white.png" alt="Works360 Logo" className="works360-logo" />
      </div>
    </div>

      <div className="d-md-none mobilebanner text-center text-white">
  <div className="container conmobile">
    <img
      src="/Meta-logo-white.png"
      alt="Meta Logo"
      className="meta-logo"
    />
    <h1 className="bannerhead">
      Let's Put Mixed
      <br />
      Reality To Work
    </h1>
    <p className="banner-text">
      Bring your business to life with fully immersive content and blended experiences, supported by security and
      privacy features you can trust. Create a Demo Kit for your prospect meeting, event or training session.
    </p>
    <Link href="/create-kit" className="btn btn-primary">
      Create Demo Kit
    </Link>
  </div>
</div>
    </>
  )
}
