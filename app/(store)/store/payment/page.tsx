"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bankTypes, setBankTypes] = useState<BankType[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "downpayment" | "balance">("full");
  const [downpaymentAmount, setDownpaymentAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const orderId = searchParams.get("orderId");
  const paymentTypeParam = searchParams.get("type"); // "balance", "shipping", "item_only", "local_shipping"

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
            const shippingFee = fetchedOrder.solo_shipping_fee || fetchedOrder.shared_shipping_fee || 0;
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
    }
  }, [isAuthenticated, authLoading, router, loadData]);

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
      // 3. For local shipping: Save selected courier
      // 4. Generate QR code with pre-identified amount
      
      if (paymentTypeParam === "local_shipping" && selectedCourier) {
        const courier = couriers.find(c => c.id === selectedCourier);
        alert(`Payment submitted! Your order will be delivered via ${courier?.name || 'selected courier'}. Manila admin will verify your payment.`);
      } else {
        alert("Payment submitted! Manila admin will verify your payment.");
      }
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
    : paymentType === "balance"
    ? existingOrder?.balance || 0
    : 0;
  const paymentAmount = paymentType === "downpayment" 
    ? downpaymentAmount 
    : paymentType === "balance"
    ? existingOrder?.balance || orderSummary?.total || 0
    : orderSummary?.total || 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {paymentTypeParam === "local_shipping"
            ? "Pay Local Shipping"
            : paymentTypeParam === "shipping" 
            ? "Pay Shipping Fee" 
            : paymentType === "balance" 
            ? "Pay Balance" 
            : "Payment"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {paymentTypeParam === "local_shipping"
            ? "Pay local shipping fee from Manila office to your address"
            : paymentTypeParam === "shipping"
            ? "Pay shipping fee from Korea to Manila office"
            : paymentType === "balance"
            ? "Pay your remaining balance for this order"
            : "Complete your payment to confirm your order"}
        </p>
        {paymentTypeParam === "local_shipping" && existingOrder && (
          <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-800">
              <strong>Order:</strong> {existingOrder.order_number || existingOrder.orderNumber}
            </p>
            <p className="text-sm text-orange-800">
              <strong>Local Shipping Fee:</strong> {formatCurrency(
                existingOrder.cod_amount || 0, 
                "PHP"
              )}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Items have arrived at Manila office. Pay local shipping to receive at your address.
            </p>
          </div>
        )}
        {paymentTypeParam === "shipping" && existingOrder && (
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800">
              <strong>Order:</strong> {existingOrder.order_number || existingOrder.orderNumber}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Shipping Fee:</strong> {formatCurrency(
                existingOrder.solo_shipping_fee || existingOrder.shared_shipping_fee || 0, 
                "PHP"
              )}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Items are ready to ship once payment is confirmed
            </p>
          </div>
        )}
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
              {paymentTypeParam === "local_shipping" && selectedCourier && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Company</p>
                  <p className="font-semibold text-orange-900">
                    {couriers.find(c => c.id === selectedCourier)?.name || "Not selected"}
                  </p>
                  {couriers.find(c => c.id === selectedCourier)?.estimatedDays && (
                    <p className="text-xs text-orange-700 mt-1">
                      Est. {couriers.find(c => c.id === selectedCourier)?.estimatedDays} day{couriers.find(c => c.id === selectedCourier)?.estimatedDays && couriers.find(c => c.id === selectedCourier)!.estimatedDays! > 1 ? 's' : ''} delivery
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Type Selection - Only show if not balance, shipping, or local_shipping payment */}
            {paymentType !== "balance" && paymentTypeParam !== "shipping" && paymentTypeParam !== "local_shipping" && (
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
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-2">
          {/* Courier Selection for Local Shipping */}
          {paymentTypeParam === "local_shipping" && couriers.length > 0 && (
            <div className="mb-6 rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Select Delivery Company</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Choose your preferred delivery company for local shipping from Manila office to your address.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {couriers.map((courier) => (
                  <button
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier.id)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedCourier === courier.id
                        ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                        : "border-border bg-background hover:border-soft-blue-300 hover:bg-soft-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-grey-900">{courier.name}</h4>
                      {selectedCourier === courier.id && (
                        <svg className="h-5 w-5 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {courier.description && (
                      <p className="text-xs text-grey-600 mb-2">{courier.description}</p>
                    )}
                    {courier.estimatedDays && (
                      <div className="flex items-center gap-1 text-xs text-grey-500">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Est. {courier.estimatedDays} day{courier.estimatedDays > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {!selectedCourier && (
                <p className="mt-4 text-sm text-orange-600">
                  ⚠️ Please select a delivery company to continue
                </p>
              )}
            </div>
          )}

          <QRPayment
            amount={paymentAmount}
            orderId={orderId || "temp-order-id"}
            paymentType={paymentType === "balance" ? "balance" : paymentType}
            downpaymentAmount={paymentType === "balance" ? paymentAmount : downpaymentAmount}
            balance={balance}
            subtotal={paymentType === "balance" ? (existingOrder?.subtotal || 0) : orderSummary.subtotal}
            isf={paymentType === "balance" ? (existingOrder?.isf || 0) : orderSummary.isf}
            lsf={paymentType === "balance" ? (existingOrder?.lsf || 0) : orderSummary.lsf}
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

