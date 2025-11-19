"use client"
import Link from "next/link"
import Image from "next/image"

export function HeadsetCards() {
  const headsets = [
    {
      id: 1,
      name: "Meta Quest 3S",
      description:
        "Meta Quest 3S offers endless possibilities to collaborate, create and learn at an incredible price, so now the whole team can experience its power.",
      image: "/Meta-3s.webp",
      productId: 4,
    },
    {
      id: 2,
      name: "Meta Quest 3",
      description:
        "Meta Quest 3 is where high performance meets incredible value. Discover the inspiring new way to create together, work together or just be together in mixed reality.",
      image: "/meta-3.webp",
      productId: 6,
    },
  ]

  return (
    <section className="headset-section">
      <div className="container">
        <h1 className="headset-title">Pick Meta Quest Headset</h1>
        <div className="row g-4 align-items-stretch">
          {headsets.map((headset) => (
            <div key={headset.id} className="col-md-6">
              <div className={`headset-card ${headset.id === 1 ? "border-right" : ""}`}>
                {/* Image */}
                <div className="headset-image">
                  <Image
                    src={headset.image}
                    alt={headset.name}
                    width={600}
                    height={350}
                    className="img-fluid headset-img"
                  />
                </div>

                {/* Text */}
                <div className="headset-content">
                  <h3 className="headset-name">{headset.name}</h3>
                  <p className="headset-desc">{headset.description}</p>

                  {/* Buttons */}
                  <div className="headset-buttons">
                    <Link href="/create-kit" className="btn-get-started">
                      Get Started
                    </Link>

                    <div className="learn-more-section" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div>
                        <img src="/arrow.png" alt="arrow" style={{ width: "2rem", height: "auto" }} />
                      </div>
                      <Link href={`/single-product?id=${headset.productId}`} className="learn-more">
                        Learn More
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
