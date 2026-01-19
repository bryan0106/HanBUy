"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { productService, type Product } from "@/services/productService";
import toast from "react-hot-toast";

interface PreorderProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: "KRW" | "PHP";
  images: string[];
  category?: string;
  brand?: string;
  sku?: string;
  stock: number;
  preorder_stock?: number;
  status: "active" | "inactive" | "out_of_stock";
  product_type: "preorder";
  is_preorder_available: boolean;
  is_onhand_available: boolean;
  order_date?: string;
  order_deadline?: string;
  release_date?: string;
  deposit_percentage?: number;
  preorder_available_stock?: number;
  preorders_claimed?: number;
  shipping_time_days?: number;
  created_at?: string;
  updated_at?: string;
  minStock?: number;
  // Additional fields for admin management
  preorder_status?: "accepting" | "deadline_passed" | "release_approaching" | "released" | "in_storage" | "cancelled";
  total_preorders?: number;
  expected_arrival?: string;
}

// Helper function to calculate preorder status based on dates
const calculatePreorderStatus = (product: Product): PreorderProduct["preorder_status"] => {
  if (product.status === "inactive") {
    return "cancelled";
  }
  
  const now = new Date();
  const orderDeadline = product.order_deadline ? new Date(product.order_deadline) : null;
  const releaseDate = product.release_date ? new Date(product.release_date) : null;
  const expectedDelivery = product.expected_delivery ? new Date(product.expected_delivery) : null;
  
  if (!orderDeadline) {
    return "accepting";
  }
  
  if (orderDeadline < now) {
    // Deadline passed
    if (releaseDate && releaseDate > now) {
      // Release date hasn't arrived yet
      const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilRelease <= 7 ? "release_approaching" : "deadline_passed";
    } else if (releaseDate && releaseDate <= now) {
      // Release date passed
      if (expectedDelivery && expectedDelivery <= now) {
        return "in_storage";
      } else {
        return "released";
      }
    } else {
      return "deadline_passed";
    }
  } else {
    return "accepting";
  }
};

