"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { QRPayment } from "@/components/payment/QRPayment";
import { Button } from "@/components/ui/button";
import { bankService, type BankType } from "@/services/api";

interface OrderSummary {
  subtotal: number;
  isf: number;
  lsf: number;
  total: number;
  currency: "PHP";
  boxTypePreference: "solo" | "shared";
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bankTypes, setBankTypes] = useState<BankType[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "downpayment">("full");
  const [downpaymentAmount, setDownpaymentAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const orderId = searchParams.get("orderId");

  // Helper function to get default banks
  const getDefaultBanks = (): BankType[] => [
    { code: "BPI", name: "BPI" },
    { code: "BDO", name: "BDO" },
    { code: "GCASH", name: "GCash" },
    { code: "GOTYME", name: "GoTyme" },
    { code: "MAYA", name: "Maya" },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch bank types from Express.js API
      try {
        const banks = await bankService.getBankTypes("http://localhost:5173/api/bank-type");
        setBankTypes(banks);
      } catch (bankError) {
        console.warn("Failed to fetch bank types from API, using defaults:", bankError);
        setBankTypes(getDefaultBanks());
      }

      // Load order data - check sessionStorage first (for temp orders from Buy Now)
      let orderData = null;
      if (orderId && orderId.startsWith("temp-order")) {
        const tempOrderStr = sessionStorage.getItem("temp_order");
        if (tempOrderStr) {
          try {
            orderData = JSON.parse(tempOrderStr);
          } catch (e) {
            console.error("Error parsing temp order:", e);
          }
        }
      }

      // TODO: If orderId exists and is not temp, fetch from API
      // For now, use temp order data or mock data
      if (orderData) {
        // Calculate order summary from temp order data
        const subtotal = orderData.price * orderData.quantity * 0.042; // Convert KRW to PHP
        const isf = 300.00; // Mock ISF
        const lsf = orderData.boxTypePreference === "shared" ? 150.00 : 200.00; // Mock LSF
        const total = subtotal + isf + lsf;
        
        const orderSummary: OrderSummary = {
          subtotal,
          isf,
          lsf,
          total,
          currency: "PHP",
          boxTypePreference: orderData.boxTypePreference || "solo",
        };
        setOrderSummary(orderSummary);
        setDownpaymentAmount(total * 0.5);
      } else {
        // Use mock data as fallback
        const mockOrderSummary: OrderSummary = {
          subtotal: 5000.00,
          isf: 300.00,
          lsf: 200.00,
          total: 5500.00,
          currency: "PHP",
          boxTypePreference: "solo",
        };
        setOrderSummary(mockOrderSummary);
        setDownpaymentAmount(mockOrderSummary.total * 0.5);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Ensure we have default banks even on error
      if (bankTypes.length === 0) {
        setBankTypes(getDefaultBanks());
      }
      // Ensure we have order summary even on error
      if (!orderSummary) {
        const mockOrderSummary: OrderSummary = {
          subtotal: 5000.00,
          isf: 300.00,
          lsf: 200.00,
          total: 5500.00,
          currency: "PHP",
          boxTypePreference: "solo",
        };
        setOrderSummary(mockOrderSummary);
        setDownpaymentAmount(mockOrderSummary.total * 0.5);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/payment");
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, loadData]);

  const handlePaymentComplete = async () => {
    setProcessing(true);
    try {
      // TODO: Submit payment to backend API
      // This would typically:
      // 1. Create a payment record
      // 2. Update order payment status
      // 3. Generate QR code with pre-identified amount
      
      alert("Payment submitted! Manila admin will verify your payment.");
      router.push("/store/orders");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading payment page...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!orderSummary && !loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="mb-2 text-xl font-semibold">Order not found</h2>
          <p className="mb-6 text-muted-foreground">
            Unable to load order details. Please try again or go back to select a product.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push("/store/products")}>
              Browse Products
            </Button>
            <Button variant="outline" onClick={() => router.push("/store/orders")}>
              View Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderSummary) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  const balance = paymentType === "downpayment" 
    ? orderSummary.total - downpaymentAmount 
    : 0;
  const paymentAmount = paymentType === "downpayment" 
    ? downpaymentAmount 
    : orderSummary.total;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Payment
        </h1>
        <p className="mt-2 text-muted-foreground">
          Complete your payment to confirm your order
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(orderSummary.subtotal, orderSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ISF (International Service Fee)
                </span>
                <span className="font-medium">
                  {formatCurrency(orderSummary.isf, orderSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  LSF (Local Service Fee)
                </span>
                <span className="font-medium">
                  {formatCurrency(orderSummary.lsf, orderSummary.currency)}
                </span>
              </div>
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-soft-blue-600">
                    {formatCurrency(orderSummary.total, orderSummary.currency)}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-grey-50 p-3">
                <p className="text-xs text-muted-foreground">Box Type</p>
                <p className="mt-1 font-semibold capitalize">
                  {orderSummary.boxTypePreference} Box
                </p>
              </div>
            </div>

            {/* Payment Type Selection */}
            <div className="mt-6">
              <label className="mb-3 block text-sm font-medium">
                Payment Type
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                    paymentType === "full"
                      ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="font-semibold">Full Payment</div>
                  <div className="text-xs text-muted-foreground">
                    Pay the full amount now
                  </div>
                  <div className="mt-1 text-sm font-bold">
                    {formatCurrency(orderSummary.total, orderSummary.currency)}
                  </div>
                </button>
                <button
                  onClick={() => setPaymentType("downpayment")}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                    paymentType === "downpayment"
                      ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="font-semibold">Downpayment</div>
                  <div className="text-xs text-muted-foreground">
                    Pay 50% now, 50% later
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="text-sm font-bold">
                      Now: {formatCurrency(downpaymentAmount, orderSummary.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Balance: {formatCurrency(balance, orderSummary.currency)}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-2">
          <QRPayment
            amount={orderSummary.total}
            orderId={orderId || "temp-order-id"}
            paymentType={paymentType}
            downpaymentAmount={downpaymentAmount}
            balance={balance}
            subtotal={orderSummary.subtotal}
            isf={orderSummary.isf}
            lsf={orderSummary.lsf}
            onPaymentComplete={handlePaymentComplete}
            bankTypes={bankTypes.length > 0 ? bankTypes : undefined}
          />

          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading payment page...</p>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

