"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cartService";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { calculateShippingFee } from "@/lib/shipping";
import { boxService, type AvailableSharedBox } from "@/services/boxService";

export default function ShippingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");
  const [boxSize, setBoxSize] = useState<"small" | "medium" | "large">("medium");
  const [availableSharedBoxes, setAvailableSharedBoxes] = useState<AvailableSharedBox[]>([]);
  const [selectedSharedBoxId, setSelectedSharedBoxId] = useState<string | null>(null);
  const [loadingSharedBoxes, setLoadingSharedBoxes] = useState(false);
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
      router.push("/auth/login?redirect=/store/shipping");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCart();
      // Load saved address from user if available
      if (user.address) {
        const address = user.address;
        setShippingAddress(prev => ({
          ...prev,
          firstName: user.name.split(' ')[0] || "",
          lastName: user.name.split(' ').slice(1).join(' ') || "",
          address: address.street || "",
          apartment: "",
          postalCode: address.zipCode || "",
          city: address.city || "",
          province: address.province || "",
          region: address.region || "",
          phone: user.phone || "",
        }));
      }
      // Load box type preference from sessionStorage if available
      if (typeof window !== 'undefined') {
        const savedBoxType = sessionStorage.getItem('boxTypePreference');
        if (savedBoxType === 'solo' || savedBoxType === 'shared') {
          setBoxTypePreference(savedBoxType);
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
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Load available shared boxes when shared box is selected
  useEffect(() => {
    if (boxTypePreference === "shared" && isAuthenticated && user) {
      loadAvailableSharedBoxes();
    }
  }, [boxTypePreference, isAuthenticated, user]);

  const loadAvailableSharedBoxes = async () => {
    setLoadingSharedBoxes(true);
    try {
      const boxes = await boxService.getAvailableSharedBoxes();
      
      // If no boxes available, create a default shared box
      if (boxes.length === 0) {
        try {
          const defaultBox = await boxService.createDefaultSharedBox();
          const defaultBoxWithDetails: AvailableSharedBox = {
            ...defaultBox,
            box_number: defaultBox.box_number || `BOX-${defaultBox.id.slice(-6).toUpperCase()}`,
            status: defaultBox.status || "in_warehouse",
            current_weight: 0,
            current_volume: 0,
            max_weight: 30, // Default max weight
            max_volume: 0.05, // Default max volume (CBM)
            participant_count: 0,
            max_participants: 10,
          };
          setAvailableSharedBoxes([defaultBoxWithDetails]);
          setSelectedSharedBoxId(defaultBoxWithDetails.id);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedSharedBoxId', defaultBoxWithDetails.id);
          }
        } catch (error) {
          console.error("Error creating default shared box:", error);
          // Create a mock default box if API fails
          const mockDefaultBox: AvailableSharedBox = {
            id: `default-shared-${Date.now()}`,
            user_id: user?.id || "",
            box_number: `BOX-${Date.now().toString().slice(-6)}`,
            box_type: "shared",
            status: "in_warehouse",
            items: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            current_weight: 0,
            current_volume: 0,
            max_weight: 30,
            max_volume: 0.05,
            participant_count: 0,
            max_participants: 10,
          };
          setAvailableSharedBoxes([mockDefaultBox]);
          setSelectedSharedBoxId(mockDefaultBox.id);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedSharedBoxId', mockDefaultBox.id);
          }
        }
      } else {
        setAvailableSharedBoxes(boxes);
        // Auto-select first box if available and none selected
        if (!selectedSharedBoxId) {
          setSelectedSharedBoxId(boxes[0].id);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedSharedBoxId', boxes[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading available shared boxes:", error);
      // Create a mock default box on error
      const mockDefaultBox: AvailableSharedBox = {
        id: `default-shared-${Date.now()}`,
        user_id: user?.id || "",
        box_number: `BOX-${Date.now().toString().slice(-6)}`,
        box_type: "shared",
        status: "in_warehouse",
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_weight: 0,
        current_volume: 0,
        max_weight: 30,
        max_volume: 0.05,
        participant_count: 0,
        max_participants: 10,
      };
      setAvailableSharedBoxes([mockDefaultBox]);
      setSelectedSharedBoxId(mockDefaultBox.id);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedSharedBoxId', mockDefaultBox.id);
      }
    } finally {
      setLoadingSharedBoxes(false);
    }
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartItemsData = await cartService.getCartItems(user?.id || "");
      const itemsWithImages = await Promise.all(
        cartItemsData.map(async (item) => {
          if (item.image_url || (item.product && item.product.images && item.product.images.length > 0)) {
            return item;
          }
          // Try to get product image from mock data
          try {
            const product = item.product_id 
              ? await import("@/lib/mockData").then(m => m.mockProducts.find(p => p.id === item.product_id))
              : null;
            if (!product) {
              return item;
            }
            if (product && product.images && product.images.length > 0) {
              return {
                ...item,
                image_url: product.images[0],
                product: item.product ? {
                  id: item.product.id || product.id,
                  name: item.product.name || product.name,
                  price: item.product.price ?? product.price,
                  currency: item.product.currency || product.currency,
                  images: product.images,
                  stock: item.product.stock ?? product.stock,
                  price_conversion_rate: item.product.price_conversion_rate,
                  php_price: item.product.php_price,
                  product_type: item.product.product_type,
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
            console.error("Error loading product image:", error);
          }
          return item;
        })
      );
      setCartItems(itemsWithImages);
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

    // Estimate weight and volume for shipping calculation
    const estimatedWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // 0.5kg per item
    const estimatedVolume = cartItems.reduce((sum, item) => sum + (item.quantity * 0.001), 0); // 0.001 CBM per item

    // Calculate shipping fees for both solo and shared
    const shippingFees = calculateShippingFee(boxTypePreference, estimatedWeight, estimatedVolume);

    return {
      subtotalPHP,
      isf: shippingFees.isf,
      lsf: shippingFees.lsf,
      shippingFee: shippingFees.total,
      soloShippingFee: shippingFees.soloTotal,
      sharedShippingFee: shippingFees.sharedTotal,
      total: subtotalPHP + shippingFees.total,
      hasPreorder,
    };
  }, [cartItems, boxTypePreference]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading shipping options...</p>
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/store/cart" className="hover:text-foreground cursor-pointer">Cart</Link>
        <span>/</span>
        <Link href="/store/checkout" className="hover:text-foreground cursor-pointer">Information</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Shipping</span>
        <span>/</span>
        <span className="text-muted-foreground">Payment</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Shipping Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Ship to</h2>
              <Link href="/store/checkout" className="text-sm text-[#FF85A2] hover:underline">
                Change
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{formatAddress()}</p>
          </div>

          {/* Shipping Method */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping method</h2>
            <div className="space-y-3">
              <div className={`rounded-lg border-2 transition-colors ${
                boxTypePreference === "solo"
                  ? "border-[#FF85A2] bg-[#FFF5F7]"
                  : "border-border bg-background"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setBoxTypePreference("solo");
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('boxTypePreference', 'solo');
                    }
                  }}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Solo Box</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Your items shipped in a dedicated box
                      </div>
                    </div>
                    <div className="font-semibold text-[#FF85A2]">
                      {formatCurrency(totals.soloShippingFee, "PHP")}
                    </div>
                  </div>
                </button>
                
                {/* Box Size Selection for Solo Box - Nested inside */}
                {boxTypePreference === "solo" && (
                  <div className="border-t border-[#FF85A2] bg-white px-4 pb-4 pt-4">
                    <label className="mb-3 block text-sm font-semibold">Select Box Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setBoxSize(size);
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('boxSize', size);
                            }
                          }}
                          className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                            boxSize === size
                              ? "border-[#FF85A2] bg-[#FFF5F7] text-[#FF85A2]"
                              : "border-border bg-background hover:bg-grey-50"
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {boxSize === "small" && "Small: Up to 2kg, 0.002 CBM"}
                      {boxSize === "medium" && "Medium: Up to 5kg, 0.005 CBM"}
                      {boxSize === "large" && "Large: Up to 10kg, 0.01 CBM"}
                    </p>
                  </div>
                )}
              </div>

              <div className={`rounded-lg border-2 transition-colors ${
                boxTypePreference === "shared"
                  ? "border-[#FF85A2] bg-[#FFF5F7]"
                  : "border-border bg-background"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setBoxTypePreference("shared");
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('boxTypePreference', 'shared');
                    }
                  }}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Shared Box</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Save {formatCurrency(totals.soloShippingFee - totals.sharedShippingFee, "PHP")} - Items consolidated with others
                      </div>
                    </div>
                    <div className="font-semibold text-[#FF85A2]">
                      {formatCurrency(totals.sharedShippingFee, "PHP")}
                    </div>
                  </div>
                </button>

                {/* Shared Box Selection - Nested inside */}
                {boxTypePreference === "shared" && (
                  <div className="border-t border-[#FF85A2] bg-white px-4 pb-4 pt-4">
                  <label className="mb-3 block text-sm font-semibold">Select Shared Box</label>
                  {loadingSharedBoxes ? (
                    <p className="text-sm text-muted-foreground">Loading available boxes...</p>
                  ) : availableSharedBoxes.length > 0 ? (
                    <div className="space-y-2">
                      {availableSharedBoxes.map((box) => (
                        <button
                          key={box.id}
                          type="button"
                          onClick={() => {
                            setSelectedSharedBoxId(box.id);
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('selectedSharedBoxId', box.id);
                            }
                          }}
                          className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                            selectedSharedBoxId === box.id
                              ? "border-[#FF85A2] bg-white"
                              : "border-border bg-background hover:bg-grey-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-2">
                                {box.box_number || `Box #${box.id.slice(-6)}`}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div className="flex items-center gap-4">
                                  <span>
                                    Weight: <span className="font-medium">{(box.current_weight || 0).toFixed(2)}kg</span> / {(box.max_weight || 30)}kg
                                  </span>
                                  <span>
                                    Volume: <span className="font-medium">{(box.current_volume || 0).toFixed(4)}</span> CBM / {(box.max_volume || 0.05)} CBM
                                  </span>
                                </div>
                                <div>
                                  Customers: <span className="font-medium">{box.participant_count || 0}</span> / {box.max_participants || 10}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    !box.is_full 
                                      ? "bg-green-100 text-green-700" 
                                      : box.is_full
                                      ? "bg-grey-100 text-grey-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {!box.is_full ? "Open" : box.is_full ? "Closed" : box.status}
                                  </span>
                                  {!box.is_full && (
                                    <span className="text-xs text-muted-foreground">
                                      • Accepting more items
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedSharedBoxId === box.id && (
                              <div className="ml-3 text-[#FF85A2] text-xl font-bold">✓</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-background p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No shared boxes available at the moment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A new shared box will be created when you proceed
                      </p>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Link
              href="/store/checkout"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Return to information
            </Link>
            <Button
              onClick={() => {
                // Save selections to sessionStorage before navigating
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('boxTypePreference', boxTypePreference);
                  if (boxTypePreference === 'solo') {
                    sessionStorage.setItem('boxSize', boxSize);
                  } else if (boxTypePreference === 'shared' && selectedSharedBoxId) {
                    sessionStorage.setItem('selectedSharedBoxId', selectedSharedBoxId);
                  }
                }
                router.push("/store/checkout-payment");
              }}
              disabled={boxTypePreference === "shared" && !selectedSharedBoxId && availableSharedBoxes.length > 0}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to payment
            </Button>
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
                        Qty: {item.quantity}
                      </p>
                      <div className="mt-1">
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
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF85A2]"
                  placeholder="Discount code"
                />
                <Button variant="outline" className="shrink-0">
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {formatCurrency(totals.shippingFee, "PHP")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(totals.total, "PHP")}
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

