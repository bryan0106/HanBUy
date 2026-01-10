"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";

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
      const cartItemsData = await cartService.getCartItems(user.id);

      // Fetch product details for each cart item to get images
      const cartItemsWithImages = await Promise.all(
        cartItemsData.map(async (item) => {
          if (item.image_url || (item.product && item.product.images && item.product.images.length > 0)) {
            return item;
          }

          try {
            const product = await productService.getProductById(item.product_id);
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

    // 3-Way Payment System: Checkout only charges for items
    // Shipping will be paid separately when customer requests shipping
    // No shipping fees in checkout
    const total = subtotalPHP;

    return {
      subtotalKRW,
      subtotalPHP,
      isf: 0, // Will be calculated when shipping is requested
      lsf: 0, // Will be calculated when shipping is requested
      shippingFee: 0, // No shipping fee at checkout
      soloShippingFee: 0,
      sharedShippingFee: 0,
      total, // Only item total
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
      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || item.product?.name || "Unknown Product",
        product_type: item.product_type || "onhand",
        quantity: item.quantity,
        unit_price: (item.price || 0) * 0.042, // Convert to PHP
        total: ((item.price || 0) * item.quantity) * 0.042, // Convert to PHP
        image_url: item.image_url || item.product?.images?.[0],
        preorder_release_date: undefined, // TODO: Get from product if preorder
      }));

      // Create order - New Payment Flow
      // Payment 1: Items only (will be stored after payment)
      // Check if order has preorder items
      const hasPreorder = orderItems.some(item => item.product_type === 'preorder');
      
      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        subtotal: totals.subtotalPHP,
        isf: 0, // Will be calculated when shipping is requested
        lsf: 0, // Will be calculated when shipping is requested
        shipping_fee: 0, // No shipping fee at checkout
        solo_shipping_fee: undefined,
        shared_shipping_fee: undefined,
        total: totals.total, // Only item total
        currency: "PHP" as const,
        status: "pending",
        payment_status: "pending",
        payment_type: "item_only" as const, // Payment for items only
        box_type_preference: "solo" as const, // Default to solo, can be changed when requesting shipping
        shipping_address: {
          street: "",
          city: "",
          province: "",
          zipCode: "",
          country: "Philippines",
        }, // Will be filled when requesting shipping
        storage_status: "pending" as const, // Will be 'in_storage' after payment (onhand) or 'pending_approval' (preorder)
        ...(hasPreorder && {
          preorder_status: "pending_approval" as const,
        }),
        order_items: orderItems,
        customer_message: customerMessage.trim() || undefined,
      };

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      const createdOrder = await orderService.createOrder(orderData);

      console.log('Order created successfully:', createdOrder);

      // Redirect to payment page with order ID and wallet info
      const paymentUrl = useWalletBalance && actualWalletAmount > 0
        ? `/store/payment?orderId=${createdOrder.id}&walletAmount=${actualWalletAmount}`
        : `/store/payment?orderId=${createdOrder.id}`;
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
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mt-4">
                <p className="text-xs text-blue-800 font-medium mb-1">📦 3-Way Payment System</p>
                <p className="text-xs text-blue-700">
                  Pay for items now. Shipping fee will be paid separately when you request shipping.
                </p>
              </div>
              <div className="mt-4 border-t border-border pt-3">
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
                  Items will be stored after payment
                </p>
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
