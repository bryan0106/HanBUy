"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { productService, type Product } from "@/services/productService";
import toast from "react-hot-toast";

interface InventoryItem extends Product {
  minStock?: number;
}

export default function OnhandInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadInventory(false);
    }
  }, []);

  // Refresh when returning from edit/create page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refreshed') === 'true') {
        loadingRef.current = false;
        hasLoadedRef.current = false;
        setTimeout(() => {
          console.log('🔄 Refreshing onhand inventory after product creation...');
          loadInventory(true, true).then(() => {
            window.history.replaceState({}, '', '/admin/inventory/onhand');
          });
        }, 1000);
      }
    }
  }, []);

  const loadInventory = async (showToast = true, forceRefresh = false) => {
    if (loadingRef.current && !forceRefresh) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    if (forceRefresh) {
      setItems([]);
    }
    
    const loadingToast = showToast ? toast.loading("Loading onhand inventory...") : null;
    try {
      console.log('📦 Loading onhand inventory from API...');
      
      // Fetch onhand products from API
      const response = await productService.getOnhandProducts({
        page: 1,
        limit: 1000, // Get all products
      });

      // Map onhand products
      const onhand: InventoryItem[] = (response.data || []).map((p) => ({
        ...p,
        product_type: (p.product_type === "onhand" || p.product_type === "preorder_and_onhand" ? "onhand" : p.product_type) as "onhand" | "preorder" | "kr_website" | "preorder_and_onhand",
        status: (p.status || (p.stock > 0 ? 'active' : 'out_of_stock')) as 'active' | 'inactive' | 'out_of_stock',
        minStock: p.min_threshold || 10,
      }));

      setItems(onhand);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.success(`Onhand inventory loaded: ${onhand.length} items`);
      }
    } catch (error: any) {
      console.error("Failed to load onhand inventory:", error);
      if (loadingToast) {
        toast.dismiss(loadingToast);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load inventory. Please try again.";
        toast.error(errorMessage);
      }
      setItems([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const lowStockCount = items.filter(
    (item) => {
      const minStock = item.minStock || 10;
      return item.stock < minStock && item.stock > 0;
    }
  ).length;
  const outOfStockCount = items.filter((item) => item.stock === 0).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Onhand Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your onhand product inventory and stock levels</p>
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
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Onhand Items</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{items.length}</p>
            </div>
            <div className="rounded-full bg-success/10 p-3">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="mt-2 text-3xl font-bold text-warning">{lowStockCount}</p>
            </div>
            <div className="rounded-full bg-warning/10 p-3">
              <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="mt-2 text-3xl font-bold text-error">{outOfStockCount}</p>
            </div>
            <div className="rounded-full bg-error/10 p-3">
              <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
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
          <h3 className="mt-4 text-lg font-semibold text-foreground">No onhand items found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first onhand product"}
          </p>
          {!searchTerm && (
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
                const productImage = item.images && item.images.length > 0 ? item.images[0] : null;
                
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-grey-50 border-l-4 border-l-success transition-colors"
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
                        <div className="absolute bottom-0 left-0 right-0 bg-success px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          ONHAND
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium sm:text-base">{item.name}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Onhand
                          </span>
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
                                console.log('🗑️ Deleting product via API:', item.id);
                                await productService.deleteProduct(item.id);
                                toast.dismiss(deleteToast);
                                toast.success(`"${item.name}" has been deleted successfully`);
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
