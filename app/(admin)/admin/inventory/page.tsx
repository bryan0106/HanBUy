"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  currency: "KRW" | "PHP";
  quantity: number;
  minStock: number;
  status: "onhand" | "preorder" | "out_of_stock";
  images: string[];
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const loadInventory = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: InventoryItem[] = [
      {
        id: "inv-1",
        name: "COSRX Advanced Snail 96 Mucin Power Essence",
        sku: "COSRX-SNAIL-96",
        category: "skincare",
        brand: "COSRX",
        price: 25000,
        currency: "KRW",
        quantity: 5,
        minStock: 10,
        status: "onhand",
        images: [],
      },
      {
        id: "inv-2",
        name: "Samyang Buldak Hot Chicken Ramen",
        sku: "SAM-BULDAK-5",
        category: "food",
        brand: "Samyang",
        price: 12000,
        currency: "KRW",
        quantity: 0,
        minStock: 20,
        status: "out_of_stock",
        images: [],
      },
      {
        id: "inv-3",
        name: "Laneige Water Bank Hyaluronic Cream",
        sku: "LAN-WB-HC",
        category: "skincare",
        brand: "Laneige",
        price: 35000,
        currency: "KRW",
        quantity: 8,
        minStock: 10,
        status: "onhand",
        images: [],
      },
    ];
    setItems(mockData);
    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "low_stock" && item.quantity < item.minStock && item.quantity > 0) ||
      (filter === "out_of_stock" && item.quantity === 0);
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const lowStockCount = items.filter(
    (item) => item.quantity < item.minStock && item.quantity > 0
  ).length;
  const outOfStockCount = items.filter((item) => item.quantity === 0).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <Link
          href="/admin/inventory/new"
          className="rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700"
        >
          + Add New Item
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Low Stock Alert</p>
          <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold text-error">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter("low_stock")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "low_stock"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("out_of_stock")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === "out_of_stock"
                ? "bg-error text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2 sm:w-64"
        />
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Stock</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity < item.minStock && item.quantity > 0;
                const isOutOfStock = item.quantity === 0;
                return (
                  <tr key={item.id} className="hover:bg-grey-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      {item.brand && (
                        <div className="text-sm text-muted-foreground">{item.brand}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{item.category}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(item.price, item.currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-error"
                              : isLowStock
                              ? "text-warning"
                              : "text-success"
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {item.minStock} min
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-error/10 px-2 py-1 text-xs font-medium text-error">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/inventory/${item.id}/edit`}
                          className="text-soft-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <button className="text-error hover:underline text-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

