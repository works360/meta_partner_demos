import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("uploadfile");
    const galleryFiles = formData.getAll("gallery_images[]");

    if (!file) {
      return NextResponse.json({ success: false, message: "No main image provided" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name; // ✅ Use original filename
    const uploadDir = path.join(process.cwd(), "public", "productimages");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    // ✅ Handle gallery uploads
    const galleryImageNames = [];
    for (const g of galleryFiles) {
      if (g && g.name) {
        const gBuffer = Buffer.from(await g.arrayBuffer());
        const gName = g.name; // Keep original
        await fs.writeFile(path.join(uploadDir, gName), gBuffer);
        galleryImageNames.push(gName);
      }
    }

    // ✅ Insert into DB using your original PHP-compatible names
    const [result] = await db.execute(
      "INSERT INTO products (product_name, product_sku, description, product_qty, total_inventory, category, usecase, level, wifi, image, gallery_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        filename,
        galleryImageNames.join(","),
      ]
    );

    return NextResponse.json({ success: true, message: "Product uploaded successfully!" });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
