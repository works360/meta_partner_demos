import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderid");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // Fetch order
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orders[0];

    if (order.order_status.toLowerCase() !== "shipped") {
      return NextResponse.json({ error: "Order not marked as shipped." }, { status: 400 });
    }

    // Build email HTML (copied from your PHP email)
    const subject = `Order Shipped #${orderId}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;">
        <h2>Your Order Has Shipped - Meta Partner Demos #${orderId}</h2>
        <p>Hello <strong>${order.contact || "Customer"}</strong>,</p>
        <p>Your demo kit has been shipped.</p>
        <p>
          <strong>Tracking:</strong>
          <a href="${order.tracking_number_link || "#"}">${order.tracking_number || "N/A"}</a>
        </p>
        <p>Submit feedback after your demo at 
          <a href="https://orange-sardine-913553.hostingersite.com/returns.php">Returns Page</a>.
        </p>
      </div>
    `;

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@shiworkspacebuilder.com",
        pass: "Sherlock.holmes1",
      },
    });

    await transporter.sendMail({
      from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
      to: "ammar@works360.com",
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
