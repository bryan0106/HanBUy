"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { QRPayment } from "@/components/payment/QRPayment";
import { Button } from "@/components/ui/button";
import { utilityService, type BankType, type Courier } from "@/services/utilityService";
import { orderService } from "@/services/orderService";

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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { balance: walletBalance, loading: walletLoading, refetch: refetchWallet } = useWallet(user?.id);
  const [loading, setLoading] = useState(true);
  const [bankTypes, setBankTypes] = useState<BankType[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "installment" | "balance">("full");
  const [downpaymentAmount, setDownpaymentAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const orderId = searchParams.get("orderId");
  const paymentTypeParam = searchParams.get("type"); // "balance", "shipping", "item_only", "local_shipping"
  const walletAmountParam = searchParams.get("walletAmount");
  const amountParam = searchParams.get("amount"); // Shipping fee amount from URL

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
        const banks = await utilityService.getBankTypes();
        setBankTypes(banks);
      } catch (bankError) {
        console.warn("Failed to fetch bank types from API, using defaults:", bankError);
        setBankTypes(getDefaultBanks());
      }

      // Fetch couriers if this is a local shipping payment (only for SHARED boxes)
      if (paymentTypeParam === "local_shipping") {
        // Verify this is a shared box order
        if (existingOrder && existingOrder.box_type_preference === "shared") {
          try {
            const courierList = await utilityService.getCouriers();
            setCouriers(courierList);
            if (courierList.length > 0) {
              setSelectedCourier(courierList[0].id);
            }
          } catch (courierError) {
            console.warn("Failed to fetch couriers:", courierError);
          }
        }
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
      } else if (orderId && (paymentTypeParam === "balance" || paymentTypeParam === "shipping" || paymentTypeParam === "item_only" || paymentTypeParam === "local_shipping")) {
        // Fetch existing order for balance/shipping/item/local_shipping payment
        try {
          const fetchedOrder = await orderService.getOrderById(orderId);
          setExistingOrder(fetchedOrder);
          orderData = fetchedOrder;
          
          if (paymentTypeParam === "shipping") {
            // For shipping payment (Korea → Manila), calculate shipping fee
            // Use amount from URL if provided, otherwise from order
            const shippingFee = amountParam 
              ? parseFloat(amountParam) 
              : fetchedOrder.solo_shipping_fee || fetchedOrder.shared_shipping_fee || 0;
            const orderSummary: OrderSummary = {
              subtotal: 0,
              isf: 0,
              lsf: 0,
              total: shippingFee,
              currency: "PHP",
              boxTypePreference: fetchedOrder.box_type_preference || "solo",
            };
            setOrderSummary(orderSummary);
            setPaymentType("full");
            setDownpaymentAmount(shippingFee);
          } else if (paymentTypeParam === "local_shipping") {
            // For local shipping payment (Manila → Customer address)
            const localShippingFee = fetchedOrder.cod_amount || 0;
            const orderSummary: OrderSummary = {
              subtotal: 0,
              isf: 0,
              lsf: 0,
              total: localShippingFee,
              currency: "PHP",
              boxTypePreference: fetchedOrder.box_type_preference || "shared",
            };
            setOrderSummary(orderSummary);
            setPaymentType("full");
            setDownpaymentAmount(localShippingFee);
          } else if (paymentTypeParam === "balance") {
            // Set payment type to balance
            setPaymentType("balance");
            // Set balance amount
            const balance = fetchedOrder.balance || 0;
            setDownpaymentAmount(balance);
          } else {
            // item_only payment (shouldn't happen as items are already paid, but handle it)
            const orderSummary: OrderSummary = {
              subtotal: fetchedOrder.subtotal || 0,
              isf: fetchedOrder.isf || 0,
              lsf: fetchedOrder.lsf || 0,
              total: fetchedOrder.total || 0,
              currency: "PHP", // Always use PHP for payment page
              boxTypePreference: fetchedOrder.box_type_preference || "solo",
            };
            setOrderSummary(orderSummary);
            setPaymentType("full");
            setDownpaymentAmount(orderSummary.total);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          // Use mock data for testing
          if (paymentTypeParam === "shipping") {
            const mockOrderSummary: OrderSummary = {
              subtotal: 0,
              isf: 0,
              lsf: 0,
              total: 2500.00, // Mock shipping fee
              currency: "PHP",
              boxTypePreference: "solo",
            };
            setOrderSummary(mockOrderSummary);
            setPaymentType("full");
            setDownpaymentAmount(2500.00);
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
      // Pre-fill wallet amount if coming from checkout
      if (walletAmountParam) {
        const amount = parseFloat(walletAmountParam);
        if (!isNaN(amount) && amount > 0) {
          setUseWalletBalance(true);
          setWalletAmount(amount);
        }
      }
    }
  }, [isAuthenticated, authLoading, router, loadData, walletAmountParam]);

  const handlePaymentComplete = async () => {
    // Validate courier selection for local shipping
    if (paymentTypeParam === "local_shipping" && !selectedCourier) {
      alert("Please select a delivery company to continue.");
      return;
    }

    setProcessing(true);
    try {
      // TODO: Submit payment to backend API
      // This would typically:
      // 1. Create a payment record
      // 2. Update order payment status
      // 3. For item_only payment: Set storage_status to 'in_storage' (onhand) or keep 'pending_approval' (preorder)
      // 4. For shipping payment: Update shipping_payment_status
      // 5. For local shipping: Save selected courier
      // 6. Generate QR code with pre-identified amount
      // 7. If wallet is used, deduct from wallet
      // 8. If payment exceeds order total, credit excess to wallet
      
      if (paymentTypeParam === "local_shipping" && selectedCourier) {
        const courier = couriers.find(c => c.id === selectedCourier);
        alert(`Payment submitted! Your order will be delivered via ${courier?.name || 'selected courier'}. Manila admin will verify your payment.`);
        router.push("/store/orders");
      } else if (paymentTypeParam === "shipping" && existingOrder?.box_type_preference === "shared") {
        // For shared boxes, after shipping payment, redirect to courier selection (3rd payment)
        let message = "Box shipping payment submitted! Manila admin will verify your payment.\n\n";
        message += "Next step: Select a delivery company for local shipping to your address.";
        if (useWalletBalance && actualWalletAmount > 0) {
          message += `\n\n${formatCurrency(actualWalletAmount, "PHP")} will be deducted from your wallet.`;
        }
        alert(message);
        // Redirect to courier selection page for shared boxes
        router.push(`/store/storage/${orderId}/select-courier`);
      } else if (paymentTypeParam === "shipping" && existingOrder?.box_type_preference === "solo") {
        // Solo boxes are already set up with courier, just confirm payment
        let message = "Box shipping payment submitted! Your order will be shipped directly to your address.\n\n";
        message += "Manila admin will verify your payment and ship your box.";
        if (useWalletBalance && actualWalletAmount > 0) {
          message += `\n\n${formatCurrency(actualWalletAmount, "PHP")} will be deducted from your wallet.`;
        }
        alert(message);
        router.push("/store/orders");
      } else if (paymentTypeParam === "item_only" || !paymentTypeParam) {
        // Item payment - items will be stored after admin verifies payment
        let message = "Payment submitted! Manila admin will verify your payment.\n\n";
        message += "After verification:\n";
        message += "- Onhand items will be stored in your storage\n";
        message += "- Preorder items will be approved and purchased by admin";
        if (useWalletBalance && actualWalletAmount > 0) {
          message += `\n\n${formatCurrency(actualWalletAmount, "PHP")} will be deducted from your wallet.`;
        }
        alert(message);
        router.push("/store/orders");
      } else {
        let message = "Payment submitted! Manila admin will verify your payment.";
        if (useWalletBalance && actualWalletAmount > 0) {
          message += `\n\n${formatCurrency(actualWalletAmount, "PHP")} will be deducted from your wallet.`;
        }
        alert(message);
        router.push("/store/orders");
      }
      
      // Refresh wallet balance after payment
      if (user?.id) {
        await refetchWallet();
      }
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

  const balance = paymentType === "installment" 
    ? orderSummary.total * 0.5
    : paymentType === "balance"
    ? existingOrder?.balance || 0
    : 0;
  
  const basePaymentAmount = paymentType === "balance"
    ? existingOrder?.balance || orderSummary?.total || 0
    : orderSummary?.total || 0;
  
  const installmentAmount = paymentType === "installment" 
    ? basePaymentAmount * 0.5
    : 0;
  
  // Calculate wallet usage
  const currentPaymentAmount = paymentType === "installment" 
    ? installmentAmount 
    : basePaymentAmount;
  const maxWalletUsage = Math.min(walletBalance, currentPaymentAmount);
  const actualWalletAmount = useWalletBalance ? Math.min(walletAmount, maxWalletUsage) : 0;
  const paymentAmount = Math.max(0, currentPaymentAmount - actualWalletAmount);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {paymentTypeParam === "local_shipping"
            ? "Pay Local Shipping"
            : paymentTypeParam === "shipping" 
            ? "Step 2: Pay Shipping Fee" 
            : paymentType === "balance" 
            ? "Pay Balance" 
            : "Payment"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {paymentTypeParam === "shipping"
            ? "Pay shipping fee for your box from Korea to Manila"
            : paymentType === "balance"
            ? "Pay your remaining balance for this order"
            : "Complete your payment to confirm your order"}
        </p>
        {paymentType === "balance" && existingOrder && (
          <div className="mt-3 rounded-lg bg-warning/10 p-3">
            <p className="text-sm text-warning">
              <strong>Order:</strong> {existingOrder.order_number || existingOrder.orderNumber}
            </p>
            <p className="text-sm text-warning">
              <strong>Remaining Balance:</strong> {formatCurrency(existingOrder.balance || 0, "PHP")}
            </p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Payment Section */}
        <div>
          {/* Wallet Balance Display */}
          {walletBalance > 0 && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-green-800">Wallet Balance</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(walletBalance, "PHP")}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWalletBalance}
                  onChange={(e) => {
                    setUseWalletBalance(e.target.checked);
                    if (e.target.checked) {
                      setWalletAmount(Math.min(walletBalance, basePaymentAmount));
                    } else {
                      setWalletAmount(0);
                    }
                  }}
                  className="rounded border-border"
                />
                <span className="text-sm text-green-700">
                  Use wallet balance for this payment
                </span>
              </label>
              {useWalletBalance && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs text-green-700 mb-1">
                      Amount to use from wallet (max: {formatCurrency(maxWalletUsage, "PHP")})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={maxWalletUsage}
                      step="0.01"
                      value={walletAmount}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(maxWalletUsage, parseFloat(e.target.value) || 0));
                        setWalletAmount(value);
                      }}
                      className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="text-xs text-green-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Order Total:</span>
                      <span>{formatCurrency(basePaymentAmount, "PHP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet Payment:</span>
                      <span>-{formatCurrency(actualWalletAmount, "PHP")}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-green-300 pt-1 mt-1">
                      <span>Remaining to Pay:</span>
                      <span>{formatCurrency(paymentAmount, "PHP")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Type Selection */}
          {paymentType !== "balance" && (
            <div className="mb-6 rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-base font-semibold">Payment Type</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    paymentType === "full"
                      ? "border-[#FF85A2] bg-[#FFF5F7] text-[#FF85A2]"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="text-sm font-semibold">Full Payment</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Pay full amount
                  </div>
                  <div className="mt-1.5 text-xs font-bold">
                    {formatCurrency(basePaymentAmount, "PHP")}
                  </div>
                </button>
                <button
                  onClick={() => setPaymentType("installment")}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    paymentType === "installment"
                      ? "border-[#FF85A2] bg-[#FFF5F7] text-[#FF85A2]"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="text-sm font-semibold">Installment</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    50% now, 50% later
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="text-xs font-bold">
                      Now: {formatCurrency(basePaymentAmount * 0.5, "PHP")}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Later: {formatCurrency(basePaymentAmount * 0.5, "PHP")}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Payment Amount Display */}
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Payment Amount</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {paymentType === "installment" 
                    ? "Pay 50% now. Remaining 50% can be paid later."
                    : "Pay for items only. Shipping will be paid separately when you request shipping."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#FF85A2]">
                  {formatCurrency(
                    paymentType === "installment" 
                      ? basePaymentAmount * 0.5 - actualWalletAmount
                      : paymentAmount, 
                    "PHP"
                  )}
                </p>
                {actualWalletAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (Wallet: {formatCurrency(actualWalletAmount, "PHP")})
                  </p>
                )}
              </div>
            </div>
          </div>

          <QRPayment
            amount={paymentAmount}
            orderId={orderId || "temp-order-id"}
            paymentType={paymentType === "balance" ? "balance" : paymentType === "installment" ? "downpayment" : "full"}
            downpaymentAmount={paymentType === "installment" ? installmentAmount : undefined}
            balance={balance}
            onPaymentComplete={handlePaymentComplete}
            bankTypes={bankTypes.length > 0 ? bankTypes : undefined}
            useWallet={useWalletBalance}
            walletAmount={actualWalletAmount}
            customerEmail={user?.email || ""}
            customerName={user?.name || ""}
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