export default function PreorderInventoryPage() {
  const [items, setItems] = useState<PreorderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
          console.log('🔄 Refreshing preorder inventory after product creation...');
          loadInventory(true, true).then(() => {
            window.history.replaceState({}, '', '/admin/inventory/preorder');
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
    
    const loadingToast = showToast ? toast.loading("Loading preorder inventory...") : null;
    try {
      console.log('📦 Loading preorder inventory from API...');
      
      // Fetch preorder products from API
      const response = await productService.getPreorderProducts({
        page: 1,
        limit: 1000, // Get all products
      });

      // Map preorder products and calculate status
      const productsWithStatus: PreorderProduct[] = (response.data || []).map((p) => {
        const preorderStatus = calculatePreorderStatus(p);
        const expectedArrival = p.release_date && p.shipping_time_days
          ? new Date(new Date(p.release_date).getTime() + p.shipping_time_days * 24 * 60 * 60 * 1000).toISOString()
          : undefined;
        
        return {
          ...p,
          product_type: "preorder" as const,
          currency: (p.currency === "KRW" || p.currency === "PHP" ? p.currency : "KRW") as "KRW" | "PHP",
          status: (p.status === 'out_of_stock' ? 'inactive' : (p.status || (p.stock > 0 ? 'active' : 'inactive'))) as 'active' | 'inactive' | 'out_of_stock',
          is_preorder_available: p.is_preorder_available ?? true,
          is_onhand_available: p.is_onhand_available ?? false,
          minStock: p.min_threshold || 10,
          preorder_status: preorderStatus,
          total_preorders: p.preorders_claimed || 0,
          expected_arrival: expectedArrival,
        };
      });
      
      setItems(productsWithStatus);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.success(`Preorder inventory loaded: ${productsWithStatus.length} items`);
      }
    } catch (error: any) {
      console.error("Failed to load preorder inventory:", error);
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
    const matchesStatus = statusFilter === "all" || item.preorder_status === statusFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: items.length,
    accepting: items.filter(i => i.preorder_status === "accepting").length,
    deadline_passed: items.filter(i => i.preorder_status === "deadline_passed").length,
    release_approaching: items.filter(i => i.preorder_status === "release_approaching").length,
    released: items.filter(i => i.preorder_status === "released").length,
    in_storage: items.filter(i => i.preorder_status === "in_storage").length,
    cancelled: items.filter(i => i.preorder_status === "cancelled").length,
  };

  const getStatusColor = (status?: PreorderProduct["preorder_status"]) => {
    const colors: Record<string, string> = {
      accepting: "bg-success/10 text-success",
      deadline_passed: "bg-warning/10 text-warning",
      release_approaching: "bg-info/10 text-info",
      released: "bg-soft-blue-50 text-soft-blue-700",
      in_storage: "bg-success/10 text-success",
      cancelled: "bg-error/10 text-error",
    };
    return colors[status || "accepting"] || "bg-grey-100 text-grey-700";
  };

  const getStatusIcon = (status?: PreorderProduct["preorder_status"]) => {
    const icons: Record<string, string> = {
      accepting: "✅",
      deadline_passed: "⏸️",
      release_approaching: "⏰",
      released: "🚚",
      in_storage: "📦",
      cancelled: "❌",
    };
    return icons[status || "accepting"] || "•";
  };

  const getStatusLabel = (status?: PreorderProduct["preorder_status"]) => {
    const labels: Record<string, string> = {
      accepting: "Accepting Orders",
      deadline_passed: "Deadline Passed",
      release_approaching: "Release Approaching",
      released: "Released (Shipping)",
      in_storage: "In Storage",
      cancelled: "Cancelled",
    };
    return labels[status || "accepting"] || "Unknown";
  };

  const isActive = (item: PreorderProduct) => {
    if (!item.order_deadline) return false;
    return new Date(item.order_deadline) > new Date();
  };

  const getDaysUntilDeadline = (item: PreorderProduct) => {
    if (!item.order_deadline) return null;
    const deadline = new Date(item.order_deadline);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysUntilRelease = (item: PreorderProduct) => {
    if (!item.release_date) return null;
    const release = new Date(item.release_date);
    const now = new Date();
    const diff = Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Preorder Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage preorder products and track the complete workflow</p>
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
            href="/admin/inventory/preorder-import"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-soft-blue-600 px-4 py-2.5 text-center font-semibold text-white transition-all hover:bg-soft-blue-700 hover:shadow-md sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import Preorder
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{statusCounts.all}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Accepting</p>
              <p className="mt-1 text-2xl font-bold text-success">{statusCounts.accepting}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Deadline Passed</p>
              <p className="mt-1 text-2xl font-bold text-warning">{statusCounts.deadline_passed}</p>
            </div>
            <div className="text-2xl">⏸️</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Release Soon</p>
              <p className="mt-1 text-2xl font-bold text-info">{statusCounts.release_approaching}</p>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Released</p>
              <p className="mt-1 text-2xl font-bold text-soft-blue-600">{statusCounts.released}</p>
            </div>
            <div className="text-2xl">🚚</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">In Storage</p>
              <p className="mt-1 text-2xl font-bold text-success">{statusCounts.in_storage}</p>
            </div>
            <div className="text-2xl">📦</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
              <p className="mt-1 text-2xl font-bold text-error">{statusCounts.cancelled}</p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter("accepting")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "accepting"
                ? "bg-success text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ✅ Accepting ({statusCounts.accepting})
          </button>
          <button
            onClick={() => setStatusFilter("deadline_passed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "deadline_passed"
                ? "bg-warning text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ⏸️ Deadline Passed ({statusCounts.deadline_passed})
          </button>
          <button
            onClick={() => setStatusFilter("release_approaching")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "release_approaching"
                ? "bg-info text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ⏰ Release Soon ({statusCounts.release_approaching})
          </button>
          <button
            onClick={() => setStatusFilter("released")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "released"
                ? "bg-soft-blue-600 text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            🚚 Released ({statusCounts.released})
          </button>
          <button
            onClick={() => setStatusFilter("in_storage")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "in_storage"
                ? "bg-success text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            📦 In Storage ({statusCounts.in_storage})
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "cancelled"
                ? "bg-error text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ❌ Cancelled ({statusCounts.cancelled})
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, SKU, or brand..."
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No preorder items found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by importing or adding your first preorder product"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link
              href="/admin/inventory/preorder-import"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Import Preorder Product
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const currency = (item.currency === "KRW" || item.currency === "PHP" ? item.currency : "KRW") as Currency;
            const productImage = item.images && item.images.length > 0 ? item.images[0] : null;
            const daysUntilDeadline = getDaysUntilDeadline(item);
            const daysUntilRelease = getDaysUntilRelease(item);
            const stockPercentage = item.preorder_available_stock && item.preorders_claimed
              ? Math.round((item.preorders_claimed / item.preorder_available_stock) * 100)
              : 0;
            const remainingSlots = item.preorder_available_stock && item.preorders_claimed
              ? item.preorder_available_stock - item.preorders_claimed
              : item.preorder_available_stock || 0;
            
            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Left: Product Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {/* Product Image */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-grey-100 sm:h-24 sm:w-24">
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
                          <div className="absolute bottom-0 left-0 right-0 bg-soft-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            PREORDER
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-foreground sm:text-lg">{item.name}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.preorder_status)}`}>
                              <span>{getStatusIcon(item.preorder_status)}</span>
                              {getStatusLabel(item.preorder_status)}
                            </span>
                          </div>
                          {item.brand && (
                            <p className="text-sm text-muted-foreground mt-1">{item.brand}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(item.price, currency)}
                        </p>
                        {item.deposit_percentage && (
                          <p className="text-xs text-muted-foreground">
                            {item.deposit_percentage}% deposit
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pre-order Period & Dates */}
                    <div className="rounded-lg bg-grey-50 p-3 space-y-2">
                      {item.order_date && item.order_deadline && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Pre-Order Period:</span>
                          <span className="text-foreground">
                            {formatDate(new Date(item.order_date))} - {formatDate(new Date(item.order_deadline))}
                          </span>
                          {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                            <span className="text-warning font-semibold">
                              ({daysUntilDeadline} days left)
                            </span>
                          )}
                          {daysUntilDeadline !== null && daysUntilDeadline <= 0 && (
                            <span className="text-error font-semibold">(Closed)</span>
                          )}
                        </div>
                      )}
                      {item.release_date && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Release Date:</span>
                          <span className="text-foreground">
                            {formatDate(new Date(item.release_date))}
                          </span>
                          {daysUntilRelease !== null && daysUntilRelease > 0 && (
                            <span className="text-info font-semibold">
                              ({daysUntilRelease} days until release)
                            </span>
                          )}
                          {daysUntilRelease !== null && daysUntilRelease <= 0 && (
                            <span className="text-success font-semibold">(Released)</span>
                          )}
                        </div>
                      )}
                      {item.expected_arrival && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Expected Arrival:</span>
                          <span className="text-foreground">
                            {formatDate(new Date(item.expected_arrival))}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pre-order Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg bg-white p-2 border border-border">
                        <p className="text-xs text-muted-foreground">Total Pre-orders</p>
                        <p className="text-lg font-bold text-foreground">{item.total_preorders || item.preorders_claimed || 0}</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-border">
                        <p className="text-xs text-muted-foreground">Available Slots</p>
                        <p className="text-lg font-bold text-foreground">{item.preorder_available_stock || 0}</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-border">
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className={`text-lg font-bold ${remainingSlots <= 10 ? "text-error" : remainingSlots <= 50 ? "text-warning" : "text-success"}`}>
                          {remainingSlots}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-border">
                        <p className="text-xs text-muted-foreground">Filled</p>
                        <p className="text-lg font-bold text-foreground">{stockPercentage}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.preorder_available_stock && item.preorders_claimed !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Pre-order Progress</span>
                          <span className="font-medium text-foreground">
                            {item.preorders_claimed} / {item.preorder_available_stock}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-grey-200">
                          <div
                            className={`h-full transition-all ${
                              stockPercentage >= 90 ? "bg-error" :
                              stockPercentage >= 70 ? "bg-warning" :
                              "bg-success"
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:w-48 lg:border-l lg:border-border lg:pl-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Actions</p>
                    <Link
                      href={`/admin/inventory/${item.id}/edit`}
                      className="w-full rounded-lg bg-soft-blue-600 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-soft-blue-700"
                    >
                      Edit Product
                    </Link>
                    {item.preorder_status === "accepting" && (
                      <div className="rounded-lg bg-success/10 p-2 text-center">
                        <p className="text-xs font-medium text-success">✅ Active</p>
                        <p className="text-xs text-muted-foreground">Accepting orders</p>
                      </div>
                    )}
                    {item.preorder_status === "in_storage" && (
                      <div className="rounded-lg bg-success/10 p-2 text-center">
                        <p className="text-xs font-medium text-success">📦 Complete</p>
                        <p className="text-xs text-muted-foreground">Ready for customers</p>
                      </div>
                    )}
                    {item.preorder_status === "cancelled" && (
                      <div className="rounded-lg bg-error/10 p-2 text-center">
                        <p className="text-xs font-medium text-error">❌ Cancelled</p>
                        <p className="text-xs text-muted-foreground">Pre-order cancelled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
