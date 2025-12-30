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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Inventory Management</h1>
        <Link
          href="/admin/inventory/new"
          className="w-full rounded-lg bg-soft-blue-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto"
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
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              filter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter("low_stock")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              filter === "low_stock"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("out_of_stock")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
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
          className="w-full rounded-lg border border-border bg-background px-4 py-2 sm:w-64"
        />
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px]">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">Item</th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">SKU</th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">Category</th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">Price</th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">Stock</th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">Status</th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity < item.minStock && item.quantity > 0;
                const isOutOfStock = item.quantity === 0;
                return (
                  <tr key={item.id} className="hover:bg-grey-50">
                    <td className="px-2 py-3 sm:px-4">
                      <div className="text-sm font-medium sm:text-base">{item.name}</div>
                      {item.brand && (
                        <div className="text-xs text-muted-foreground sm:text-sm">{item.brand}</div>
                      )}
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                      {item.sku}
                    </td>
                    <td className="px-2 py-3 text-xs capitalize sm:px-4 sm:text-sm">{item.category}</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                      {formatCurrency(item.price, item.currency)}
                    </td>
                    <td className="px-2 py-3 text-center sm:px-4">
                      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                        <span
                          className={`text-xs font-semibold sm:text-sm ${
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
                    <td className="px-2 py-3 text-center sm:px-4">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-error/10 px-1.5 py-0.5 text-[10px] font-medium text-error sm:px-2 sm:text-xs">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning sm:px-2 sm:text-xs">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success sm:px-2 sm:text-xs">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                        <Link
                          href={`/admin/inventory/${item.id}/edit`}
                          className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm"
                        >
                          Edit
                        </Link>
                        <button className="text-[10px] text-error hover:underline sm:text-sm">
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

