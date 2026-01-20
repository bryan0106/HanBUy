"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/store/orders/${orderId}`);
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, orderId, router]);

  const loadOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await orderService.getOrderById(orderId);
      
      // Verify the order belongs to the current user
      if (orderData.user_id !== user?.id) {
        setError("You don't have permission to view this order");
        return;
      }
      
      setOrder(orderData);
    } catch (err: any) {
      console.error("Error loading order details:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    processing: "bg-soft-blue-50 text-soft-blue-700",
    packed: "bg-info/10 text-info",
    in_transit_to_manila: "bg-info/10 text-info",
    received_at_manila: "bg-success/10 text-success",
    consolidated: "bg-success/10 text-success",
    shipped: "bg-info/10 text-info",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-error/10 text-error",
    partial: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
    refunded: "bg-grey-100 text-grey-700",
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="mb-2 text-xl font-semibold">Error</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push("/store/orders")}>
              Back to Orders
            </Button>
            <Button variant="outline" onClick={loadOrderDetails}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">📦</div>
          <h2 className="mb-2 text-xl font-semibold">Order not found</h2>
          <p className="mb-6 text-muted-foreground">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/store/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const hasBalance = order.balance && order.balance > 0;
  const paymentType = order.payment_type || "full";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Order Details
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order #{order.order_number}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/store/orders")}>
            Back to Orders
          </Button>
          {hasBalance && (
            <Link href={`/store/payment?orderId=${order.id}&type=balance`}>
              <Button>Pay Balance</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    statusColors[order.status] || "bg-grey-100 text-grey-700"
                  }`}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    paymentStatusColors[order.payment_status] || "bg-grey-100 text-grey-700"
                  }`}
                >
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Date</span>
                <span className="text-sm font-medium">
                  {formatDate(new Date(order.created_at))}
                </span>
              </div>
              {order.paid_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paid Date</span>
                  <span className="text-sm font-medium">
                    {formatDate(new Date(order.paid_at))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
            <div className="space-y-4">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-border bg-background p-4"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
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
                      <h3 className="font-semibold text-foreground">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.product_type === "preorder"
                          ? "Pre-Order"
                          : item.product_type === "kr_website"
                          ? "KR Website"
                          : "Onhand"}
                      </p>
                      {item.preorder_release_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Release Date: {formatDate(new Date(item.preorder_release_date))}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-lg font-bold text-soft-blue-600">
                          {formatCurrency(item.total, order.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No items found in this order
                </p>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {order.shipping_address && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shipping_address.street}</p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.province}{" "}
                  {order.shipping_address.zipCode}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address.country}
                </p>
              </div>
            </div>
          )}

          {/* Tracking Information */}
          {(order.ph_courier_tracking_number || order.box_id) && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Tracking Information</h2>
              <div className="space-y-3">
                {order.ph_courier_tracking_number && (
                  <div>
                    <span className="text-sm text-muted-foreground">Courier Tracking:</span>
                    <p className="font-medium">{order.ph_courier_tracking_number}</p>
                    {order.ph_courier_name && (
                      <p className="text-sm text-muted-foreground">
                        {order.ph_courier_name}
                      </p>
                    )}
                  </div>
                )}
                {order.box_id && (
                  <div>
                    <span className="text-sm text-muted-foreground">Box ID:</span>
                    <p className="font-medium">{order.box_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ISF</span>
                  <span className="font-medium">
                    {formatCurrency(order.isf, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">LSF</span>
                  <span className="font-medium">
                    {formatCurrency(order.lsf, order.currency)}
                  </span>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-soft-blue-600">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Type</span>
                  <span className="font-medium capitalize">
                    {paymentType === "installment"
                      ? "Installment"
                      : paymentType === "downpayment"
                      ? "Downpayment"
                      : "Full Payment"}
                  </span>
                </div>
                {paymentType === "downpayment" && order.downpayment_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Downpayment</span>
                    <span className="font-medium">
                      {formatCurrency(order.downpayment_amount, order.currency)}
                    </span>
                  </div>
                )}
                {hasBalance && (
                  <div className="rounded-lg bg-warning/10 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-warning">Remaining Balance</span>
                      <span className="font-bold text-warning">
                        {formatCurrency(order.balance, order.currency)}
                      </span>
                    </div>
                  </div>
                )}
                {order.payment_method && (
                  <div className="mt-3 rounded-lg bg-grey-50 p-3">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="mt-1 font-medium capitalize">
                      {order.payment_method.bank || order.payment_method.type}
                    </p>
                  </div>
                )}
                <Link
                  href={`/store/payments/${order.id}`}
                  className="mt-4 block w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-grey-50"
                >
                  View Payment Details
                </Link>
              </div>
            </div>

            {/* Box Type */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Box Type</h3>
              <div className="rounded-lg bg-grey-50 p-3">
                <p className="text-sm font-medium capitalize">
                  {order.box_type_preference} Box
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

