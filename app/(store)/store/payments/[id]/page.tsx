"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { mockOrderService } from "@/lib/mockOrdersData";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/store/payments/${orderId}`);
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
      // Use mock data - no API call
      const orderData = await mockOrderService.getOrderById(orderId);
      
      // Verify the order belongs to the current user
      if (orderData.user_id !== user?.id) {
        setError("You don't have permission to view this payment");
        return;
      }
      
      setOrder(orderData);
    } catch (err: any) {
      console.error("Error loading payment details:", err);
      setError(err.message || "Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-error/10 text-error",
    partial: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
    refunded: "bg-grey-100 text-grey-700",
  };

  const paymentRecordStatusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    verified: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
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
          <div className="mb-4 text-6xl">💳</div>
          <h2 className="mb-2 text-xl font-semibold">Payment not found</h2>
          <p className="mb-6 text-muted-foreground">
            The payment information you're looking for doesn't exist.
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
  const paymentHistory = order.payment_history || [];
  const installmentPlan = order.installment_plan;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Payment Details
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order #{order.order_number}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/store/orders")}>
            Back to Orders
          </Button>
          <Link href={`/store/orders/${order.id}`}>
            <Button variant="outline">View Order Details</Button>
          </Link>
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
          {/* Payment Status Overview */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Payment Status</h2>
            <div className="space-y-4">
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
                <span className="text-sm text-muted-foreground">Payment Type</span>
                <span className="text-sm font-medium capitalize">
                  {paymentType === "installment"
                    ? "Installment"
                    : paymentType === "downpayment"
                    ? "Downpayment"
                    : "Full Payment"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-soft-blue-600">
                  {formatCurrency(order.total, order.currency)}
                </span>
              </div>
              {hasBalance && (
                <div className="rounded-lg bg-warning/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-warning">Remaining Balance</span>
                    <span className="text-xl font-bold text-warning">
                      {formatCurrency(order.balance, order.currency)}
                    </span>
                  </div>
                </div>
              )}
              {!hasBalance && order.payment_status === "paid" && (
                <div className="rounded-lg bg-success/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-success">Fully Paid</span>
                    <span className="text-lg font-bold text-success">✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Installment Plan */}
          {installmentPlan && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Installment Plan</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Installments</p>
                    <p className="text-lg font-bold">{installmentPlan.total_installments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Installments</p>
                    <p className="text-lg font-bold text-success">
                      {installmentPlan.paid_installments}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount per Installment</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(installmentPlan.installment_amount, order.currency)}
                    </p>
                  </div>
                  {installmentPlan.next_due_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next Due Date</p>
                      <p className="text-lg font-bold">
                        {formatDate(new Date(installmentPlan.next_due_date))}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {installmentPlan.paid_installments} / {installmentPlan.total_installments}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-grey-200">
                    <div
                      className="h-full bg-soft-blue-600 transition-all"
                      style={{
                        width: `${(installmentPlan.paid_installments / installmentPlan.total_installments) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Payment History</h2>
            {paymentHistory.length > 0 ? (
              <div className="space-y-4">
                {paymentHistory.map((payment: any, index: number) => (
                  <div
                    key={payment.id || index}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {payment.payment_type === "installment"
                              ? `Installment #${payment.installment_number}`
                              : payment.payment_type === "downpayment"
                              ? "Downpayment"
                              : payment.payment_type === "balance"
                              ? "Balance Payment"
                              : "Full Payment"}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              paymentRecordStatusColors[payment.status] || "bg-grey-100 text-grey-700"
                            }`}
                          >
                            {payment.status.toUpperCase()}
                          </span>
                          {payment.verified && (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(payment.created_at))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-soft-blue-600">
                          {formatCurrency(payment.amount, payment.currency || order.currency)}
                        </p>
                        {payment.payment_method?.bank && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {payment.payment_method.bank}
                          </p>
                        )}
                      </div>
                    </div>
                    {payment.verified_at && (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-xs text-muted-foreground">
                          Verified on {formatDate(new Date(payment.verified_at))}
                          {payment.verified_by && ` by ${payment.verified_by}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No payment history available</p>
              </div>
            )}
          </div>

          {/* Downpayment Information */}
          {paymentType === "downpayment" && order.downpayment_amount && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Downpayment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Downpayment Amount</span>
                  <span className="font-medium">
                    {formatCurrency(order.downpayment_amount, order.currency)}
                  </span>
                </div>
                {order.downpayment_paid && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                    <span className="font-medium text-success">
                      {formatCurrency(order.downpayment_paid, order.currency)}
                    </span>
                  </div>
                )}
                {hasBalance && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Remaining Balance</span>
                    <span className="font-bold text-warning">
                      {formatCurrency(order.balance, order.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Payment Summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-medium">
                    {formatCurrency(order.total, order.currency)}
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
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-warning">Balance</span>
                      <span className="text-xl font-bold text-warning">
                        {formatCurrency(order.balance, order.currency)}
                      </span>
                    </div>
                  </div>
                )}
                {!hasBalance && (
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-success">Paid</span>
                      <span className="text-xl font-bold text-success">
                        {formatCurrency(order.total, order.currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            {order.payment_method && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Payment Method</h3>
                <div className="space-y-2">
                  <div className="rounded-lg bg-grey-50 p-3">
                    <p className="text-sm font-medium capitalize">
                      {order.payment_method.bank || order.payment_method.type}
                    </p>
                    {order.payment_method.type && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {order.payment_method.type.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/store/orders/${order.id}`}
                  className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-grey-50"
                >
                  View Order Details
                </Link>
                {hasBalance && (
                  <Link
                    href={`/store/payment?orderId=${order.id}&type=balance`}
                    className="block w-full rounded-lg bg-soft-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700"
                  >
                    Pay Balance
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

