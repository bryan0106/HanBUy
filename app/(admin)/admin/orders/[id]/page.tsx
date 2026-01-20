"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      // Use admin API endpoint which includes customer info
      const orderData = await orderService.getAdminOrderById(orderId);
      setOrder(orderData);
      setNewStatus(orderData.status);
      setNewPaymentStatus(orderData.payment_status);
    } catch (error: any) {
      console.error("Error loading order details:", error);
      toast.error(error.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;

    setUpdating(true);
    try {
      await orderService.updateAdminOrderStatus(orderId, {
        status: newStatus,
        admin_notes: adminNotes || undefined,
      });
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      setAdminNotes("");
      await loadOrderDetails();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (!order || !newPaymentStatus) return;

    setUpdating(true);
    try {
      // Use admin API endpoint to update payment status
      await orderService.updateAdminOrderPaymentStatus(orderId, {
        payment_status: newPaymentStatus as 'paid' | 'partial' | 'failed',
        admin_notes: adminNotes || undefined,
        rejection_reason: newPaymentStatus === 'failed' ? rejectionReason : undefined,
      });
      
      toast.success("Payment status updated successfully");
      setShowPaymentModal(false);
      setAdminNotes("");
      setRejectionReason("");
      await loadOrderDetails();
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      toast.error(error.message || "Failed to update payment status");
    } finally {
      setUpdating(false);
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

  const orderStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "in_transit_to_manila", label: "In Transit to Manila" },
    { value: "received_at_manila", label: "Received at Manila" },
    { value: "consolidated", label: "Consolidated" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "partial", label: "Partial" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="mb-2 text-xl font-semibold">Order Not Found</h2>
          <p className="mb-6 text-muted-foreground">The order you're looking for doesn't exist</p>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine order type
  const orderItems = order.order_items || [];
  const productTypes = new Set(
    orderItems.map((item: any) => item.product_type || item.product?.product_type || 'onhand')
  );
  
  let orderType: "onhand" | "preorder" | "pasabuy" | "mixed" = "onhand";
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Order {order.order_number}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="bg-green-600 hover:bg-green-700"
            disabled={updating}
          >
            Verify Payment
          </Button>
          <Button
            onClick={() => setShowStatusModal(true)}
            disabled={updating}
          >
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    orderType === "pasabuy"
                      ? "bg-pink-100 text-pink-700"
                      : orderType === "preorder"
                      ? "bg-purple-100 text-purple-700"
                      : orderType === "mixed"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {orderType === "pasabuy" ? "🛍️ Pasabuy" :
                   orderType === "preorder" ? "⏰ Preorder" :
                   orderType === "mixed" ? "🔀 Mixed" :
                   "📦 Onhand"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    statusColors[order.status] || "bg-grey-100 text-grey-700"
                  }`}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    paymentStatusColors[order.payment_status] || "bg-grey-100 text-grey-700"
                  }`}
                >
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Type</p>
                <p className="font-semibold capitalize">{order.payment_type?.replace(/_/g, " ") || "Full Payment"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-semibold">{formatDate(new Date(order.created_at))}</p>
              </div>
              {order.box_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Box ID</p>
                  <p className="font-semibold">{order.box_id}</p>
                </div>
              )}
              {order.ph_courier_tracking_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-semibold">{order.ph_courier_tracking_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Items ({orderItems.length})</h2>
            <div className="space-y-4">
              {orderItems.map((item: any, index: number) => (
                <div key={item.id || index} className="flex gap-4 rounded-lg border border-border p-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name || "Product"}</h3>
                    <p className="text-sm text-muted-foreground">
                      Product Type: {item.product_type || "onhand"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × {formatCurrency(item.unit_price || 0, "PHP")}
                    </p>
                    <p className="mt-1 font-semibold">
                      Total: {formatCurrency((item.unit_price || 0) * (item.quantity || 1), "PHP")}
                    </p>
                    {item.preorder_release_date && (
                      <p className="mt-1 text-xs text-purple-600">
                        Release Date: {formatDate(new Date(item.preorder_release_date))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          {order.payment_history && order.payment_history.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Payment History</h2>
              <div className="space-y-3">
                {order.payment_history.map((payment: any, index: number) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {payment.payment_type === "installment"
                            ? `Installment #${payment.installment_number}`
                            : payment.payment_type === "downpayment"
                            ? "Downpayment"
                            : payment.payment_type === "balance"
                            ? "Balance Payment"
                            : "Full Payment"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(payment.created_at))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(payment.amount, (payment.currency || "PHP") as Currency)}
                        </p>
                        {payment.verified && (
                          <p className="text-xs text-success">✓ Verified</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
              <div className="text-sm">
                <p className="font-semibold">{order.shipping_address.street}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
                <p>{order.shipping_address.zipCode}, {order.shipping_address.country}</p>
                {order.shipping_address.region && (
                  <p>Region: {order.shipping_address.region}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(order.subtotal || 0, order.currency || "PHP")}</span>
              </div>
              {order.isf > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISF</span>
                  <span className="font-semibold">{formatCurrency(order.isf, order.currency || "PHP")}</span>
                </div>
              )}
              {order.lsf > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LSF</span>
                  <span className="font-semibold">{formatCurrency(order.lsf, order.currency || "PHP")}</span>
                </div>
              )}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(order.total || 0, order.currency || "PHP")}</span>
                </div>
              </div>
              {order.balance && order.balance > 0 && (
                <div className="mt-2 rounded-lg bg-warning/10 p-2">
                  <p className="text-xs text-muted-foreground">Remaining Balance</p>
                  <p className="font-semibold text-warning">{formatCurrency(order.balance, order.currency || "PHP")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Customer</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-semibold">{order.customer_name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-semibold">{order.customer_email}</span>
              </p>
              {order.customer_phone && (
                <p>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="font-semibold">{order.customer_phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={updating}
              >
                Verify Payment
              </Button>
              <Button
                onClick={() => setShowStatusModal(true)}
                className="w-full"
                disabled={updating}
              >
                Update Status
              </Button>
              {order.payment_status === "pending" && (
                <Button
                  onClick={() => {
                    setNewPaymentStatus("paid");
                    setShowPaymentModal(true);
                  }}
                  className="w-full bg-success hover:bg-success/90"
                  disabled={updating}
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Update Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  {orderStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  onClick={handleStatusUpdate}
                  disabled={updating || !newStatus}
                  className="flex-1"
                >
                  {updating ? "Updating..." : "Update Status"}
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusModal(false);
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

      {/* Payment Verification Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Verify Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {order.proof_of_payment && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Payment Proof</label>
                  <img
                    src={order.proof_of_payment}
                    alt="Payment proof"
                    className="w-full rounded-lg border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {newPaymentStatus === "failed" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    placeholder="Reason for rejection..."
                    required
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Add verification notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePaymentStatusUpdate}
                  disabled={updating || !newPaymentStatus || (newPaymentStatus === "failed" && !rejectionReason)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {updating ? "Updating..." : "Verify Payment"}
                </Button>
                <Button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setAdminNotes("");
                    setRejectionReason("");
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

