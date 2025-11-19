import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Fetch orders for this user
    const [orders]: any = await db.query(
      "SELECT * FROM orders WHERE sales_email = ? ORDER BY id DESC",
      [email]
    );

    if (!orders.length) return NextResponse.json([]);

    for (const order of orders) {
      const [items]: any = await db.query(
        `SELECT p.product_name, p.category, oi.quantity 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const headsets: string[] = [];
      const onlineApps: string[] = [];
      const offlineApps: string[] = [];

      for (const item of items) {
        if (item.category === "Headset") {
          headsets.push(`${item.quantity} × ${item.product_name}`);
        } else if (item.category === "Online Apps") {
          onlineApps.push(item.product_name);
        } else if (item.category === "Offline Apps") {
          offlineApps.push(item.product_name);
        }
      }

      order.headsets = headsets;
      order.onlineApps = onlineApps;
      order.offlineApps = offlineApps;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
