import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// -----------------------------------------------------------
// EMAIL DEPENDENCIES (added)
// -----------------------------------------------------------
// @ts-ignore – Nodemailer is CommonJS and TS complains, safe to ignore
import nodemailer from "nodemailer";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escape helper
function esc(s: any) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildChipList(arr: string[]) {
  if (!arr || !arr.length) {
    return '<span style="color:#7b8a95;font-size:12px;">None</span>';
  }
  return arr
    .map(
      (a) =>
        `<span style="margin-right:6px;font-size:12px;display:inline-block;">${esc(
          a
        )}</span>`
    )
    .join("");
}

function buildHeadsetRows(headsets: any[]) {
  if (!headsets.length)
    return `<tr><td style="padding:16px;color:#7b8a95;">No headsets</td><td></td></tr>`;

  let html = "";
  headsets.forEach((h, idx) => {
    html += `
      <tr>
        <td style="padding:16px;">
          <div style="border-left:3px solid #2563eb;padding-left:10px;">
            <div style="font-weight:700;font-size:16px;">${esc(h.name)}</div>
            <div style="font-size:11px;color:#7b8a95;">SKU: ${esc(h.sku)}</div>
          </div>
        </td>
        <td align="right" style="padding:16px;">
          <div style="width:34px;height:34px;border-radius:50%;background:#eef3ff;
               text-align:center;line-height:34px;font-weight:700;">
            ${h.qty}
          </div>
        </td>
      </tr>
    `;
    if (idx < headsets.length - 1)
      html += `<tr><td colspan="2" style="height:1px;background:#eef3f7;"></td></tr>`;
  });
  return html;
}

async function sendNewOrderEmail(orderId: number, orderData: any, summary: any) {
  const { headsets, offlineApps, onlineApps } = summary;

  const headsetsHtml = buildHeadsetRows(headsets);
  const offlineList = buildChipList(offlineApps);
  const onlineList = buildChipList(onlineApps);

  const placedOn = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const logoPath = path.join(process.cwd(), "public", "meta-logo.png");

  // ---------------------------------------------------------
  // FULL HTML EMAIL (same styling as your 10-day reminder)
  // ---------------------------------------------------------
  // ---------------------------------------------
  // USER EMAIL (NO VIEW ORDER BUTTON)
  // ---------------------------------------------
  const userHtml = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
      <tr><td align="center">
        <table width="650" style="background:#ffffff;border:1px solid #e8edf3;border-radius:12px;">

          <!-- HEADER -->
          <tr>
            <td style="padding:22px 24px;background:#f1f6ff;border-bottom:1px solid #eef3f7;">
              <table width="100%">
                <tr>
                  <td><img src="cid:logoimg" width="170"></td>
                  <td align="right" style="font-size:20px;font-weight:700;">New Order #${orderId} | Meta Partner Demos</td>
                </tr>
              </table>
            </td>
          </tr>

           <!-- TITLE -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:20px;font-weight:700;">Order #${orderId} — Meta Partner Demos</div>
                <div style="font-size:12px;color:#6b7b86;margin-top:6px;">Placed on ${placedOn}</div>
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
                                  line-height:36px;font-weight:700;display:inline-block;">1</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">New Order</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;
                                  line-height:36px;font-weight:700;">2</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Approved</div>
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
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">New Order</span>
                </div>
              </td>
            </tr>

            <!-- MESSAGE FOR USER -->
          <tr>
            <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;font-size:14px;color:#334b59;line-height:20px;">
              We have received your order on<a href="http://metapartnerdemos.vercel.app" 
                 style="font-weight:700;color:#0066ff;"> www.metapartnerdemos.com </a>Order will be processed by our team and shipped within the next 7 days. You will receive a shipping email with tracking details once the order ships.<br>
              Feel free to contact us at<a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;"> support@metapartnerdemos.com </a>if you have any questions. 
            </td>
          </tr>


           <!-- ORDER DETAILS BLOCK (unchanged) -->
          <tr>
            <td style="padding:12px 24px 2px;">
              <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                <tr><td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">Ordered Products</td></tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eee;">Product</td>
                  <td align="right" style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eee;">Qty</td>
                </tr>

                ${headsetsHtml}

                <tr><td colspan="2" style="padding:12px 16px;">
                  <table width="100%" style="border:1px solid #dbe7ff;border-radius:10px;margin-bottom:10px;">
                    <tr><td style="padding:10px;font-weight:700;font-size:13px;">Pre-Packaged App Demos</td></tr>
                    <tr><td style="padding:0 12px 10px;">${offlineList}</td></tr>
                  </table>

                  <table width="100%" style="border:1px solid #d6f5e5;border-radius:10px;">
                    <tr><td style="padding:10px;font-weight:700;font-size:13px;">Managed App Store Demos</td></tr>
                    <tr><td style="padding:0 12px 10px;">${onlineList}</td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>

          
        <!-- REQUESTOR DETAILS -->
<tr>
  <td style="padding:14px 24px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" 
           style="border:1px solid #e7edf2;border-radius:12px;overflow:hidden;">
      <tr>
        <td colspan="2"
            style="padding:12px 16px;font-weight:700;font-size:18px;">
          Requestor Details
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Sales Executive</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.sales_executive || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Sales Email</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.sales_email || "")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Reseller</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.reseller || "N/A")}
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

      <tr>
        <td colspan="2"
            style="padding:12px 16px;font-weight:700;font-size:18px;">
          Opportunity Details
        </td>
      </tr>

      <!-- Demo Purpose -->
