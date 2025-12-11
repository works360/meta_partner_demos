import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT usecase
      FROM products
      WHERE usecase IS NOT NULL AND usecase <> ''
      ORDER BY usecase ASC
    `);

    // Convert rows to a simple array of strings
    const usecases = rows.map(row => row.usecase);

    return NextResponse.json(usecases, { status: 200 });
  } catch (error) {
    console.error("Error fetching usecases:", error);
    return NextResponse.json(
      { error: "Failed to fetch usecases" },
      { status: 500 }
    );
  }
}
