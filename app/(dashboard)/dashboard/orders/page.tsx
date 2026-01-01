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

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  productType: "onhand" | "preorder";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cart" | "orders" | "receive">("cart");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockOrders: Order[] = [
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
    
    const mockCart: CartItem[] = [
      {
        id: "cart-1",
        productId: "550e8400-e29b-41d4-a716-446655440010",
        productName: "COSRX Advanced Snail 96 Mucin Power Essence",
        quantity: 2,
        price: 25000,
        imageUrl: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
        productType: "onhand",
      },
      {
        id: "cart-2",
        productId: "550e8400-e29b-41d4-a716-446655440011",
        productName: "Beauty of Joseon Relief Sun SPF50+",
        quantity: 1,
        price: 18000,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220",
        productType: "onhand",
      },
    ];
    
    setOrders(mockOrders);
    setCartItems(mockCart);
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
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("cart")}
            className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
              activeTab === "cart"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cart ({cartItems.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
              activeTab === "orders"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
              activeTab === "receive"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            To Receive
          </button>
        </div>
      </div>

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <div>
          {loading ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🛒</div>
              <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
              <p className="mb-6 text-muted-foreground">
                Add items to your cart to see them here
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
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{item.productName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.productType === "preorder" ? "Pre-Order" : "Onhand"}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Qty:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <p className="text-lg font-bold text-soft-blue-600">
                          {formatCurrency(item.price * item.quantity, "PHP")}
                        </p>
                      </div>
                      <button className="mt-2 text-sm text-error hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-soft-blue-600">
                    {formatCurrency(
                      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                      "PHP"
                    )}
                  </span>
                </div>
                <Link
                  href="/store/checkout"
                  className="block w-full rounded-lg bg-soft-blue-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-soft-blue-700"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

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

