"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  // ✅ Fetch existing product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);

        // ⭐ Blob URLs — use them directly
        if (data.image) setPreview(data.image);

        if (data.gallery_images) {
          setGalleryPreview(data.gallery_images.split(","));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (!product) return <p className="p-5 text-center">Loading product...</p>;

  // ✅ Handle main image preview
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (r) => setPreview(r.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(product.image);
    }
  };

  // ✅ Handle gallery preview
  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (r) => {
        urls.push(r.target?.result as string);
        setGalleryPreview([...urls]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ Submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      setMessage("✅ Product updated successfully!");
      setTimeout(() => router.push("/all-products"), 1200);
    } else {
      setMessage("❌ " + result.message);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Edit Product</h2>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="card p-4 shadow-sm"
      >
        <div className="row">
          {/* LEFT SIDE */}
          <div className="col-lg-8">
            <div className="mb-3">
              <label>Product Name</label>
              <input
                name="product_name"
                defaultValue={product.product_name}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Product SKU</label>
              <input
                name="product_sku"
                defaultValue={product.product_sku}
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Product Quantity</label>
              <input
                name="product_qty"
                defaultValue={product.product_qty}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Total Inventory</label>
              <input
                name="total_inventory"
                defaultValue={product.total_inventory}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Description</label>
              <input
                name="description"
                defaultValue={product.description}
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Category</label>
              <select
                name="category"
                defaultValue={product.category}
                className="form-control"
              >
                <option value="">Select Category</option>
                <option value="Headset">Headset</option>
                <option value="Offline Apps">Offline Apps</option>
                <option value="Online Apps">Online Apps</option>
              </select>
            </div>

            {/* Usecase */}
            <div className="mb-3">
              <label>Usecase</label>
              <select
                name="usecase[]"
                multiple
                defaultValue={product.usecase?.split(",") || []}
                className="form-select"
              >
                <option>Creativity & Design</option>
                <option>Learning & Training</option>
                <option>Meetings & Collaboration</option>
                <option>Building Community</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>

            {/* Level */}
            <div className="mb-3">
              <label>Level</label>
              <select
                name="level[]"
                multiple
                defaultValue={product.level?.split(",") || []}
                className="form-select"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>

            {/* Wi-Fi */}
            <div className="mb-3">
              <label>Requires Wi-Fi?</label>
              <select
                name="wifi[]"
                multiple
                defaultValue={product.wifi?.split(",") || []}
                className="form-select"
              >
                <option>Yes</option>
                <option>No - Offline</option>
              </select>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-4">
            <div className="mb-3">
              <label>Main Product Image</label>
              <input
                type="file"
                name="uploadfile"
                accept="image/*"
                className="form-control"
                onChange={handleMainImageChange}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", marginTop: 10, borderRadius: 5 }}
                />
              )}
            </div>

            <div className="mb-3">
              <label>Gallery Images</label>
              <input
                type="file"
                name="gallery_images[]"
                multiple
                accept="image/*"
                className="form-control"
                onChange={handleGalleryChange}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: 10,
                }}
              >
                {galleryPreview.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 5,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary px-4">
            Update Product
          </button>

          <button
            type="button"
            className="btn btn-secondary px-4 ms-2"
            onClick={() => router.push("/all-products")}
          >
            Cancel
          </button>
        </div>

        {message && <p className="text-center mt-3">{message}</p>}
      </form>
    </div>
  );
}
