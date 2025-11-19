import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 1️⃣ Fetch order info
    const [orders] = await db.query(
      "SELECT id, sales_email, demo_purpose, address, order_status FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    // 2️⃣ Fetch ONLY headset products (ignore apps)
    const [items] = await db.query(
      `SELECT p.product_name, p.category, oi.quantity
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?
         AND (
           p.category LIKE '%headset%' 
           OR p.category LIKE '%vr headset%' 
           OR p.category LIKE '%ar headset%' 
           OR p.category LIKE '%mixed reality%' 
           OR p.category = 'Headset'
           OR p.category = 'VR'
           OR p.category = 'AR'
         )`,
      [orderId]
    );

    // 3️⃣ Format response like the PHP expected
    const response = {
      products:
        items && items.length > 0
          ? items.map(i => `${i.product_name} (x${i.quantity})`).join(", ")
          : "No headset products found",
      address: order.address || "",
      purpose: order.demo_purpose || "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("order-details error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
