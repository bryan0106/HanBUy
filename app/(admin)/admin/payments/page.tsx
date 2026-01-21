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
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, verified: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
      // 1. Fetch filtered payments for the list
      // Note: We map 'failed' filter to 'rejected' status for the API call
      const paymentsResponse = await paymentService.getAdminPayments({
        status: statusFilter === "all" ? undefined : statusFilter === "pending" ? "pending" : statusFilter === "failed" ? "rejected" : statusFilter,
      });
      
      const adminPayments = paymentsResponse.data;
      
      const paymentRecords: Payment[] = adminPayments.map((payment: any) => ({
        id: payment.id,
        order_id: payment.order_id,
        order_number: payment.order_number,
        amount: payment.amount,
        currency: 'PHP',
        payment_type: payment.payment_method?.type || 'full_payment',
        payment_method: payment.payment_method,
        status: payment.status === 'verified' ? 'verified' : (payment.status === 'rejected' || payment.status === 'failed') ? 'failed' : 'pending',
        verified: payment.status === 'verified',
        verified_at: payment.verified_at,
        verified_by: payment.verified_by,
        proof_of_payment_url: payment.proof_of_payment,
        created_at: payment.created_at,
        customer_name: payment.customer_name,
        customer_email: payment.customer_email,
        admin_notes: payment.admin_notes,
        rejection_reason: payment.rejection_reason,
      }));

      setPayments(paymentRecords);

      // 2. Fetch all payments to get accurate counts for the filters
      const allResponse = await paymentService.getAdminPayments({ limit: 1000 });
      const allData = allResponse.data;
      setCounts({
        total: allData.length,
        pending: allData.filter((p: any) => p.status !== 'verified' && p.status !== 'rejected' && p.status !== 'failed').length,
        verified: allData.filter((p: any) => p.status === 'verified').length,
        failed: allData.filter((p: any) => p.status === 'rejected' || p.status === 'failed').length,
      });
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

      toast.success(`Payment ${verificationStatus === 'verified' ? 'verified' : 'rejected'} successfully`);
      setShowVerifyModal(false);
      setSelectedPayment(null);
      setAdminNotes("");
      setRejectionReason("");
      
      // Switch to the target tab so the user sees the updated payment
      const targetFilter = verificationStatus === 'verified' ? 'verified' : 'failed';
      if (statusFilter === targetFilter) {
        // If already on the target tab, we need to manually reload since the useEffect won't trigger
        await loadPayments();
      } else {
        // This will trigger the useEffect to reload the payments
        setStatusFilter(targetFilter);
      }
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Payment Verification</h1>
        <p className="mt-2 text-muted-foreground">Review and verify customer payments</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{counts.pending}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Verified</p>
          <p className="text-2xl font-bold text-success">{counts.verified}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-error">{counts.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setStatusFilter("verified")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "verified"
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Verified ({counts.verified})
        </button>
        <button
          onClick={() => setStatusFilter("failed")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "failed"
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Failed ({counts.failed})
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
          <p className="text-muted-foreground">No payments found</p>
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
                      <h3 className="text-lg font-semibold">
                        Order {payment.order_number}
                      </h3>
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
                    {payment.verified_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">Verified At</p>
                        <p className="font-semibold">
                          {formatDate(new Date(payment.verified_at))}
                        </p>
                      </div>
                    )}
                    {payment.verified_by && (
                      <div>
                        <p className="text-sm text-muted-foreground">Verified By</p>
                        <p className="font-semibold">{payment.verified_by}</p>
                      </div>
                    )}
                  </div>

                  {payment.proof_of_payment_url && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium">Payment Proof</p>
                      <img
                        src={payment.proof_of_payment_url}
                        alt="Payment proof"
                        className="max-w-xs rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {payment.admin_notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Admin Notes</p>
                      <p className="text-sm text-muted-foreground">{payment.admin_notes}</p>
                    </div>
                  )}

                  {payment.rejection_reason && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-error">Rejection Reason</p>
                      <p className="text-sm text-error">{payment.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:ml-4">
                  {!payment.verified && payment.status !== 'failed' && (
                    <Button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setVerificationStatus('verified');
                        setShowVerifyModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Verify Payment
                    </Button>
                  )}
                  {!payment.verified && payment.status !== 'failed' && (
                    <Button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setVerificationStatus('failed');
                        setShowVerifyModal(true);
                      }}
                      variant="outline"
                      className="border-error text-error hover:bg-error/10"
                    >
                      Reject Payment
                    </Button>
                  )}
                  <Link href={`/admin/orders/${payment.order_id}`}>
                    <Button variant="outline" className="w-full">
                      View Order
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
              {verificationStatus === 'verified' ? 'Verify Payment' : 'Reject Payment'}
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

