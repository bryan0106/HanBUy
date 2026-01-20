"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { orderService, type Order as OrderType } from "@/services/orderService";
import { userService } from "@/services/userService";

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
}

// Cache for customer data to avoid repeated API calls
const customerCache: Record<string, { name: string; email: string }> = {};


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Helper function to get customer info (with caching)
  const getCustomerInfo = async (userId: string): Promise<{ name: string; email: string }> => {
    if (customerCache[userId]) {
      return customerCache[userId];
    }

    try {
      const user = await userService.getUserById(userId);
      const customerInfo = {
        name: user.name || `Customer ${userId.slice(-6)}`,
        email: user.email || `customer${userId.slice(-6)}@example.com`,
      };
      customerCache[userId] = customerInfo;
      return customerInfo;
    } catch (error) {
      console.error(`Error fetching customer ${userId}:`, error);
      return {
        name: `Customer ${userId.slice(-6)}`,
        email: `customer${userId.slice(-6)}@example.com`,
      };
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('📦 Fetching all orders for admin');
      
      // Fetch all orders (admin view - no user_id filter)
      // Note: Backend should handle admin permissions and return all orders
      const ordersResponse = await orderService.getOrders(
        statusFilter !== "all" ? { status: statusFilter } : undefined
      );
      const allOrders = ordersResponse.data;
      
      // Fetch customer info for each order and map to admin Order interface
      const mappedOrdersPromises = allOrders.map(async (order: OrderType) => {
        const customer = await getCustomerInfo(order.user_id);
        
        // Determine fulfillment status from order status
        let fulfillmentStatus: Order["fulfillmentStatus"] = undefined;
        if (order.status === "pending" || order.status === "confirmed") {
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
        
        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName: customer.name,
          customerEmail: customer.email,
          items: order.order_items?.length || 0,
          total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
          currency: order.currency as "PHP" | "KRW",
          status: order.status as Order["status"],
          paymentStatus: order.payment_status as Order["paymentStatus"],
          paymentType: (order.payment_type === "downpayment" ? "downpayment" : 
                       order.payment_type === "item_only" ? "item_only" : 
                       "full") as Order["paymentType"],
          fulfillmentStatus,
          boxId: order.box_id,
          phCourierTrackingNumber: order.ph_courier_tracking_number,
          createdAt: new Date(order.created_at),
        };
      });
      
      const mappedOrders = await Promise.all(mappedOrdersPromises);
      
      // Sort by creation date (newest first)
      mappedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

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
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold text-info">
            {orders.filter((o) => o.status === "processing" || o.status === "confirmed").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unpaid</p>
          <p className="text-2xl font-bold text-error">
            {orders.filter((o) => o.paymentStatus === "pending").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "confirmed"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Confirmed ({orders.filter((o) => o.status === "confirmed").length})
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "processing"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Processing ({orders.filter((o) => o.status === "processing").length})
          </button>
          <button
            onClick={() => setStatusFilter("received_at_manila")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "received_at_manila"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Received ({orders.filter((o) => o.status === "received_at_manila").length})
          </button>
          <button
            onClick={() => setStatusFilter("shipped")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "shipped"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Shipped ({orders.filter((o) => o.status === "shipped").length})
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "delivered"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Delivered ({orders.filter((o) => o.status === "delivered").length})
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
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-soft-blue-600 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
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
                      <button className="text-soft-blue-600 hover:underline text-sm">
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
    </div>
  );
}
