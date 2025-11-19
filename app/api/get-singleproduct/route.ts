import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const [rows]: any = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (!rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = rows[0];
    product.gallery_images = product.gallery_images
      ? product.gallery_images.split(",")
      : [];

    return NextResponse.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
