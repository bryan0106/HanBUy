"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { cartService } from "@/services/cartService";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { calculateShippingFee } from "@/lib/shipping";
import { QRPayment } from "@/components/payment/QRPayment";
import { utilityService, type BankType } from "@/services/utilityService";
import { orderService } from "@/services/orderService";
import { mockPreorderProducts } from "@/lib/mockPreorderData";
import toast from "react-hot-toast";
import { shouldUseMockData } from "@/utils/env";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { balance: walletBalance, loading: walletLoading, refetch: refetchWallet } = useWallet(user?.id);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");
  const [boxSize, setBoxSize] = useState<"small" | "medium" | "large">("medium");
  const [selectedSharedBoxId, setSelectedSharedBoxId] = useState<string | null>(null);
  const [paymentOption, setPaymentOption] = useState<"split" | "full">("split");
  const [bankTypes, setBankTypes] = useState<BankType[]>([]);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderCreateError, setOrderCreateError] = useState<string | undefined>(undefined);
  const [shippingAddress, setShippingAddress] = useState({
    country: "Philippines",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalCode: "",
    city: "",
    province: "",
    region: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/checkout-payment");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCart();
      loadBoxPreferences();
      loadBanks();
      loadShippingAddress();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadShippingAddress = () => {
    if (user?.address) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || "",
        lastName: user.name?.split(' ').slice(1).join(' ') || "",
        address: user.address?.street || "",
        apartment: "",
        postalCode: user.address?.zipCode || "",
        city: user.address?.city || "",
        province: user.address?.province || "",
        region: user.address?.region || "",
        phone: user.phone || "",
      }));
    }
    // Also try to load from sessionStorage if available
    if (typeof window !== 'undefined') {
      const savedAddress = sessionStorage.getItem('shippingAddress');
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress);
          setShippingAddress(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Error parsing shipping address:", e);
        }
      }
    }
  };

  const formatAddress = () => {
    const parts = [
      shippingAddress.address,
      shippingAddress.apartment,
      shippingAddress.postalCode,
      shippingAddress.city,
      shippingAddress.region,
      shippingAddress.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const loadBoxPreferences = () => {
    if (typeof window !== 'undefined') {
      const savedBoxType = sessionStorage.getItem('boxTypePreference');
      if (savedBoxType === 'solo' || savedBoxType === 'shared') {
        setBoxTypePreference(savedBoxType);
        // Solo box: force 1-time payment only
        if (savedBoxType === 'solo') {
          setPaymentOption('full');
        }
      }
      const savedBoxSize = sessionStorage.getItem('boxSize');
      if (savedBoxSize === 'small' || savedBoxSize === 'medium' || savedBoxSize === 'large') {
        setBoxSize(savedBoxSize);
      }
      const savedSharedBoxId = sessionStorage.getItem('selectedSharedBoxId');
      if (savedSharedBoxId) {
        setSelectedSharedBoxId(savedSharedBoxId);
      }
    }
  };

  const loadBanks = async () => {
    try {
      const banks = await utilityService.getBankTypes();
      setBankTypes(banks);
      console.log("✅ Bank types loaded:", banks);
    } catch (error) {
      console.warn("Failed to fetch bank types, utilityService will use defaults:", error);
      // utilityService.getBankTypes() now returns defaults, so set empty array
      // QRPayment component will use its DEFAULT_BANKS
      setBankTypes([]);
    }
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartItemsData = await cartService.getCartItems(user?.id || "");
      setCartItems(cartItemsData);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    let subtotalPHP = 0;
    let hasPreorder = false;

    cartItems.forEach((item) => {
      const itemPricePHP = item.product?.price 
        ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
        : ((item.price || 0) * 0.042);
      subtotalPHP += itemPricePHP * item.quantity;
      if (item.product_type === "preorder") {
        hasPreorder = true;
      }
    });

    // Estimate weight and volume
    const estimatedWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0);
    const estimatedVolume = cartItems.reduce((sum, item) => sum + (item.quantity * 0.001), 0);

    // Calculate shipping fees
    const shippingFees = calculateShippingFee(boxTypePreference, estimatedWeight, estimatedVolume);
    
    // For 1-time payment: Include shipping fees
    // For 3-way payment: Only items (shipping paid later)
    const isf = paymentOption === "full" ? shippingFees.isf : 0;
    const lsf = paymentOption === "full" ? shippingFees.lsf : 0;
    const shippingFee = paymentOption === "full" ? shippingFees.total : 0;
    
    // Estimate local shipping (COD) for shared boxes
    const estimatedLocalShipping = boxTypePreference === "shared" && paymentOption === "full" ? 150 : 0;
    
    // Calculate deposit/balance for preorders
    let depositAmount = 0;
    let balanceAmount = 0;
    if (hasPreorder && paymentOption === "split") {
      const preorderItems = cartItems.filter(item => item.product_type === 'preorder');
      const onhandItems = cartItems.filter(item => item.product_type !== 'preorder');
      const preorderTotal = preorderItems.reduce((sum, item) => {
        const itemPricePHP = item.product?.price 
          ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
          : ((item.price || 0) * 0.042);
        return sum + (itemPricePHP * item.quantity);
      }, 0);
      const onhandTotal = onhandItems.reduce((sum, item) => {
        const itemPricePHP = item.product?.price 
          ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
          : ((item.price || 0) * 0.042);
        return sum + (itemPricePHP * item.quantity);
      }, 0);
      depositAmount = (preorderTotal * 0.5) + onhandTotal;
      balanceAmount = preorderTotal * 0.5;
    }

    const total = hasPreorder && paymentOption === "split"
      ? depositAmount
      : paymentOption === "full" 
        ? subtotalPHP + shippingFee + estimatedLocalShipping
        : subtotalPHP;

    return {
      subtotalPHP,
      isf,
      lsf,
      shippingFee,
      estimatedLocalShipping,
      soloShippingFee: shippingFees.soloTotal,
      sharedShippingFee: shippingFees.sharedTotal,
      total,
      depositAmount,
      balanceAmount,
      hasPreorder,
    };
  }, [cartItems, boxTypePreference, paymentOption]);

  const maxWalletUsage = Math.min(walletBalance, totals.total);
  const actualWalletAmount = useWalletBalance ? Math.min(walletAmount, maxWalletUsage) : 0;
  const remainingAmount = Math.max(0, totals.total - actualWalletAmount);

  const orderCreateKey = useMemo(() => {
    // Only create once per cart+selection combination
    const cartKey = cartItems
      .map((i) => `${i.product_id}:${i.quantity}:${i.product_type || ""}`)
      .sort()
      .join("|");
    return [
      user?.id || "",
      cartKey,
      paymentOption,
      boxTypePreference,
      boxTypePreference === "solo" ? boxSize : "",
      boxTypePreference === "shared" ? (selectedSharedBoxId || "") : "",
      // totals included to reflect shipping toggle
      String(totals.subtotalPHP),
      String(totals.isf),
      String(totals.lsf),
      String(totals.shippingFee),
      String(totals.total),
    ].join("::");
  }, [
    user?.id,
    cartItems,
    paymentOption,
    boxTypePreference,
    boxSize,
    selectedSharedBoxId,
    totals.subtotalPHP,
    totals.isf,
    totals.lsf,
    totals.shippingFee,
    totals.total,
  ]);

  const lastCreatedKeyRef = useRef<string | null>(null);

  // Create order once cart + selections are ready
  useEffect(() => {
    const createOrder = async () => {
      if (!user?.id) return;
      if (cartItems.length === 0) return;
      if (creatingOrder) return;
      if (createdOrderId) return;
      if (lastCreatedKeyRef.current === orderCreateKey) return;

      lastCreatedKeyRef.current = orderCreateKey;
      setOrderCreateError(undefined);
      setCreatingOrder(true);
      let orderData: unknown = undefined;
      try {
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Prepare order items with preorder release dates
        const orderItems = await Promise.all(
          cartItems.map(async (item) => {
            let preorderReleaseDate: string | undefined = undefined;
            
            if (item.product_type === 'preorder') {
              try {
                const product = mockPreorderProducts.find(p => p.id === item.product_id);
                if (product && product.release_date) {
                  preorderReleaseDate = new Date(product.release_date).toISOString();
                }
              } catch (error) {
                console.warn('Could not fetch product details for preorder:', error);
              }
            }

            const itemPricePHP = item.product?.price 
              ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
              : ((item.price || 0) * 0.042);

            return {
              product_id: item.product_id,
              product_name: item.product_name || item.product?.name || "Unknown Product",
              product_type: item.product_type || "onhand",
              quantity: item.quantity,
              unit_price: itemPricePHP,
              total: itemPricePHP * item.quantity,
              image_url: item.image_url || item.product?.images?.[0],
              preorder_release_date: preorderReleaseDate,
            };
          })
        );

        const shippingAddressObj = {
          street: "",
          city: "",
          province: "",
          zipCode: "",
          country: "Philippines",
          region: "",
        };

        if (typeof window !== 'undefined') {
          const savedAddress = sessionStorage.getItem('shippingAddress');
          if (savedAddress) {
            try {
              const parsed = JSON.parse(savedAddress);
              Object.assign(shippingAddressObj, {
                street: parsed.address || "",
                city: parsed.city || "",
                province: parsed.province || "",
                zipCode: parsed.postalCode || "",
                country: parsed.country || "Philippines",
                region: parsed.region || "",
              });
            } catch (e) {
              console.error("Error parsing shipping address:", e);
            }
          }
        }

        const hasPreorder = orderItems.some(item => item.product_type === 'preorder');

        orderData = {
          user_id: user.id,
          order_number: orderNumber,
          subtotal: totals.subtotalPHP,
          isf: paymentOption === "full" ? totals.isf : 0,
          lsf: paymentOption === "full" ? totals.lsf : 0,
          shipping_fee: paymentOption === "full" ? totals.shippingFee : 0,
          solo_shipping_fee: totals.soloShippingFee,
          shared_shipping_fee: totals.sharedShippingFee,
          total: paymentOption === "full" ? totals.total : totals.subtotalPHP,
          currency: "PHP" as const,
          status: "pending",
          payment_status: "pending",
          payment_type: paymentOption === "full" ? ("full_payment" as const) : ("item_only" as const),
          box_type_preference: boxTypePreference,
          box_size: boxTypePreference === "solo" ? boxSize : undefined,
          shared_box_id: boxTypePreference === "shared" ? selectedSharedBoxId || undefined : undefined,
          shipping_address: shippingAddressObj,
          storage_status: paymentOption === "full" ? ("shipping_requested" as const) : ("pending" as const),
          shipping_payment_status: paymentOption === "full" ? ("paid" as const) : undefined,
          shipping_requested_at: paymentOption === "full" ? new Date().toISOString() : undefined,
          order_items: orderItems,
          customer_message: typeof window !== 'undefined' ? (sessionStorage.getItem('order_message') || undefined) : undefined,
        };

        const createdOrder = await orderService.createOrder(orderData as any);
        
        // Validate and extract order id from order response
        // Normalize order ID: extract UUID from order-<uuid>-<suffix> format if needed
        if (!createdOrder.id) {
          throw new Error("Order created but missing order ID");
        }
        
        let orderId = createdOrder.id.trim();
        
        // Normalize: extract UUID from order-<uuid>-<timestamp> format
        if (orderId.startsWith('order-')) {
          const uuidMatch = orderId.match(/^order-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
          if (uuidMatch) {
            orderId = uuidMatch[1]; // Extract just the UUID
            console.log('📝 Normalized order ID:', { original: createdOrder.id, normalized: orderId });
          }
        }
        
        // Validate UUID format only in real API mode
        if (!shouldUseMockData()) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(orderId)) {
            console.error("Invalid order ID format after normalization:", { original: createdOrder.id, normalized: orderId });
            console.error("Full order response:", createdOrder);
            throw new Error(`Invalid order ID format: ${createdOrder.id}. Expected UUID format.`);
          }
        }
        
        setCreatedOrderId(orderId);
        console.log("✅ Order created successfully with ID:", orderId);
        
        // Clear cart after order is successfully created
        try {
          await cartService.clearCart();
          console.log("✅ Cart cleared after order creation");
        } catch (cartError) {
          console.error("⚠️ Failed to clear cart, but order was created:", cartError);
          // Don't throw - order was successful, cart clearing is secondary
        }
        
        toast.success("Order created successfully!");
      } catch (error: any) {
        console.error("Error creating order:", error);
        console.error("Order data that failed:", orderData);
        
        // Extract detailed error message
        let errorMessage = "Failed to create order. Please try again.";
        
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Add status code if available
        if (error?.response?.status) {
          console.error(`API Error Status: ${error.response.status}`);
          if (error.response.status === 400) {
            errorMessage += " (Validation error - check your order data)";
          } else if (error.response.status === 401) {
            errorMessage += " (Authentication error - please login again)";
          } else if (error.response.status === 500) {
            errorMessage += " (Server error - please try again later)";
          }
        }
        
        setOrderCreateError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setCreatingOrder(false);
      }
    };

    createOrder();
  }, [user?.id, cartItems.length, creatingOrder, createdOrderId, orderCreateKey]);

  const handlePaymentComplete = async (paymentId?: string) => {
    setProcessing(true);
    try {
      // Clear cart only after payment is confirmed
      // Note: Cart will be cleared by backend after payment verification
      
      // Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('boxTypePreference');
        sessionStorage.removeItem('boxSize');
        sessionStorage.removeItem('selectedSharedBoxId');
        sessionStorage.removeItem('order_message');
        sessionStorage.removeItem('shippingAddress');
      }

      // Refresh wallet
      await refetchWallet();

      toast.success("Payment proof uploaded! Awaiting admin verification.");
      router.push("/store/orders");
    } catch (error) {
      console.error("Error completing payment:", error);
      toast.error("Error processing payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading || walletLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading payment...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add items to your cart before checkout
          </p>
          <Button onClick={() => router.push("/store/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/store/cart" className="hover:text-foreground cursor-pointer">Cart</Link>
        <span>/</span>
        <Link href="/store/checkout" className="hover:text-foreground cursor-pointer">Information</Link>
        <span>/</span>
        <Link href="/store/shipping" className="hover:text-foreground cursor-pointer">Shipping</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Payment</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            {/* Ship to */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ship to</p>
                <p className="text-sm text-foreground">{formatAddress()}</p>
              </div>
              <Link href="/store/checkout" className="text-sm text-[#FF85A2] hover:underline">
                Change
              </Link>
            </div>
            
            {/* Shipping method */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping method</p>
                <div className="text-sm text-foreground">
                  <div className="font-medium">
                    {boxTypePreference === "solo" ? "Solo Box" : "Shared Box"}
                    {boxTypePreference === "solo" && ` (${boxSize.charAt(0).toUpperCase() + boxSize.slice(1)})`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {paymentOption === "full" 
                      ? formatCurrency(totals.shippingFee, "PHP")
                      : boxTypePreference === "solo"
                      ? formatCurrency(totals.soloShippingFee, "PHP")
                      : formatCurrency(totals.sharedShippingFee, "PHP")}
                  </div>
                </div>
              </div>
              <Link href="/store/shipping" className="text-sm text-[#FF85A2] hover:underline">
                Change
              </Link>
            </div>
          </div>

          <h1 className="text-2xl font-bold">Payment</h1>

          {/* Payment Option Selection */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Option</h2>
            {boxTypePreference === "solo" ? (
              // Solo box: Only 1-time payment
              <div className="rounded-lg border-2 border-[#FF85A2] bg-[#FFF5F7] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">1-Time Payment</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Pay everything now (items + shipping)
                    </div>
                  </div>
                  <div className="font-semibold text-[#FF85A2]">
                    {formatCurrency(totals.total, "PHP")}
                  </div>
                </div>
              </div>
            ) : (
              // Shared box: Both 3-way and 1-time payment in a row
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption("split")}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    paymentOption === "split"
                      ? "border-[#FF85A2] bg-[#FFF5F7]"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="font-semibold">3-Way Payment</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pay items now, shipping later
                      </div>
                    </div>
                    <div className="font-semibold text-[#FF85A2] mt-2">
                      {formatCurrency(totals.subtotalPHP, "PHP")}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption("full")}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    paymentOption === "full"
                      ? "border-[#FF85A2] bg-[#FFF5F7]"
                      : "border-border bg-background hover:bg-grey-50"
                  }`}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="font-semibold">1-Time Payment</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pay everything now (items + shipping)
                      </div>
                    </div>
                    <div className="font-semibold text-[#FF85A2] mt-2">
                      {formatCurrency(totals.total, "PHP")}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Wallet Balance */}
          {walletBalance > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Wallet Balance</h2>
                  <p className="text-2xl font-bold text-green-600">
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
                      setWalletAmount(Math.min(walletBalance, totals.total));
                    } else {
                      setWalletAmount(0);
                    }
                  }}
                  className="rounded border-border"
                />
                <span className="text-sm">Use wallet balance</span>
              </label>
              {useWalletBalance && (
                <div className="mt-4">
                  <label className="block text-sm mb-2">
                    Amount to use (max: {formatCurrency(maxWalletUsage, "PHP")})
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
                    className="w-full rounded-lg border border-border px-4 py-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Amount & QR Code */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Amount</h2>
            <div className="mb-6 text-center">
              <p className="text-3xl font-bold text-[#FF85A2]">
                {formatCurrency(remainingAmount, "PHP")}
              </p>
              {actualWalletAmount > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  (Wallet: -{formatCurrency(actualWalletAmount, "PHP")})
                </p>
              )}
            </div>
            {creatingOrder ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">Creating order...</p>
              </div>
            ) : createdOrderId ? (
              <QRPayment
                amount={remainingAmount}
                orderId={createdOrderId}
                paymentType={paymentOption === "full" ? "full_payment" : "item_only"}
                subtotal={totals.subtotalPHP}
                isf={totals.isf}
                lsf={totals.lsf}
                onPaymentComplete={handlePaymentComplete}
                bankTypes={bankTypes.length > 0 ? bankTypes : undefined}
                useWallet={useWalletBalance}
                walletAmount={actualWalletAmount}
                customerEmail={user?.email || ""}
                customerName={user?.name || ""}
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-error">Failed to Create Order</h3>
                <p className="mb-4 text-sm text-muted-foreground whitespace-pre-line">
                  {orderCreateError || "Failed to create order. Please try again."}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // allow retry
                      lastCreatedKeyRef.current = null;
                      setCreatedOrderId(null);
                      setOrderCreateError(undefined);
                    }}
                  >
                    Retry Create Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push("/store/cart");
                    }}
                  >
                    Return to Cart
                  </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Check browser console for detailed error information
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            
            {/* Product List */}
            <div className="mb-6 space-y-4">
              {cartItems.map((item) => {
                const itemPricePHP = item.product?.price 
                  ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
                  : ((item.price || 0) * 0.042);
                const itemTotalPHP = itemPricePHP * item.quantity;
                
                return (
                  <div key={item.id} className="flex gap-3">
                    {item.image_url || (item.product && item.product.images && item.product.images.length > 0) ? (
                      <img
                        src={item.image_url || (item.product?.images?.[0] || '')}
                        alt={item.product_name}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-grey-200 border border-border"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{item.product_name}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(itemTotalPHP, "PHP")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Totals */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotalPHP, "PHP")}</span>
              </div>
              {paymentOption === "full" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatCurrency(totals.shippingFee, "PHP")}</span>
                </div>
              )}
              {useWalletBalance && actualWalletAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Wallet Payment</span>
                  <span>-{formatCurrency(actualWalletAmount, "PHP")}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-base font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(remainingAmount, "PHP")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

