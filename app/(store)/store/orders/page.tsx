"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { orderService, type Order as OrderType } from "@/services/orderService";
import { productService } from "@/services/productService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  orderItems?: Array<{
    id: string;
    product_id: string;
    product_name: string;
    product_type?: 'onhand' | 'preorder' | 'pasabuy';
    quantity: number;
    unit_price: number;
    total: number;
    image_url?: string;
  }>;
}

function StoreOrdersContent() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "receive" | "rate" | "payments" | "pasabuy">(
    (searchParams.get("tab") as "orders" | "receive" | "rate" | "payments" | "pasabuy") || "orders"
  );
  const [orderDetails, setOrderDetails] = useState<Record<string, any>>({});
  const [loadingOrderDetails, setLoadingOrderDetails] = useState<Record<string, boolean>>({});
  const [pasabuyRequests, setPasabuyRequests] = useState<any[]>([]);
  const [loadingPasabuy, setLoadingPasabuy] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageLimit] = useState(10); // Default limit per page
  
  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Update active tab and page when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["orders", "receive", "rate", "payments", "pasabuy"].includes(tab)) {
      setActiveTab(tab as "orders" | "receive" | "rate" | "payments" | "pasabuy");
    }
    
    // Read page from URL query params
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 1) {
        setCurrentPage(page);
      }
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/orders");
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, user, currentPage]);


  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        console.log('📦 Fetching orders for user:', user.id, 'page:', currentPage, 'limit:', pageLimit);
        
        const ordersResponse = await orderService.getOrders({ 
          user_id: user.id,
          page: currentPage,
          limit: pageLimit
        });
        const ordersData = ordersResponse.data;
        
        // Update pagination metadata
        if (ordersResponse.pagination) {
          setTotalPages(ordersResponse.pagination.totalPages || 1);
          setTotalOrders(ordersResponse.pagination.total || 0);
          setCurrentPage(ordersResponse.pagination.page || currentPage);
        }
        
        // Map API response to Order interface
        const mappedOrders: Order[] = ordersData.map((order: OrderType) => {
          // Debug: Log order items to see what fields are available
          if (order.order_items && order.order_items.length > 0) {
            console.log('📦 Order items from API:', order.order_items.map((item: any) => ({
              product_name: item.product_name,
              product_type: item.product_type,
              product: item.product,
            })));
          }
          
          return {
            id: order.id,
            orderNumber: order.order_number,
            items: order.order_items?.length || 0,
            total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
            currency: order.currency as "PHP" | "KRW",
            status: order.status,
            paymentStatus: order.payment_status,
            createdAt: new Date(order.created_at),
            boxId: order.box_id,
            phCourierTrackingNumber: order.ph_courier_tracking_number,
            orderItems: order.order_items?.map((item: any) => {
              // Determine product type using multiple strategies:
              // 1. Check if order has preorder_status (order-level preorder indicator)
              // 2. Check if item has preorder_release_date (item-level preorder indicator)
              // 3. Check product_type field from API response (including 'kr_website' as preorder)
              // 4. Check nested product object for product_type
              
              let productType: 'onhand' | 'preorder' | 'pasabuy' = 'onhand';
              
              // Strategy 1: Order has preorder_status → all items are preorder
              if (order.preorder_status) {
                productType = 'preorder';
              }
              // Strategy 2: Item has preorder_release_date → it's a preorder item
              else if (item.preorder_release_date || item.preorderReleaseDate || item.preorder_releaseDate) {
                productType = 'preorder';
              }
              // Strategy 3: Check explicit product_type field
              else {
                const rawProductType = item.product_type 
                  || item.productType 
                  || item.product?.product_type 
                  || item.product?.productType 
                  || item.product?.type;
                
                if (rawProductType) {
                  const normalizedType = String(rawProductType).toLowerCase().trim();
                  
                  // 'kr_website' items are preorders (need to be purchased from Korean websites)
                  if (normalizedType === 'preorder' || normalizedType === 'pre-order' || normalizedType === 'kr_website' || normalizedType === 'kr-website') {
                    productType = 'preorder';
                  } else if (normalizedType === 'pasabuy' || normalizedType === 'pasabuy-request' || normalizedType === 'pasabuy_request') {
                    productType = 'pasabuy';
                  } else if (normalizedType === 'onhand' || normalizedType === 'on_hand') {
                    productType = 'onhand';
                  } else {
                    // If product type is unknown but not explicitly 'onhand', check if it's a preorder
                    // by looking for preorder indicators
                    if (item.preorder_release_date || item.preorderReleaseDate || item.preorder_releaseDate) {
                      productType = 'preorder';
                    }
                  }
                } else {
                  // No product_type field, check if it has preorder_release_date
                  if (item.preorder_release_date || item.preorderReleaseDate || item.preorder_releaseDate) {
                    productType = 'preorder';
                  }
                }
              }
              
              console.log('🏷️ Product type mapping:', {
                product_name: item.product_name,
                order_preorder_status: order.preorder_status,
                item_preorder_release_date: item.preorder_release_date || item.preorderReleaseDate || item.preorder_releaseDate,
                item_product_type: item.product_type || item.productType || item.product?.product_type,
                full_item: item,
                mapped: productType,
              });
              
              return {
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_type: productType,
                quantity: item.quantity,
                unit_price: item.unit_price || item.price || 0,
                total: item.total || (item.unit_price || item.price || 0) * item.quantity,
                image_url: item.image_url,
              };
            }),
          };
        });
        
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    if (orderDetails[orderId]) return; // Already loaded
    
    setLoadingOrderDetails(prev => ({ ...prev, [orderId]: true }));
    try {
      const orderDetail = await orderService.getOrderById(orderId);
      setOrderDetails(prev => ({ ...prev, [orderId]: orderDetail }));
    } catch (error) {
      console.error(`Error loading order ${orderId}:`, error);
    } finally {
      setLoadingOrderDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleOpenCancelModal = (order: Order, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOrderToCancel(order);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      const result = await orderService.cancelOrder(orderToCancel.id, cancelReason.trim());
      if (result.refund_processed) {
        toast.success('Order cancelled and refund processed successfully');
      } else {
        toast.success('Order cancelled successfully');
      }
      handleCloseCancelModal();
      // Reload orders
      loadData();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenContactModal = (order: Order, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(order);
    setMessage("");
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedOrder(null);
    setMessage("");
  };

  const handleSendMessage = async () => {
    if (!selectedOrder || !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await orderService.sendMessage(selectedOrder.id, message.trim());
      toast.success('Message sent successfully! We will get back to you soon.');
      handleCloseContactModal();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Load order details when Rate tab is active
  useEffect(() => {
    if (activeTab === "rate") {
      const deliveredOrders = orders.filter(o => o.status === "delivered");
      deliveredOrders.forEach(order => {
        loadOrderDetails(order.id);
      });
    }
  }, [activeTab, orders]);

  // Load pasabuy requests when Pasabuy tab is active
  const loadPasabuyRequests = async () => {
    if (!user?.id) return;
    
    setLoadingPasabuy(true);
    try {
      const response = await productService.getPasabuyRequests();
      setPasabuyRequests(response.data || []);
    } catch (error) {
      console.error("Error loading pasabuy requests:", error);
      toast.error("Failed to load pasabuy requests");
      setPasabuyRequests([]);
    } finally {
      setLoadingPasabuy(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pasabuy" && isAuthenticated && user?.id) {
      loadPasabuyRequests();
    }
  }, [activeTab, isAuthenticated, user?.id]);

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
        <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:gap-2">
          <button
            onClick={() => {
              setActiveTab("orders");
              router.push("/store/orders?tab=orders");
            }}
            className={`shrink-0 px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "orders"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders ({totalOrders > 0 ? totalOrders : orders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("receive");
              router.push("/store/orders?tab=receive");
            }}
            className={`shrink-0 px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "receive"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            To Receive
          </button>
          <button
            onClick={() => {
              setActiveTab("rate");
              router.push("/store/orders?tab=rate");
            }}
            className={`shrink-0 px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "rate"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rate
          </button>
          <button
            onClick={() => {
              setActiveTab("payments");
              router.push("/store/orders?tab=payments");
            }}
            className={`shrink-0 px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "payments"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => {
              setActiveTab("pasabuy");
              router.push("/store/orders?tab=pasabuy");
            }}
            className={`shrink-0 px-2 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "pasabuy"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pasabuy ({pasabuyRequests.length})
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
            <>
              <div className="space-y-4">
                {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  {/* Accordion Header - Order Info */}
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedOrders);
                      if (newExpanded.has(order.id)) {
                        newExpanded.delete(order.id);
                      } else {
                        newExpanded.add(order.id);
                      }
                      setExpandedOrders(newExpanded);
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-foreground">
                              {order.orderNumber}
                            </span>
                            <span className="text-muted-foreground">
                              {expandedOrders.has(order.id) ? '▼' : '▶'}
                            </span>
                          </div>
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
                        {order.phCourierTrackingNumber && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Tracking: {order.phCourierTrackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Accordion Content - Item List and Actions */}
                  {expandedOrders.has(order.id) && (
                    <div className="border-t border-border p-4">
                      {/* Item List */}
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Order Items:</h4>
                        {order.orderItems && order.orderItems.length > 0 ? (
                          <div className="space-y-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 rounded border border-border bg-background p-2">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                                  {item.image_url ? (
                                    <Image
                                      src={item.image_url}
                                      alt={item.product_name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                      <span className="text-xs">No Image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × {formatCurrency(item.unit_price, order.currency)}
                                  </p>
                                  {(item.product_type === 'preorder' || item.product_type === 'pasabuy') && (
                                    <span
                                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                        item.product_type === 'preorder'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                      }`}
                                    >
                                      {item.product_type === 'preorder' ? 'Preorder' : 'Pasabuy'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No items available</p>
                        )}
                      </div>
                      
                      {/* Total Price */}
                      <div className="mt-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">Total:</span>
                          <span className="text-lg font-bold text-foreground">
                            {formatCurrency(order.total, order.currency)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={(e) => handleOpenCancelModal(order, e)}
                          variant="outline"
                          size="sm"
                          disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          className="flex-1"
                        >
                          Cancel Order
                        </Button>
                        <Button
                          onClick={(e) => handleOpenContactModal(order, e)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Contact
                        </Button>
                        <Link href={`/store/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {orders.length > 0 ? ((currentPage - 1) * pageLimit + 1) : 0} to {Math.min(currentPage * pageLimit, totalOrders)} of {totalOrders} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const newPage = currentPage - 1;
                        if (newPage >= 1) {
                          setCurrentPage(newPage);
                          router.push(`/store/orders?tab=orders&page=${newPage}`);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              router.push(`/store/orders?tab=orders&page=${pageNum}`);
                            }}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            disabled={loading}
                            className={currentPage === pageNum ? "bg-soft-blue-600 text-white hover:bg-soft-blue-700" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      onClick={() => {
                        const newPage = currentPage + 1;
                        if (newPage <= totalPages) {
                          setCurrentPage(newPage);
                          router.push(`/store/orders?tab=orders&page=${newPage}`);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Items to Receive Tab */}
      {activeTab === "receive" && (
        <div>
          <Link
            href="/store/box-tracking"
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

      {/* Rate Tab */}
      {activeTab === "rate" && (
        <div>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : (
            <>
              {orders.filter(o => o.status === "delivered").length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 sm:p-12 text-center">
                  <div className="mb-4 text-6xl">⭐</div>
                  <h2 className="mb-2 text-xl font-semibold">No orders to rate yet</h2>
                  <p className="mb-6 text-muted-foreground">
                    Rate products from your delivered orders
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-sm text-muted-foreground px-1">
                    Rate products from your delivered orders to help other customers
                  </p>
                  {orders
                    .filter(o => o.status === "delivered")
                    .map((order) => {
                      const orderDetail = orderDetails[order.id];
                      const isLoading = loadingOrderDetails[order.id];
                      const orderItems = orderDetail?.order_items || [];

                      return (
                        <div
                          key={order.id}
                          className="rounded-lg border border-border bg-card p-4 sm:p-6"
                        >
                          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground text-base sm:text-lg">
                                {order.orderNumber}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Delivered on {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <span className="self-start rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success sm:px-3">
                              Delivered
                            </span>
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            <p className="text-sm font-medium text-grey-700">
                              Rate your products:
                            </p>
                            {isLoading ? (
                              <div className="py-4 text-center">
                                <p className="text-sm text-muted-foreground">Loading products...</p>
                              </div>
                            ) : orderItems.length === 0 ? (
                              <div className="py-4 text-center">
                                <p className="text-sm text-muted-foreground">No products found in this order</p>
                              </div>
                            ) : (
                              orderItems.map((item: any) => {
                                const productId = item.product_id || item.product?.id;
                                const productName = item.product_name || item.product?.name || "Product";
                                const imageUrl = item.image_url || item.product?.images?.[0] || item.product?.image_url;
                                
                                return (
                                  <div
                                    key={item.id || item.order_item_id}
                                    className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-start sm:gap-4 sm:p-4"
                                  >
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                      {imageUrl ? (
                                        <img
                                          src={imageUrl}
                                          alt={productName}
                                          className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                          }}
                                        />
                                      ) : (
                                        <div className="h-20 w-20 rounded-lg bg-grey-200 sm:h-24 sm:w-24"></div>
                                      )}
                                    </div>
                                    
                                    {/* Product Info and Rating */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="mb-1 font-medium text-grey-900 text-sm sm:text-base">
                                        {productName}
                                      </h4>
                                      {item.quantity && (
                                        <p className="mb-2 text-xs text-grey-600 sm:text-sm">
                                          Quantity: {item.quantity}
                                        </p>
                                      )}
                                      <p className="mb-3 text-xs text-grey-600 sm:text-sm">
                                        How would you rate this product?
                                      </p>
                                      
                                      {/* Rating Stars and Review Link */}
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                              key={rating}
                                              type="button"
                                              className="focus:outline-none"
                                              onClick={() => {
                                                if (productId) {
                                                  router.push(`/store/products/${productId}?rate=true`);
                                                }
                                              }}
                                            >
                                              <svg
                                                className="h-5 w-5 transition-colors text-grey-300 hover:text-yellow-400 sm:h-6 sm:w-6"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                            </button>
                                          ))}
                                        </div>
                                        {productId && (
                                          <Link
                                            href={`/store/products/${productId}?rate=true`}
                                            className="text-xs font-medium text-soft-blue-600 hover:text-soft-blue-700 hover:underline sm:text-sm"
                                          >
                                            Write Review →
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading payment information...</p>
            </div>
          ) : (
            <>
              {/* Payment Summary Cards */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Total Orders</div>
                  <div className="text-2xl font-bold text-foreground">{orders.length}</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Paid Orders</div>
                  <div className="text-2xl font-bold text-success">
                    {orders.filter((o) => o.paymentStatus === "paid").length}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Pending Payment</div>
                  <div className="text-2xl font-bold text-warning">
                    {orders.filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "partial").length}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm text-muted-foreground">Total Balance</div>
                  <div className="text-2xl font-bold text-error">
                    {formatCurrency(
                      orders.reduce((sum, order) => {
                        const orderDetail = orderDetails[order.id];
                        const balance = orderDetail?.balance || 0;
                        return sum + (balance > 0 ? balance : 0);
                      }, 0),
                      "PHP"
                    )}
                  </div>
                </div>
              </div>

              {/* Orders with Payment Status */}
              {orders.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <div className="mb-4 text-6xl">💳</div>
                  <h2 className="mb-2 text-xl font-semibold">No payment information</h2>
                  <p className="mb-6 text-muted-foreground">
                    Your payment history will appear here once you place an order
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    // Load order details if not loaded
                    if (!orderDetails[order.id] && !loadingOrderDetails[order.id]) {
                      loadOrderDetails(order.id);
                    }
                    const orderDetail = orderDetails[order.id];
                    const isLoading = loadingOrderDetails[order.id];
                    const balance = orderDetail?.balance || 0;
                    const paymentType = orderDetail?.payment_type || orderDetail?.paymentType || "full";
                    const paymentStatus = order.paymentStatus;
                    const hasBalance = balance > 0;

                    return (
                      <div
                        key={order.id}
                        className="rounded-lg border border-border bg-card p-4 sm:p-6"
                      >
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold text-foreground text-base sm:text-lg">
                                {order.orderNumber}
                              </h3>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  paymentStatus === "paid"
                                    ? "bg-success/10 text-success"
                                    : paymentStatus === "partial"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-error/10 text-error"
                                }`}
                              >
                                {paymentStatus === "paid"
                                  ? "Paid"
                                  : paymentStatus === "partial"
                                  ? "Partial"
                                  : "Pending"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.items} item{order.items > 1 ? "s" : ""} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {formatCurrency(order.total, order.currency)}
                            </div>
                            {hasBalance && (
                              <div className="mt-1 text-sm font-semibold text-error">
                                Balance: {formatCurrency(balance, order.currency)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Details */}
                        {isLoading ? (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            Loading payment details...
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Payment Type and Status */}
                            <div className="rounded-lg bg-grey-50 p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-grey-700">Payment Type</span>
                                <span className="text-sm font-semibold capitalize text-grey-900">
                                  {paymentType === "installment"
                                    ? "Installment"
                                    : paymentType === "downpayment"
                                    ? "Downpayment"
                                    : "Full Payment"}
                                </span>
                              </div>
                              {paymentType === "installment" && orderDetail?.installment_plan && (
                                <div className="mt-2 text-xs text-grey-600">
                                  {orderDetail.installment_plan.paid_installments || 0} of{" "}
                                  {orderDetail.installment_plan.total_installments || 0} installments paid
                                </div>
                              )}
                              {paymentType === "downpayment" && (
                                <div className="mt-2 text-xs text-grey-600">
                                  Downpayment: {formatCurrency(orderDetail?.downpayment_amount || 0, "PHP")}
                                </div>
                              )}
                            </div>

                            {/* Payment History */}
                            {orderDetail?.payment_history && orderDetail.payment_history.length > 0 && (
                              <div className="rounded-lg border border-border bg-white p-3">
                                <h4 className="mb-3 text-sm font-semibold text-grey-900">Payment History</h4>
                                <div className="space-y-2">
                                  {orderDetail.payment_history.map((payment: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                                    >
                                      <div>
                                        <div className="text-sm font-medium text-grey-900">
                                          {payment.payment_type === "installment"
                                            ? `Installment #${payment.installment_number}`
                                            : payment.payment_type === "downpayment"
                                            ? "Downpayment"
                                            : payment.payment_type === "balance"
                                            ? "Balance Payment"
                                            : "Full Payment"}
                                        </div>
                                        <div className="text-xs text-grey-600">
                                          {formatDate(new Date(payment.created_at))}
                                          {payment.verified && (
                                            <span className="ml-2 text-success">✓ Verified</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-semibold text-grey-900">
                                          {formatCurrency(payment.amount, payment.currency || "PHP")}
                                        </div>
                                        <div className="text-xs text-grey-600 capitalize">
                                          {payment.payment_method?.bank || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pay Balance Button */}
                            {hasBalance && (
                              <div className="flex gap-3">
                                <Link
                                  href={`/store/payment?orderId=${order.id}&type=balance`}
                                  className="flex-1 rounded-lg bg-soft-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700"
                                >
                                  Pay Balance
                                </Link>
                                <Link
                                  href={`/store/orders/${order.id}`}
                                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50"
                                >
                                  View Details
                                </Link>
                              </div>
                            )}

                            {/* No Balance - View Details */}
                            {!hasBalance && (
                              <Link
                                href={`/store/orders/${order.id}`}
                                className="block rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-grey-50"
                              >
                                View Order Details
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pasabuy Tab */}
      {activeTab === "pasabuy" && (
        <div>
          {loadingPasabuy ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading pasabuy requests...</p>
            </div>
          ) : pasabuyRequests.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <div className="mb-4 text-6xl">🛍️</div>
              <h2 className="mb-2 text-xl font-semibold">No pasabuy requests yet</h2>
              <p className="mb-6 text-muted-foreground">
                Request products that aren't in our store and we'll find them for you!
              </p>
              <Link
                href="/store/products/onhand"
                className="inline-block rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
              >
                Request Pasabuy
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pasabuyRequests.map((request) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-warning/10 text-warning",
                  approved: "bg-info/10 text-info",
                  paid: "bg-success/10 text-success",
                  bought: "bg-soft-blue-50 text-soft-blue-700",
                  in_storage: "bg-success/10 text-success",
                  rejected: "bg-error/10 text-error",
                };

                const statusLabels: Record<string, string> = {
                  pending: "Pending Approval",
                  approved: "Approved",
                  paid: "Paid",
                  bought: "Purchased",
                  in_storage: "In Storage",
                  rejected: "Rejected",
                };

                return (
                  <div
                    key={request.id}
                    className="rounded-lg border border-border bg-card p-4 sm:p-6"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-semibold text-foreground text-base sm:text-lg">
                            {request.request_number || request.id}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              statusColors[request.status] || "bg-grey-100 text-grey-700"
                            }`}
                          >
                            {statusLabels[request.status] || request.status.toUpperCase()}
                          </span>
                        </div>
                        {request.product_name && (
                          <p className="mb-1 font-medium text-foreground">
                            {request.product_name}
                          </p>
                        )}
                        {request.product_url && (
                          <a
                            href={request.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 block text-sm text-soft-blue-600 hover:underline"
                          >
                            View Product URL →
                          </a>
                        )}
                        {request.comment && (
                          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                            {request.comment}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested on {formatDate(new Date(request.created_at))}
                        </p>
                        {request.estimated_price && (
                          <p className="mt-2 text-sm font-semibold">
                            Estimated: {formatCurrency(request.estimated_price, request.currency || "KRW")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status-specific information */}
                    {request.status === "approved" && (
                      <div className="mt-4 rounded-lg bg-info/10 p-3 text-sm text-info">
                        <p className="font-medium">✓ Request Approved</p>
                        {request.admin_notes && (
                          <p className="mt-1 text-xs">{request.admin_notes}</p>
                        )}
                        {request.estimated_price && (
                          <p className="mt-2 font-semibold">
                            Please pay: {formatCurrency(request.estimated_price, request.currency || "KRW")}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === "paid" && (
                      <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">
                        <p className="font-medium">✓ Payment Received</p>
                        <p className="mt-1 text-xs">
                          Paid on {request.paid_at ? formatDate(new Date(request.paid_at)) : "N/A"}
                        </p>
                        <p className="mt-2 text-xs">We're now purchasing the item for you.</p>
                      </div>
                    )}

                    {request.status === "bought" && (
                      <div className="mt-4 rounded-lg bg-soft-blue-50 p-3 text-sm text-soft-blue-700">
                        <p className="font-medium">✓ Item Purchased</p>
                        <p className="mt-1 text-xs">
                          Purchased on {request.bought_at ? formatDate(new Date(request.bought_at)) : "N/A"}
                        </p>
                        <p className="mt-2 text-xs">Item is being shipped to our storage facility.</p>
                      </div>
                    )}

                    {request.status === "in_storage" && (
                      <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">
                        <p className="font-medium">✓ Item in Storage</p>
                        <p className="mt-1 text-xs">
                          Arrived on {request.in_storage_at ? formatDate(new Date(request.in_storage_at)) : "N/A"}
                        </p>
                        <p className="mt-2 text-xs font-semibold">
                          Your item is ready! It has been added to your cart.
                        </p>
                        <Link
                          href="/store/cart"
                          className="mt-3 inline-block rounded-lg bg-success px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-success/90"
                        >
                          View in Cart →
                        </Link>
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
                        <p className="font-medium">✗ Request Rejected</p>
                        {request.rejection_reason && (
                          <p className="mt-1 text-xs">{request.rejection_reason}</p>
                        )}
                        <p className="mt-2 text-xs">
                          Rejected on {request.rejected_at ? formatDate(new Date(request.rejected_at)) : "N/A"}
                        </p>
                      </div>
                    )}

                    {request.admin_notes && request.status !== "approved" && (
                      <div className="mt-3 rounded-lg bg-grey-50 p-3 text-xs text-muted-foreground">
                        <p className="font-medium">Admin Notes:</p>
                        <p className="mt-1">{request.admin_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCloseContactModal}>
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
              <button
                onClick={handleCloseContactModal}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Send a message about order <span className="font-semibold text-foreground">{selectedOrder.orderNumber}</span>
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message or question about this order..."
                rows={6}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-soft-blue-500 focus:outline-none focus:ring-1 focus:ring-soft-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCloseContactModal}
                variant="outline"
                className="flex-1"
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                className="flex-1 bg-soft-blue-600 text-white hover:bg-soft-blue-700"
                disabled={sending || !message.trim()}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCloseCancelModal}>
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Cancel Order</h2>
              <button
                onClick={handleCloseCancelModal}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                disabled={cancelling}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel order <span className="font-semibold text-foreground">{orderToCancel.orderNumber}</span>?
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                If you've already paid, a refund will be processed automatically.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="cancelReason" className="mb-2 block text-sm font-medium text-foreground">
                Reason for Cancellation <span className="text-error">*</span>
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-soft-blue-500 focus:outline-none focus:ring-1 focus:ring-soft-blue-500"
                disabled={cancelling}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCloseCancelModal}
                variant="outline"
                className="flex-1"
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button
                onClick={handleCancelOrder}
                className="flex-1 bg-error text-white hover:bg-error/90"
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreOrdersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <StoreOrdersContent />
    </Suspense>
  );
}

