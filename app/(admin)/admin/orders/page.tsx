"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

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
  paymentType: "full" | "downpayment";
  fulfillmentStatus?: "pending_packing" | "packed" | "in_transit_to_manila" | "received_at_manila" | "consolidated" | "ready_for_delivery" | "out_for_delivery" | "delivered";
  boxId?: string;
  phCourierTrackingNumber?: string;
  createdAt: Date;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Order[] = [
      {
        id: "order-1",
        orderNumber: "ORD-2024-001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        items: 3,
        total: 3285,
        currency: "PHP",
        status: "received_at_manila",
        paymentStatus: "paid",
        paymentType: "full",
        fulfillmentStatus: "received_at_manila",
        createdAt: new Date("2024-12-28"),
      },
      {
        id: "order-2",
        orderNumber: "ORD-2024-002",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        items: 2,
        total: 1500,
        currency: "PHP",
        status: "consolidated",
        paymentStatus: "partial",
        paymentType: "downpayment",
        fulfillmentStatus: "consolidated",
        boxId: "box-2",
        createdAt: new Date("2024-12-27"),
      },
      {
        id: "order-3",
        orderNumber: "ORD-2024-003",
        customerName: "Mike Johnson",
        customerEmail: "mike@example.com",
        items: 1,
        total: 850,
        currency: "PHP",
        status: "shipped",
        paymentStatus: "paid",
        paymentType: "full",
        fulfillmentStatus: "out_for_delivery",
        boxId: "box-2",
        phCourierTrackingNumber: "LBC987654321",
        createdAt: new Date("2024-12-26"),
      },
    ];
    setOrders(mockData);
    setLoading(false);
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

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
            {orders.filter((o) => o.status === "processing").length}
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
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "confirmed"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "processing"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter("shipped")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "shipped"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Shipped
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
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

