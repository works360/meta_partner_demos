"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  username: string;
  sales_executive: string;
  reseller: string;
}

export default function AllUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";

  // 🔹 Check login only when NOT embedded
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

    fetchUsers();
  }, [isEmbed]);

  // 🔹 Fetch data from /api/users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Export to Excel
  const exportToExcel = () => {
    const table = document.getElementById("usertable") as HTMLTableElement | null;
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
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <main className={isEmbed ? "embed-layout" : "container mt-5"}>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Users</h3>

          <button className="btn btn-excel" onClick={exportToExcel}>
            <img src="/productimages/excelicon.png" className="icon" alt="" />
            Export to Excel
          </button>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table
              id="usertable"
              className="table table-bordered text-nowrap mb-0 w-100"
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: "90px" }}>S.No</th>
                  <th>User Email</th>
                  <th>User Name</th>
                  <th>Reseller</th>
                </tr>
              </thead>

              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.sales_executive}</td>
                      <td>{user.reseller}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PAGE SPECIFIC STYLES */}
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
