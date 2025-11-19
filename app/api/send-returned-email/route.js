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

    if (order.order_status.toLowerCase() !== "returned") {
      return NextResponse.json({ error: "Order not marked as returned." }, { status: 400 });
    }

    // Build email HTML (simplified but styled like your PHP)
    const subject = `Order Returned #${orderId}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;">
        <h2>Thank You — Your Demo Kit Has Been Returned</h2>
        <p>Hello <strong>${order.contact || "Customer"}</strong>,</p>
        <p>We’ve received your demo kit return. Thank you for participating!</p>
        <p><strong>Order:</strong> #${orderId}</p>
        <p><strong>Return Tracking:</strong>
          <a href="${order.return_tracking_link || "#"}">${order.return_tracking || "N/A"}</a>
        </p>
      </div>
    `;

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
    console.error("Returned email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
