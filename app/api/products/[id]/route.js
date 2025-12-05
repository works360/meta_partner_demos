import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

// ------------------------------------------------------
// ⭐ GET ONE PRODUCT  → REQUIRED FOR EDIT PAGE
// ------------------------------------------------------
export async function GET(req, context) {
  const { id } = context.params;

  try {
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (!rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------
// ⭐ UPDATE PRODUCT (PUT)
// ------------------------------------------------------
export async function PUT(req, context) {
  const { id } = context.params;

  try {
    const formData = await req.formData();

    // Get existing product
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    if (!rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = rows[0];

    const product_name = formData.get("product_name");
    const product_sku = formData.get("product_sku");
    const product_qty = formData.get("product_qty");
    const total_inventory = formData.get("total_inventory");
    const description = formData.get("description");
    const category = formData.get("category");
    const usecase = formData.getAll("usecase[]").join(",");
    const level = formData.getAll("level[]").join(",");
    const wifi = formData.getAll("wifi[]").join(",");

    const mainFile = formData.get("uploadfile");
    const galleryFiles = formData.getAll("gallery_images[]");

    let mainImageURL = existing.image;
    let galleryURLs = existing.gallery_images ? existing.gallery_images.split(",") : [];

    // ⭐ Upload new main image
    if (mainFile && typeof mainFile === "object" && mainFile.size > 0) {
      const safeName = mainFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const filename = `product_${Date.now()}_${safeName}`;
      const buffer = Buffer.from(await mainFile.arrayBuffer());
      const uploaded = await put(`products/${filename}`, buffer, { access: "public" });
      mainImageURL = uploaded.url;
    }

    // ⭐ Upload new gallery images
    const newGalleryURLs = [];

    for (const g of galleryFiles) {
      if (g && typeof g === "object" && g.size > 0) {
        const safeName = g.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const filename = `gallery_${Date.now()}_${safeName}`;
        const buffer = Buffer.from(await g.arrayBuffer());
        const uploaded = await put(`products/gallery/${filename}`, buffer, { access: "public" });
        newGalleryURLs.push(uploaded.url);
      }
    }

    if (newGalleryURLs.length > 0) {
      galleryURLs = [...galleryURLs, ...newGalleryURLs];
    }

    await db.execute(
      `UPDATE products
       SET product_name=?, product_sku=?, product_qty=?, total_inventory=?, description=?, 
           category=?, usecase=?, level=?, wifi=?, image=?, gallery_images=?
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
        mainImageURL,
        galleryURLs.join(","),
        id,
      ]
    );

    return NextResponse.json({ success: true, message: "Product updated successfully ✨" });

  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}