<tr>
  <td colspan="2" style="padding:0 16px 16px;">
    <div style="font-size:12px;color:#6b7b86;">Demo Purpose</div>
    <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                border-radius:8px;font-size:13px;color:#0b1f2a;">
      ${esc(orderData.demo_purpose || "N/A")}
    </div>
  </td>
</tr>

      ${
        orderData.demo_purpose !== "Prospect/Meeting"
          ? `
      <!-- For Event / Other -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Intended Demo Audience</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.intended_audience || "N/A")}
          </div>
        </td>
        <td></td>
      </tr>
      `
          : `
      <!-- For Prospect / Meeting -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Company</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.company || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Demos</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.expected_demos || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.opportunity_size || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.revenue_size || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Use Case(s)</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.use_case || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Meta Registered?</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.meta_registered || "No")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.deal_id || "N/A")}
          </div>
        </td>
        <td></td>
      </tr>
      `
      }

      <!-- Return Date -->
      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Return Date</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.return_date)}
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
      <tr><td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">Shipping Details</td></tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Point of Contact</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">${esc(
            orderData.contact
          )}</div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Email</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">${esc(
            orderData.contact_email
          )}</div>
        </td>
      </tr>

      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Address</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(orderData.address)}, ${esc(orderData.city)}, ${esc(
    orderData.state
  )} ${esc(orderData.zip)}
          </div>
        </td>
      </tr>

      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Notes</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(orderData.notes || "")}
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
      </td></tr>
    </table>
  </body>
