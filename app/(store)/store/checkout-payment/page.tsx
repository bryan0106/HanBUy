"use client";

import { useState, useEffect, useMemo } from "react";
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
import { mockOrderService } from "@/lib/mockOrdersData";

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
    } catch (error) {
      console.warn("Failed to fetch bank types, using defaults:", error);
      setBankTypes([
        { code: "BPI", name: "BPI" },
        { code: "BDO", name: "BDO" },
        { code: "GCASH", name: "GCash" },
        { code: "GOTYME", name: "GoTyme" },
        { code: "MAYA", name: "Maya" },
      ]);
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

  const handlePaymentComplete = async () => {
    setProcessing(true);
    try {
      // Create order
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price || 0,
        product_type: item.product_type,
      }));

      const shippingAddress = {
        street: "",
        city: "",
        province: "",
        zipCode: "",
        country: "Philippines",
        region: "",
        phone: "",
      };

      if (typeof window !== 'undefined') {
        const savedAddress = sessionStorage.getItem('shippingAddress');
        if (savedAddress) {
          try {
            Object.assign(shippingAddress, JSON.parse(savedAddress));
          } catch (e) {
            console.error("Error parsing shipping address:", e);
          }
        }
      }

      const orderData = {
        user_id: user?.id || "",
        order_number: orderNumber,
        items: orderItems,
        subtotal: totals.subtotalPHP,
        isf: totals.isf,
        lsf: totals.lsf,
        shipping_fee: totals.shippingFee,
        solo_shipping_fee: totals.soloShippingFee,
        shared_shipping_fee: totals.sharedShippingFee,
        total: totals.total,
        currency: "PHP" as const,
        status: "pending",
        payment_status: "pending",
        payment_type: paymentOption === "full" ? ("full_payment" as const) : ("item_only" as const),
        box_type_preference: boxTypePreference,
        box_size: boxTypePreference === "solo" ? boxSize : undefined,
        shared_box_id: boxTypePreference === "shared" ? selectedSharedBoxId : undefined,
        shipping_address: shippingAddress,
        customer_message: typeof window !== 'undefined' ? (sessionStorage.getItem('order_message') || undefined) : undefined,
      };

      const createdOrder = await mockOrderService.createOrder(orderData);
      
      // Clear cart
      await cartService.clearCart();
      
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

      alert("Order created successfully! Your payment is being processed.");
      router.push("/store/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
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
            <QRPayment
              amount={remainingAmount}
              orderId={`checkout-${Date.now()}`}
              paymentType={paymentOption === "full" ? "full" : "downpayment"}
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

