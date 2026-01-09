"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { productService, type Product } from "@/services/productService";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";

interface InventoryItem extends Product {
  minStock?: number; // For low stock alerts (can be stored separately or calculated)
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [onhandItems, setOnhandItems] = useState<InventoryItem[]>([]);
  const [preorderItems, setPreorderItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "onhand" | "preorder" | "low_stock" | "out_of_stock">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadInventory(false); // Don't show toast on initial load
    }
  }, []);

  // Refresh when returning from edit/create page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refreshed') === 'true') {
        // Force refresh by resetting refs
        loadingRef.current = false;
        hasLoadedRef.current = false;
        // Force refresh immediately with a small delay to ensure state is reset
        setTimeout(() => {
          loadInventory(true, true).then(() => {
            // Clean up URL after refresh completes
            window.history.replaceState({}, '', '/admin/inventory');
          });
        }, 50);
      }
    }
  }, []);

  const loadInventory = async (showToast = true, forceRefresh = false) => {
    // Prevent duplicate calls unless forced refresh
    if (loadingRef.current && !forceRefresh) {
      console.log("Inventory load already in progress, skipping duplicate call");
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    // Clear existing data on force refresh to show loading state
    if (forceRefresh) {
      setItems([]);
      setOnhandItems([]);
      setPreorderItems([]);
    }
    
    const loadingToast = showToast ? toast.loading("Loading inventory...") : null;
    try {
      // Fetch all products (both onhand and preorder) in parallel
      // Cache-busting is handled automatically by apiClient interceptor
      const [onhandResponse, preorderResponse] = await Promise.allSettled([
        productService.getOnhandProducts({ page: 1, limit: 1000 }),
        productService.getPreorderProducts({ page: 1, limit: 1000 }),
      ]);

      // Handle onhand response
      let onhand: InventoryItem[] = [];
      if (onhandResponse.status === 'fulfilled') {
        console.log("Onhand products loaded:", onhandResponse.value.data.length);
        onhand = (onhandResponse.value.data || []).map((p) => ({
          ...p,
          product_type: (p.product_type === "onhand" || p.product_type === "preorder_and_onhand" ? "onhand" : p.product_type || "onhand") as "onhand" | "preorder" | "kr_website",
          minStock: 10,
        }));
      } else {
        console.error("Failed to load onhand products:", onhandResponse.reason);
      }

      // Handle preorder response
      let preorder: InventoryItem[] = [];
      if (preorderResponse.status === 'fulfilled') {
        console.log("Preorder products loaded:", preorderResponse.value.data.length);
        preorder = (preorderResponse.value.data || []).map((p) => {
          console.log("Preorder product:", p);
          return {
            ...p,
            product_type: (p.product_type === "preorder" || p.product_type === "preorder_and_onhand" ? "preorder" : p.product_type || "preorder") as "onhand" | "preorder" | "kr_website",
            minStock: 10,
          };
        });
      } else {
        console.error("Failed to load preorder products:", preorderResponse.reason);
        // Fallback: Try to fetch all products and filter for preorder
        try {
          console.log("Attempting fallback: fetching all products...");
          const allProductsResponse = await productService.getProducts({ page: 1, limit: 1000 });
          const preorderFromAll = allProductsResponse.data.filter(
            (p) => p.product_type === "preorder" || p.product_type === "preorder_and_onhand"
          );
          console.log("Found preorder products from all products:", preorderFromAll.length);
          preorder = preorderFromAll.map((p) => ({
            ...p,
            product_type: "preorder" as const,
            minStock: 10,
          }));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }

      console.log("Mapped onhand items:", onhand.length);
      console.log("Mapped preorder items:", preorder.length);

      // Combine both product types
      const allProducts: InventoryItem[] = [...onhand, ...preorder];

      setOnhandItems(onhand);
      setPreorderItems(preorder);
      setItems(allProducts);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.success(`Inventory loaded: ${allProducts.length} items`);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.error("Failed to load inventory. Please try again.");
      }
      // Fallback to empty array on error
      setItems([]);
      setOnhandItems([]);
      setPreorderItems([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const filteredItems = items.filter((item) => {
    const minStock = item.minStock || 10;
    
    // First check product type filter (most specific)
    let matchesFilter = false;
    const pt = item.product_type;
    if (filter === "onhand") {
      // Only show items that are onhand (exclude preorder-only items)
      matchesFilter = pt === "onhand" || pt === "preorder_and_onhand";
    } else if (filter === "preorder") {
      // Only show items that are preorder (exclude onhand-only items)
      matchesFilter = pt === "preorder" || pt === "preorder_and_onhand";
    } else if (filter === "low_stock") {
      matchesFilter = item.stock < minStock && item.stock > 0;
    } else if (filter === "out_of_stock") {
      matchesFilter = item.stock === 0;
    } else {
      // filter === "all"
      matchesFilter = true;
    }
    
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const lowStockCount = items.filter(
    (item) => {
      const minStock = item.minStock || 10;
      return item.stock < minStock && item.stock > 0;
    }
  ).length;
  const outOfStockCount = items.filter((item) => item.stock === 0).length;
  
  // Calculate counts from items array to ensure accuracy
  // Check for exact match or products that include the type
  const onhandCount = items.filter((item) => {
    const pt = item.product_type;
    return pt === "onhand" || pt === "preorder_and_onhand";
  }).length;
  const preorderCount = items.filter((item) => {
    const pt = item.product_type;
    return pt === "preorder" || pt === "preorder_and_onhand";
  }).length;
  const totalCount = items.length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Inventory Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product inventory and stock levels</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={() => {
              loadingRef.current = false;
              loadInventory(true, true);
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 font-semibold transition-all hover:bg-grey-50 hover:shadow-md disabled:opacity-50"
          >
            <svg 
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link
            href="/admin/inventory/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-soft-blue-600 px-4 py-2.5 text-center font-semibold text-white transition-all hover:bg-soft-blue-700 hover:shadow-md sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md ${
            filter === "all" ? "ring-2 ring-soft-blue-600 ring-offset-2" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{totalCount}</p>
            </div>
            <div className="rounded-full bg-soft-blue-100 p-3">
              <svg className="h-6 w-6 text-soft-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter("onhand")}
          className={`rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md ${
            filter === "onhand" ? "ring-2 ring-success ring-offset-2" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Onhand Items</p>
              <p className="mt-2 text-3xl font-bold text-success">{onhandCount}</p>
            </div>
            <div className="rounded-full bg-success/10 p-3">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter("preorder")}
          className={`rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md ${
            filter === "preorder" ? "ring-2 ring-soft-blue-600 ring-offset-2" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preorder Items</p>
              <p className="mt-2 text-3xl font-bold text-soft-blue-600">{preorderCount}</p>
            </div>
            <div className="rounded-full bg-soft-blue-100 p-3">
              <svg className="h-6 w-6 text-soft-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              filter === "all"
                ? "bg-soft-blue-600 text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter("onhand")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              filter === "onhand"
                ? "bg-success text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Onhand ({onhandCount})
          </button>
          <button
            onClick={() => setFilter("preorder")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              filter === "preorder"
                ? "bg-soft-blue-600 text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preorder ({preorderCount})
          </button>
          <div className="mx-2 h-6 w-px bg-border"></div>
          <button
            onClick={() => setFilter("low_stock")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              filter === "low_stock"
                ? "bg-warning text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("out_of_stock")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              filter === "out_of_stock"
                ? "bg-error text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Out of Stock ({outOfStockCount})
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 pl-10 focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-600/20 sm:w-80"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading inventory...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No items found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search or filters"
              : filter !== "all"
              ? "No items match the selected filter"
              : "Get started by adding your first product"}
          </p>
          {!searchTerm && filter === "all" && (
            <Link
              href="/admin/inventory/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full min-w-[800px]">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">Image</th>
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
                const minStock = item.minStock || 10;
                const isLowStock = item.stock < minStock && item.stock > 0;
                const isOutOfStock = item.stock === 0;
                const currency = (item.currency === "KRW" || item.currency === "PHP" ? item.currency : "KRW") as Currency;
                const isPreorder = item.product_type === "preorder";
                const isOnhand = item.product_type === "onhand";
                const productImage = item.images && item.images.length > 0 ? item.images[0] : null;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${
                      isPreorder 
                        ? "bg-soft-blue-50/50 hover:bg-soft-blue-50 border-l-4 border-l-soft-blue-600" 
                        : isOnhand
                        ? "hover:bg-grey-50 border-l-4 border-l-success"
                        : "hover:bg-grey-50"
                    }`}
                  >
                    <td className="px-2 py-3 sm:px-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-grey-100 sm:h-20 sm:w-20">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg
                              className="h-8 w-8 text-muted-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Product Type Badge on Image */}
                        {isPreorder && (
                          <div className="absolute bottom-0 left-0 right-0 bg-soft-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            PREORDER
                          </div>
                        )}
                        {isOnhand && (
                          <div className="absolute bottom-0 left-0 right-0 bg-success px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            ONHAND
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium sm:text-base">{item.name}</span>
                          {/* Product Type Badge */}
                          {isPreorder && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-soft-blue-100 px-2 py-0.5 text-[10px] font-semibold text-soft-blue-700">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Preorder
                            </span>
                          )}
                          {isOnhand && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Onhand
                            </span>
                          )}
                        </div>
                        {item.brand && (
                          <div className="text-xs text-muted-foreground sm:text-sm">{item.brand}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                      {item.sku || "N/A"}
                    </td>
                    <td className="px-2 py-3 text-xs capitalize sm:px-4 sm:text-sm">{item.category || "Uncategorized"}</td>
                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                      {formatCurrency(item.price, currency)}
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
                          {item.stock}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {minStock} min
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
                        <button 
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${item.name}"? This will set the product status to inactive.`)) {
                              setDeletingId(item.id);
                              const deleteToast = toast.loading(`Deleting ${item.name}...`);
                              try {
                                const { productService } = await import("@/services/productService");
                                // Use soft delete: set status to inactive (PUT /api/products/{id})
                                await productService.updateProduct(item.id, { status: "inactive" });
                                toast.dismiss(deleteToast);
                                toast.success(`"${item.name}" has been deleted successfully`);
                                // Force refresh inventory and update counts (without toast since we already showed success)
                                loadingRef.current = false;
                                await loadInventory(false, true);
                              } catch (error: any) {
                                console.error("Failed to delete product:", error);
                                toast.dismiss(deleteToast);
                                const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to delete product";
                                toast.error(errorMessage);
                              } finally {
                                setDeletingId(null);
                              }
                            }
                          }}
                          disabled={deletingId === item.id || loading}
                          className={`text-[10px] sm:text-sm ${
                            deletingId === item.id || loading
                              ? "text-muted-foreground cursor-not-allowed" 
                              : "text-error hover:underline"
                          }`}
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
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

