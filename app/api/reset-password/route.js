// app/api/reset-password/route.js
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // 1) Check if user exists
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [email]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "User email not found. Please create an account." }), {
        status: 404,
      });
    }

    // 2) Generate token + expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE username = ?",
      [token, expires, email]
    );

    // 3) Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://metapartnerdemos.vercel.app"; // <-- set this env
    const resetUrl = `${baseUrl}/update-password?token=${encodeURIComponent(token)}`;

    //send email
 const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: Number(process.env.SMTP_PORT || 465),
   secure: process.env.SMTP_SECURE === "true",
   auth: {
     user: process.env.SMTP_USER,
     pass: process.env.SMTP_PASS,
   },
 });

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const year = today.getFullYear();
    const safeEmail = email.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f7;padding:20px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" 
             style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;
                    font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <!-- Header -->
        <tr>
          <td style="background:#1976d2;color:#fff;text-align:center;padding:24px 20px;">
            <h1 style="margin:0;font-size:22px;">Reset Your Password</h1>
            <p style="margin:6px 0 0;font-size:14px;opacity:.9;">Meta Partner Demos</p>
          </td>
        </tr>
        <!-- Logo -->
        <tr>
          <td style="text-align:center;padding:24px;">
            <img src="https://orange-sardine-913553.hostingersite.com/assets/images/logo.png" 
                 alt="Meta Partner Demos" style="max-width:200px;height:auto;">
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:10px 28px 24px 28px;text-align:center;">
            <h2 style="margin:10px 0;font-size:20px;color:#1e293b;">Hi ${safeEmail},</h2>
            <p style="font-size:14px;color:#374151;margin:6px 0 18px 0;">
              We received a request to reset your password on <strong>${formattedDate}</strong>.
            </p>
            <a href="${resetUrl}" 
               style="display:inline-block;background:#1976d2;color:#fff;
                      padding:12px 22px;border-radius:6px;font-weight:600;
                      text-decoration:none;margin:16px 0;">
              Reset Password
            </a>
            <p style="font-size:12px;color:#6b7280;margin-top:18px;">
              If the button above doesn’t work, copy and paste this link into your browser:<br>
              <span style="word-break:break-all;color:#2563eb;">${resetUrl}</span>
            </p>
          </td>
        </tr>
        <!-- Security notice -->
        <tr>
          <td style="padding:0 28px 20px 28px;">
            <div style="background:#f0f9ff;border-radius:8px;padding:14px 18px;color:#1e293b;font-size:13px;">
              <strong>🔒 Security Notice:</strong><br>
              If you did not request this reset, you can safely ignore this email. Your password will remain unchanged.
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;text-align:center;padding:16px;font-size:12px;color:#6b7280;">
            Thank you for using Meta Partner Demos!<br>
            Regards, <strong>Meta Partner Demos Team</strong><br><br>
            © ${year} Meta Partner Demos. All rights reserved.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"Meta Partner Demos" <admin@shiworkspacebuilder.com>`,
      to: email,
      cc: "ammar@works360.com",
      subject: "Reset Your Password — Meta Partner Demos",
      html: htmlBody,
      text: `Hi ${email},\n\nWe received a request to reset your password on ${formattedDate}.\n\nReset link: ${resetUrl}\n\nIf you didn’t request this change, ignore this email.`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: "Failed to send reset email" }), {
      status: 500,
    });
  }
}