</html>`;

  // ---------------------------------------------
  // ADMIN EMAIL (WITH REVIEW LINK TEXT – NO BUTTON)
  // ---------------------------------------------
  const adminHtml = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
      <tr><td align="center">
        <table width="650" style="background:#ffffff;border:1px solid #e8edf3;border-radius:12px;">

          <!-- HEADER -->
          <tr>
            <td style="padding:22px 24px;background:#f1f6ff;border-bottom:1px solid #eef3f7;">
              <table width="100%">
                <tr>
                  <td><img src="cid:logoimg" width="170"></td>
                  <td align="right" style="font-size:20px;font-weight:700;">New Order — #${orderId} | Meta Partner Demos</td>
                </tr>
              </table>
            </td>
          </tr>

  <!-- TITLE -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:20px;font-weight:700;">Order #${orderId} — Meta Partner Demos</div>
                <div style="font-size:12px;color:#6b7b86;margin-top:6px;">Placed on ${placedOn}</div>
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
                                  line-height:36px;font-weight:700;display:inline-block;">1</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">New Order</div>
                    </td>

                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;
                                  line-height:36px;font-weight:700;">2</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Approved</div>
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
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">New Order</span>
                </div>
              </td>
            </tr>

          <!-- ADMIN TEXT -->
          <tr>
            <td style="padding:22px 24px;font-size:14px;color:#334b59;line-height:20px;border-bottom:1px solid #eef3f7;">
              Hello Team,<br><br>
              You have received a new order from<a href="http://metapartnerdemos.vercel.app" 
                 style="font-weight:700;color:#0066ff;">
                metapartnerdemos.com.
              </a>
              Please click on the<a href="http://metapartnerdemos.vercel.app/kit-updateorder?orderid=${orderId}" 
                 style="font-weight:700;color:#0066ff;">
               link
              </a> to Review and Approve/Reject.
            </td>
          </tr>

            <!-- ORDER DETAILS -->
            <tr>
              <td style="padding:12px 24px 2px;">
                <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr><td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">Ordered Products</td></tr>

                  <tr>
                    <td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eee;">Product</td>
                    <td align="right" style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eee;">Qty</td>
                  </tr>

                  ${headsetsHtml}

                  <tr><td colspan="2" style="padding:12px 16px;">
                    <table width="100%" style="border:1px solid #dbe7ff;border-radius:10px;margin-bottom:10px;">
                      <tr><td style="padding:10px 12px;font-weight:700;font-size:13px;color:#274b8f;">Pre-Packaged App Demos</td></tr>
                      <tr><td style="padding:0 12px 10px;">${offlineList}</td></tr>
                    </table>

                    <table width="100%" style="border:1px solid #d6f5e5;border-radius:10px;">
                      <tr><td style="padding:10px 12px;font-weight:700;font-size:13px;color:#274b8f;">Managed App Store Demos</td></tr>
                      <tr><td style="padding:0 12px 10px;">${onlineList}</td></tr>
                    </table>
                  </td></tr>
                </table>
              </td>
            </tr>


            <!-- REQUESTOR DETAILS -->
<tr>
  <td style="padding:14px 24px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" 
           style="border:1px solid #e7edf2;border-radius:12px;overflow:hidden;">
      <tr>
        <td colspan="2"
            style="padding:12px 16px;font-weight:700;font-size:18px;">
          Requestor Details
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Sales Executive</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.sales_executive || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Sales Email</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.sales_email || "")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Reseller</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.reseller || "N/A")}
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

      <tr>
        <td colspan="2"
            style="padding:12px 16px;font-weight:700;font-size:18px;">
          Opportunity Details
        </td>
      </tr>

      <!-- Demo Purpose -->
<tr>
  <td colspan="2" style="padding:0 16px 16px;">
    <div style="font-size:12px;color:#6b7b86;">Demo Purpose</div>
    <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                border-radius:8px;font-size:13px;color:#0b1f2a;">
      ${esc(orderData.demo_purpose || "N/A")}
    </div>
  </td>
</tr>

      ${
        orderData.demo_purpose !== "Prospect/Meeting"
          ? `
      <!-- For Event / Other -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Intended Demo Audience</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.intended_audience || "N/A")}
          </div>
        </td>
        <td></td>
      </tr>
      `
          : `
      <!-- For Prospect / Meeting -->
      <tr>
        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Company</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.company || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Demos</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.expected_demos || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.opportunity_size || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.revenue_size || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Use Case(s)</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.use_case || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Meta Registered?</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.meta_registered || "No")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.deal_id || "N/A")}
          </div>
        </td>
        <td></td>
      </tr>
      `
      }

      <!-- Return Date -->
      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Return Date</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(orderData.return_date)}
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
      <tr><td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">Shipping Details</td></tr>

      <tr>
        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Point of Contact</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">${esc(
            orderData.contact
          )}</div>
        </td>

        <td width="50%" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Email</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">${esc(
            orderData.contact_email
          )}</div>
        </td>
      </tr>

      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Address</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(orderData.address)}, ${esc(orderData.city)}, ${esc(
    orderData.state
  )} ${esc(orderData.zip)}
          </div>
        </td>
      </tr>

      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Notes</div>
          <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
            ${esc(orderData.notes || "")}
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

  // ---------------------------------------------
  // SEND EMAILS
  // ---------------------------------------------
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@shiworkspacebuilder.com",
      pass: "Sherlock.holmes1",
    },
  });

  // Send USER email
  await transporter.sendMail({
    from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
   // to: orderData.contact_email || orderData.sales_email,
    to: "wajahat@works360.com",
   //  to: "ammar@works360.com", "zeeshan@works360.com", // ⬅ Multiple recipients
    subject: `Order Confirmation — #${orderId}`,
    html: userHtml,
    attachments: [{ filename: "logo.png", path: logoPath, cid: "logoimg" }],
  });

  // Send ADMIN email
  await transporter.sendMail({
    from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
    to: "ammar@works360.com",
    subject: `New Order Placed — #${orderId}`,
    html: adminHtml,
    attachments: [{ filename: "logo.png", path: logoPath, cid: "logoimg" }],
  });

  console.log("📧 User & Admin emails sent successfully!");
}

