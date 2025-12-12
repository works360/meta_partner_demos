"use client";

import { useEffect, useState, useRef, MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./single-product.css";

interface Product {
  id: number;
  product_name: string;
  product_sku: string;
  product_qty: number;
  total_inventory: number;
  usecase: string;
  level: string;
  description: string;
  image: string;              // FULL BLOB URL
  gallery_images: string[];   // ARRAY OF FULL BLOB URLs
}

export default function SingleProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // hover zoom
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(false);

  const handleZoom = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoom(true);

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  // Load product
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const res = await fetch(`/api/get-singleproduct?id=${id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data);
          setMainImage(data.image); // ⭐ Blob URL directly
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }

    fetchProduct();
  }, [id]);

  // Wait for product to load
  if (!product) {
    return <div className="loading-screen">Loading product details...</div>;
  }

  // ⭐ COMBINE IMAGES (NO /productimages)
  const allImages = [product.image, ...product.gallery_images];

  // Slider logic
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(newIndex);
    setMainImage(allImages[newIndex]);
  };

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(newIndex);
    setMainImage(allImages[newIndex]);
  };

  const handleImageClick = (src: string, index: number) => {
    setMainImage(src);
    setCurrentIndex(index);
  };

  return (
    <div className="single-product-body">
      <div className="product-wrapper" style={{ marginTop: "3rem" }}>
        <div className="header-row">
          {/* <button className="back-btn" onClick={() => router.push("/")}>
            <img src="/back-arrow.png" alt="Back" width={18} />
            Back
          </button> */}
        </div>

        <div className="product-card">
          <div className="left-section">
            <div className="main-image-box">
              <div
                className="zoom-container"
                onMouseMove={handleZoom}
                onMouseLeave={() => setZoom(false)}
              >
                {/* LEFT ARROW */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    className="img-arrow arrow-left"
                    onClick={handlePrev}
                  >
                    ‹
                  </button>
                )}

                {/* RIGHT ARROW */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    className="img-arrow arrow-right"
                    onClick={handleNext}
                  >
                    ›
                  </button>
                )}

                {/* MAIN IMAGE (with hover zoom) */}
                <img
                  ref={imgRef}
                  src={mainImage}
                  alt={product.product_name}
                  className={`main-image ${zoom ? "zoom-active" : ""}`}
                />
              </div>
            </div>

            <div className="gallery">
              {allImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Gallery"
                  className={`thumb ${mainImage === src ? "selected" : ""}`}
                  onClick={() => handleImageClick(src, i)}
                />
              ))}
            </div>
          </div>

          <div className="right-section">
            <h2>{product.product_name}</h2>
            {/* <p>
              <strong>SKU:</strong> {product.product_sku}
            </p> */}
  
              <strong style={{ fontSize: "1.2rem", fontWeight: "500"}}>Description:</strong> 
            
            <p style={{ fontSize: "0.95rem" }}>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
