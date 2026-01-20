"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { paymentService } from "@/services/paymentService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  order_id: string;
  order_number: string;
  amount: number;
  currency: Currency;
  payment_type: string;
  payment_method: any;
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'refunded';
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
  proof_of_payment_url?: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  admin_notes?: string;
  rejection_reason?: string;
  order_type?: 'onhand' | 'preorder' | 'pasabuy' | 'mixed';
  order_items?: any[];
}

export default function ManilaPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'failed'>('verified');
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Use admin payments API endpoint
      const paymentsResponse = await paymentService.getAdminPayments({
        status: statusFilter === "pending" ? "pending" : statusFilter === "all" ? undefined : statusFilter,
      });
      
      const adminPayments = paymentsResponse.data;
      
      // Map admin API response to Payment interface
      const paymentRecords: Payment[] = adminPayments.map((payment: any) => {
        // Determine order type from order items if available
        let orderType: 'onhand' | 'preorder' | 'pasabuy' | 'mixed' = 'onhand';
        // Order type would come from order data if available
        
        return {
          id: payment.id,
          order_id: payment.order_id,
          order_number: payment.order_number,
          amount: payment.amount,
          currency: 'PHP',
          payment_type: payment.payment_method?.type || 'full_payment',
          payment_method: payment.payment_method,
          status: payment.status === 'verified' ? 'verified' : payment.status === 'rejected' ? 'failed' : 'pending',
          verified: payment.status === 'verified',
          verified_at: payment.verified_at,
          proof_of_payment_url: payment.proof_of_payment,
          created_at: payment.created_at,
          customer_name: payment.customer_name,
          customer_email: payment.customer_email,
          order_type: orderType,
        };
      });

      setPayments(paymentRecords);
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error(error.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedPayment) return;

    setVerifying(true);
    try {
      // Use admin payment API to verify/reject payment
      await paymentService.updateAdminPaymentStatus(selectedPayment.id, {
        status: verificationStatus === 'verified' ? 'verified' : 'rejected',
        admin_notes: adminNotes || undefined,
        rejection_reason: verificationStatus === 'failed' ? rejectionReason : undefined,
      });

      if (verificationStatus === 'verified') {
        toast.success("Payment verified! Korean admin can now pack/prepare the order.");
      } else {
        toast.error("Payment rejected. Customer will be notified.");
      }

      setShowVerifyModal(false);
      setSelectedPayment(null);
      setAdminNotes("");
      setRejectionReason("");
      await loadPayments();
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error(error.message || "Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-info/10 text-info",
    verified: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
    refunded: "bg-grey-100 text-grey-700",
  };

  const orderTypeColors: Record<string, string> = {
    onhand: "bg-blue-100 text-blue-700",
    preorder: "bg-purple-100 text-purple-700",
    pasabuy: "bg-pink-100 text-pink-700",
    mixed: "bg-yellow-100 text-yellow-700",
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => !p.verified && p.status !== 'failed').length,
    verified: payments.filter(p => p.verified).length,
    failed: payments.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Manila Office - Payment Verification</h1>
        <p className="mt-2 text-muted-foreground">
          Verify customer payments. Once verified, Korean admin will be notified to pack/prepare orders.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Verified Today</p>
          <p className="text-2xl font-bold text-success">{stats.verified}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-error">{stats.failed}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-warning text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Pending Verification ({stats.pending})
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All Payments
        </button>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No pending payments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Order {payment.order_number}
                        </h3>
                        {payment.order_type && (
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${orderTypeColors[payment.order_type]}`}>
                            {payment.order_type === "pasabuy" ? "🛍️ Pasabuy" :
                             payment.order_type === "preorder" ? "⏰ Preorder" :
                             payment.order_type === "mixed" ? "🔀 Mixed" :
                             "📦 Onhand"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.customer_name} ({payment.customer_email})
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[payment.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Type</p>
                      <p className="font-semibold capitalize">
                        {payment.payment_type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-semibold">
                        {payment.payment_method?.bank || payment.payment_method?.type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {formatDate(new Date(payment.created_at))}
                      </p>
                    </div>
                  </div>

                  {payment.order_items && payment.order_items.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium">Order Items:</p>
                      <div className="space-y-1">
                        {payment.order_items.slice(0, 3).map((item: any, idx: number) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {item.product_name} (x{item.quantity}) - {item.product_type}
                          </p>
                        ))}
                        {payment.order_items.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            ... and {payment.order_items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {payment.proof_of_payment_url && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium">Payment Proof</p>
                      <img
                        src={payment.proof_of_payment_url}
                        alt="Payment proof"
                        className="max-w-xs rounded-lg border border-border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(payment.proof_of_payment_url, '_blank')}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:ml-4">
                  {!payment.verified && payment.status !== 'failed' && (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setVerificationStatus('verified');
                          setShowVerifyModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✅ Verify Payment
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setVerificationStatus('failed');
                          setShowVerifyModal(true);
                        }}
                        variant="outline"
                        className="border-error text-error hover:bg-error/10"
                      >
                        ❌ Reject Payment
                      </Button>
                    </>
                  )}
                  <Link href={`/admin/orders/${payment.order_id}`}>
                    <Button variant="outline" className="w-full">
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {verificationStatus === 'verified' ? '✅ Verify Payment' : '❌ Reject Payment'}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="font-semibold">{selectedPayment.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </p>
              </div>
              {selectedPayment.proof_of_payment_url && (
                <div>
                  <p className="mb-2 text-sm font-medium">Payment Proof</p>
                  <img
                    src={selectedPayment.proof_of_payment_url}
                    alt="Payment proof"
                    className="w-full rounded-lg border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {verificationStatus === 'verified' && (
                <div className="rounded-lg bg-success/10 p-3">
                  <p className="text-sm font-medium text-success">
                    ✅ After verification, Korean admin will be notified to pack/prepare this order.
                  </p>
                  {selectedPayment.order_type === 'preorder' && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Preorder items will be processed for reordering.
                    </p>
                  )}
                  {selectedPayment.order_type === 'pasabuy' && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pasabuy items will be processed for purchase.
                    </p>
                  )}
                </div>
              )}
              {verificationStatus === 'failed' && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Rejection Reason *</label>
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
                  onClick={handleVerifyPayment}
                  disabled={verifying || (verificationStatus === 'failed' && !rejectionReason)}
                  className={`flex-1 ${
                    verificationStatus === 'verified'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-error hover:bg-error/90'
                  }`}
                >
                  {verifying
                    ? "Processing..."
                    : verificationStatus === 'verified'
                    ? "Verify Payment"
                    : "Reject Payment"}
                </Button>
                <Button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedPayment(null);
                    setAdminNotes("");
                    setRejectionReason("");
                  }}
                  variant="outline"
                  disabled={verifying}
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

