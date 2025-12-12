import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import path from "path";
import { NextResponse } from "next/server";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escape
function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function fieldBlock(label, value) {
  if (!value || value.trim() === "") return ""; // hide field
  return `
    <td width="50%" style="padding:12px 16px;">
      <div style="font-size:12px;color:#6b7b86;">${label}</div>
      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
        ${value}
      </div>
    </td>
  `;
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderid");

    if (!orderId)
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (!orders?.length)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const order = orders[0];

    if (order.order_status.toLowerCase() !== "processing") {
      return NextResponse.json(
        { error: "Order is not approved." },
        { status: 400 }
      );
    }

    // ---------------------
    // PREP VALUES
    // ---------------------
    const placedOn = order.created_at
      ? new Date(order.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const shipName = esc(order.contact);
    const shipEmail = esc(order.contact_email);
    const shipAddress = esc(
      `${order.address}, ${order.city}, ${order.state} ${order.zip}`.replace(
        /^[,\s]+|[,\s]+$/g,
        ""
      )
    );
    const shipNotes = esc(order.notes || "");

    const salesExec = esc(order.sales_executive || "Sales Team");
    const salesEmail = esc(order.sales_email || "");
    const reseller = esc(order.reseller || "");
    const company = esc(order.company || "");
const opportunity = esc(order.opportunity_size || "");
const revenue = esc(order.revenue_size || "");
const usecase = esc(order.use_case || "");
const metaReg = esc(order.meta_registered || "");
const dealId = esc(order.deal_id || "");
const returnDateFormatted = formatDate(order.return_date);


    // ---------------------
    // MASTER HTML TEMPLATE
    // ---------------------
    const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="650" cellspacing="0" cellpadding="0" border="0" 
                 style="background:#ffffff;border:1px solid #e8edf3;border-radius:12px;overflow:hidden;
                        font-family:Arial,Helvetica,sans-serif;color:#172b3a;">

            <!-- TOP BAR -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;background:#f1f6ff;">
                <table width="100%">
                  <tr>
                    <td align="left">
                      <img src="cid:logoimg" width="170" style="display:block;border:0;">
                    </td>
                    <td align="right" style="font-size:20px;font-weight:700;color:#0b1f2a;">
                      Order Approved — #${orderId}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TITLE -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:20px;font-weight:700;color:#0b1f2a;">
                  Approved Order #${orderId}
                </div>
                <div style="margin-top:6px;font-size:12px;color:#6b7b86;">
                  Placed on ${placedOn}
                </div>
              </td>
            </tr>

                      <!-- ORDER PROGRESS -->
            <tr>
              <td style="padding:24px 24px 4px;">
                <div style="font-size:16px;font-weight:700;color:#0b1f2a;text-align:center;margin-bottom:30px;">
                  Order Progress
                </div>

                <table width="100%" style="table-layout:fixed;">
                  <tr>
                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;
                                  line-height:36px;font-weight:700;display:inline-block;">1</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">New Order</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                  line-height:36px;font-weight:700;">2</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Approved</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;
                                  line-height:36px;font-weight:700;">3</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Shipped</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;
                                  line-height:36px;font-weight:700;">4</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Returned</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:33px;padding:15px;border:1px solid #e7edf2;border-radius:10px;text-align:center;font-size:13px;">
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">Approved</span>
                </div>
              </td>
            </tr>

            <!-- INTRO -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;font-size:14px;line-height:20px;color:#334b59;">
                Your order on <a href="https://www.metapartnerdemos.com" style="color:#2563eb;">metapartnerdemos.com/</a> has been approved. Once your package ships, you will receive a shipping email with tracking information for your order.<br>
                If you have any questions please contact us at <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;">support@metapartnerdemos.com</a>.
              
              </td>
            </tr>

            <!-- REQUESTOR DETAILS -->
            <tr>
              <td style="padding:14px 24px 0;">
                <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">
                      Requestor Details
                    </td>
                  </tr>

                  <tr>
                    <td width="50%" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Sales Executive</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${salesExec}
                      </div>
                    </td>

                    <td width="50%" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Sales Email</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${salesEmail}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Reseller</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${reseller}
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </table>
              </td>
            </tr>

      <!-- OPPORTUNITY DETAILS -->
<tr>
  <td style="padding:14px 24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
           style="border:1px solid #e7edf2;border-radius:12px;overflow:hidden;">

      <!-- Section Header -->
      <tr>
        <td colspan="2"
            style="padding:12px 16px;font-weight:700;font-size:18px;">
          Opportunity Details
        </td>
      </tr>

      <!-- DEMO PURPOSE (always shown) -->
      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Demo Purpose</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.demo_purpose || "")}
          </div>
        </td>
      </tr>

      ${
        order.demo_purpose !== "Prospect/Meeting"
          ? `
      <!-- EVENT / OTHER LOGIC -->

      <!-- Intended Audience -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Intended Demo Audience</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.intended_audience || "")}
          </div>
        </td>
        <td></td>
      </tr>

      <!-- Expected Demos (ALSO shown for Event/Other) -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Demos</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.expected_demos || "")}
          </div>
        </td>
        <td></td>
      </tr>

      `
          : `
      <!-- PROSPECT / MEETING LOGIC -->

      <!-- Company + Expected Demos -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Company</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.company || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Demos</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.expected_demos || "")}
          </div>
        </td>
      </tr>

      <!-- Opportunity Size + Revenue Size -->
      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.opportunity_size || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.revenue_size || "")}
          </div>
        </td>
      </tr>

      <!-- Use Case + Meta Registered -->
      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Use Case(s)</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.use_case || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Meta Registered?</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.meta_registered || "")}
          </div>
        </td>
      </tr>

      <!-- Deal ID -->
      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.deal_id || "")}
          </div>
        </td>
        <td></td>
      </tr>
      `
      }

      <!-- RETURN DATE -->
      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Return Date</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
             ${esc(returnDateFormatted)}
          </div>
        </td>
      </tr>

    </table>
  </td>
</tr>



            <!-- SHIPPING DETAILS -->
            <tr>
              <td style="padding:14px 24px;">
                <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">
                      Shipping Details
                    </td>
                  </tr>

                  <tr>
                    <td width="50%" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Point of Contact</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${shipName}
                      </div>
                    </td>

                    <td width="50%" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Email</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${shipEmail}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Shipping Address</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${shipAddress}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Notes</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${shipNotes}
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:14px 24px;background:#f1f6ff;border-top:1px solid #eef3f7;">
                <table width="100%">
                  <tr>
                    <td style="font-size:12px;color:#6b7b86;">
                      Need help? Contact us:<br>
                      <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;">
                        support@metapartnerdemos.com
                      </a>
                    </td>
                    <td style="font-size:12px;color:#6b7b86;" align="right">
                      Visit our website:<br>
                      <a href="https://www.metapartnerdemos.com" style="color:#2563eb;">
                        metapartnerdemos.com
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    // ---------------------
    // SEND EMAIL
    // ---------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
    const logoPath = path.join(process.cwd(), "public", "meta-logo.png");

    await transporter.sendMail({
      from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
      to: "ammar@works360.com", // replace when ready
      subject: `Order Approved — #${orderId} | Meta Partner Demos`,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logoimg",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approved email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
