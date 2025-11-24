import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import path from "path";
import { NextResponse } from "next/server";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escape helper
function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

    if (order.order_status.toLowerCase() !== "returned") {
      return NextResponse.json(
        { error: "Order not marked as returned." },
        { status: 400 }
      );
    }

    // Prepare fields
    const shipName = esc(order.contact);
    const shipEmail = esc(order.contact_email);
    const shipAddress = esc(
      `${order.address}, ${order.city}, ${order.state} ${order.zip}`.replace(
        /^[,\s]+|[,\s]+$/g,
        ""
      )
    );
    const shipNotes = esc(order.notes || "");

    const placedOn = new Date(order.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const salesExec = esc(order.sales_executive || "");
    const salesEmail = esc(order.sales_email || "");
    const reseller = esc(order.reseller || "");

    const company = esc(order.company || "");
    const opportunity = esc(order.opportunity_size || "");
    const revenue = esc(order.revenue_size || "");
    const usecase = esc(order.use_case || "");
    const metaReg = esc(order.meta_registered || "");
    const dealId = esc(order.deal_id || "");

    const returnTracking = esc(order.return_tracking || "");
    const returnTrackingLink = esc(order.return_tracking_link || "#");

    // ===========================================================
    // FULL HTML TEMPLATE (MATCHING APPROVED + REJECTED LAYOUT)
    // ===========================================================
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
                      Order Returned — #${orderId}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TITLE -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:20px;font-weight:700;color:#0b1f2a;">
                  Thank You — Your Demo Kit Has Been Returned
                </div>
                <div style="margin-top:6px;font-size:12px;color:#6b7b86;">
                  Placed on ${placedOn}
                </div>
              </td>
            </tr>

            <!-- INTRO -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;font-size:14px;line-height:20px;color:#334b59;">
                Hi <strong>${shipName}</strong>,<br><br>

                We are pleased to confirm that your demo kit for 
                <strong>Order #${orderId}</strong> has been successfully 
                <strong style="color:#059669;">returned</strong>.<br><br>

                Thank you for your participation in the Meta Partner Demos program. 
                Your involvement helps us provide a best-in-class experience.<br><br>

                Below is your return information and order summary.
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
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                  line-height:36px;font-weight:700;">1</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Approved</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                  line-height:36px;font-weight:700;">2</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Shipped</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                  line-height:36px;font-weight:700;">3</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Delivered</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#059669;color:#fff;
                                  line-height:36px;font-weight:700;">4</div>
                      <div style="font-size:12px;color:#059669;margin-top:6px;">Returned</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- RETURN TRACKING -->
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">
                      Return Tracking
                    </td>
                  </tr>

                  <tr>
                    <td width="50%" style="padding:12px 16px;font-size:13px;color:#6b7b86;">
                      Return Tracking Number
                    </td>
                    <td width="50%" align="right" style="padding:12px 16px;">
                      <a href="${returnTrackingLink}" target="_blank" style="color:#2563eb;text-decoration:none;">
                        ${returnTracking || "N/A"}
                      </a>
                    </td>
                  </tr>
                </table>
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
  <td style="padding:14px 24px 0;">
    <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">

      <tr>
        <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">
          Opportunity Details
        </td>
      </tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Demo Purpose</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(order.demo_purpose || "N/A")}
          </div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Demos</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(order.expected_demos || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Company</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${company}
          </div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${opportunity}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${revenue}
          </div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Use Case</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${usecase}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Meta Registered</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${metaReg}
          </div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${dealId}
          </div>
        </td>
      </tr>

      
      <tr>
        <td colspan="2" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Return Date</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(order.return_date || "N/A")}
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

    // SEND EMAIL
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
      subject: `Order Returned — #${orderId} | Meta Partner Demos`,
      html,
      attachments: [
        { filename: "logo.png", path: logoPath, cid: "logoimg" },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Returned email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
