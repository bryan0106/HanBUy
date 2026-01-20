"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  currency: "PHP" | "KRW";
  status: "pending" | "confirmed" | "processing" | "packed" | "in_transit_to_manila" | "received_at_manila" | "consolidated" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid" | "failed";
  paymentType: "full" | "downpayment" | "item_only" | "full_payment";
  fulfillmentStatus?: "pending_packing" | "packed" | "in_transit_to_manila" | "received_at_manila" | "consolidated" | "ready_for_delivery" | "out_for_delivery" | "delivered";
  boxId?: string;
  phCourierTrackingNumber?: string;
  createdAt: Date;
  orderType?: "onhand" | "preorder" | "pasabuy" | "mixed"; // Order type based on items
  orderItems?: Array<{ product_type?: string; product_id?: string }>; // Store order items for filtering
}



export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for filtering
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "onhand" | "preorder" | "pasabuy">("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('📦 Fetching all orders for admin');
      
      // Use admin API endpoint which includes customer info
      const ordersResponse = await orderService.getAdminOrders({
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      
      const adminOrders = ordersResponse.data;
      
      // Map admin API response to admin Order interface
      const mappedOrders: Order[] = adminOrders.map((order: any) => {
        // Determine fulfillment status from order status
        let fulfillmentStatus: Order["fulfillmentStatus"] = undefined;
        if (order.fulfillment_status) {
          fulfillmentStatus = order.fulfillment_status as Order["fulfillmentStatus"];
        } else if (order.status === "pending" || order.status === "confirmed") {
          fulfillmentStatus = "pending_packing";
        } else if (order.status === "processing") {
          fulfillmentStatus = "packed";
        } else if (order.status === "in_transit_to_manila") {
          fulfillmentStatus = "in_transit_to_manila";
        } else if (order.status === "received_at_manila") {
          fulfillmentStatus = "received_at_manila";
        } else if (order.status === "consolidated") {
          fulfillmentStatus = "consolidated";
        } else if (order.status === "shipped") {
          fulfillmentStatus = "out_for_delivery";
        } else if (order.status === "delivered") {
          fulfillmentStatus = "delivered";
        }
        
        // Determine order type based on order items
        const orderItems = order.order_items || [];
        const productTypes = new Set(
          orderItems.map((item: any) => item.product_type || 'onhand')
        );
        
        let orderType: Order["orderType"] = "onhand";
        if (productTypes.has('pasabuy') || orderItems.some((item: any) => item.product_id?.startsWith('pasabuy-'))) {
          orderType = "pasabuy";
        } else if (productTypes.has('preorder')) {
          if (productTypes.has('onhand')) {
            orderType = "mixed";
          } else {
            orderType = "preorder";
          }
        } else if (productTypes.size > 1 && !productTypes.has('preorder')) {
          orderType = "mixed";
        }
        
        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          items: order.item_count || order.order_items?.length || 0,
          total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
          currency: "PHP" as "PHP" | "KRW", // Admin API returns PHP
          status: order.status as Order["status"],
          paymentStatus: order.payment_status as Order["paymentStatus"],
          paymentType: (order.payment_status === "partial" ? "downpayment" : 
                       order.payment_status === "paid_stored" ? "item_only" : 
                       "full") as Order["paymentType"],
          fulfillmentStatus,
          boxId: order.box_id,
          phCourierTrackingNumber: order.ph_courier_tracking_number,
          createdAt: new Date(order.created_at),
          orderType,
          orderItems: orderItems as Order["orderItems"],
        };
      });
      
      // Sort by creation date (newest first)
      mappedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setAllOrders(mappedOrders);
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      toast.error(error.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = allOrders;

    // Filter by order type first
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter((order) => {
        if (orderTypeFilter === "pasabuy") {
          return order.orderType === "pasabuy" || 
                 order.orderItems?.some(item => item.product_id?.startsWith('pasabuy-'));
        }
        return order.orderType === orderTypeFilter;
      });
    }

    // Then filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered;
  }, [allOrders, statusFilter, orderTypeFilter]);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    processing: "bg-soft-blue-50 text-soft-blue-700",
    packed: "bg-info/10 text-info",
    in_transit_to_manila: "bg-soft-blue-50 text-soft-blue-700",
    received_at_manila: "bg-success/10 text-success",
    consolidated: "bg-info/10 text-info",
    shipped: "bg-info/10 text-info",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

  const paymentColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    partial: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        <Link
          href="/admin/orders/new"
          className="rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700"
        >
          + Create Order
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{allOrders.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Onhand</p>
          <p className="text-2xl font-bold text-blue-600">
            {allOrders.filter((o) => o.orderType === "onhand").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Preorder</p>
          <p className="text-2xl font-bold text-purple-600">
            {allOrders.filter((o) => o.orderType === "preorder").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pasabuy</p>
          <p className="text-2xl font-bold text-pink-600">
            {allOrders.filter((o) => o.orderType === "pasabuy").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">
            {allOrders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold text-info">
            {allOrders.filter((o) => o.status === "processing" || o.status === "confirmed").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unpaid</p>
          <p className="text-2xl font-bold text-error">
            {allOrders.filter((o) => o.paymentStatus === "pending").length}
          </p>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setOrderTypeFilter("all")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              orderTypeFilter === "all"
                ? "border-soft-blue-600 text-soft-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({allOrders.length})
          </button>
          <button
            onClick={() => setOrderTypeFilter("onhand")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              orderTypeFilter === "onhand"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            📦 Onhand ({allOrders.filter((o) => o.orderType === "onhand").length})
          </button>
          <button
            onClick={() => setOrderTypeFilter("preorder")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              orderTypeFilter === "preorder"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            ⏰ Preorder ({allOrders.filter((o) => o.orderType === "preorder").length})
          </button>
          <button
            onClick={() => setOrderTypeFilter("pasabuy")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              orderTypeFilter === "pasabuy"
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            🛍️ Pasabuy ({allOrders.filter((o) => o.orderType === "pasabuy").length})
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Filter by Status:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All Status ({filteredOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending ({allOrders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "confirmed"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Confirmed ({allOrders.filter((o) => o.status === "confirmed").length})
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "processing"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Processing ({allOrders.filter((o) => o.status === "processing").length})
          </button>
          <button
            onClick={() => setStatusFilter("received_at_manila")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "received_at_manila"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Received ({allOrders.filter((o) => o.status === "received_at_manila").length})
          </button>
          <button
            onClick={() => setStatusFilter("shipped")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "shipped"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Shipped ({allOrders.filter((o) => o.status === "shipped").length})
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "delivered"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Delivered ({allOrders.filter((o) => o.status === "delivered").length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {statusFilter !== "all"
              ? "No orders match the selected filter"
              : "Orders will appear here when customers place them"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Payment</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Fulfillment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-grey-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-soft-blue-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.orderType && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.orderType === "pasabuy"
                              ? "bg-pink-100 text-pink-700"
                              : order.orderType === "preorder"
                              ? "bg-purple-100 text-purple-700"
                              : order.orderType === "mixed"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.orderType === "pasabuy" ? "🛍️ Pasabuy" :
                           order.orderType === "preorder" ? "⏰ Preorder" :
                           order.orderType === "mixed" ? "🔀 Mixed" :
                           "📦 Onhand"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3">{order.items} items</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(order.total, order.currency)}
                    {order.paymentType === "downpayment" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (DP)
                      </span>
                    )}
                    {order.paymentType === "item_only" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Items Only)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        paymentColors[order.paymentStatus] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </span>
                    {order.paymentType === "downpayment" && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {order.paymentType}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[order.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {order.status.replace(/_/g, " ").charAt(0).toUpperCase() + 
                        order.status.replace(/_/g, " ").slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {order.fulfillmentStatus ? (
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          order.fulfillmentStatus === "delivered"
                            ? "bg-success/10 text-success"
                            : order.fulfillmentStatus.includes("manila") || order.fulfillmentStatus === "consolidated"
                            ? "bg-info/10 text-info"
                            : "bg-soft-blue-50 text-soft-blue-700"
                        }`}
                      >
                        {order.fulfillmentStatus.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                    {order.phCourierTrackingNumber && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {order.phCourierTrackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-soft-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setShowStatusModal(true);
                        }}
                        className="text-soft-blue-600 hover:underline text-sm"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Update Order Status</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Order</p>
                <p className="font-semibold">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="in_transit_to_manila">In Transit to Manila</option>
                  <option value="received_at_manila">Received at Manila</option>
                  <option value="consolidated">Consolidated</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Add notes about this status change..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!selectedOrder || !newStatus) return;
                    setUpdating(true);
                    try {
                      await orderService.updateAdminOrderStatus(selectedOrder.id, {
                        status: newStatus,
                        admin_notes: adminNotes || undefined,
                      });
                      toast.success("Order status updated successfully");
                      setShowStatusModal(false);
                      setSelectedOrder(null);
                      setAdminNotes("");
                      await loadOrders();
                    } catch (error: any) {
                      console.error("Error updating order status:", error);
                      toast.error(error.message || "Failed to update order status");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating || !newStatus}
                  className="flex-1"
                >
                  {updating ? "Updating..." : "Update Status"}
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setAdminNotes("");
                  }}
                  variant="outline"
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
