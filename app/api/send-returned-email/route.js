import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import path from "path";
import { NextResponse } from "next/server";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

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

// =======================================================
// ⭐ RESTORE PRODUCT STOCK WHEN ORDER IS RETURNED
// =======================================================
async function restoreStock(orderId) {
  const [items] = await db.query(
    `SELECT product_id, quantity 
     FROM order_items 
     WHERE order_id = ?`,
    [orderId]
  );

  for (const item of items) {
    await db.query(
      `UPDATE products 
       SET product_qty = product_qty + ? 
       WHERE id = ?`,
      [item.quantity, item.product_id]
    );
  }

  console.log(`Stock restored for order #${orderId}`);
}

// =======================================================
// PRODUCT HELPERS
// =======================================================
async function fetchItemsForOrder(orderId) {
  const sql = `
    SELECT p.product_name, p.category, p.product_sku, oi.quantity
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `;
  const [rows] = await db.query(sql, [orderId]);
  return rows;
}

function buildHeadsetAndAppGroups(items) {
  const headsets = [];
  const onlineApps = [];
  const offlineApps = [];

  for (const row of items) {
    const name = row.product_name || "";
    const cat = row.category || "";
    const sku = row.product_sku || "—";
    const qty = Number(row.quantity || 0);

    if (!name || qty <= 0) continue;

    if (cat === "Headset") {
      headsets.push({ name, sku, qty });
    } else if (cat === "Online Apps") {
      onlineApps.push(name);
    } else if (cat === "Offline Apps") {
      offlineApps.push(name);
    } else {
      onlineApps.push(name);
    }
  }

  return { headsets, onlineApps, offlineApps };
}

function buildChipList(apps) {
  const chipStyle =
    "display:inline-block;margin:4px 0;padding:4px;font-size:12px;";
  const separator = '<span style="font-size:12px;">, </span>';

  if (!apps || apps.length === 0)
    return '<span style="color:#6b7b86;">None</span>';

  return apps
    .map((app) => `<span style="${chipStyle}">${esc(app)}</span>`)
    .join(separator);
}

function buildHeadsetRows(headsets) {
  if (!headsets || headsets.length === 0) {
    return `<tr><td style="padding:16px;color:#7b8a95;">No headsets</td><td></td></tr>`;
  }

  let html = "";

  headsets.forEach((h, idx) => {
    const name = esc(h.name);
    const sku = esc(h.sku);
    const qty = Number(h.qty);

    html += `
      <tr>
        <td style="padding:16px;">
          <div style="border-left:3px solid Blue;padding-left:10px;">
            <div style="font-weight:700;font-size:17px;">${name}</div>
            <div style="font-size:11px;color:#7b8a95;">SKU: ${sku}</div>
          </div>
        </td>
        <td align="right" style="padding:16px;">
          <div style="width:34px;height:34px;border-radius:50%;background:#eef3ff;
                      color:#0b1f2a;line-height:34px;text-align:center;font-weight:700;">
            ${qty}
          </div>
        </td>
      </tr>
    `;

    if (idx < headsets.length - 1) {
      html += `<tr><td colspan="2" style="height:1px;background:#eef3f7;"></td></tr>`;
    }
  });

  return html;
}

// =======================================================
// MAIN API ROUTE
// =======================================================
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

    // ====================================================
    // ⭐ RESTORE STOCK HERE ⭐
    // ====================================================
    // 🔒 Check if stock already restored
if (!order.stock_restored) {
  await restoreStock(orderId);

  await db.query(
    `UPDATE orders SET stock_restored = 1 WHERE id = ?`,
    [orderId]
  );

  console.log(`✅ Stock restored ONCE for order #${orderId}`);
} else {
  console.log(`⚠️ Stock already restored for order #${orderId}, skipping`);
}
    // ====================================================
    // PREPARE EMAIL DATA
    // ====================================================
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
    const returnDate = formatDate(order.return_date);
    const returnTracking = esc(order.return_tracking || "");
    const returnTrackingLink = esc(order.return_tracking_link || "#");

    // PRODUCTS
    const items = await fetchItemsForOrder(orderId);
    const { headsets, onlineApps, offlineApps } =
      buildHeadsetAndAppGroups(items);

    const headsetsHtml = buildHeadsetRows(headsets);
    const offlineList = buildChipList(offlineApps);
    const onlineList = buildChipList(onlineApps);



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
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                  line-height:36px;font-weight:700;">4</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Returned</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:33px;padding:15px;border:1px solid #e7edf2;border-radius:10px;text-align:center;font-size:13px;">
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">Returned</span>
                </div>
              </td>
            </tr>

             <!-- INTRO -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;font-size:14px;line-height:20px;color:#334b59;">
                Hello <strong>${salesExec}</strong>,<br><br>
                Your order has been returned. 
                
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

            <!-- ORDER DETAILS -->
<tr>
  <td style="padding:12px 24px 2px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" 
           style="border:1px solid #e7edf2;border-radius:12px;overflow:hidden;">

      <tr>
        <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">
          Order Details
        </td>
      </tr>

      <tr>
        <td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eeeeee;">
          Product
        </td>
        <td align="right" style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eeeeee;">
          Quantity
        </td>
      </tr>

      <!-- HEADSETS -->
      ${headsetsHtml}

      <!-- APPS BOXES -->
      <tr>
        <td colspan="2" style="padding:0 16px 16px;">

          <!-- OFFLINE APPS -->
          <table width="100%" style="margin:8px 0;border:1px solid #dbe7ff;border-radius:10px;">
            <tr>
              <td style="padding:10px 12px;">
                <div style="font-weight:700;font-size:13px;color:#274b8f;margin-bottom:6px;">Pre-Packaged App Demos</div>
                ${offlineList}
              </td>
            </tr>
          </table>

          <!-- ONLINE APPS -->
          <table width="100%" style="margin:0;border:1px solid #d6f5e5;border-radius:10px;">
            <tr>
              <td style="padding:10px 12px;">
                <div style="font-weight:700;font-size:13px;color:#274b8f;margin-bottom:6px;">Managed App Store Demos</div>
                ${onlineList}
              </td>
            </tr>
          </table>

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
         ${returnDate}
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
