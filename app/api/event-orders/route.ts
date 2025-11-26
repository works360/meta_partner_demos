import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch only Event & Other
    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE demo_purpose IN ('Event', 'Other') ORDER BY id DESC"
    );

    const results: any[] = [];

    for (const order of orders as any[]) {
      const [items] = await db.execute(
        `SELECT p.product_name, p.category, oi.quantity
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      results.push({
        ...order,
        products: items,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Fetch Event Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event orders" },
      { status: 500 }
    );
  }
}
