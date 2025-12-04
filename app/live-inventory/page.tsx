"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  id: number;
  product_name: string;
  product_sku: string;
  product_qty: number;        // Devices in stock
  total_inventory: number;    // Total units
}

export default function LiveInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";

  // 🔐 Require login only when NOT embedded
  useEffect(() => {
    const userEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("userEmail") ||
          sessionStorage.getItem("userEmail")
        : null;

    if (!isEmbed && !userEmail) {
      router.push("/login");
      return;
    }

    fetchInventory();
  }, [isEmbed]);

  // 🔹 Fetch headset inventory from API
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📤 Export to Excel
  const exportToExcel = () => {
    const table = document.getElementById("inventoryTable") as HTMLTableElement | null;
    if (!table) return;

    const rows: string[][] = [];
    const headers = Array.from(table.querySelectorAll("thead th")).map(
      (th) => th.textContent?.trim() || ""
    );
    rows.push(headers);

    const bodyRows = Array.from(
      table.querySelectorAll("tbody tr")
    ) as HTMLTableRowElement[];

    bodyRows.forEach((tr) => {
      const cells = Array.from(tr.cells) as HTMLTableCellElement[];
      const row = cells.map((td) => td.textContent?.trim() || "");
      rows.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Headset Inventory");

    XLSX.writeFile(wb, "headset-inventory.xlsx");
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <main className={isEmbed ? "embed-layout" : "container mt-5"}>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Live Inventory</h3>

          <button className="btn btn-excel" onClick={exportToExcel}>
            <img src="/productimages/excelicon.png" className="icon" alt="" />
            Export to Excel
          </button>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table
              id="inventoryTable"
              className="table table-bordered text-nowrap mb-0"
            >
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Devices In-Stock</th>
                  <th>With Customer</th>
                  <th>Total Inventory</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((p) => {
                    const stock = p.product_qty || 0;
                    const total = p.total_inventory || 0;
                    const withCustomer = Math.max(0, total - stock);

                    return (
                      <tr key={p.id}>
                        <td>{p.product_name}</td>
                        <td>{p.product_sku}</td>
                        <td>{stock}</td>
                        <td>{withCustomer}</td>
                        <td>{total}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No headset products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Page styling */}
      <style jsx>{`
        .embed-layout {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
        .embed-layout .card {
          border-radius: 0;
          border-left: 0;
          border-right: 0;
          border-bottom: 0;
          box-shadow: none;
        }
        .card-title {
          font-weight: 600;
          font-size: 22px;
        }
        .btn-excel {
          background: transparent !important;
          color: #000 !important;
          border: 1px solid #000;
          padding: 8px 14px;
        }
        img.icon {
          width: 20px !important;
          margin-right: 6px;
        }
        .table td,
        .table th {
          font-size: 13px;
          vertical-align: middle;
        }
        .table thead th {
          background: #f8fafc;
        }
      `}</style>
    </main>
  );
}
