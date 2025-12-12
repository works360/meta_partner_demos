// app/api/admin/send-reminders/route.js
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { orderIds } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return Response.json(
        { success: false, message: "No orders selected" },
        { status: 400 }
      );
    }

    // Hostinger SMTP
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: Number(process.env.SMTP_PORT || 465),
     secure: process.env.SMTP_SECURE === "true",
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   });

    const results = [];

    for (const id of orderIds) {
      // 1) Fetch order
      const [[order]] = await db.query(
        "SELECT * FROM orders WHERE id = ?",
        [id]
      );

      if (!order) {
        results.push({ id, status: "failed", reason: "Order not found" });
        continue;
      }

      // 2) Fetch items
      const [items] = await db.query(
        `SELECT p.product_name, p.category, oi.quantity
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id]
      );

      if (!order.sales_email) {
        results.push({ id, status: "failed", reason: "Missing sales_email" });
        continue;
      }

      // 3) Build Email HTML
      const htmlBody = buildOverdueEmail(order, items);

      // 4) Send email
      await transporter.sendMail({
        from: `"Meta Partner Demos" <admin@shiworkspacebuilder.com>`,
       // to: order.sales_email,
       to: "ammar@works360.com",
       // cc: "ammar@works360.com",
        subject: `Overdue Order #${order.id} (${order.company || ""})`,
        html: htmlBody,
      });

      results.push({ id, status: "sent" });
    }

    return Response.json({
      success: true,
      message: "Reminders processed",
      results,
    });
  } catch (err) {
    console.error("❌ send-reminders error:", err);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// -----------------------------
// HTML EMAIL TEMPLATE (simple version)
// You can replace with the long PHP design anytime.
// -----------------------------
function buildOverdueEmail(order, items) {
  const itemList = items
    .map(
      (i) =>
        `${i.quantity} × ${i.product_name} (${i.category})`
    )
    .join("<br>");

  return `
  <!doctype html>
  <html>
    <body style="font-family:Arial, sans-serif; color:#111">
      <h2>Overdue Return — Order #${order.id}</h2>

      <p>
        Hello ${order.contact || "there"},<br><br>
        This is a reminder that your demo kit was due to return on 
        <strong>${order.return_date}</strong> and is now <strong>overdue</strong>.
      </p>

      <p>Please complete your returns form:</p>
      <a href="https://metapartnerdemos.com/returns/"
         style="display:inline-block;background:#1976d2;color:white;
                padding:10px 18px;border-radius:6px;text-decoration:none;">
        Complete Returns Form
      </a>

      <h3 style="margin-top:20px;">Products Included:</h3>
      <p>${itemList || "No items found"}</p>

      <p style="margin-top:25px;color:#555;">
        If you've already returned the kit, please reply to this email.
      </p>
    </body>
  </html>`;
}
