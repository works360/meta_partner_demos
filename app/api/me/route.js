export async function GET(req) {
  const session = req.cookies.get("sessionUser");

  // ⬅️ FIX: If cookie is missing or empty → logged out
  if (!session || !session.value) {
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }

  try {
    const user = JSON.parse(session.value);
    const email = (user?.email || "").toLowerCase();

    // ⬇️ Fetch role + profile fields from users table
    // 👉 Adjust column names (sales_executive, reseller, username) to match your schema
    const [rows] = await db.query(
      `
      SELECT 
        user_role,
        sales_executive,      -- Sales Executive name
        username,       -- Login email
        reseller        -- Reseller name
      FROM users 
      WHERE LOWER(username) = ? 
      LIMIT 1
      `,
      [email]
    );

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
        role,             // direct role
        salesExecutive,   // for Sales Executive *
        salesEmail,       // for Sales Executive Email *
        reseller,         // for Reseller *
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ /api/me error:", error);
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }
}
