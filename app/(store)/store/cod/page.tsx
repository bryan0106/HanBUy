"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/services/orderService";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { Order } from "@/services/orderService";
import Link from "next/link";

export default function CODPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [codOrders, setCodOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/cod");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCODOrders();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCODOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch orders with COD pending status
      const orders = await orderService.getOrders({ 
        user_id: user.id,
        payment_status: "paid",
      });
      
      // Filter for orders that need local shipping payment
      // Only SHARED boxes need local shipping (Manila → Customer)
      // SOLO boxes ship directly to customer, so they don't need local shipping payment
      const codPendingOrders = orders.data.filter(
        (order) => 
          order.box_type_preference === "shared" && // Only shared boxes
          (order.shipping_payment_status === "cod_pending" ||
          (order.storage_status === "shipped" && 
           order.shipping_payment_status === "paid" &&
           order.cod_amount && order.cod_amount > 0))
      );
      
      // If no orders from API, use mock data
      if (codPendingOrders.length === 0) {
        setCodOrders(getMockCODOrders());
      } else {
        setCodOrders(codPendingOrders);
      }
    } catch (error) {
      // Log error details properly
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
      console.error("Error loading COD orders:", errorMessage, errorDetails);
      
      // Use mock data for testing when API fails
      try {
        setCodOrders(getMockCODOrders());
      } catch (mockError) {
        console.error("Error loading mock COD orders:", mockError);
        setCodOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock COD orders for testing
  const getMockCODOrders = (): Order[] => {
    const now = new Date();
    return [
      {
        id: "order-cod-001",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-002",
        subtotal: 1890.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: undefined,
        shared_shipping_fee: 1200.00,
        total: 1890.00,
        currency: "PHP",
        status: "shipped",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: { type: "bank_transfer", bank: "BDO" },
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
        fulfillment_status: "out_for_delivery",
        storage_status: "shipped",
        shipping_requested_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_payment_status: "cod_pending",
        cod_amount: 250.00,
        wallet_credit: undefined,
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_paid_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
        id: "order-cod-002",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-005",
        subtotal: 3200.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: undefined,
        shared_shipping_fee: 1500.00,
        total: 3200.00,
        currency: "PHP",
        status: "shipped",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: { type: "online", bank: "GCASH" },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "shared",
        shipping_address: {
          street: "456 Oak Avenue",
          city: "Quezon City",
          province: "Metro Manila",
          zipCode: "1100",
          country: "Philippines",
        },
        fulfillment_status: "out_for_delivery",
        storage_status: "shipped",
        shipping_requested_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_payment_status: "cod_pending",
        cod_amount: 350.00,
        wallet_credit: undefined,
        created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_paid_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-005",
            product_id: "prod-005",
            product_name: "Sony WH-1000XM5 Headphones",
            product_type: "onhand",
            quantity: 1,
            unit_price: 3200.00,
            total: 3200.00,
            image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            preorder_release_date: undefined,
          },
        ],
      },
    ];
  };


  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-soft-blue-600 border-t-transparent"></div>
            <p className="text-muted-foreground">Loading COD orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-grey-900 sm:text-3xl">Local Shipping Payment</h1>
          {codOrders.length > 0 && codOrders[0]?.id?.startsWith("order-cod") && (
            <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              Mock Data
            </span>
          )}
        </div>
        <p className="text-sm text-grey-600 sm:text-base">
          Pay for local shipping from Manila office to your address. Your items have arrived at Manila and are ready for local delivery.
        </p>
      </div>

      {/* Summary Cards */}
      {codOrders.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-grey-600">Pending Shipping</p>
                <p className="text-lg font-bold text-grey-900">
                  {codOrders.filter(o => o.shipping_payment_status === "cod_pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-grey-600">Paid Shipping</p>
                <p className="text-lg font-bold text-grey-900">
                  {codOrders.filter(o => o.shipping_payment_status === "cod_paid").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-grey-600">Total Shipping Amount</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(
                    codOrders
                      .filter(o => o.shipping_payment_status === "cod_pending")
                      .reduce((sum, o) => sum + (o.cod_amount || 0), 0),
                    "PHP"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">About Local Shipping Payment</h3>
            <p className="text-sm text-blue-800">
              For shared boxes, items are consolidated and shipped to the Manila office. You pay the shipping fee from Korea to Manila (shared cost), 
              and then pay for local shipping from Manila office to your address. This is the third payment in our 3-way payment system.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {codOrders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-grey-200">
            <svg className="h-10 w-10 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-grey-900 mb-2">No Local Shipping Payments Pending</h3>
          <p className="text-grey-600 mb-6 max-w-md mx-auto">
            You don't have any shared box orders ready for local shipping payment. Local shipping payments are only for shared boxes that have arrived at the Manila office. Solo boxes ship directly to your address.
          </p>
          <Link href="/store/storage">
            <Button variant="outline">View My Storage</Button>
          </Link>
        </div>
      ) : (
        /* COD Orders List */
        <div className="space-y-4">
          {codOrders.map((order) => {
            const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const isPaid = order.shipping_payment_status === "cod_paid";
            
            return (
              <div key={order.id} className="rounded-lg border-2 border-border bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* Order Header */}
                <div className={`border-b border-border px-6 py-4 ${isPaid ? "bg-green-50" : "bg-orange-50"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-grey-900">
                          Order #{order.order_number}
                        </h3>
                        {isPaid ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Shipping Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Shipping Pending
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-grey-600">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Shared Box</span>
                        </div>
                        {order.shipping_paid_at && (
                          <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Shipping Paid</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium text-grey-600 mb-1">Local Shipping Fee</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(order.cod_amount || 0, order.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="mb-4 space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-lg border border-grey-200 bg-grey-50 p-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-20 w-20 shrink-0 rounded-lg object-cover border border-grey-200"
                          />
                        ) : (
                          <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200 border border-grey-300 flex items-center justify-center">
                            <svg className="h-8 w-8 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-grey-900 mb-1">{item.product_name}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-grey-600">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              Qty: {item.quantity}
                            </span>
                            <span>•</span>
                            <span>{formatCurrency(item.unit_price, order.currency)} each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-grey-600 mb-1">Item Total</p>
                          <p className="text-lg font-bold text-grey-900">
                            {formatCurrency(item.total, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Summary */}
                  <div className="mb-4 rounded-lg bg-grey-50 border border-grey-200 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-grey-600">Items Total:</span>
                        <span className="font-semibold">{formatCurrency(order.subtotal, order.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-grey-600">Shipping Fee (Korea → Manila):</span>
                        <span className="font-semibold">
                          {formatCurrency(order.shared_shipping_fee || 0, order.currency)}
                        </span>
                      </div>
                      <div className="border-t border-grey-300 pt-2 flex justify-between">
                        <span className="text-grey-600">Local Shipping (Manila → Your Address):</span>
                        <span className="font-bold text-orange-600 text-lg">
                          {formatCurrency(order.cod_amount || 0, order.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 mb-1">Delivery Address</p>
                        <p className="text-sm text-blue-800">
                          {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isPaid ? (
                    <div className="flex items-center justify-between rounded-lg bg-orange-50 border border-orange-200 p-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-grey-900 mb-1">Ready for Local Shipping Payment</p>
                        <p className="text-xs text-grey-600">
                          Your items have arrived at Manila office. Pay local shipping fee to proceed with delivery to your address.
                        </p>
                      </div>
                      <Link href={`/store/payment?orderId=${order.id}&type=local_shipping`}>
                        <Button
                          size="lg"
                          className="ml-4 whitespace-nowrap bg-orange-600 hover:bg-orange-700"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Pay Shipping Fee
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">Local Shipping Paid</p>
                          <p className="text-xs text-green-700">
                            Your order is out for delivery. You will receive it soon at your address.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

