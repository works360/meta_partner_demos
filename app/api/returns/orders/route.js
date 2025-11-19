import { db } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json({ error: "Missing email" }, { status: 400 });
  }

  const [rows] = await db.query(
    "SELECT id FROM orders WHERE sales_email = ? AND order_status = 'Shipped'",
    [email]
  );

  return Response.json(rows);
}
