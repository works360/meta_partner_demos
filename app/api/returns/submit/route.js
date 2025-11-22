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
      unit_count,
      estimated_value,
      is_registered,
      deal_reg_number,
      event_demo_count,
      notes,
    } = body;

    // Store in DB
    await db.query(
      `INSERT INTO return_requests 
      (submitted_by, order_id, products_demod, return_from, demo_purpose, 
       demo_count, is_ongoing, unit_count, estimated_value, is_registered,
       deal_reg_number, event_demo_count, notes, submit_return, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'yes', NOW())`,
      [
        submitted_by,
        order_id,
        products_demod,
        return_from,
        demo_purpose,
        demo_count,
        is_ongoing,
        unit_count,
        estimated_value,
        is_registered,
        deal_reg_number,
        event_demo_count,
        notes,
      ]
    );

    const [labelRes] = await db.query(
      "SELECT return_label FROM orders WHERE id = ?",
      [order_id]
    );

    const returnLabel = labelRes[0]?.return_label;

    // Helper for auto-showing only filled fields
    const row = (label, value) =>
      value
        ? `
        <tr>
          <td style="padding:8px 12px;border:1px solid #ccc;"><strong>${label}</strong></td>
          <td style="padding:8px 12px;border:1px solid #ccc;">${value}</td>
        </tr>`
        : "";

    const detailsTable = `
      <table width="100%" cellpadding="0" cellspacing="0" 
             style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin-top:15px;">
        ${row("Submitted By", submitted_by)}
        ${row("Order ID", order_id)}
        ${row("Products Demod", products_demod)}
        ${row("Return From", return_from)}
        ${row("Demo Purpose", demo_purpose)}
        ${row("Actual # of Demos Done", demo_count)}
        ${row("Is the Opportunity Ongoing?", is_ongoing)}
        ${row("Unit Count (if ongoing)", unit_count)}
        ${row("Estimated Deal Value", estimated_value)}
        ${row("Is Deal Registered?", is_registered)}
        ${row("Deal Registration Number", deal_reg_number)}
        ${row("Event/Other: Demos Done", event_demo_count)}
        ${row("Notes", notes)}
      </table>
    `;

    // EMAIL TEMPLATE — WITH HEADER + CENTERED LOGO
    const emailBody = `
      <table width="650" cellpadding="0" cellspacing="0" 
             style="border:2px solid #ccc;font-family:Arial,sans-serif;background:#ffffff;">
        
        <!-- HEADER -->
        <tr>
          <td style="background:#213747;color:#fff;padding:16px;text-align:center;font-size:20px;font-weight:bold;">
            Meta Partner Demos – Return
          </td>
        </tr>

        <!-- LOGO CENTERED -->
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <img src="cid:metaLogo" width="180" style="display:block;margin:auto;" alt="Meta Partner Demos Logo"/>
          </td>
        </tr>

        <!-- MESSAGE -->
        <tr>
          <td style="padding:20px;font-size:14px;line-height:22px;">
            <p style="margin:0 0 12px;">
              Thank you for submitting the return form. Below are the details submitted:
            </p>

            ${detailsTable}

            ${
              returnLabel
                ? `
              <div style="text-align:center;margin-top:25px;">
                <a href="https://orange-sardine-913553.hostingersite.com/returnlabelimages/${returnLabel}"
                   style="background:#28a745;color:#fff;padding:12px 24px;text-decoration:none;
                          border-radius:6px;font-size:15px;display:inline-block;">
                  Download Return Label
                </a>
              </div>`
                : ""
            }

            <p style="font-size:13px;margin-top:25px;color:#555;">
              For questions, contact <strong>support@metapartnerdemos.com</strong>.
            </p>
          </td>
        </tr>
      </table>
    `;

    // NODEMAILER WITH EMBEDDED LOGO
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
      subject: `Returns | Meta Partner Demos Order #${order_id}`,
      html: emailBody,
      attachments: [
        {
          filename: "meta-logo.png",
          path: "public/meta-logo.png", // <— Correct path
          cid: "metaLogo", // <— Must match <img src="cid:metaLogo">
        },
      ],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
