import { db } from "@/lib/db";

export async function GET(req) {
  const session = req.cookies.get("sessionUser");

  if (!session) {
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }

  try {
    const user = JSON.parse(session.value);
    const email = (user?.email || "").toLowerCase();

    // ⭐ CLEAN SQL (no hidden chars)
    const sql = `
      SELECT 
        user_role,
        sales_executive,
        username,
        reseller
      FROM users
      WHERE LOWER(username) = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [email]);

    let role = "user";
    let salesExecutive = "";
    let salesEmail = email;
    let reseller = "";

    if (rows && rows.length > 0) {
      const row = rows[0];

      if (row.user_role) {
        role = row.user_role.trim().toLowerCase();
      }

      salesExecutive = row.sales_executive || "";
      salesEmail = (row.username || email || "").toLowerCase();
      reseller = row.reseller || "";
    }

    return new Response(
      JSON.stringify({
        loggedIn: true,
        email: salesEmail,
        role,
        salesExecutive,
        salesEmail,
        reseller,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ /api/me error:", error);
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }
}
