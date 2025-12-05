import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const mainFile = formData.get("uploadfile");
    const galleryFiles = formData.getAll("gallery_images[]");

    if (!mainFile) {
      return NextResponse.json({ success: false, message: "Main image missing" });
    }

    // ------------------------------
    // ⭐ Upload MAIN IMAGE to Vercel Blob
    // ------------------------------

    const safeMainName = mainFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const mainFilename = `product_${Date.now()}_${safeMainName}`;

    const mainArrayBuffer = await mainFile.arrayBuffer();
    const mainBuffer = Buffer.from(mainArrayBuffer);

    const uploadedMain = await put(`products/${mainFilename}`, mainBuffer, {
      access: "public",
    });

    const mainImageURL = uploadedMain.url;

    console.log("✅ Main image uploaded:", mainImageURL);

    // ------------------------------
    // ⭐ Upload GALLERY IMAGES (Multiple)
    // ------------------------------

    const galleryImageURLs = [];

    for (const g of galleryFiles) {
      if (g && typeof g === "object" && g.size > 0) {
        const safeName = g.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const gFilename = `gallery_${Date.now()}_${safeName}`;

        const gArrayBuffer = await g.arrayBuffer();
        const gBuffer = Buffer.from(gArrayBuffer);

        const uploadedG = await put(`products/gallery/${gFilename}`, gBuffer, {
          access: "public",
        });

        galleryImageURLs.push(uploadedG.url);
        console.log("📸 Gallery Uploaded:", uploadedG.url);
      }
    }

    // ------------------------------
    // ⭐ Insert product into DB
    // ------------------------------

    await db.execute(
      `INSERT INTO products 
      (product_name, product_sku, description, product_qty, total_inventory, category, usecase, level, wifi, image, gallery_images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.get("product_name"),
        formData.get("product_sku"),
        formData.get("description"),
        formData.get("product_qty"),
        formData.get("total_inventory"),
        formData.get("category"),
        formData.getAll("usecase[]").join(","),
        formData.getAll("level[]").join(","),
        formData.getAll("wifi[]").join(","),
        mainImageURL,
        galleryImageURLs.join(","), // comma-separated URLs
      ]
    );

    return NextResponse.json({ success: true, message: "Uploaded successfully!" });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