// -----------------------------------------------------------
// ORIGINAL USER CODE (UNTOUCHED BELOW)
// -----------------------------------------------------------

export async function POST(req: Request) {
  let conn: any;

  try {
    conn = await db.getConnection();
    const formData = await req.formData();

    // Parse FormData
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      const cleanKey = key.endsWith("[]") ? key.replace("[]", "") : key;
      if (!data[cleanKey]) data[cleanKey] = [];
      data[cleanKey].push(value);
    }

    // Flatten
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length === 1) {
        data[key] = data[key][0];
      }
    }

    let selectedProducts: any[] = [];
    let quantities: any[] = [];

    try {
      if (typeof data.products === "string" && data.products.startsWith("[")) {
        selectedProducts = JSON.parse(data.products);
      } else if (Array.isArray(data.products)) {
        selectedProducts = data.products;
      }

      if (typeof data.quantity === "string" && data.quantity.startsWith("[")) {
        quantities = JSON.parse(data.quantity);
      } else if (Array.isArray(data.quantity)) {
        quantities = data.quantity;
      }
    } catch (err) {
      console.warn("⚠️ Could not parse product arrays:", err);
    }

    console.log("🧩 Finalizing Order");
    console.log("Products:", selectedProducts);
    console.log("Quantities:", quantities);

    const {
      sales_executive,
      sales_email,
      reseller,
      demo_purpose,
      expected_demos,
      intended_audience,
      company,
      opportunity_size,
      return_date,
      revenue_size,
      use_case,
      meta_registered,
      deal_id,
      contact,
      contact_email,
      address,
      city,
      state,
      zip,
      notes,
    } = data;

    const useCaseStr = Array.isArray(use_case)
      ? use_case.join(", ")
      : use_case || "";

    // INSERT ORDER
    const [orderResult] = await conn.execute(
      `
      INSERT INTO orders (
        sales_executive, sales_email, reseller,
        demo_purpose, expected_demos, intended_audience, company,
        opportunity_size, return_date, revenue_size, use_case,
        meta_registered, deal_id,
        contact, contact_email, address, city, state, zip, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sales_executive,
        sales_email,
        reseller,
        demo_purpose,
        expected_demos,
        intended_audience || null,
        company || null,
        opportunity_size || null,
        return_date,
        revenue_size || null,
        useCaseStr,
        meta_registered,
        deal_id || null,
        contact,
        contact_email,
        address,
        city,
        state,
        zip,
        notes || null,
      ]
    );

    const orderId = (orderResult as any).insertId;
    console.log("✅ Inserted order:", orderId);

    // INSERT ITEMS + STOCK UPDATE
    const headsets: any[] = [];
    const offlineApps: any[] = [];
    const onlineApps: any[] = [];

    if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
      for (let i = 0; i < selectedProducts.length; i++) {
        const productId = Number(selectedProducts[i]);
        const qty =
          Array.isArray(quantities) && quantities[i]
            ? Number(quantities[i])
            : 1;

        if (!productId || isNaN(productId)) continue;

        const [rows] = await conn.execute(
          "SELECT id, product_name, category, product_qty, product_sku FROM products WHERE id = ?",
          [productId]
        );

        if (!Array.isArray(rows) || rows.length === 0) continue;
        const product = rows[0] as any;

        if (qty > product.product_qty)
          throw new Error(
            `Insufficient stock for ${product.product_name} (available: ${product.product_qty})`
          );

        await conn.execute(
          "UPDATE products SET product_qty = product_qty - ? WHERE id = ?",
          [qty, productId]
        );

        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
          [orderId, productId, qty]
        );

        const cat = (product.category || "").toLowerCase();
        if (cat.includes("headset")) {
          headsets.push({
            qty,
            name: product.product_name,
            sku: product.product_sku,
          });
        } else if (cat.includes("offline")) {
          offlineApps.push(product.product_name);
        } else if (cat.includes("online")) {
          onlineApps.push(product.product_name);
        }
      }
    }

    const orderDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const summary = {
      orderId,
      orderDate,
      headsets,
      offlineApps,
      onlineApps,
    };

    console.log("✅ Order completed:", summary);

    // -----------------------------------------------------------
    // SEND EMAIL HERE (your original code untouched above)
    // -----------------------------------------------------------
    await sendNewOrderEmail(orderId, data, summary);

    return NextResponse.json({ success: true, order: summary });
  } catch (err: any) {
    console.error("❌ Finalize Order Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Database error" },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
