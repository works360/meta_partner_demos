import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    console.log("🔵 Change Password API called");

    // ✅ Await cookies() per Next.js 16 requirement
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sessionUser");

    if (!sessionCookie) {
      console.log("❌ No session cookie found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie.value);
    const { current_password, new_password, confirm_password } = await req.json();

    if (!current_password || !new_password || !confirm_password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (new_password !== confirm_password) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    console.log("🧠 Checking DB...");
    const connection = await db.getConnection();

    const [rows] = await connection.query(
      "SELECT username, password FROM users WHERE id = ?",
      [user.id]
    );

    if (!rows || rows.length === 0) {
      connection.release();
      console.log("❌ User not found");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const dbUser = rows[0];
    if (dbUser.password !== current_password) {
      connection.release();
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    console.log("✏️ Updating password...");
    await connection.query("UPDATE users SET password = ? WHERE id = ?", [new_password, user.id]);
    connection.release();

    // Optional: send email
    try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

      await transporter.sendMail({
        from: "Meta Partner Demos <admin@shiworkspacebuilder.com>",
        to: dbUser.username,
        subject: "Password Changed - Meta Partner Demos Security Alert",
        html: `<p>Hi ${dbUser.username}, your password was successfully updated.</p>`,
      });

      console.log("📧 Email sent successfully");
    } catch (emailError) {
      console.error("⚠️ Email send failed:", emailError.message);
    }

    console.log("✅ Password updated successfully");
    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("💥 CHANGE PASSWORD API ERROR:", err);
    return NextResponse.json(
      { error: "Server error occurred: " + err.message },
      { status: 500 }
    );
  }
}
