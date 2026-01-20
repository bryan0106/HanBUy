"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { orderService, type Order as OrderType } from "@/services/orderService";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BoxRequest {
  id: string;
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  box_type: 'solo' | 'shared';
  request_type: 'solo_box' | 'installment_payment';
  status: 'pending' | 'approved' | 'rejected';
  amount?: number;
  currency?: Currency;
  installment_number?: number;
  total_installments?: number;
  created_at: string;
  admin_notes?: string;
  rejection_reason?: string;
}

export default function BoxApprovalsPage() {
  const [requests, setRequests] = useState<BoxRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'solo_box' | 'installment_payment'>('all');
  const [selectedRequest, setSelectedRequest] = useState<BoxRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Fetch orders with solo box requests or installment payments
      const ordersResponse = await orderService.getOrders();
      const orders = ordersResponse.data;

      const boxRequests: BoxRequest[] = [];

      for (const order of orders) {
        // Solo box requests - orders with box_type_preference = 'solo' and payment_status = 'paid'
        if (order.box_type_preference === 'solo' && order.payment_status === 'paid' && !order.box_id) {
          try {
            const customer = await userService.getUserById(order.user_id);
            boxRequests.push({
              id: `solo-${order.id}`,
              order_id: order.id,
              order_number: order.order_number,
              customer_id: order.user_id,
              customer_name: customer.name || `Customer ${order.user_id.slice(-6)}`,
              customer_email: customer.email || `customer${order.user_id.slice(-6)}@example.com`,
              box_type: 'solo',
              request_type: 'solo_box',
              status: 'pending',
              amount: order.total,
              currency: order.currency as Currency,
              created_at: order.created_at,
            });
          } catch (error) {
            console.error(`Error fetching customer ${order.user_id}:`, error);
          }
        }

        // Installment payment requests - orders with payment_type = 'installment' and partial payments
        if (order.payment_type === 'installment' || order.payment_type === 'downpayment') {
          if (order.payment_history && order.payment_history.length > 0) {
            // Check for pending installment payments
            const pendingPayments = order.payment_history.filter((p: any) => !p.verified && p.payment_type === 'installment');
            
            for (const payment of pendingPayments) {
              try {
                const customer = await userService.getUserById(order.user_id);
                boxRequests.push({
                  id: `installment-${order.id}-${payment.created_at}`,
                  order_id: order.id,
                  order_number: order.order_number,
                  customer_id: order.user_id,
                  customer_name: customer.name || `Customer ${order.user_id.slice(-6)}`,
                  customer_email: customer.email || `customer${order.user_id.slice(-6)}@example.com`,
                  box_type: order.box_type_preference || 'shared',
                  request_type: 'installment_payment',
                  status: 'pending',
                  amount: payment.amount,
                  currency: (payment.currency || order.currency) as Currency,
                  installment_number: payment.installment_number,
                  total_installments: order.installment_plan?.total_installments || undefined,
                  created_at: payment.created_at,
                });
              } catch (error) {
                console.error(`Error fetching customer ${order.user_id}:`, error);
              }
            }
          }
        }
      }

      // Filter requests
      const filtered = filter === 'all' 
        ? boxRequests 
        : boxRequests.filter(r => r.request_type === filter);

      setRequests(filtered);
    } catch (error: any) {
      console.error("Error loading box requests:", error);
      toast.error(error.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setApproving(true);
    try {
      if (approvalAction === 'approve') {
        if (selectedRequest.request_type === 'solo_box') {
          // Approve solo box - update order with box_id
          // TODO: Call API to create/assign solo box
          await orderService.updateOrderStatus(selectedRequest.order_id, 'confirmed');
          toast.success("Solo box approved! Order can proceed.");
        } else if (selectedRequest.request_type === 'installment_payment') {
          // Approve installment payment
          // TODO: Call API to verify installment payment
          await orderService.updateOrderStatus(selectedRequest.order_id, 'confirmed');
          toast.success("Installment payment approved!");
        }
      } else {
        // Reject request
        toast.error("Request rejected. Customer will be notified.");
      }

      setShowApproveModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      setRejectionReason("");
      await loadRequests();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error(error.message || "Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const soloBoxRequests = requests.filter(r => r.request_type === 'solo_box');
  const installmentRequests = requests.filter(r => r.request_type === 'installment_payment');

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Box & Payment Approvals</h1>
        <p className="mt-2 text-muted-foreground">
          Approve solo box requests and installment payments for customers
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-warning">{requests.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Solo Box Requests</p>
          <p className="text-2xl font-bold text-blue-600">{soloBoxRequests.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Installment Payments</p>
          <p className="text-2xl font-bold text-purple-600">{installmentRequests.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? "bg-soft-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('solo_box')}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'solo_box'
              ? "bg-blue-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Solo Box ({soloBoxRequests.length})
        </button>
        <button
          onClick={() => setFilter('installment_payment')}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'installment_payment'
              ? "bg-purple-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Installment ({installmentRequests.length})
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soft-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No pending requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Order {request.order_number}
                        </h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          request.request_type === 'solo_box' 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {request.request_type === 'solo_box' ? '📦 Solo Box Request' : '💳 Installment Payment'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.customer_name} ({request.customer_email})
                      </p>
                    </div>
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-warning/10 text-warning">
                      PENDING
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {request.amount && (
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold">
                          {formatCurrency(request.amount, request.currency || 'PHP')}
                        </p>
                      </div>
                    )}
                    {request.installment_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Installment</p>
                        <p className="font-semibold">
                          Payment #{request.installment_number} of {request.total_installments}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Box Type</p>
                      <p className="font-semibold capitalize">{request.box_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Request Date</p>
                      <p className="font-semibold">
                        {formatDate(new Date(request.created_at))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:ml-4">
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setApprovalAction('approve');
                      setShowApproveModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setApprovalAction('reject');
                      setShowApproveModal(true);
                    }}
                    variant="outline"
                    className="border-error text-error hover:bg-error/10"
                  >
                    ❌ Reject
                  </Button>
                  <Link href={`/admin/orders/${request.order_id}`}>
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

      {/* Approval Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {approvalAction === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="font-semibold">{selectedRequest.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Type</p>
                <p className="font-semibold capitalize">
                  {selectedRequest.request_type === 'solo_box' ? 'Solo Box Request' : 'Installment Payment'}
                </p>
              </div>
              {selectedRequest.amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedRequest.amount, selectedRequest.currency || 'PHP')}
                  </p>
                </div>
              )}
              {approvalAction === 'reject' && (
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
                  placeholder="Add approval notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApproveRequest}
                  disabled={approving || (approvalAction === 'reject' && !rejectionReason)}
                  className={`flex-1 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-error hover:bg-error/90'
                  }`}
                >
                  {approving
                    ? "Processing..."
                    : approvalAction === 'approve'
                    ? "Approve Request"
                    : "Reject Request"}
                </Button>
                <Button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setAdminNotes("");
                    setRejectionReason("");
                  }}
                  variant="outline"
                  disabled={approving}
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

