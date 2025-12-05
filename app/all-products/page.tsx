"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Product {
  id: number;
  product_name: string;
  product_sku: string;
  category: string;
  product_qty: number;
  image: string;
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then(async (res) => {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);



  // ✅ Delete product
  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(products.filter((p: any) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

 return (
  <div className="min-h-screen bg-white p-8">
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <button
          onClick={() => router.push("/product-upload")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-sm"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No products found. Add a new product to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100 text-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4 w-[80px]">Image</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(products) && products.map((p: any) => (

                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-4">{p.id}</td>
                  <td
                    className="py-2 px-4 font-medium text-blue-600 cursor-pointer hover:underline"
                    onClick={() => router.push(`/edit-product/${p.id}`)}
                  >
                    {p.product_name}
                  </td>
                  <td className="py-2 px-4">{p.product_sku}</td>
                  <td className="py-2 px-4">{p.category}</td>
                  <td className="py-2 px-4">{p.product_qty}</td>

                  <td className="py-2 px-4">
  {p.image ? (
    <div className="w-[50px] h-[50px] flex items-center justify-center overflow-hidden rounded-md">
      <img
        src={p.image}   // 👈 FIXED
        alt={p.product_name}
        className="w-[50px] h-[50px] object-cover"
        style={{
          minWidth: "50px",
          minHeight: "50px",
          maxWidth: "50px",
          maxHeight: "50px",
        }}
      />
    </div>
  ) : (
    <span className="text-gray-400">No image</span>
  )}
</td>


                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => router.push(`/edit-product/${p.id}`)}
                        className="p-2 text-black hover:text-gray-700 transition"
                        title="Edit Product"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition"
                        title="Delete Product"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

}
