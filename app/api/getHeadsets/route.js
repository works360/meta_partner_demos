import { db } from "@/lib/db";

export async function GET() {
  try {
    // ✅ Fetch only headset-type products
    const [rows] = await db.query(`
      SELECT 
        id,
        product_name AS name,
        product_sku AS sku,
        description AS specs,
        image,
        category
      FROM products
      WHERE category LIKE '%headset%'
         OR category LIKE '%Headset%'
         OR product_name LIKE '%Meta Quest%'
    `);

    // ✅ Format image path correctly
    const formatted = rows.map((item) => ({
      ...item,
      image: item.image
        ? `/productimages/${item.image}`
        : "https://placehold.co/400x160/cbd5e1/475569?text=No+Image",
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Database Fetch Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch headsets from database" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
