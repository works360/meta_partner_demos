// send-return-reminders.js
// Run daily via cron to send reminder emails 5 days before return_date.
// Example cron:
// 0 8 * * * /usr/bin/node /path/to/send-return-reminders.js

import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../lib/db.js"; // ⚠️ adjust this path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- HELPERS ----------
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function ensureReminderColumn() {
  const checkSql = `
    SELECT COUNT(*) AS cnt
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'reminder_sent'
  `;
  const [rows] = await db.query(checkSql);
  const exists = rows[0]?.cnt > 0;
  if (!exists) {
    console.log("Adding orders.reminder_sent column...");
    await db.query(
      "ALTER TABLE orders ADD COLUMN reminder_sent TINYINT(1) NOT NULL DEFAULT 0"
    );
  }
}

async function fetchOrdersDueForReminder() {
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
      return_label
    FROM orders
    WHERE DATE(return_date - INTERVAL 5 DAY) = CURDATE()
      AND reminder_sent = 0
      AND NOT EXISTS (
        SELECT 1
        FROM return_requests rr
        WHERE rr.order_id = orders.id
          AND LOWER(TRIM(rr.submit_return)) = 'yes'
      )
  `;
  const [orders] = await db.query(sql);
  return orders;
}

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
      // catch-all
      onlineApps.push(name);
    }
  }

  return { headsets, onlineApps, offlineApps };
}

function buildChipList(apps) {
  const chipStyle =
    "display:inline-block;margin:4px 0 4px 0;padding:4px 4px;background:none;font-size:12px;";
  const separator = '<span style="font-size:12px;">, </span>';

  if (!apps || apps.length === 0) {
    return '<span style="color:#6b7b86;">None</span>';
  }

  const spans = apps.map(
    (app) => `<span style="${chipStyle}">${esc(app)}</span>`
  );
  return spans.join(separator);
}

function buildHeadsetRows(headsets) {
  if (!headsets || headsets.length === 0) {
    return `<tr><td style="padding:16px;color:#7b8a95;">No headsets</td><td></td></tr>`;
  }

  let html = "";
  const count = headsets.length;

  headsets.forEach((h, idx) => {
    const name = esc(h.name || "Headset");
    const sku = esc(h.sku || "—");
    const qty = Number(h.qty || 0);

    html += `
      <tr>
        <td style="padding:16px;">
          <div style="border-left:3px solid Blue;padding-left:10px;">
            <div style="font-weight:700;font-size:17px;margin-bottom:2px;">${name}</div>
            <div style="font-size:11px;color:#7b8a95;margin-bottom:0;">SKU: ${sku}</div>
          </div>
        </td>
        <td align="right" valign="top" style="padding:16px;">
          <div style="width:34px;height:34px;border-radius:50%;background:#eef3ff;color:#0b1f2a;line-height:34px;text-align:center;font-weight:700;display:inline-block;">${qty}</div>
        </td>
      </tr>
    `;

    if (idx < count - 1) {
      html += `<tr><td colspan="2" style="height:1px;background:#eef3f7;"></td></tr>`;
    }
  });

  return html;
}

function buildTrackingHtml(trackingNumber, trackingLink, returnTracking, returnTrackingLink) {
  let trackingRows = "";

  if (trackingNumber) {
    const tNum = esc(trackingNumber);
    const tLink = esc(trackingLink || "#");
    trackingRows += `
      <tr>
        <td style="padding:8px 12px;border-top:1px solid #e7edf2;">Tracking Number</td>
        <td align="right" style="padding:8px 12px;border-top:1px solid #e7edf2;">
          <a href="${tLink}" style="color:#2563eb;text-decoration:none;" target="_blank">${tNum}</a>
        </td>
      </tr>
    `;
  }

  if (returnTracking) {
    const rtNum = esc(returnTracking);
    const rtLink = esc(returnTrackingLink || "#");
    trackingRows += `
      <tr>
        <td style="padding:8px 12px;border-top:1px solid #e7edf2;">Return Tracking</td>
        <td align="right" style="padding:8px 12px;border-top:1px solid #e7edf2;">
          <a href="${rtLink}" style="color:#2563eb;text-decoration:none;" target="_blank">${rtNum}</a>
        </td>
      </tr>
    `;
  }

  if (!trackingRows) return "";

  return `
    <tr>
      <td style="padding:14px 24px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7edf2;border-radius:12px;">
          <tr>
            <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">Tracking Details</td>
          </tr>
          ${trackingRows}
        </table>
      </td>
    </tr>
  `;
}

async function sendReminderEmail(order, headsets, offlineApps, onlineApps) {
  const orderId = order.order_id;
  const returnDate = order.return_date; // YYYY-MM-DD
  const createdAt = order.created_at;

  const placedOn = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const shipName = esc(order.contact || "");
  const shipEmail = esc(order.contact_email || "");
  const shipAddress = esc(
    `${order.address || ""}, ${order.city || ""}, ${order.state || ""} ${
      order.zip || ""
    }`.replace(/^[,\s]+|[,\s]+$/g, "")
  );
  const shipNotes = esc(order.notes || "");

  const { headsetsHtml, offlineList, onlineList } = (() => {
    const headsetsHtml = buildHeadsetRows(headsets);
    const offlineList = buildChipList(offlineApps);
    const onlineList = buildChipList(onlineApps);
    return { headsetsHtml, offlineList, onlineList };
  })();

  const reqSalesExec = esc(order.sales_executive || "Sales Team");
  const reqSalesEmail = esc(order.sales_email || "");
  const reqReseller = esc(order.reseller || "N/A");

  const demoPurpose = order.demo_purpose || "";
  const intended = esc(order.intended_audience || "N/A");
  const company = esc(order.company || "N/A");
  const opportunity = esc(order.opportunity_size || "N/A");
  const revenue = esc(order.revenue_size || "N/A");
  const usecase = esc(order.use_case || "N/A");
  const metaReg = esc(order.meta_registered || "No");
  const dealId = esc(order.deal_id || "N/A");
  const returnDateEsc = esc(returnDate || "");

  const trackingLink = order.tracking_number_link || "";
  const trackingNumber = order.tracking_number || "";
  const returnTrackingLink = order.return_tracking_link || "";
  const returnTracking = order.return_tracking || "";
  const returnLabelFilename = order.return_label || "";

  const trackingHtml = buildTrackingHtml(
    trackingNumber,
    trackingLink,
    returnTracking,
    returnTrackingLink
  );

  const currentStatus = "Feedback / Return Due Soon";

  // Build the large HTML body (ported from your PHP script)
  let body = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="650" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e8edf3;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#172b3a;">
            <!-- Top bar -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;background-color:#f1f6ff;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" valign="middle">
                      <img src="cid:logoimg" width="170" alt="Partner Demos" style="display:block;border:0;">
                    </td>
                    <td align="right" valign="middle" style="font-size:20px;font-weight:700;color:#0b1f2a;">
                      Return Reminder — #${orderId}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:22px 24px;border-bottom:1px solid #eef3f7;background-color:#ffffff;">
                <div style="font-size:20px;font-weight:700;color:#0b1f2a;">
                  Return Reminder for Order #${orderId} — Meta Partner Demos
                </div>
                <div style="margin-top:6px;font-size:12px;color:#6b7b86;">Placed On ${placedOn}</div>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding:18px 24px;border-bottom:1px solid #eef3f7;">
                <div style="font-size:14px;line-height:20px;color:#334b59;">
                  Hi <strong>${shipName}</strong>,<br>
                  We hope your experience with Meta Partner Demos has been smooth and valuable so far. This is a courtesy reminder that days have now passed since the delivery of your demo device(s). <br>
                  To ensure a seamless return process when completed with the demo, we request that you initiate the return preparation by completing the <a href="https://orange-sardine-913553.hostingersite.com/returns.php" style="color:#2563eb;text-decoration:none;">Returns Form</a> at your convenience.<br>
                  Once your feedback is submitted on the returns form, you will receive a scanned copy of <strong>return shipping label</strong> that can be used to send the demo kit back<br>
                  This is a friendly reminder that your demo kit for Order <strong>#${orderId}</strong> is due to be returned on <strong>${returnDateEsc}</strong> (in 5 days).
                  
                  <br><br>
                  Feel free to reach out to us at <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;text-decoration:none;">support@metapartnerdemos.com</a> for any further queries!.
                </div>
              </td>
            </tr>

            <!-- Order Progress -->
            <tr>
              <td style="padding:18px 24px 8px;">
                <div style="font-size:16px;font-weight:700;color:#0b1f2a;margin-bottom:30px;text-align:center;">Order Progress</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">
                  <tr>
                    <td align="center" width="25%">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;line-height:36px;font-weight:700;display:inline-block;">1</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">New Order</div>
                    </td>
                    <td align="center" width="25%">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;line-height:36px;font-weight:700;display:inline-block;">2</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Order Shipped</div>
                    </td>
                    <td align="center" width="25%">
                      <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;line-height:36px;font-weight:700;display:inline-block;">3</div>
                      <div style="font-size:12px;color:#0b1f2a;margin-top:6px;">Feedback</div>
                    </td>
                    <td align="center" width="25%">
                      <div style="width:36px;height:36px;border-radius:50%;background:#e9eef5;color:#7b8a95;line-height:36px;font-weight:700;display:inline-block;">4</div>
                      <div style="font-size:12px;color:#7b8a95;margin-top:6px;">Order Returned</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:33px;padding:15px 12px;text-align:center;border:1px solid #e7edf2;border-radius:10px;font-size:13px;color:#29414f;">
                  <strong>Current Status:</strong> <span style="color:#2563eb;font-weight:700;">${currentStatus}</span>
                </div>
              </td>
            </tr>

            <!-- Tracking (if any) -->
            ${trackingHtml}

            <!-- Order Details card -->
            <tr>
              <td style="padding:12px 24px 2px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7edf2;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">Order Details</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eeeeee;">Product</td>
                    <td align="right" style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eeeeee;">Quantity</td>
                  </tr>

                  <!-- One row per headset -->
                  ${headsetsHtml}

                  <!-- Apps boxes (shown once) -->
                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;">
                      <!-- Blue: Pre-Packaged App Demos (offline) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 10px;border:1px solid #dbe7ff;border-radius:10px;">
                        <tr>
                          <td style="padding:10px 12px;">
                            <div style="font-weight:700;font-size:13px;color:#274b8f;margin-bottom:6px;">Pre-Packaged App Demos</div>
                            ${offlineList}
                          </td>
                        </tr>
                      </table>

                      <!-- Green: Managed App Store Demos (online) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 6px;border:1px solid #d6f5e5;border-radius:10px;">
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

            <!-- Requestor Details -->
            <tr>
              <td style="padding:14px 24px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">Requestor Details</td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Sales Executive</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${reqSalesExec}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Sales Executive Email</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${reqSalesEmail}</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Reseller</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${reqReseller}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:0 16px 16px;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Opportunity Details -->
            <tr>
              <td style="padding:14px 24px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">Opportunity Details</td>
                  </tr>
`;

  // Conditional block like PHP (Prospect/Meeting vs others)
  if (demoPurpose !== "Prospect/Meeting") {
    body += `
                  <tr>
                    <td width="50%" valign="top" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Intended demo audience?</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${intended}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:0 16px 16px;"></td>
                  </tr>
`;
  } else {
    body += `
                  <tr>
                    <td width="50%" valign="top" style="padding:0 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Company</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${company}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:0 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Opportunity Size</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${opportunity}</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:12px 16px 0;">
                      <div style="font-size:12px;color:#6b7b86;">Revenue Size</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${revenue}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:12px 16px 0;">
                      <div style="font-size:12px;color:#6b7b86;">Use Case</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${usecase}</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:12px 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Meta Registered</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${metaReg}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:12px 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Deal ID</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${dealId}</div>
                    </td>
                  </tr>
`;
  }

  body += `
                  <tr>
                    <td colspan="2" valign="top" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Expected Return Date</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${returnDateEsc}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Shipping Details -->
            <tr>
              <td style="padding:14px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7edf2;border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:12px 16px;font-weight:700;font-size:18px;">Shipping Details</td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Point of Contact</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${shipName}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:12px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Email</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${shipEmail}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" valign="top" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Shipping Address</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${shipAddress}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" valign="top" style="padding:0 16px 16px;">
                      <div style="font-size:12px;color:#6b7b86;">Notes</div>
                      <div style="margin-top:6px;padding:10px 12px;border:1px solid #e7edf2;border-radius:8px;font-size:13px;color:#0b1f2a;">${shipNotes}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 24px 18px;background:#f1f6ff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #eef3f7;">
                  <tr>
                    <td width="50%" align="left" style="padding-top:12px;font-size:12px;color:#6b7b86;">
                      Need help? Contact us:<br>
                      <a href="mailto:support@metapartnerdemos.com" style="color:#2563eb;text-decoration:none;">support@metapartnerdemos.com</a>
                    </td>
                    <td width="50%" align="right" style="padding-top:12px;font-size:12px;color:#6b7b86;">
                      Visit our website:<br>
                      <a href="https://www.metapartnerdemos.com" style="color:#2563eb;text-decoration:none;">www.metapartnerdemos.com</a>
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

  
  const logoPath = path.join(__dirname, "..", "public", "meta-logo.png");
  const attachments = [];

  // We don't require logo to exist, but if it does, embed it
  attachments.push({
    filename: "logo.png",
    path: logoPath,
    cid: "logoimg",
  });

  await transporter.sendMail({
    from: '"Meta Partner Demos" <admin@shiworkspacebuilder.com>',
    to: "ammar@works360.com", // same as your PHP; you can change to order.contact_email if you want
    subject: `Return Reminder — Order #${orderId} | Meta Partner Demos`,
    html: body,
    attachments,
  });
}

async function main() {
  try {
    await ensureReminderColumn();

    const orders = await fetchOrdersDueForReminder();
    if (!orders || orders.length === 0) {
      console.log("No reminders due today.");
      return;
    }

    console.log(`Found ${orders.length} orders due for reminder.`);

    for (const order of orders) {
      const orderId = order.order_id;
      try {
        const items = await fetchItemsForOrder(orderId);
        const { headsets, onlineApps, offlineApps } =
          buildHeadsetAndAppGroups(items);

        await sendReminderEmail(order, headsets, offlineApps, onlineApps);

        await db.query("UPDATE orders SET reminder_sent = 1 WHERE id = ?", [
          orderId,
        ]);

        console.log(`Reminder sent for order #${orderId}`);
      } catch (err) {
        console.error(
          `Reminder email failed for order #${orderId}:`,
          err.message || err
        );
      }
    }

    console.log("Reminder process complete.");
  } catch (err) {
    console.error("Global reminder process error:", err.message || err);
  } finally {
    if (typeof db.end === "function") {
      try {
        await db.end();
      } catch (e) {
        // ignore
      }
    }
  }
}

main();
