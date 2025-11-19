import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  let conn: any;

  try {
    conn = await db.getConnection();
    const formData = await req.formData();

    // ✅ Parse FormData properly — supports [] and normal keys
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      const cleanKey = key.endsWith("[]") ? key.replace("[]", "") : key;
      if (!data[cleanKey]) data[cleanKey] = [];
      data[cleanKey].push(value);
    }

    // Flatten single values
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length === 1) {
        data[key] = data[key][0];
      }
    }

    // ✅ Parse product and quantity data safely
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

    // ✅ Extract standard order fields
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

    // ✅ Step 1: Insert order record
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

    // ✅ Step 2: Insert order_items and update stock
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

        // Deduct stock
        await conn.execute(
          "UPDATE products SET product_qty = product_qty - ? WHERE id = ?",
          [qty, productId]
        );

        // Insert into order_items
        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
          [orderId, productId, qty]
        );

        // Categorize products for summary
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
    } else {
      console.warn("⚠️ No products found — order_items not inserted.");
    }

    // ✅ Step 3: Build summary response
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
