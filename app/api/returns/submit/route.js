import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      submitted_by,
      order_id,
      products_demod,
      return_from,
      demo_purpose,
      demo_count,
      is_ongoing,
      is_registered,
      event_demo_count,
      notes,
    } = body;

    await db.query(
      `INSERT INTO return_requests 
      (submitted_by, order_id, products_demod, return_from, demo_purpose, 
       demo_count, is_ongoing, is_registered, event_demo_count, notes, submit_return, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'yes', NOW())`,
      [
        submitted_by,
        order_id,
        products_demod,
        return_from,
        demo_purpose,
        demo_count,
        is_ongoing,
        is_registered,
        event_demo_count,
        notes,
      ]
    );

    const [labelRes] = await db.query("SELECT return_label FROM orders WHERE id = ?", [order_id]);
    const returnLabel = labelRes[0]?.return_label;

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@shiworkspacebuilder.com",
        pass: "Sherlock.holmes1",
      },
    });

    const emailBody = `
      <table width="650" border="0" cellpadding="0" cellspacing="0" style="border:2px solid #ccc;font-family:Arial,sans-serif;">
        <tr><td style="background:#213747;color:#fff;padding:12px;font-size:18px;">
        Returns | Meta Partner Demos Order #${order_id}</td></tr>
        <tr><td style="padding:20px;text-align:center;">
          <img src="https://orange-sardine-913553.hostingersite.com/assets/images/logo.png" width="220" />
          <p style="font-size:14px;line-height:22px;text-align:left;">
            Thank you for submitting the return form. Click below to download your return label.
          </p>
          ${
            returnLabel
              ? `<p style="text-align:center;">
                   <a href="https://orange-sardine-913553.hostingersite.com/returnlabelimages/${returnLabel}"
                      style="background:#28a745;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
                      Download Return Label</a></p>`
              : ""
          }
          <p style="font-size:13px;text-align:left;">For questions, contact support@metapartnerdemos.com.</p>
        </td></tr>
      </table>`;

    await transporter.sendMail({
      from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
      to: "ammar@works360.com",
      subject: `Returns | Meta Partner Demos Order #${order_id}`,
      html: emailBody,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
