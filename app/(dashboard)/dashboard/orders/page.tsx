"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  items: number;
  total: number;
  currency: "PHP" | "KRW";
  status: string;
  paymentStatus: string;
  createdAt: Date;
  boxId?: string;
  phCourierTrackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "receive">("orders");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Order[] = [
      {
        id: "order-1",
        orderNumber: "ORD-2024-001",
        items: 3,
        total: 3285,
        currency: "PHP",
        status: "received_at_manila",
        paymentStatus: "paid",
        createdAt: new Date("2024-12-28"),
        boxId: "box-1",
      },
      {
        id: "order-2",
        orderNumber: "ORD-2024-002",
        items: 2,
        total: 1500,
        currency: "PHP",
        status: "shipped",
        paymentStatus: "paid",
        createdAt: new Date("2024-12-27"),
        boxId: "box-2",
        phCourierTrackingNumber: "LBC987654321",
      },
    ];
    setOrders(mockData);
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    processing: "bg-soft-blue-50 text-soft-blue-700",
    received_at_manila: "bg-success/10 text-success",
    shipped: "bg-info/10 text-info",
    delivered: "bg-success/10 text-success",
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="mb-4 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">My Orders</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
              activeTab === "orders"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
              activeTab === "receive"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Items to Receive
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🛒</div>
              <h2 className="mb-2 text-xl font-semibold">No orders yet</h2>
              <p className="mb-6 text-muted-foreground">
                Start shopping to see your orders here
              </p>
              <Link
                href="/store/products"
                className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[order.status] || "bg-grey-100 text-grey-700"
                          }`}
                        >
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items} item{order.items > 1 ? "s" : ""} • {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-2 text-lg font-bold">
                        {formatCurrency(order.total, order.currency)}
                      </p>
                      {order.phCourierTrackingNumber && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Tracking: {order.phCourierTrackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items to Receive Tab */}
      {activeTab === "receive" && (
        <div>
          <Link
            href="/dashboard/box"
            className="block rounded-lg border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 text-6xl">📬</div>
            <h2 className="mb-2 text-xl font-semibold">View Items to Receive</h2>
            <p className="mb-4 text-muted-foreground">
              Track your box and items being shipped to you
            </p>
            <div className="inline-block rounded-lg bg-soft-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700">
              View Box Tracking
            </div>
          </Link>

          {/* Recent orders that are being received */}
          {!loading && orders.filter(o => o.status === "received_at_manila" || o.status === "shipped").length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold">Incoming Items</h3>
              <div className="space-y-4">
                {orders
                  .filter(o => o.status === "received_at_manila" || o.status === "shipped")
                  .map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">
                              {order.orderNumber}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                order.status === "shipped"
                                  ? "bg-info/10 text-info"
                                  : "bg-success/10 text-success"
                              }`}
                            >
                              {order.status === "shipped" ? "In Transit" : "Received at Manila"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.items} item{order.items > 1 ? "s" : ""}
                          </p>
                          {order.phCourierTrackingNumber && (
                            <p className="mt-2 text-xs font-medium text-soft-blue-600">
                              Track: {order.phCourierTrackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

