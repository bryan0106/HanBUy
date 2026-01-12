"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface PasabuyRequest {
  id: string;
  request_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  product_url?: string;
  product_name?: string;
  comment?: string;
  estimated_price?: number;
  currency: "KRW" | "PHP";
  status: "pending" | "approved" | "paid" | "bought" | "in_storage" | "rejected";
  images?: string[];
  category?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  paid_at?: string;
  bought_at?: string;
  in_storage_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

// Mock pasabuy requests with different workflow stages
const mockPasabuyRequests: PasabuyRequest[] = [
  {
    id: "pasabuy-1",
    request_number: "PSB-2024-001",
    customer_id: "user-test-customer-1",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    product_url: "https://www.ktown4u.com/product/12345",
    product_name: "Limited Edition K-Pop Merch",
    comment: "Looking for this limited edition item, please help me find it!",
    estimated_price: 50000,
    currency: "KRW",
    status: "pending",
    category: "k-pop",
    sku: "PSB-001",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pasabuy-2",
    request_number: "PSB-2024-002",
    customer_id: "user-test-customer-2",
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    product_url: "https://www.oliveyoung.com/product/67890",
    product_name: "Rare K-Beauty Set from Olive Young",
    comment: "This set is sold out everywhere, can you help me get it?",
    estimated_price: 75000,
    currency: "KRW",
    status: "approved",
    category: "k-beauty",
    sku: "PSB-002",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    admin_notes: "Found on Olive Young, available for purchase",
  },
  {
    id: "pasabuy-3",
    request_number: "PSB-2024-003",
    customer_id: "user-test-customer-3",
    customer_name: "Mike Johnson",
    customer_email: "mike@example.com",
    product_name: "Exclusive K-Drama OST Album",
    comment: "Looking for the exclusive OST album from my favorite drama",
    estimated_price: 30000,
    currency: "KRW",
    status: "paid",
    category: "k-pop",
    sku: "PSB-003",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    admin_notes: "Customer paid, need to purchase from Yes24",
  },
  {
    id: "pasabuy-4",
    request_number: "PSB-2024-004",
    customer_id: "user-test-customer-1",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    product_url: "https://www.makestar.com/product/15166",
    product_name: "Special Edition Photocard Set",
    estimated_price: 45000,
    currency: "KRW",
    status: "bought",
    category: "k-pop",
    sku: "PSB-004",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    bought_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    admin_notes: "Purchased from Makestar, shipping to storage",
  },
  {
    id: "pasabuy-5",
    request_number: "PSB-2024-005",
    customer_id: "user-test-customer-2",
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    product_name: "Limited Edition Face Mask Set",
    comment: "Looking for this specific face mask set",
    estimated_price: 25000,
    currency: "KRW",
    status: "in_storage",
    category: "k-beauty",
    sku: "PSB-005",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    bought_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    in_storage_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    admin_notes: "Item received at storage, customer notified",
  },
  {
    id: "pasabuy-6",
    request_number: "PSB-2024-006",
    customer_id: "user-test-customer-3",
    customer_name: "Mike Johnson",
    customer_email: "mike@example.com",
    product_url: "https://www.example.com/product/99999",
    product_name: "Discontinued Product",
    comment: "Looking for this discontinued item",
    estimated_price: 60000,
    currency: "KRW",
    status: "rejected",
    category: "k-pop",
    sku: "PSB-006",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    rejected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: "Product is discontinued and no longer available in Korea",
    admin_notes: "Searched multiple websites, product no longer available",
  },
];

