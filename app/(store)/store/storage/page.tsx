"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/services/orderService";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { Order } from "@/services/orderService";
import Link from "next/link";

export default function StoragePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storedOrders, setStoredOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/storage");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadStoredItems();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadStoredItems = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const orders = await orderService.getStoredItems(user.id);
      // If API returns empty, use mock data for testing
      if (orders.length === 0) {
        setStoredOrders(getMockStoredOrders());
      } else {
        setStoredOrders(orders);
      }
    } catch (error) {
      console.error("Error loading stored items:", error);
      // Use mock data for testing when API fails
      setStoredOrders(getMockStoredOrders());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data for testing the full payment flow
  const getMockStoredOrders = (): Order[] => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: "order-001",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-001",
        subtotal: 2450.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: undefined,
        shared_shipping_fee: undefined,
        total: 2450.00,
        currency: "PHP",
        status: "paid_stored",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: {
          type: "online",
          bank: "GCASH",
        },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Main Street",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        fulfillment_status: "in_storage",
        storage_status: "in_storage",
        shipping_requested_at: undefined,
        shipping_payment_status: "pending",
        cod_amount: undefined,
        wallet_credit: undefined,
        created_at: twoDaysAgo.toISOString(),
        updated_at: twoDaysAgo.toISOString(),
        paid_at: twoDaysAgo.toISOString(),
        shipping_paid_at: undefined,
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-001",
            product_id: "prod-001",
            product_name: "Samsung Galaxy Watch 6 Classic",
            product_type: "onhand",
            quantity: 1,
            unit_price: 2450.00,
            total: 2450.00,
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            preorder_release_date: undefined,
          },
        ],
      },
      {
        id: "order-002",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-002",
        subtotal: 1890.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: undefined,
        shared_shipping_fee: undefined,
        total: 1890.00,
        currency: "PHP",
        status: "paid_stored",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: {
          type: "bank_transfer",
          bank: "BDO",
        },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "shared",
        shipping_address: {
          street: "123 Main Street",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        fulfillment_status: "in_storage",
        storage_status: "in_storage",
        shipping_requested_at: undefined,
        shipping_payment_status: "pending",
        cod_amount: undefined,
        wallet_credit: undefined,
        created_at: fiveDaysAgo.toISOString(),
        updated_at: fiveDaysAgo.toISOString(),
        paid_at: fiveDaysAgo.toISOString(),
        shipping_paid_at: undefined,
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-002",
            product_id: "prod-002",
            product_name: "Apple AirPods Pro 2nd Gen",
            product_type: "onhand",
            quantity: 1,
            unit_price: 1200.00,
            total: 1200.00,
            image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
            preorder_release_date: undefined,
          },
          {
            id: "item-003",
            product_id: "prod-003",
            product_name: "Wireless Charging Pad",
            product_type: "onhand",
            quantity: 2,
            unit_price: 345.00,
            total: 690.00,
            image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
            preorder_release_date: undefined,
          },
        ],
      },
      {
        id: "order-003",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-003",
        subtotal: 3250.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: undefined,
        shared_shipping_fee: undefined,
        total: 3250.00,
        currency: "PHP",
        status: "paid_stored",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: {
          type: "online",
          bank: "MAYA",
        },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Main Street",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        fulfillment_status: "in_storage",
        storage_status: "in_storage",
        shipping_requested_at: undefined,
        shipping_payment_status: "pending",
        cod_amount: undefined,
        wallet_credit: undefined,
        created_at: oneWeekAgo.toISOString(),
        updated_at: oneWeekAgo.toISOString(),
        paid_at: oneWeekAgo.toISOString(),
        shipping_paid_at: undefined,
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-004",
            product_id: "prod-004",
            product_name: "Nintendo Switch OLED Console",
            product_type: "preorder",
            quantity: 1,
            unit_price: 3250.00,
            total: 3250.00,
            image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
            preorder_release_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
    ];
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStoredItems();
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleRequestShipping = () => {
    if (selectedOrders.size === 0) {
      return;
    }
    
    if (selectedOrders.size === 1) {
      // Single order - redirect to request shipping page
      const orderId = Array.from(selectedOrders)[0];
      router.push(`/store/storage/${orderId}/request-shipping`);
    } else {
      // Multiple orders - could redirect to a bulk shipping page or handle individually
      // For now, redirect to the first order's shipping page
      const orderId = Array.from(selectedOrders)[0];
      router.push(`/store/storage/${orderId}/request-shipping`);
    }
  };

  // Calculate totals
  const totalOrders = storedOrders.length;
  const totalItems = storedOrders.reduce((sum, order) => {
    return sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
  }, 0);
  const totalValue = storedOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-soft-blue-600 border-t-transparent"></div>
            <p className="text-muted-foreground">Loading your storage...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-grey-900 sm:text-3xl">My Storage</h1>
            {storedOrders.length > 0 && storedOrders[0]?.id?.startsWith("order-00") && (
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Mock Data
              </span>
            )}
          </div>
          <p className="text-sm text-grey-600 sm:text-base">
            Items you've purchased and paid for are stored in our warehouse. Request shipping when you're ready to receive them.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <svg className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      {storedOrders.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-lg border border-border bg-white p-2 shadow-sm sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="rounded-lg bg-soft-blue-100 p-1 sm:p-2">
                <svg className="h-4 w-4 text-soft-blue-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-grey-600 sm:text-xs">Total Orders</p>
                <p className="text-sm font-bold text-grey-900 sm:text-lg">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-2 shadow-sm sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="rounded-lg bg-green-100 p-1 sm:p-2">
                <svg className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-grey-600 sm:text-xs">Total Items</p>
                <p className="text-sm font-bold text-grey-900 sm:text-lg">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-2 shadow-sm sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="rounded-lg bg-purple-100 p-1 sm:p-2">
                <svg className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-grey-600 sm:text-xs">Total Value</p>
                <p className="text-sm font-bold text-soft-blue-600 sm:text-lg">{formatCurrency(totalValue, "PHP")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {storedOrders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-grey-200">
            <svg className="h-10 w-10 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-grey-900 mb-2">No items in storage</h3>
          <p className="text-grey-600 mb-6 max-w-md mx-auto">
            Items you purchase and pay for will be stored here in our warehouse. You can request shipping when you're ready to receive them.
          </p>
          <Link href="/store/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOrders.size === storedOrders.length && storedOrders.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders(new Set(storedOrders.map(order => order.id)));
                  } else {
                    setSelectedOrders(new Set());
                  }
                }}
                className="h-4 w-4 rounded border-grey-300 text-[#FF85A2] focus:ring-[#FF85A2] focus:ring-2"
              />
              <span className="text-sm font-medium text-foreground">
                Select All ({selectedOrders.size} of {storedOrders.length} selected)
              </span>
            </label>
          </div>

          {storedOrders.map((order) => {
            const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const totalValue = order.subtotal;

            const isExpanded = expandedOrders.has(order.id);

            return (
              <div key={order.id} className="rounded-lg border-2 border-border bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="flex gap-3">
                  {/* Checkbox */}
                  <div className="flex items-start pt-4 pl-4 sm:pt-6 sm:pl-6">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedOrders);
                        if (e.target.checked) {
                          newSelected.add(order.id);
                        } else {
                          newSelected.delete(order.id);
                        }
                        setSelectedOrders(newSelected);
                      }}
                      className="h-4 w-4 rounded border-grey-300 text-[#FF85A2] focus:ring-[#FF85A2] focus:ring-2"
                    />
                  </div>
                  
                  {/* Order Header - Clickable */}
                  <div className="flex-1">
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="w-full border-b border-border bg-grey-50 px-4 py-3 sm:px-6 sm:py-4 text-left transition-colors hover:bg-grey-100"
                    >
                  {/* Top Row: Order Number and Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-medium text-grey-600 sm:text-sm">Order</span>
                      <span className="text-sm font-bold text-grey-900 sm:text-lg truncate">
                        #{order.order_number}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 sm:text-xs shrink-0">
                      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Paid & Stored
                    </span>
                  </div>

                  {/* Bottom Row: Item count, date, total value, and chevron */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-grey-600 sm:text-sm flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="whitespace-nowrap">Stored {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-grey-600 mb-0.5">Total Value</p>
                        <p className="text-lg font-bold text-soft-blue-600 sm:text-xl">
                          {formatCurrency(totalValue, order.currency)}
                        </p>
                      </div>
                      <div className="text-right sm:hidden">
                        <p className="text-[10px] font-medium text-grey-600 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-soft-blue-600">
                          {formatCurrency(totalValue, order.currency)}
                        </p>
                      </div>
                      <svg
                        className={`h-4 w-4 sm:h-5 sm:w-5 text-grey-600 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                    </button>
                  </div>
                </div>

                {/* Order Items - Collapsible */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 ml-11 sm:ml-14">
                  <div className="mb-4 space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="rounded-lg border border-grey-200 bg-white p-4 transition-colors hover:bg-grey-50">
                        {/* First Row: Image and Product Name */}
                        <div className="flex items-center gap-3 mb-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg object-cover border border-grey-200"
                            />
                          ) : (
                            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg bg-grey-200 border border-grey-300 flex items-center justify-center">
                              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-grey-900 text-base sm:text-lg">{item.product_name}</p>
                            {item.preorder_release_date && (
                              <div className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 mb-2">
                                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pre-order • Release: {new Date(item.preorder_release_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Second Row: Quantity, Price, and Item Total */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-grey-600 border-t border-grey-200 pt-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="font-medium">Qty: {item.quantity}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatCurrency(item.unit_price, order.currency)} each</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-grey-600 mb-0.5 sm:mb-1">Item Total</p>
                            <p className="text-lg sm:text-xl font-bold text-grey-900">
                              {formatCurrency(item.total, order.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg bg-soft-blue-50 border border-soft-blue-200 p-4 gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-grey-900 mb-1">Ready to Ship</p>
                      <p className="text-xs text-grey-600">
                        Request shipping to receive your items. Choose between Solo or Shared box shipping.
                      </p>
                    </div>
                    <Link href={`/store/storage/${order.id}/request-shipping`} className="sm:ml-4 w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto whitespace-nowrap">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Request Shipping
                      </Button>
                    </Link>
                  </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bulk Request Shipping Button */}
          {selectedOrders.size > 0 && (
            <div className="fixed bottom-16 left-0 right-0 z-50 md:sticky md:bottom-0 rounded-t-lg bg-[#FF85A2] p-2 sm:p-4 shadow-2xl border-t-2 border-[#FF85A2]/20 md:border-t-0">
              <div className="container mx-auto flex justify-center">
                <button
                  onClick={handleRequestShipping}
                  className="w-full sm:w-auto rounded-lg bg-white px-4 py-2 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-[#FF85A2] transition-all hover:bg-grey-50 hover:shadow-lg whitespace-nowrap"
                >
                  <svg className="inline mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Request Shipping ({selectedOrders.size} {selectedOrders.size === 1 ? 'Order' : 'Orders'})
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

