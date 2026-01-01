"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cartService, productService, orderService, type CartItem } from "@/services/api";

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

export default function StoreOrdersPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cart" | "orders" | "receive">("cart");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/orders");
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCart = async () => {
    if (user?.id) {
      try {
        const cartItemsData = await cartService.getCartItems(user.id);
        
        // Fetch product details for each cart item to get images
        const cartItemsWithImages = await Promise.all(
          cartItemsData.map(async (item) => {
            // If image_url or product.images already exists, use it
            if (item.image_url || (item.product && item.product.images && item.product.images.length > 0)) {
              return item;
            }
            
            // Otherwise, fetch product details to get the image
            try {
              const product = await productService.getProduct(item.product_id);
              if (product && product.images && product.images.length > 0) {
                return {
                  ...item,
                  image_url: product.images[0],
                  product: item.product ? {
                    ...item.product,
                    id: item.product.id || product.id,
                    images: product.images,
                  } : {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    currency: product.currency,
                    images: product.images,
                    stock: product.stock,
                  },
                };
              }
            } catch (error) {
              console.error(`Error fetching product ${item.product_id}:`, error);
            }
            
            return item;
          })
        );
        
        setCartItems(cartItemsWithImages);
      } catch (cartError) {
        console.error("Error loading cart:", cartError);
        setCartItems([]);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch orders from API
      if (user?.id) {
        try {
          console.log('=== FETCHING ORDERS ===');
          console.log('User ID:', user.id);
          console.log('User object:', user);
          
          const ordersData = await orderService.getOrders({ user_id: user.id });
          
          console.log('=== ORDERS API RESPONSE ===');
          console.log('Orders data type:', typeof ordersData);
          console.log('Is array:', Array.isArray(ordersData));
          console.log('Number of orders:', ordersData?.length || 0);
          console.log('Full orders data:', JSON.stringify(ordersData, null, 2));
          
          if (!ordersData || ordersData.length === 0) {
            console.warn('No orders returned from API');
            setOrders([]);
            return;
          }
          
          // Map API response to Order interface
          const mappedOrders: Order[] = ordersData.map((order: any) => {
            console.log('Mapping order:', {
              id: order.id,
              order_number: order.order_number,
              order_items_length: order.order_items?.length,
              items_count: order.items_count,
              total: order.total,
              status: order.status
            });
            
            return {
              id: order.id,
              orderNumber: order.order_number,
              items: order.order_items?.length || order.items_count || 0,
              total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
              currency: order.currency,
              status: order.status,
              paymentStatus: order.payment_status,
              createdAt: new Date(order.created_at),
              boxId: order.box_id,
              phCourierTrackingNumber: order.ph_courier_tracking_number,
            };
          });
          
          console.log('=== MAPPED ORDERS ===');
          console.log('Mapped orders count:', mappedOrders.length);
          console.log('Mapped orders:', JSON.stringify(mappedOrders, null, 2));
          
          setOrders(mappedOrders);
        } catch (orderError: any) {
          console.error("=== ERROR LOADING ORDERS ===");
          console.error("Error:", orderError);
          console.error("Error message:", orderError.message);
          console.error("Error stack:", orderError.stack);
          setOrders([]);
        }
      } else {
        console.warn('No user ID available, cannot fetch orders');
        console.log('User object:', user);
      }

      // Fetch cart items from API
      await loadCart();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    processing: "bg-soft-blue-50 text-soft-blue-700",
    received_at_manila: "bg-success/10 text-success",
    shipped: "bg-info/10 text-info",
    delivered: "bg-success/10 text-success",
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">My Orders</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("cart")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "cart"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cart ({cartItems.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "orders"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
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
                    {item.image_url || (item.product && item.product.images && item.product.images.length > 0) ? (
                      <img
                        src={item.image_url || (item.product?.images?.[0] || '')}
                        alt={item.product_name}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{item.product_name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.product_type === "preorder" ? "Pre-Order" : 
                         item.product_type === "kr_website" ? "KR Website" : "Onhand"}
                      </p>
                      {item.box_type_preference && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Box: {item.box_type_preference}
                        </p>
                      )}
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
                  href={`/store/orders/${order.id}`}
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

          {!loading && orders.filter(o => o.status === "received_at_manila" || o.status === "shipped").length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold">Incoming Items</h3>
              <div className="space-y-4">
                {orders
                  .filter(o => o.status === "received_at_manila" || o.status === "shipped")
                  .map((order) => (
                    <Link
                      key={order.id}
                      href={`/store/orders/${order.id}`}
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

