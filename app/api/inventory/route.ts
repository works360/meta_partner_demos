import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        product_name,
        product_sku,
        COALESCE(product_qty, 0) AS product_qty,
        COALESCE(total_inventory, 0) AS total_inventory
      FROM products
      WHERE category = 'Headset'
      ORDER BY product_name ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ GET /api/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
