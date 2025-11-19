"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";

export default function ProductUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = e.currentTarget; // ✅ store before await
  const formData = new FormData(form);

  const res = await fetch("/api/upload-product", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();

  if (result.success) {
    setMessage("✅ Product uploaded successfully!");
    form.reset(); // ✅ works fine now
    setPreview(null);
    setGalleryPreview([]);
  } else {
    setMessage("❌ " + result.message);
  }
};


  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (r) => setPreview(r.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

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

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="card p-4 shadow-sm">
        <div className="row">
          <div className="col-lg-8">
            <div className="mb-3">
              <label>Product Name</label>
              <input name="product_name" required className="form-control" />
            </div>
            <div className="mb-3">
              <label>Product SKU</label>
              <input name="product_sku" className="form-control" />
            </div>
            <div className="mb-3">
              <label>Product Quantity</label>
              <input name="product_qty" required className="form-control" />
            </div>
            <div className="mb-3">
              <label>Total Inventory</label>
              <input name="total_inventory" required className="form-control" />
            </div>
            <div className="mb-3">
              <label>Description</label>
              <input name="description" className="form-control" />
            </div>
            <div className="mb-3">
              <label>Category</label>
              <select name="category" required className="form-control">
                <option value="">Select Category</option>
                <option value="Headset">Headset</option>
                <option value="Offline Apps">Offline Apps</option>
                <option value="Online Apps">Online Apps</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Usecase</label>
              <select name="usecase[]" multiple className="form-select">
                <option>Creativity & Design</option>
                <option>Learning & Training</option>
                <option>Meetings & Collaboration</option>
                <option>Building Community</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Level</label>
              <select name="level[]" multiple className="form-select">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Requires Wi-Fi?</label>
              <select name="wifi[]" multiple className="form-select">
                <option>Yes</option>
                <option>No - Offline</option>
              </select>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="mb-3">
              <label>Main Product Image</label>
              <input
                type="file"
                name="uploadfile"
                required
                accept="image/*"
                className="form-control"
                onChange={handleMainImageChange}
              />
              {preview && <img src={preview} alt="Preview" style={{ width: "100%", marginTop: 10 }} />}
            </div>

            <div className="mb-3">
              <label>Gallery Images (up to 4)</label>
              <input
                type="file"
                name="gallery_images[]"
                multiple
                accept="image/*"
                className="form-control"
                onChange={handleGalleryChange}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: 10 }}>
                {galleryPreview.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 5 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary px-4">
            Upload Product
          </button>
        </div>
        {message && <p className="text-center mt-3">{message}</p>}
      </form>
    </div>
  );
}
