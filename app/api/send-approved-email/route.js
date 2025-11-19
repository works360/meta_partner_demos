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

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!orders?.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    if (order.order_status.toLowerCase() !== "processing") {
      return NextResponse.json({ error: "Order is not approved." }, { status: 400 });
    }

    const subject = `Order Approved #${orderId}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;">
        <h2>Order Approved - Meta Partner Demos #${orderId}</h2>
        <p>Hello <strong>${order.contact}</strong>,</p>
        <p>Your demo kit order has been approved and is now being processed.</p>
        <p>We will notify you once it is shipped.</p>
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
      to: "ammar@works360.com",  // you can replace with order.contact_email
      subject,
      html,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Approved email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
