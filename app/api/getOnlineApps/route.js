import { db } from "@/lib/db";

export async function GET() {
  try {
    // ✅ Fetch all online apps
    const [rows] = await db.query(`
      SELECT 
        id,
        product_name AS name,
        product_sku AS sku,
        product_qty AS quantity,
        total_inventory,
        description,
        category,
        usecase,
        level,
        wifi,
        image,
        gallery_images
      FROM products
      WHERE category = 'Online Apps'
    `);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Database Fetch Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products from database" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
