"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./single-product.css"; // ✅ Import custom CSS

interface Product {
  id: number;
  product_name: string;
  product_sku: string;
  product_qty: number;
  total_inventory: number;
  usecase: string;
  level: string;
  description: string;
  image: string;
  gallery_images: string[];
}

export default function SingleProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const res = await fetch(`/api/get-singleproduct?id=${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          setMainImage(`/productimages/${data.image}`);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="loading-screen">Loading product details...</div>
    );
  }

  const handleImageClick = (src: string) => {
    setMainImage(src);
  };

  return (
    <div className="single-product-body">
      <div className="product-wrapper" style={{ marginTop: "3rem" }}>
        <div className="header-row">
          <button className="back-btn" onClick={() => router.push("/")}>
            <img src="/back-arrow.png" alt="Back" width={18} />
            Back
          </button>
         
        </div>

        <div className="product-card">
          <div className="left-section">
            <div className="main-image-box">
              <img
                src={mainImage}
                alt={product.product_name}
                className="main-image"
              />
            </div>

            <div className="gallery">
              <img
                src={`/productimages/${product.image}`}
                alt="Main"
                className={`thumb ${
                  mainImage === `/productimages/${product.image}` ? "selected" : ""
                }`}
                onClick={() =>
                  handleImageClick(`/productimages/${product.image}`)
                }
              />
              {product.gallery_images.map((img, i) => (
                <img
                  key={i}
                  src={`/productimages/${img}`}
                  alt="Gallery"
                  className={`thumb ${
                    mainImage === `/productimages/${img}` ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleImageClick(`/productimages/${img}`)
                  }
                />
              ))}
            </div>
          </div>

          <div className="right-section">
             <h2>{product.product_name}</h2>
            <p><strong>SKU:</strong> {product.product_sku}</p>
            <p><strong>Quantity:</strong> {product.product_qty}</p>
            <p><strong>Total Inventory:</strong> {product.total_inventory}</p>
            <p><strong>Usecase:</strong> {product.usecase}</p>
            <p><strong>Level:</strong> {product.level}</p>
            <p><strong>Description:</strong> {product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
