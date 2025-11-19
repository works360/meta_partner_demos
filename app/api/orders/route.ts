import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from 'mysql2/promise';

// Define types for better type safety
interface OrderItem extends RowDataPacket {
  product_name: string;
  category: string;
  quantity: number;
}

interface Order extends RowDataPacket {
  id: number;
  sales_email: string;
  demo_purpose: string;
  created_at: string;
  status: string;
  products?: OrderItem[];
}

export async function GET() {
  try {
    // Query all Prospect/Meeting orders
    const [orders] = await db.query<Order[]>(
      "SELECT * FROM orders WHERE demo_purpose = 'Prospect/Meeting' ORDER BY id DESC"
    );

    if (!Array.isArray(orders)) {
      throw new Error("Invalid response from database");
    }

    const results: Order[] = [];

    for (const order of orders) {
      try {
        const [items] = await db.query<OrderItem[]>(
          `SELECT p.product_name, p.category, oi.quantity
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );

        if (!Array.isArray(items)) {
          console.error(`Failed to fetch items for order ${order.id}`);
          continue;
        }

        results.push({
          ...order,
          products: items,
        });
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
        continue;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
