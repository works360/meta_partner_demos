// app/api/update-password/route.js
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }

    // 1) Find user by token and check expiry
    const [rows] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset link" }), {
        status: 400,
      });
    }

    const user = rows[0];

    // 2) Update password (plaintext, to match existing PHP logic)
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [password, user.id]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Update password error:", err);
    return new Response(JSON.stringify({ error: "Failed to update password" }), {
      status: 500,
    });
  }
}
