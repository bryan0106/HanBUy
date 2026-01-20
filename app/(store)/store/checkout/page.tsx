"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { cartService } from "@/services/cartService";
import { userService } from "@/services";
import { mockOrderService } from "@/lib/mockOrdersData";
import { mockProducts } from "@/lib/mockData";
import { mockPreorderProducts } from "@/lib/mockPreorderData";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import { calculateShippingFee } from "@/lib/shipping";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user, refetch: refetchUser } = useAuth();
  const { balance: walletBalance, loading: walletLoading } = useWallet(user?.id);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"split" | "full">("split"); // "split" = 3-way, "full" = 1-time
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
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
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/checkout");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCart();
      // Load saved address from user if available
      if (user.address) {
        setShippingAddress({
          country: user.address.country || "Philippines",
          firstName: user.name?.split(' ')[0] || "",
          lastName: user.name?.split(' ').slice(1).join(' ') || "",
          address: user.address.street || "",
          apartment: "",
          postalCode: user.address.zipCode || "",
          city: user.address.city || "",
          province: user.address.province || "",
          region: user.address.region || "",
          phone: user.phone || "",
        });
        // Auto-check "save address" if user already has a saved address
        setSaveAddressForNextTime(true);
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Use mock cart service - no API call
      const cartItemsData = await cartService.getCartItems(user.id);

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
          street: shippingAddress.address + (shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ""),
          city: shippingAddress.city,
          province: shippingAddress.province || shippingAddress.city,
          zipCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        storage_status: paymentOption === "full" ? "shipping_requested" as const : "pending" as const,
        ...(hasPreorder && {
          preorder_status: "pending_approval" as const,
        }),
        ...(paymentOption === "full" && {
          shipping_payment_status: "paid" as const,
          shipping_requested_at: new Date().toISOString(),
        }),
        order_items: orderItems,
        customer_message: typeof window !== 'undefined' ? (sessionStorage.getItem('order_message') || undefined) : undefined,
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
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Cart</span>
        <span>/</span>
        <span className="text-foreground font-medium">Information</span>
        <span>/</span>
        <span className="hover:text-foreground cursor-pointer">Shipping</span>
        <span>/</span>
        <span className="hover:text-foreground cursor-pointer">Payment</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping address</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Country/Region</label>
                <select
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                >
                  <option value="Philippines">Philippines</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">First name</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Last name</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                  placeholder="Address"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  * Please enter your address correctly!
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  type="text"
                  value={shippingAddress.apartment}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Postal code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                    placeholder="Postal code"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                    placeholder="City"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Region</label>
                <select
                  value={shippingAddress.region}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                >
                  <option value="">Select Region</option>
                  <option value="Metro Manila">Metro Manila</option>
                  <option value="Camarines Norte">Camarines Norte</option>
                  <option value="Camarines Sur">Camarines Sur</option>
                  <option value="Albay">Albay</option>
                  <option value="Sorsogon">Sorsogon</option>
                  <option value="Catanduanes">Catanduanes</option>
                  <option value="Masbate">Masbate</option>
                  <option value="Laguna">Laguna</option>
                  <option value="Cavite">Cavite</option>
                  <option value="Batangas">Batangas</option>
                  <option value="Rizal">Rizal</option>
                  <option value="Quezon">Quezon</option>
                  <option value="Other">Other</option>
                </select>
                    </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      className="rounded-lg border border-border bg-background px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                      defaultValue="PH"
                    >
                      <option value="PH">🇵🇭 +63</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                    placeholder="Phone number"
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground p-2"
                    title="Help"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Address Saved Indicator */}
            {user?.address && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800">
                    Using your saved address. You can edit it above if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <Link
                href="/store/cart"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Return to cart
              </Link>
              {/* Save Address Option */}
              {!user?.address && (
                <div className="mb-4 rounded-lg border border-border bg-background p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddressForNextTime}
                      onChange={(e) => setSaveAddressForNextTime(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              )}

              <Button
                onClick={async () => {
                  // Save address to user profile if checkbox is checked
                  if (saveAddressForNextTime && user?.id && !savingAddress) {
                    setSavingAddress(true);
                    try {
                      const updatedUser = await userService.updateUser(user.id, {
                        address: {
                          street: shippingAddress.address + (shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ""),
                          city: shippingAddress.city,
                          province: shippingAddress.province || shippingAddress.city,
                          zipCode: shippingAddress.postalCode,
                          country: shippingAddress.country,
                          region: shippingAddress.region,
                        },
                        phone: shippingAddress.phone || user.phone,
                      });
                      
                      // Update user in localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('hanbuy_user', JSON.stringify(updatedUser));
                      }
                      
                      // Refresh user in auth context
                      await refetchUser();
                      
                      toast.success("Address saved for future orders!");
                    } catch (error: any) {
                      console.error("Error saving address:", error);
                      toast.error(error?.message || "Failed to save address, but you can continue");
                    } finally {
                      setSavingAddress(false);
                    }
                  }

                  // Save shipping address to sessionStorage
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
                  }
                  router.push("/store/shipping");
                }}
                disabled={savingAddress}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAddress ? "Saving..." : "Continue to shipping"}
              </Button>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-border bg-card p-6">
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
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  ) : (
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-grey-200 border border-border"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                      {item.product_type === "preorder" ? "Pre-Order" : 
                       item.product_type === "kr_website" ? "KR Website" : "Onhand"}
                    </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(itemTotalPHP, "PHP")}
                      </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

            {/* Discount Code */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Discount code or gift card</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                  placeholder="Discount code"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Apply discount code
                    toast.success("Discount code applied");
                  }}
                  className="shrink-0"
                >
                  Apply
                </Button>
              </div>
          </div>

            {/* Order Totals */}
            <div className="border-t border-border pt-4">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(totals.subtotalPHP, "PHP")}
                </span>
              </div>
                {paymentOption === "full" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {formatCurrency(totals.shippingFee, "PHP")}
                  </span>
                  </div>
                )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-base font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(
                    paymentOption === "full" ? totals.total : totals.subtotalPHP,
                    "PHP"
                  )}
                </span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
