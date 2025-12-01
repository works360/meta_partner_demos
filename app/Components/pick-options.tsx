"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export function PickOptions() {
  const [hovered, setHovered] = useState<string | null>(null)

  const options = [
    {
      id: "headset",
      title: "Pick Headset",
      desc: "First, choose the Meta Quest headset that suits your needs—pick the best model and move on to the next step.",
      img: "/headset.webp",
      link: "/create-kit",
    },
    {
      id: "apps",
      title: "Select Apps",
      desc: "Pick relevant apps that will match appropriate use cases for your event or meeting.",
      img: "/Apps.png",
      link: "/create-kit",
    },
  ]

  return (
    <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-20 overflow-hidden bg-gradient-to-bl from-[#F8F9FA] via-white to-[#E8F0FE]">
      <div className="container">
        <div className="row g-4 justify-content-center align-items-stretch" style={{ marginTop:"5rem"}} >
          {options.map((opt) => (
            <div className="col-md-6 col-lg-5" key={opt.id}>
              <div
                className={`option-box ${hovered === opt.id ? "hovered" : ""}`}
                onMouseEnter={() => setHovered(opt.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="option-image-container">
                  <Image
                    src={opt.img}
                    alt={opt.title}
                    fill
                    className="option-image"
                  />
                  
                </div>

                <div className="option-content">
                  <h3 className="option-title">
                    <Link href={opt.link} className="option-link">
                      {opt.title}
                    </Link>
                  </h3>
                  <p className="option-desc">{opt.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
