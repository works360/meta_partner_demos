import { db } from "@/lib/db";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 🔹 Fetch user by username
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [email]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    const user = rows[0];

    // 🔹 Compare plaintext password (to match PHP logic)
    if (password !== user.password) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    // 🔹 Store session as a cookie (7 days)
    const cookie = serialize(
      "sessionUser",
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.username,
        role: user.role || user.user_role || "",
        reseller: user.reseller || "",
        sales_executive: user.sales_executive || "",
      }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    return new Response(JSON.stringify({ success: true, message: "Login successful" }), {
      status: 200,
      headers: { "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
