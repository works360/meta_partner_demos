// app/api/support/route.ts
import { NextResponse } from "next/server";

// @ts-ignore – Nodemailer is CommonJS and TS complains, safe to ignore
import nodemailer from "nodemailer";

// Simple HTML escape helper
function esc(value: any) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = esc(body.name || "");
    const email = esc(body.email || "");
    const phone = esc(body.phone || "");
    // Convert newlines to <br> like nl2br in PHP
    const message = esc(body.message || "").replace(/\n/g, "<br>");

    if (!name || !email || !body.message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@shiworkspacebuilder.com",
        pass: "Sherlock.holmes1",
      },
    });

    const html = `
<table width="650" border="0" cellpadding="0" cellspacing="0" style="border:2px solid #ccc;font-family:Arial,sans-serif;">
  <tr>
    <td style="background:#213747;color:#fff;padding:12px;font-size:18px;">
      Support | Meta Partner Demos Order # ${name}
    </td>
  </tr>
  <tr>
    <td style="padding:20px;text-align:center;">
      <img src="https://orange-sardine-913553.hostingersite.com/assets/images/logo.png" alt="Partner Demos" width="220" />
      <br><br>
      
      <p style="color:#000;text-align:left;"><strong>Name:</strong> ${name}</p>
      <p style="color:#000;text-align:left;"><strong>Email:</strong> ${email}</p>
      <p style="color:#000;text-align:left;"><strong>Phone:</strong> ${phone}</p>
      <p style="color:#000;text-align:left;"><strong>Message:</strong><br>${message}</p>
      
      <p style="font-size:13px;color:#444;text-align:left;">
        Thank you for using the Meta Partner Demos program!<br>
        Regards,<br>
        Meta Partner Demos Team
      </p>
    </td>
  </tr>
</table>`;

    await transporter.sendMail({
      from: '"admin" <admin@shiworkspacebuilder.com>',
      to: "ammar@works360.com",
      subject: `Support | Meta Partner Demos Order ${name}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (err: any) {
    console.error("Support email error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Message could not be sent. Please try again later.",
      },
      { status: 500 }
    );
  }
}
