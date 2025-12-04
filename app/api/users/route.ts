import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT id, username, sales_executive, reseller
      FROM users
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
