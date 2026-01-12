"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { mockCartService, mockOrderService } from "@/lib/mockOrdersData";
import { mockProducts } from "@/lib/mockData";
import { mockPreorderProducts } from "@/lib/mockPreorderData";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import { calculateShippingFee } from "@/lib/shipping";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { balance: walletBalance, loading: walletLoading } = useWallet(user?.id);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerMessage, setCustomerMessage] = useState<string>("");
  const [isMessageOpen, setIsMessageOpen] = useState<boolean>(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"split" | "full">("split"); // "split" = 3-way, "full" = 1-time
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/checkout");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCart();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Use mock cart service - no API call
      const cartItemsData = await mockCartService.getCartItems(user.id);

      // Fetch product details for each cart item to get images (from mock data)
      const cartItemsWithImages = await Promise.all(
        cartItemsData.map(async (item) => {
          if (item.image_url || (item.product && item.product.images && item.product.images.length > 0)) {
            return item;
          }

          try {
            // Check mock products first using direct .map() / .find()
            let product = mockProducts.find(p => p.id === item.product_id);
            
            // If not found, check preorder products using direct .find()
            if (!product) {
              product = mockPreorderProducts.find(p => p.id === item.product_id) as any;
            }
            
            if (product && product.images && product.images.length > 0) {
              return {
                ...item,
                image_url: product.images[0],
                product: item.product ? {
                  ...item.product,
                  id: item.product.id || product.id,
                  images: product.images,
                } : {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  currency: product.currency,
                  images: product.images,
                  stock: product.stock,
                },
              };
            }
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error);
          }

          return item;
        })
      );

      setCartItems(cartItemsWithImages);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotalKRW = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    const subtotalPHP = subtotalKRW * 0.042; // Convert KRW to PHP

    // Check if order has preorder items
    const hasPreorder = cartItems.some(item => item.product_type === 'preorder');
    
    // Calculate deposit for preorder items (50% default, or from product)
    let depositAmount = 0;
    let balanceAmount = 0;
    if (hasPreorder && paymentOption === "split") {
      // For preorder with split payment, only charge deposit now
      const preorderItems = cartItems.filter(item => item.product_type === 'preorder');
      const preorderTotal = preorderItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity * 0.042), 0);
      const onhandItems = cartItems.filter(item => item.product_type !== 'preorder');
      const onhandTotal = onhandItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity * 0.042), 0);
      
      // Preorder: 50% deposit, onhand: 100% (full payment)
      depositAmount = (preorderTotal * 0.5) + onhandTotal;
      balanceAmount = preorderTotal * 0.5;
    }

    // Estimate weight and volume for shipping calculation
    const estimatedWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // 0.5kg per item
    const estimatedVolume = cartItems.reduce((sum, item) => sum + (item.quantity * 0.001), 0); // 0.001 CBM per item

    // Calculate shipping fees
    const shippingFees = calculateShippingFee(boxTypePreference, estimatedWeight, estimatedVolume);
    
    // For 1-time payment: Include shipping fees
    // For 3-way payment: Only items (shipping paid later)
    const isf = paymentOption === "full" ? shippingFees.isf : 0;
    const lsf = paymentOption === "full" ? shippingFees.lsf : 0;
    const shippingFee = paymentOption === "full" ? shippingFees.total : 0;
    
    // Estimate local shipping (COD) for shared boxes - this is approximate
    const estimatedLocalShipping = boxTypePreference === "shared" ? 150 : 0; // Approximate COD fee
    
    // For preorder with split payment: Only deposit
    // For full payment: Everything upfront
    // For regular items: Full price
    const total = hasPreorder && paymentOption === "split"
      ? depositAmount
      : paymentOption === "full" 
        ? subtotalPHP + shippingFee + estimatedLocalShipping
        : subtotalPHP;

    return {
      subtotalKRW,
      subtotalPHP,
      isf,
      lsf,
      shippingFee,
      soloShippingFee: shippingFees.soloTotal,
      sharedShippingFee: shippingFees.sharedTotal,
      estimatedLocalShipping,
      total,
      depositAmount,
      balanceAmount,
      hasPreorder,
    };
  };

  const handleCreateOrder = async () => {
    if (!user?.id) {
      alert("Please login to continue");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      router.push("/store/orders");
      return;
    }

    setProcessing(true);

    try {
      const totals = calculateTotals();

      // Generate order number
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Prepare order items
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          // Get product details to check if it's preorder and get release date
          let preorderReleaseDate: string | undefined = undefined;
          let depositPercentage = 50; // Default deposit
          
          if (item.product_type === 'preorder') {
            try {
              // Use mock data - check preorder products using direct .find()
              const product = mockPreorderProducts.find(p => p.id === item.product_id);
              if (product && product.release_date) {
                preorderReleaseDate = new Date(product.release_date).toISOString();
              }
              if (product && product.deposit_percentage) {
                depositPercentage = product.deposit_percentage;
              }
            } catch (error) {
              console.warn('Could not fetch product details for preorder:', error);
            }
          }

          return {
        product_id: item.product_id,
        product_name: item.product_name || item.product?.name || "Unknown Product",
        product_type: item.product_type || "onhand",
        quantity: item.quantity,
        unit_price: (item.price || 0) * 0.042, // Convert to PHP
        total: ((item.price || 0) * item.quantity) * 0.042, // Convert to PHP
        image_url: item.image_url || item.product?.images?.[0],
            preorder_release_date: preorderReleaseDate,
          };
        })
      );

      // Create order - New Payment Flow
      // Payment 1: Items only (will be stored after payment)
      // Check if order has preorder items
      const hasPreorder = orderItems.some(item => item.product_type === 'preorder');
      
      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
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
        shipping_address: {
          street: "",
          city: "",
          province: "",
          zipCode: "",
          country: "Philippines",
        }, // Will be filled when requesting shipping
        storage_status: paymentOption === "full" ? "shipping_requested" as const : "pending" as const,
        ...(hasPreorder && {
          preorder_status: "pending_approval" as const,
        }),
        ...(paymentOption === "full" && {
          shipping_payment_status: "paid" as const,
          shipping_requested_at: new Date().toISOString(),
        }),
        order_items: orderItems,
        customer_message: customerMessage.trim() || undefined,
      };

      console.log('Creating order with data (mock):', JSON.stringify(orderData, null, 2));
      
      // Use mock order service - no API call
      const createdOrder = await mockOrderService.createOrder(orderData);

      console.log('Order created successfully (mock):', createdOrder);

      // Redirect to payment page with order ID and wallet info
      const paymentUrl = useWalletBalance && actualWalletAmount > 0
        ? `/store/payment?orderId=${createdOrder.id}&walletAmount=${actualWalletAmount}&type=${paymentOption === "full" ? "full_payment" : "item_only"}`
        : `/store/payment?orderId=${createdOrder.id}&type=${paymentOption === "full" ? "full_payment" : "item_only"}`;
      router.push(paymentUrl);
    } catch (error: any) {
      console.error("Error creating order:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        cause: error.cause
      });
      
      // Show detailed error message
      const errorMessage = error.message || "Unknown error";
      alert(
        `Failed to create order\n\n` +
        `Error: ${errorMessage}\n\n` +
        `Please check the browser console (F12) for more details.`
      );
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
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

  const totals = calculateTotals();
  
  // Calculate wallet usage
  const maxWalletUsage = Math.min(walletBalance, totals.total);
  const actualWalletAmount = useWalletBalance ? Math.min(walletAmount, maxWalletUsage) : 0;
  const remainingAmount = Math.max(0, totals.total - actualWalletAmount);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review your order and shipping details
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.image_url || (item.product && item.product.images && item.product.images.length > 0) ? (
                    <img
                      src={item.image_url || (item.product?.images?.[0] || '')}
                      alt={item.product_name}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.product_type === "preorder" ? "Pre-Order" : 
                       item.product_type === "kr_website" ? "KR Website" : "Onhand"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(((item.price || 0) * item.quantity) * 0.042, "PHP")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Message Accordion */}
          <div className="rounded-lg border border-border bg-card">
            <button
              onClick={() => setIsMessageOpen(!isMessageOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-grey-50 transition-colors"
            >
              <div>
                <h2 className="text-lg font-semibold">Order Message (Optional)</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave a message about your order
                </p>
              </div>
              <svg
                className={`h-5 w-5 text-muted-foreground transition-transform ${isMessageOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMessageOpen && (
              <div className="px-4 pb-4 border-t border-border">
                <p className="mt-4 mb-3 text-sm text-muted-foreground">
                  Leave a message about your order if you have any special instructions or requests.
                </p>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="E.g., Please handle with care, special packaging instructions, etc."
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                  maxLength={500}
                />
                <p className="mt-2 text-xs text-muted-foreground text-right">
                  {customerMessage.length}/500 characters
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(totals.subtotalPHP, "PHP")}
                </span>
              </div>
              {/* Wallet Balance Display */}
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-green-800">💰 Wallet Balance</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(walletBalance, "PHP")}
                    </p>
                  </div>
                </div>
                {walletBalance > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
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
                          className="rounded border-border text-[#FF85A2] focus:ring-[#FF85A2]"
                        />
                        <span className="text-sm text-green-700">
                          Use wallet balance to reduce payment
                        </span>
                      </label>
                      <button
                        onClick={() => {
                          if (!useWalletBalance) {
                            setUseWalletBalance(true);
                            setWalletAmount(Math.min(walletBalance, totals.total));
                          } else {
                            setUseWalletBalance(false);
                            setWalletAmount(0);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          useWalletBalance
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-[#FF85A2] text-white hover:bg-[#FF85A2]/90'
                        }`}
                      >
                        {useWalletBalance ? 'Remove' : 'Use Balance'}
                      </button>
                    </div>
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
                            <span>{formatCurrency(totals.total, "PHP")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wallet Payment:</span>
                            <span>-{formatCurrency(actualWalletAmount, "PHP")}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-green-300 pt-1 mt-1">
                            <span>Remaining to Pay:</span>
                            <span>{formatCurrency(remainingAmount, "PHP")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-green-700 mt-1">
                    No wallet balance available
                  </p>
                )}
              </div>
              {/* Payment Option Selection */}
              <div className="rounded-lg border border-border bg-card p-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Payment Option</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("split")}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                      paymentOption === "split"
                        ? "border-pink-500 bg-pink-50"
                        : "border-border bg-background hover:bg-grey-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">3-Way Payment</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Pay items now, shipping later
                        </div>
                      </div>
                      <div className="text-xs font-medium text-pink-600">
                        {formatCurrency(totals.subtotalPHP, "PHP")}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption("full")}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                      paymentOption === "full"
                        ? "border-pink-500 bg-pink-50"
                        : "border-border bg-background hover:bg-grey-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">1-Time Payment</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Pay everything now (items + shipping)
                        </div>
                      </div>
                      <div className="text-xs font-medium text-pink-600">
                        {formatCurrency(totals.total, "PHP")}
                      </div>
                    </div>
                  </button>
                </div>
                
                {paymentOption === "full" && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-2">Box Type:</p>
                      <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBoxTypePreference("solo")}
                        className={`flex-1 rounded-lg border p-2 text-xs transition-colors ${
                          boxTypePreference === "solo"
                            ? "border-pink-500 bg-pink-50 font-semibold"
                            : "border-border bg-background"
                        }`}
                      >
                        Solo Box
                      </button>
                      <button
                        type="button"
                        onClick={() => setBoxTypePreference("shared")}
                        className={`flex-1 rounded-lg border p-2 text-xs transition-colors ${
                          boxTypePreference === "shared"
                            ? "border-pink-500 bg-pink-50 font-semibold"
                            : "border-border bg-background"
                        }`}
                      >
                        Shared Box (Save {formatCurrency(totals.soloShippingFee - totals.sharedShippingFee, "PHP")})
                      </button>
                    </div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 p-2 mt-2">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{formatCurrency(totals.subtotalPHP, "PHP")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping (Korea → Manila):</span>
                          <span>{formatCurrency(totals.isf, "PHP")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Local Shipping (Manila → You):</span>
                          <span>{formatCurrency(totals.lsf, "PHP")}</span>
                        </div>
                        {boxTypePreference === "shared" && totals.estimatedLocalShipping > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Estimated COD Fee:</span>
                            <span>{formatCurrency(totals.estimatedLocalShipping, "PHP")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-border pt-3">
                {totals.hasPreorder && paymentOption === "split" ? (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-pink-50 border border-pink-200 p-3">
                      <p className="text-xs font-semibold text-pink-800 mb-2">📦 Pre-Order Payment</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-pink-700">Deposit (50%):</span>
                          <span className="font-semibold text-pink-800">{formatCurrency(totals.depositAmount, "PHP")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-pink-600">Balance (on release):</span>
                          <span className="text-pink-600">{formatCurrency(totals.balanceAmount, "PHP")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Pay Now (Deposit)</span>
                      <span className="text-xl font-bold text-pink-600">
                        {formatCurrency(remainingAmount, "PHP")}
                      </span>
                    </div>
                    {useWalletBalance && actualWalletAmount > 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        (Wallet: -{formatCurrency(actualWalletAmount, "PHP")})
                      </div>
                    )}
                    <p className="text-xs text-pink-600 mt-2">
                      Pay 50% deposit to secure your pre-order. Balance will be paid when item arrives.
                </p>
              </div>
                ) : (
                  <>
                <div className="flex justify-between">
                  <span className="font-semibold">Total to Pay</span>
                  <span className="text-xl font-bold text-[#FF85A2]">
                    {formatCurrency(remainingAmount, "PHP")}
                  </span>
                </div>
                {useWalletBalance && actualWalletAmount > 0 && (
                  <div className="mt-1 text-xs text-green-600">
                    (Wallet: -{formatCurrency(actualWalletAmount, "PHP")})
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                      {paymentOption === "full" 
                        ? "Items will be shipped directly to you after payment"
                        : "Items will be stored after payment"}
                </p>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={processing}
              className="mt-6 w-full"
            >
              {processing ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
