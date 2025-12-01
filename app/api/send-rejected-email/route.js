import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import path from "path";
import { NextResponse } from "next/server";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escape HTML
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

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (!orders?.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    if (order.order_status.toLowerCase() !== "cancelled") {
      return NextResponse.json(
        { error: "Order is not rejected." },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // REJECTED EMAIL SPECIFIC DATA
    // ---------------------------------------------------
    const placedOn = new Date(order.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const shipName = esc(order.contact || "");
    const shipEmail = esc(order.contact_email || "");
    const shipAddress = esc(
      `${order.address}, ${order.city}, ${order.state} ${order.zip}`.replace(
        /^[,\s]+|[,\s]+$/g,
        ""
      )
    );
    const shipNotes = esc(order.notes || "");

    const salesExec = esc(order.sales_executive || "");
    const salesEmail = esc(order.sales_email || "");
    const reseller = esc(order.reseller || "");

    const company = esc(order.company || "");
    const opportunity = esc(order.opportunity_size || "");
    const revenue = esc(order.revenue_size || "");
    const usecase = esc(order.use_case || "");
    const metaReg = esc(order.meta_registered || "");
    const dealId = esc(order.deal_id || "");
    const returnDateFormatted = formatDate(order.return_date);

    // ---------------------------------------------------
    // FULL HTML TEMPLATE (MATCHING APPROVED EMAIL)
    // ---------------------------------------------------
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
                    <td align="right" style="font-size:20px;font-weight:700;color:#b91c1c;">
                      Order Rejected — #${orderId}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TITLE -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:16px;font-weight:700;color:#fff;">
                  Hello ${salesExec},
                </div>
                <div style="margin-top:6px;font-size:14px;color:#6b7b86;">
                Meta Partner Demos Order #${orderId} has been Rejected<br><br>
                 Order #${orderId} (${placedOn})
                </div>
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
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">
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
                    <td align="right" style="font-size:12px;color:#6b7b86;">
                      Visit our website:<br>
                      <a href="https://www.metapartnerdemos.com" style="color:#2563eb;">
                        www.metapartnerdemos.com
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

    // ---------------------------------------------------
    // SEND EMAIL
    // ---------------------------------------------------
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@shiworkspacebuilder.com",
        pass: "Sherlock.holmes1",
      },
    });

    const logoPath = path.join(process.cwd(), "public", "meta-logo.png");

    await transporter.sendMail({
      from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
      to: "ammar@works360.com", // replace with order.contact_email
     // to: order.contact_email || "ammar@works360.com",
      subject: `Order Rejected — #${orderId} | Meta Partner Demos`,
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
  } catch (error) {
    console.error("Rejected email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
