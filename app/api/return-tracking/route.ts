import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    let sql = `
      SELECT
        rr.id,
        rr.submitted_by,
        rr.order_id,
        rr.submit_return,
        rr.return_from,
        rr.demo_purpose,
        rr.demo_count,
        rr.is_ongoing,
        rr.is_registered,
        rr.event_demo_count,
        rr.unit_count,
        rr.estimated_value,
        rr.deal_reg_number,
        rr.notes,
        rr.submitted_at,
        o.return_tracking,
        o.return_tracking_link,
        o.return_label
      FROM return_requests rr
      LEFT JOIN orders o ON o.id = rr.order_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (q !== "") {
      sql += ` AND (CAST(rr.order_id AS CHAR) LIKE ? OR rr.return_from LIKE ? OR rr.demo_purpose LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    sql += " ORDER BY rr.submitted_at DESC, rr.id DESC";

    const [rows] = await db.query(sql, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ GET /api/return-tracking error:", error);
    return NextResponse.json({ error: "Failed to load return tracking" }, { status: 500 });
  }
}
