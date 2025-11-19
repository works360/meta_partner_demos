import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

// ✅ Fetch product
export async function GET(req, context) {
  const { id } = await context.params;
  const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
  if (!rows.length)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// ✅ Update product
export async function PUT(req, context) {
  const { id } = await context.params; // ✅ FIXED

  try {
    const formData = await req.formData();

    const product_name = formData.get("product_name");
    const product_sku = formData.get("product_sku");
    const product_qty = formData.get("product_qty");
    const total_inventory = formData.get("total_inventory");
    const description = formData.get("description");
    const category = formData.get("category");
    const usecase = formData.getAll("usecase[]").join(",");
    const level = formData.getAll("level[]").join(",");
    const wifi = formData.getAll("wifi[]").join(",");

    const file = formData.get("uploadfile");
    const galleryFiles = formData.getAll("gallery_images[]");

    let filename = null;
    let galleryNames = [];

    const uploadDir = path.join(process.cwd(), "public", "productimages");
    await fs.mkdir(uploadDir, { recursive: true });

    // ✅ Handle main image upload
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
    }

    // ✅ Handle gallery upload
    for (const g of galleryFiles) {
      if (g && g.name) {
        const gBuffer = Buffer.from(await g.arrayBuffer());
        const gName = g.name;
        await fs.writeFile(path.join(uploadDir, gName), gBuffer);
        galleryNames.push(gName);
      }
    }

    // ✅ SQL update (fixed syntax + id)
    await db.execute(
      `UPDATE products
       SET product_name=?, product_sku=?, product_qty=?, total_inventory=?, description=?, category=?, usecase=?, level=?, wifi=?,
           image=COALESCE(?, image), gallery_images=COALESCE(?, gallery_images)
       WHERE id=?`,
      [
        product_name,
        product_sku,
        product_qty,
        total_inventory,
        description,
        category,
        usecase,
        level,
        wifi,
        filename,
        galleryNames.join(","),
        id,
      ]
    );

    return NextResponse.json({ success: true, message: "✅ Product updated successfully" });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ Delete product
export async function DELETE(req, context) {
  const { id } = await context.params; // ✅ FIXED

  try {
    const [rows] = await db.execute(
      "SELECT image, gallery_images FROM products WHERE id = ?",
      [id]
    );
    if (!rows.length)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const { image, gallery_images } = rows[0];
    const uploadDir = path.join(process.cwd(), "public", "productimages");

    if (image) await fs.unlink(path.join(uploadDir, image)).catch(() => {});
    if (gallery_images) {
      for (const g of gallery_images.split(",")) {
        await fs.unlink(path.join(uploadDir, g)).catch(() => {});
      }
    }

    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "✅ Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    );
  }
}
