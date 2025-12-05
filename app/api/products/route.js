import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");

    // ALWAYS RETURN AN ARRAY
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);

    // RETURN EMPTY ARRAY ON ERROR
    return NextResponse.json([]);
  }
}
