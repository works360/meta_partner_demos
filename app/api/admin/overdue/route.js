// app/api/admin/overdue/route.js
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [orders] = await db.query(
      `SELECT * 
       FROM orders 
       WHERE order_status = 'Shipped' 
         AND return_date < CURDATE()
       ORDER BY id DESC`
    );

    return Response.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("❌ API ERROR: overdue orders:", err);
    return Response.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
