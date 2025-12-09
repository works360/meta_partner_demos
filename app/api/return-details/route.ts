import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = Number(searchParams.get("order_id"));

    if (!orderId || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const sql = `
      SELECT 
        rr.*,
        o.return_tracking,
        o.return_tracking_link,
        o.return_label
      FROM return_requests rr
      LEFT JOIN orders o ON o.id = rr.order_id
      WHERE rr.order_id = ?
      ORDER BY rr.submitted_at DESC, rr.id DESC
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [orderId]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("❌ /api/return-details error:", error);
    return NextResponse.json({ error: "Failed to load return details" }, { status: 500 });
  }
}
