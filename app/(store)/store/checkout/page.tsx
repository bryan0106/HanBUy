"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { cartService, orderService, productService } from "@/services/api";
import type { CartItem } from "@/services/api";
import { Button } from "@/components/ui/button";

interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
  });
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
      const cartItemsData = await cartService.getCartItems(user.id);

      // Fetch product details for each cart item to get images
      const cartItemsWithImages = await Promise.all(
        cartItemsData.map(async (item) => {
          if (item.image_url || (item.product && item.product.images && item.product.images.length > 0)) {
            return item;
          }

          try {
            const product = await productService.getProduct(item.product_id);
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

      // Load user address if available
      if (user?.address) {
        setShippingAddress({
          street: user.address.street || "",
          city: user.address.city || "",
          province: user.address.province || "",
          zipCode: user.address.zipCode || "",
          country: user.address.country || "Philippines",
        });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotalKRW = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalPHP = subtotalKRW * 0.042; // Convert KRW to PHP

    // Calculate ISF and LSF
    const isf = 300.00; // International Service Fee (fixed for now)
    const lsf = boxTypePreference === "shared" ? 150.00 : 200.00; // Local Service Fee
    const shippingFee = isf + lsf;
    const soloShippingFee = 200.00;
    const sharedShippingFee = 150.00;
    const total = subtotalPHP + shippingFee;

    return {
      subtotalKRW,
      subtotalPHP,
      isf,
      lsf,
      shippingFee,
      soloShippingFee,
      sharedShippingFee,
      total,
    };
  };

  const handleCreateOrder = async () => {
    if (!user?.id) {
      alert("Please login to continue");
      return;
    }

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.zipCode) {
      alert("Please fill in all shipping address fields");
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
        product_name: item.product_name,
        product_type: item.product_type,
        quantity: item.quantity,
        unit_price: item.price * 0.042, // Convert to PHP
        total: (item.price * item.quantity) * 0.042, // Convert to PHP
        image_url: item.image_url || (item.product?.images?.[0] || undefined),
        preorder_release_date: null, // TODO: Get from product if preorder
      }));

      // Create order
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
        payment_type: "full" as const, // TODO: Allow user to select
        box_type_preference: boxTypePreference,
        shipping_address: shippingAddress,
        order_items: orderItems,
      };

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      const createdOrder = await orderService.createOrder(orderData);

      console.log('Order created successfully:', createdOrder);

      // Redirect to payment page with order ID
      router.push(`/store/payment?orderId=${createdOrder.id}`);
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
                        {formatCurrency((item.price * item.quantity) * 0.042, "PHP")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    placeholder="Manila"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Province</label>
                  <input
                    type="text"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    placeholder="Metro Manila"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Zip Code</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    placeholder="1000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Box Type Preference */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Box Type</h2>
            <div className="space-y-2">
              <button
                onClick={() => setBoxTypePreference("solo")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  boxTypePreference === "solo"
                    ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                    : "border-border bg-background hover:bg-grey-50"
                }`}
              >
                <div className="font-semibold">Solo Box</div>
                <div className="text-sm text-muted-foreground">
                  Full shipping fee: {formatCurrency(totals.soloShippingFee, "PHP")}
                </div>
              </button>
              <button
                onClick={() => setBoxTypePreference("shared")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  boxTypePreference === "shared"
                    ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                    : "border-border bg-background hover:bg-grey-50"
                }`}
              >
                <div className="font-semibold">Shared Box</div>
                <div className="text-sm text-muted-foreground">
                  Reduced shipping fee: {formatCurrency(totals.sharedShippingFee, "PHP")}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(totals.subtotalPHP, "PHP")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ISF</span>
                <span className="font-medium">
                  {formatCurrency(totals.isf, "PHP")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LSF</span>
                <span className="font-medium">
                  {formatCurrency(totals.lsf, "PHP")}
                </span>
              </div>
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-soft-blue-600">
                    {formatCurrency(totals.total, "PHP")}
                  </span>
                </div>
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
