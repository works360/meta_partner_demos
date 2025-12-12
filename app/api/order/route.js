//kit-updateorder/route.js file

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public/returnlabelimages");

// ✅ GET — Fetch full order and products
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (!orders?.length)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const order = orders[0];

    const [items] = await db.query(
      `
      SELECT 
        p.product_name, 
        p.category, 
        COALESCE(oi.quantity, 0) AS quantity
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY p.category ASC
    `,
      [id]
    );

    const [returns] = await db.query(
      `
      SELECT submit_return 
      FROM return_requests 
      WHERE order_id = ? 
      ORDER BY submitted_at DESC 
      LIMIT 1
    `,
      [id]
    );

    const hasSubmittedReturn =
      returns?.length &&
      (returns[0].submit_return === "1" ||
        returns[0].submit_return?.toLowerCase() === "yes");

    return NextResponse.json({
      order,
      items,
      hasSubmittedReturn,
    });
  } catch (error) {
    console.error("❌ GET /api/order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ✅ POST — Update order + upload return label (for Shop Manager & Program Manager)
export async function POST(req) {
  try {
    const role = (req.headers.get("x-user-role") || "").toLowerCase();
    const email = req.headers.get("x-user-email") || "unknown";

    // Allow both roles
    if (!["shop manager", "program manager"].includes(role)) {
      return NextResponse.json(
        { error: `Access denied. ${email} is not authorized to edit orders.` },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const id = formData.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

    const order_status = String(
      formData.get("order_status") || "Processing"
    );

    const tracking_number = formData.get("tracking_number") || "";
    const tracking_number_link = formData.get("tracking_number_link") || "";
    const return_tracking = formData.get("return_tracking") || "";
    const return_tracking_link = formData.get("return_tracking_link") || "";
    let return_label = formData.get("existing_label") || "";

    // Handle return label upload
    // const uploaded = formData.get("return_label");
    // if (uploaded && typeof uploaded === "object" && uploaded.size > 0) {
    //   if (!fs.existsSync(UPLOAD_DIR))
    //     fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    //   const buffer = Buffer.from(await uploaded.arrayBuffer());
    //   const safeName = uploaded.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    //   const filename = `returnlabel_${Date.now()}_${safeName}`;
    //   fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    //   return_label = filename;
    // }

 // const uploaded = formData.get("return_label");
  //const orderID = formData.get("id"); // ← Dynamic folder

  //if (uploaded && typeof uploaded === "object" && uploaded.size > 0) {
    // Clean filename
  //  const safeName = uploaded.name.replace(/[^a-zA-Z0-9_.-]/g, "_");

    // Build folder + filename path
   // const filename = `returnlabel_${Date.now()}_${safeName}`;
   // const blobPath = `${orderID}/${filename}`;

    // Upload to Vercel Blob
  //  const blob = await put(blobPath, uploaded, {
   //   access: "public",
    //  addRandomSuffix: true,     // Optional
    //});

    // Store the final URL in your DB or return object
   // return_label = blob.url;
   // console.log("✅ Uploaded return label to Vercel Blob:", blob.url);
  //}

  // ⭐ FIX: Convert file to buffer BEFORE calling `put()`
// Otherwise Vercel tries to read the locked Request stream → error happens

const uploaded = formData.get("return_label");
const orderID = formData.get("id");

// Only process IF real file was selected
if (
  uploaded &&
  typeof uploaded === "object" &&
  uploaded.size &&
  uploaded.size > 0
) {
  const safeName = uploaded.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filename = `returnlabel_${Date.now()}_${safeName}`;
  const blobPath = `${orderID}/${filename}`;

  const buffer = Buffer.from(await uploaded.arrayBuffer());

  const blob = await put(blobPath, buffer, { access: "public" });

  return_label = blob.url;
  console.log("✅ Uploaded return label to Vercel Blob:", blob.url);
}



    // 🔎 Fetch existing approval/rejection fields
    const [rows] = await db.query(
      "SELECT approved_by, approved_date, rejected_by, rejected_date FROM orders WHERE id = ?",
      [id]
    );
    if (!rows?.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let approved_by = rows[0].approved_by;
    let approved_date = rows[0].approved_date;
    let rejected_by = rows[0].rejected_by;
    let rejected_date = rows[0].rejected_date;

    // --- ✅ Approval tracking logic ---
    // Only Program Manager can set/clear these flags
    if (role === "program manager") {
      if (order_status === "Processing") {
        // Approve: set approved, clear rejected
        approved_by = email;
        approved_date = new Date();
        rejected_by = null;
        rejected_date = null;
      } else if (order_status === "Cancelled") {
        // Reject: set rejected, clear approved
        rejected_by = email;
        rejected_date = new Date();
        approved_by = null;
        approved_date = null;
      } else if (order_status === "Awaiting Approval") {
        // Reset: clear both
        approved_by = null;
        approved_date = null;
        rejected_by = null;
        rejected_date = null;
      }
      // For other statuses (Shipped, Returned, etc.), keep existing values
    }

    await db.query(
      `
      UPDATE orders 
      SET 
        order_status = ?, 
        tracking_number = ?, 
        tracking_number_link = ?, 
        return_tracking = ?, 
        return_tracking_link = ?, 
        return_label = ?, 
        approved_by = ?, 
        approved_date = ?, 
        rejected_by = ?, 
        rejected_date = ?, 
        updated_date = NOW()
      WHERE id = ?
    `,
      [
        order_status,
        tracking_number,
        tracking_number_link,
        return_tracking,
        return_tracking_link,
        return_label,
        approved_by,
        approved_date,
        rejected_by,
        rejected_date,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ POST /api/order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