export default function PasabuyInventoryPage() {
  const [requests, setRequests] = useState<PasabuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadRequests(false);
    }
  }, []);

  const loadRequests = async (showToast = true, forceRefresh = false) => {
    if (loadingRef.current && !forceRefresh) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    if (forceRefresh) {
      setRequests([]);
    }
    
    const loadingToast = showToast ? toast.loading("Loading pasabuy requests...") : null;
    try {
      // Use mock data directly - no API calls
      console.log('📦 Using mock data for pasabuy requests');
      
      setRequests(mockPasabuyRequests);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.success(`Pasabuy requests loaded: ${mockPasabuyRequests.length} items`);
      }
    } catch (error) {
      console.error("Failed to load pasabuy requests:", error);
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.error("Failed to load requests. Please try again.");
      }
      setRequests([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: PasabuyRequest["status"], notes?: string) => {
    setProcessingId(requestId);
    const actionToast = toast.loading(`Updating request status...`);
    
    try {
      // Update local state (in real app, this would be an API call)
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const updated: PasabuyRequest = {
            ...req,
            status: newStatus,
            updated_at: new Date().toISOString(),
            admin_notes: notes || req.admin_notes,
          };
          
          // Set timestamps based on status
          if (newStatus === "approved" && !req.approved_at) {
            updated.approved_at = new Date().toISOString();
          } else if (newStatus === "paid" && !req.paid_at) {
            updated.paid_at = new Date().toISOString();
          } else if (newStatus === "bought" && !req.bought_at) {
            updated.bought_at = new Date().toISOString();
          } else if (newStatus === "in_storage" && !req.in_storage_at) {
            updated.in_storage_at = new Date().toISOString();
          } else if (newStatus === "rejected" && !req.rejected_at) {
            updated.rejected_at = new Date().toISOString();
          }
          
          return updated;
        }
        return req;
      }));
      
      toast.dismiss(actionToast);
      
      // Show appropriate success message
      const statusMessages: Record<string, string> = {
        approved: "Request approved! Customer will be notified to proceed with payment.",
        paid: "Payment confirmed! You can now proceed to purchase the item.",
        bought: "Item marked as bought! It will be shipped to storage.",
        in_storage: "Item marked as in storage! Customer will be notified.",
        rejected: "Request rejected. Customer will be notified.",
      };
      
      toast.success(statusMessages[newStatus] || "Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.dismiss(actionToast);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesSearch =
      req.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.sku && req.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    paid: requests.filter(r => r.status === "paid").length,
    bought: requests.filter(r => r.status === "bought").length,
    in_storage: requests.filter(r => r.status === "in_storage").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const getStatusColor = (status: PasabuyRequest["status"]) => {
    const colors: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      approved: "bg-info/10 text-info",
      paid: "bg-success/10 text-success",
      bought: "bg-soft-blue-50 text-soft-blue-700",
      in_storage: "bg-success/10 text-success",
      rejected: "bg-error/10 text-error",
    };
    return colors[status] || "bg-grey-100 text-grey-700";
  };

  const getStatusIcon = (status: PasabuyRequest["status"]) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      approved: "✅",
      paid: "💳",
      bought: "🛒",
      in_storage: "📦",
      rejected: "❌",
    };
    return icons[status] || "•";
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Pasabuy Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer pasabuy requests and track the complete workflow</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={() => {
              loadingRef.current = false;
              loadRequests(true, true);
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
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold text-warning">{statusCounts.pending}</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved</p>
              <p className="mt-1 text-2xl font-bold text-info">{statusCounts.approved}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Paid</p>
              <p className="mt-1 text-2xl font-bold text-success">{statusCounts.paid}</p>
            </div>
            <div className="text-2xl">💳</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bought</p>
              <p className="mt-1 text-2xl font-bold text-soft-blue-600">{statusCounts.bought}</p>
            </div>
            <div className="text-2xl">🛒</div>
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
              <p className="text-xs font-medium text-muted-foreground">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-error">{statusCounts.rejected}</p>
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
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "pending"
                ? "bg-warning text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ⏳ Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "approved"
                ? "bg-info text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ✅ Approved ({statusCounts.approved})
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "paid"
                ? "bg-success text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            💳 Paid ({statusCounts.paid})
          </button>
          <button
            onClick={() => setStatusFilter("bought")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "bought"
                ? "bg-soft-blue-600 text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            🛒 Bought ({statusCounts.bought})
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
            onClick={() => setStatusFilter("rejected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              statusFilter === "rejected"
                ? "bg-error text-white shadow-md"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            ❌ Rejected ({statusCounts.rejected})
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by request number, product name, customer name, or email..."
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

      {/* Requests Table */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No pasabuy requests found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Pasabuy requests will appear here when customers submit them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const currency = request.currency as Currency;
            const isProcessing = processingId === request.id;
            
            return (
              <div
                key={request.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Left: Request Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{request.request_number}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                            <span>{getStatusIcon(request.status)}</span>
                            {request.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {request.product_name || "Custom Pasabuy Request"}
                        </p>
                      </div>
                      {request.estimated_price && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Estimated Price</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(request.estimated_price, currency)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="rounded-lg bg-grey-50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Customer</p>
                      <p className="text-sm font-medium text-foreground">{request.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{request.customer_email}</p>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2">
                      {request.product_url && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[80px]">URL:</span>
                          <a
                            href={request.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-soft-blue-600 hover:underline break-all"
                          >
                            {request.product_url}
                          </a>
                        </div>
                      )}
                      {request.comment && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Comment:</span>
                          <p className="text-xs text-foreground flex-1">{request.comment}</p>
                        </div>
                      )}
                      {request.admin_notes && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Admin Notes:</span>
                          <p className="text-xs text-foreground flex-1 italic">{request.admin_notes}</p>
                        </div>
                      )}
                      {request.rejection_reason && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-error min-w-[80px]">Rejection Reason:</span>
                          <p className="text-xs text-error flex-1">{request.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(new Date(request.created_at))}
                      </div>
                      {request.approved_at && (
                        <div>
                          <span className="font-medium">Approved:</span> {formatDate(new Date(request.approved_at))}
                        </div>
                      )}
                      {request.paid_at && (
                        <div>
                          <span className="font-medium">Paid:</span> {formatDate(new Date(request.paid_at))}
                        </div>
                      )}
                      {request.bought_at && (
                        <div>
                          <span className="font-medium">Bought:</span> {formatDate(new Date(request.bought_at))}
                        </div>
                      )}
                      {request.in_storage_at && (
                        <div>
                          <span className="font-medium">In Storage:</span> {formatDate(new Date(request.in_storage_at))}
                        </div>
                      )}
                      {request.rejected_at && (
                        <div>
                          <span className="font-medium">Rejected:</span> {formatDate(new Date(request.rejected_at))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:w-48 lg:border-l lg:border-border lg:pl-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Actions</p>
                    
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            const notes = prompt("Add admin notes (optional):");
                            handleStatusChange(request.id, "approved", notes || undefined);
                          }}
                          disabled={isProcessing}
                          className="w-full rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:opacity-50"
                        >
                          ✅ Approve & Notify Customer
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason) {
                              handleStatusChange(request.id, "rejected");
                              // In real app, update rejection_reason
                              setRequests(prev => prev.map(r => 
                                r.id === request.id ? { ...r, rejection_reason: reason } : r
                              ));
                            }
                          }}
                          disabled={isProcessing}
                          className="w-full rounded-lg bg-error px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    
                    {request.status === "approved" && (
                      <button
                        onClick={() => handleStatusChange(request.id, "paid")}
                        disabled={isProcessing}
                        className="w-full rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:opacity-50"
                      >
                        💳 Mark as Paid
                      </button>
                    )}
                    
                    {request.status === "paid" && (
                      <button
                        onClick={() => {
                          const notes = prompt("Add purchase notes (optional):");
                          handleStatusChange(request.id, "bought", notes || undefined);
                        }}
                        disabled={isProcessing}
                        className="w-full rounded-lg bg-soft-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50"
                      >
                        🛒 Mark as Bought
                      </button>
                    )}
                    
                    {request.status === "bought" && (
                      <button
                        onClick={() => {
                          handleStatusChange(request.id, "in_storage");
                          toast.success("Customer will be notified that their item is in storage!");
                        }}
                        disabled={isProcessing}
                        className="w-full rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:opacity-50"
                      >
                        📦 Mark as In Storage
                      </button>
                    )}
                    
                    {request.status === "in_storage" && (
                      <div className="rounded-lg bg-success/10 p-2 text-center">
                        <p className="text-xs font-medium text-success">✅ Complete</p>
                        <p className="text-xs text-muted-foreground">Item ready for customer</p>
                      </div>
                    )}
                    
                    {request.status === "rejected" && (
                      <div className="rounded-lg bg-error/10 p-2 text-center">
                        <p className="text-xs font-medium text-error">❌ Rejected</p>
                        <p className="text-xs text-muted-foreground">Customer notified</p>
                      </div>
                    )}

                    {/* Workflow Progress */}
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Workflow</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={request.status !== "pending" ? "text-success" : "text-muted-foreground"}>1. Pending</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={["approved", "paid", "bought", "in_storage"].includes(request.status) ? "text-success" : request.status === "rejected" ? "text-error" : "text-muted-foreground"}>2. Approved</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={["paid", "bought", "in_storage"].includes(request.status) ? "text-success" : "text-muted-foreground"}>3. Paid</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={["bought", "in_storage"].includes(request.status) ? "text-success" : "text-muted-foreground"}>4. Bought</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={request.status === "in_storage" ? "text-success" : "text-muted-foreground"}>5. Storage</span>
                      </div>
                    </div>
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
