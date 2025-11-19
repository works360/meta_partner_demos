import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "metapartnerdemos",
    });

    // ✅ Only fetch "Event" and "Other" demo purposes
    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE demo_purpose IN ('Event', 'Other') ORDER BY id DESC"
    );

    const results: any[] = [];

    for (const order of orders as any[]) {
      const [items] = await connection.execute(
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

    await connection.end();
    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Fetch Event Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event orders" },
      { status: 500 }
    );
  }
}
