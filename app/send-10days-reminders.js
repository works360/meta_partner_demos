// send-10days-reminders.js
// Run daily via cron to send reminder emails 10 days AFTER the return_date.
// Example cron:
// 0 8 * * * /usr/bin/node /path/to/send-10days-reminders.js

import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- helpers ----------
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Ensure overdue10_sent exists
async function ensureOverdueColumn() {
  const sql = `
    SELECT COUNT(*) AS cnt
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'overdue10_sent'
  `;
  const [rows] = await db.query(sql);
  if (!rows[0].cnt) {
    console.log("Adding orders.overdue10_sent column...");
    await db.query(
      "ALTER TABLE orders ADD COLUMN overdue10_sent TINYINT(1) NOT NULL DEFAULT 0"
    );
  }
}

// Orders due for 10-day reminder
async function fetchOverdueOrders() {
  const sql = `
    SELECT 
      id AS order_id,
      created_at,
      sales_executive,
      sales_email,
      reseller,
      demo_purpose,
      expected_demos,
      intended_audience,
      company,
      opportunity_size,
      DATE(return_date) AS return_date,
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
      tracking_number_link,
      tracking_number,
      return_tracking_link,
      return_tracking,
      return_label,
      order_status
    FROM orders
    WHERE DATE(return_date + INTERVAL 10 DAY) = CURDATE()
      AND overdue10_sent = 0
      AND order_status <> 'Returned'
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// Items for each order
async function fetchOrderItems(orderId) {
  const sql = `
    SELECT p.product_name, p.category, p.product_sku, oi.quantity
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `;
  const [rows] = await db.query(sql, [orderId]);
  return rows;
}

function groupItems(items) {
  const headsets = [];
  const onlineApps = [];
  const offlineApps = [];

  for (const row of items) {
    const name = row.product_name || "";
    const cat = row.category || "";
    const qty = Number(row.quantity || 0);
    const sku = row.product_sku || "—";

    if (!name || qty <= 0) continue;

    if (cat === "Headset") headsets.push({ name, sku, qty });
    else if (cat === "Online Apps") onlineApps.push(name);
    else if (cat === "Offline Apps") offlineApps.push(name);
    else onlineApps.push(name);
  }
  return { headsets, onlineApps, offlineApps };
}

function buildChipList(arr) {
  if (!arr || !arr.length)
    return '<span style="color:#7b8a95;font-size:12px;">None</span>';

  return arr
    .map(
      (a) =>
        `<span style="margin-right:6px;font-size:12px;display:inline-block;">${esc(
          a
        )}</span>`
    )
    .join("");
}

function buildHeadsetRows(headsets) {
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
          <div style="width:34px;height:34px;border-radius:50%;background:#eef3ff;text-align:center;line-height:34px;font-weight:700;">
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

function trackingHtml(order) {
  let html = "";

  if (order.tracking_number) {
    html += `
      <tr>
        <td style="padding:8px 12px;">Tracking Number</td>
        <td align="right" style="padding:8px 12px;">
          <a href="${esc(order.tracking_number_link)}" target="_blank" style="color:#2563eb;">
            ${esc(order.tracking_number)}
          </a>
        </td>
      </tr>
    `;
  }

  if (order.return_tracking) {
    html += `
      <tr>
        <td style="padding:8px 12px;border-top:1px solid #e7edf2;">Return Tracking</td>
        <td align="right" style="padding:8px 12px;border-top:1px solid #e7edf2;">
          <a href="${esc(order.return_tracking_link)}" target="_blank" style="color:#2563eb;">
            ${esc(order.return_tracking)}
          </a>
        </td>
      </tr>
    `;
  }

  if (!html) return "";

  return `
    <tr>
      <td style="padding:14px 24px 0;">
        <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
          <tr>
            <td colspan="2" style="padding:10px 16px;font-weight:700;font-size:18px;">
              Tracking Details
            </td>
          </tr>
          ${html}
        </table>
      </td>
    </tr>
  `;
}

async function sendEmail(order, grouped) {
  const { headsets, onlineApps, offlineApps } = grouped;

  const headsetsHtml = buildHeadsetRows(headsets);
  const offlineList = buildChipList(offlineApps);
  const onlineList = buildChipList(onlineApps);
  const orderId = order.order_id;
  const returnDate = esc(order.return_date);

  const placedOn = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const logoPath = path.join(__dirname, "..", "public", "meta-logo.png");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="650" style="background:#ffffff;border:1px solid #e8edf3;border-radius:12px;">
            
            <!-- HEADER -->
            <tr>
              <td style="padding:22px 24px;background:#f1f6ff;border-bottom:1px solid #eef3f7;">
                <table width="100%">
                  <tr>
                    <td>
                      <img src="cid:logoimg" width="170" style="display:block;">
                    </td>
                    <td align="right" style="font-size:20px;font-weight:700;color:#0b1f2a;">
                      10-Day Overdue Reminder — #${orderId}
                    </td>
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

            <!-- INTRO -->
            <tr>
              <td style="padding:18px 24px;border-bottom:1px solid #eef3f7;font-size:14px;color:#334b59;line-height:20px;">
                Hi <strong>${esc(order.contact)}</strong>,<br><br>
                Your demo kit for Order <strong>#${orderId}</strong> was expected to be returned on <strong>${returnDate}</strong>.<br><br>

                <strong>This reminder is being sent 10 days after the scheduled return date.</strong><br><br>

                Please fill out the <a href="https://orange-sardine-913553.hostingersite.com/returns.php" style="color:#2563eb;">Returns Form</a> to initiate your return.<br>
                Once submitted, you will receive your <strong>return shipping label</strong>.
                <br><br>
                If you need help, email us at 
                <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;">support@metapartnerdemos.com</a>.
              </td>
            </tr>

            <!-- ORDER PROGRESS -->
            <tr>
              <td style="padding:18px 24px 8px;">
                <div style="text-align:center;font-size:16px;font-weight:700;margin-bottom:30px;">
                  Order Progress
                </div>

                <table width="100%">
                  <tr>
                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;line-height:36px;font-weight:700;color:#7b8a95;">1</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">New Order</div>
                    </td>
                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;line-height:36px;font-weight:700;color:#7b8a95;">2</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Shipped</div>
                    </td>
                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;line-height:36px;font-weight:700;">3</div>
                      <div style="font-size:12px;margin-top:6px;color:#0b1f2a;">Feedback Due</div>
                    </td>
                    <td align="center">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;line-height:36px;font-weight:700;color:#7b8a95;">4</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Returned</div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:33px;padding:15px;border:1px solid #e7edf2;border-radius:10px;text-align:center;font-size:13px;">
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">10-Day Overdue</span>
                </div>
              </td>
            </tr>

            ${trackingHtml(order)}

            <!-- ORDER DETAILS -->
            <tr>
              <td style="padding:12px 24px 2px;">
                <table width="100%" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr><td colspan="2" style="padding:12px 16px;font-size:18px;font-weight:700;">Order Details</td></tr>

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
            ${esc(order.sales_executive || "")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Sales Email</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.sales_email || "")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Reseller</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.reseller || "N/A")}
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

      ${
        order.demo_purpose !== "Prospect/Meeting"
          ? `
      <tr>
        <td width="50%" valign="top" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Intended Demo Audience</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.intended_audience || "N/A")}
          </div>
        </td>
        <td></td>
      </tr>`
          : `
      <tr>
        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Company</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.company || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:0 16px;">
          <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.opportunity_size || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.revenue_size || "N/A")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 0;">
          <div style="font-size:12px;color:#6b7b86;">Use Case</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.use_case || "N/A")}
          </div>
        </td>
      </tr>

      <tr>
        <td width="50%" valign="top" style="padding:12px 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Meta Registered</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.meta_registered || "No")}
          </div>
        </td>

        <td width="50%" valign="top" style="padding:12px 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.deal_id || "N/A")}
          </div>
        </td>
      </tr>
      `
      }

      <tr>
        <td colspan="2" style="padding:0 16px 16px;">
          <div style="font-size:12px;color:#6b7b86;">Expected Return Date</div>
          <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;
                      border-radius:8px;font-size:13px;color:#0b1f2a;">
            ${esc(order.return_date)}
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
                        order.contact
                      )}</div>
                    </td>
                    <td width="50%" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Email</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">${esc(
                        order.contact_email
                      )}</div>
                    </td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Address</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${esc(order.address)}, ${esc(order.city)}, ${esc(
    order.state
  )} ${esc(order.zip)}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Notes</div>
                      <div style="margin-top:6px;padding:10px;border:1px solid #e7edf2;border-radius:8px;">
                        ${esc(order.notes || "")}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:20px;text-align:center;font-size:12px;color:#6b7b86;background:#f1f6ff;">
                This is an automated 10-day overdue reminder from Meta Partner Demos.<br>
                Need help? <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;">support@metapartnerdemos.com</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

  await transporter.sendMail({
    from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
    to: "ammar@works360.com", // Option 1 confirmed
    subject: `10-Day Overdue Reminder — Order #${orderId}`,
    html,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logoimg",
      },
    ],
  });
}

// ---- main ----
async function main() {
  try {
    console.log("Running 10-day reminder script...");

    await ensureOverdueColumn();
    const orders = await fetchOverdueOrders();

    if (!orders.length) {
      console.log("No overdue reminders today.");
      return;
    }

    console.log(`Found ${orders.length} overdue orders.`);

    for (const order of orders) {
      try {
        const items = await fetchOrderItems(order.order_id);
        const grouped = groupItems(items);

        await sendEmail(order, grouped);

        await db.query(
          "UPDATE orders SET overdue10_sent = 1 WHERE id = ?",
          [order.order_id]
        );

        console.log(`Sent 10-day reminder for order #${order.order_id}`);
      } catch (err) {
        console.error(
          `Failed for order #${order.order_id}:`,
          err.message || err
        );
      }
    }

    console.log("Process complete.");
  } catch (err) {
    console.error("GLOBAL ERROR:", err.message || err);
  }
}

main();
