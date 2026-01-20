"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cartService";
import { mockProducts } from "@/lib/mockData";
import { mockPreorderProducts } from "@/lib/mockPreorderData";
import type { CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [customerMessage, setCustomerMessage] = useState<string>("");
  const [isPaymentProcessOpen, setIsPaymentProcessOpen] = useState(false);
  const [isSoloBoxOpen, setIsSoloBoxOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/cart");
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadCart();
      // Load saved message from sessionStorage if available
      if (typeof window !== 'undefined') {
        const savedMessage = sessionStorage.getItem('order_message');
        if (savedMessage) {
          setCustomerMessage(savedMessage);
        }
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const cartItemsData = await cartService.getCartItems(user.id);

      // Map cart items - extract data from nested product object
      const cartItemsWithImages = cartItemsData.map((item) => {
        const product = item.product;
        
        // Extract product data from nested product object
        const productName = item.product_name || product?.name || 'Unknown Product';
        const productPrice = product?.price ? parseFloat(String(product.price)) : (item.price || 0);
        const productCurrency = product?.currency || 'KRW';
        const productImages = product?.images || [];
        const imageUrl = item.image_url || (productImages.length > 0 ? productImages[0] : '');
        const productType = item.product_type || (product?.product_type as 'onhand' | 'preorder' | 'kr_website') || 'onhand';
        
        return {
          ...item,
          product_name: productName,
          price: productPrice,
          currency: productCurrency,
          image_url: imageUrl,
          product_type: productType,
          // Keep the nested product object for reference
          product: product || item.product,
        };
      });

      setCartItems(cartItemsWithImages);
      // Select all items by default when cart loads
      if (cartItemsWithImages.length > 0) {
        setSelectedItems(new Set(cartItemsWithImages.map(item => item.id)));
      } else {
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Update selected items when cart items change (remove invalid selections)
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.size > 0) {
      // Remove selections for items that no longer exist in cart
      const currentItemIds = new Set(cartItems.map(item => item.id));
      const validSelectedItems = new Set(
        Array.from(selectedItems).filter(id => currentItemIds.has(id))
      );
      if (validSelectedItems.size !== selectedItems.size) {
        setSelectedItems(validSelectedItems);
      }
    } else if (cartItems.length === 0) {
      setSelectedItems(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await cartService.updateCartItem(cartItemId, newQuantity);
      await loadCart(); // Reload cart to get updated data
      
      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartItemUpdated'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      toast.success("Cart updated");
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update cart item";
      toast.error(errorMessage);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    
    try {
      await cartService.removeCartItem(cartItemId);
      await loadCart(); // Reload cart
      
      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartItemRemoved'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      toast.success("Item removed from cart");
    } catch (error: any) {
      console.error("Error removing cart item:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to remove item";
      toast.error(errorMessage);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Clear all items from cart? This action cannot be undone.")) return;
    
    try {
      await cartService.clearCart();
      await loadCart(); // Reload cart
      setSelectedItems(new Set());
      
      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartCleared'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      toast.success("Cart cleared");
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to clear cart";
      toast.error(errorMessage);
    }
  };

  const calculateTotals = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    
    const subtotal = selectedCartItems.reduce((sum, item) => {
      // Get price from product object or item
      const productPrice = item.product?.price ? parseFloat(String(item.product.price)) : (item.price || 0);
      const currency = item.product?.currency || 'KRW';
      
      // Convert to PHP if needed
      const conversionRate = item.product?.price_conversion_rate || 0.042;
      const priceInPHP = currency === 'KRW' ? productPrice * conversionRate : productPrice;
      
      return sum + priceInPHP * item.quantity;
    }, 0);

    return {
      subtotalPHP: subtotal,
    };
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600">Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add items to your cart to see them here
          </p>
          <Button onClick={() => router.push("/store/products")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Product List and Payment Process Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select All and Clear Cart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(cartItems.map(item => item.id)));
                      } else {
                        setSelectedItems(new Set());
                      }
                    }}
                    className="h-4 w-4 rounded border-grey-300 text-[#FF85A2] focus:ring-[#FF85A2] focus:ring-2"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Select All ({selectedItems.size} of {cartItems.length} selected)
                  </span>
                </label>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-error hover:underline font-medium"
                  disabled={cartItems.length === 0}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="rounded-lg border border-border bg-card">
              {/* Header */}
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-green-600">PRODUCT</h2>
              </div>

              {/* Product Items */}
              <div className="divide-y divide-border">
                {cartItems.map((item) => {
                  const itemPricePHP = item.product?.price 
                    ? (parseFloat(String(item.product.price)) * (item.product?.price_conversion_rate || 0.042))
                    : ((item.price || 0) * 0.042);
                  const itemTotalPHP = itemPricePHP * item.quantity;

                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex items-start pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(item.id);
                              } else {
                                newSelected.delete(item.id);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="h-4 w-4 rounded border-grey-300 text-[#FF85A2] focus:ring-[#FF85A2] focus:ring-2"
                          />
                        </div>

                        {/* Product Image */}
                        {item.image_url || (item.product && item.product.images && item.product.images.length > 0) ? (
                          <img
                            src={item.image_url || (item.product?.images?.[0] || '')}
                            alt={item.product_name}
                            className="h-24 w-24 shrink-0 rounded-lg object-cover border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.png';
                            }}
                          />
                        ) : (
                          <div className="h-24 w-24 shrink-0 rounded-lg bg-grey-200 border border-border flex items-center justify-center text-xs text-muted-foreground text-center p-2">
                            No Image
                          </div>
                        )}

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/store/products/${item.product_id}`}
                            className="font-semibold text-foreground hover:text-[#FF85A2] hover:underline transition-colors block mb-1"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.product_type === "preorder" ? "Pre-Order" : 
                             item.product_type === "kr_website" ? "KR Website" : "Onhand"}
                          </p>
                          <p className="text-sm font-semibold text-green-600 mb-4">
                            {formatCurrency(itemPricePHP, "PHP")}
                          </p>

                          {/* Quantity and Total Row */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Quantity Section */}
                            <div>
                              <p className="text-sm font-semibold text-green-600 mb-2">QUANTITY</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      handleUpdateQuantity(item.id, item.quantity - 1);
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 rounded border border-border bg-background hover:bg-grey-50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="text-lg leading-none">−</span>
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded border border-border bg-background hover:bg-grey-50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <span className="text-lg leading-none">+</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="mt-2 text-sm text-error hover:underline"
                              >
                                Remove
                              </button>
                            </div>

                            {/* Total Section */}
                            <div>
                              <p className="text-sm font-semibold text-green-600 mb-2">TOTAL</p>
                              <div className="space-y-1">
                                <p className="text-lg font-bold text-red-600">
                                  {formatCurrency(itemTotalPHP, "PHP")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Process Information Accordion */}
            <div className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setIsPaymentProcessOpen(!isPaymentProcessOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-grey-50 transition-colors"
              >
                <div>
                  <h2 className="text-lg font-semibold text-green-600">Payment Process Information</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Learn about our payment process
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-muted-foreground transition-transform ${isPaymentProcessOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isPaymentProcessOpen && (
                <div className="px-6 pb-6 border-t border-border">
                  <div className="space-y-3 text-sm text-muted-foreground mt-4">
                    <p>
                      <strong className="text-foreground">Step 1:</strong> Pay for items only. Your items will be stored in our warehouse after payment verification.
                    </p>
                    <p>
                      <strong className="text-foreground">Step 2:</strong> When you're ready, pay for shipping from Korea to Manila. Your items will be shipped to our Manila office.
                    </p>
                    <p>
                      <strong className="text-foreground">Step 3:</strong> Pay for local shipping from Manila to your address. Select your preferred courier and complete the delivery.
                    </p>
                    <p className="pt-2 border-t border-border">
                      <strong className="text-foreground">Note:</strong> You can pay everything at once (1-Time Payment) or use the 3-Way Payment system to spread payments over time.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Solo Box Payment Accordion */}
            <div className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setIsSoloBoxOpen(!isSoloBoxOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-grey-50 transition-colors"
              >
                <div>
                  <h2 className="text-lg font-semibold text-green-600">Solo Box Payment</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Information about solo box shipping
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-muted-foreground transition-transform ${isSoloBoxOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isSoloBoxOpen && (
                <div className="px-6 pb-6 border-t border-border">
                  <div className="space-y-3 text-sm text-muted-foreground mt-4">
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <p className="text-sm font-semibold text-warning mb-2">
                        ⚠️ Admin Approval Required
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solo box shipping requires approval from admin before processing. Your request will be reviewed and you will be notified once approved.
                      </p>
                    </div>
                    <p>
                      <strong className="text-foreground">What is Solo Box?</strong> A solo box means your items will be shipped in a dedicated box exclusively for your order, without sharing space with other customers' items.
                    </p>
                    <p>
                      <strong className="text-foreground">Benefits:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Faster shipping - no need to wait for box consolidation</li>
                      <li>Dedicated space for your items</li>
                      <li>Direct shipping from Korea to your address</li>
                      <li>Better protection for fragile items</li>
                    </ul>
                    <p>
                      <strong className="text-foreground">Payment Process:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Pay for items first (Step 1)</li>
                      <li>After admin approval, pay for shipping from Korea to Manila (Step 2)</li>
                      <li>Your box will be shipped directly to your address</li>
                      <li>No local shipping payment needed for solo boxes</li>
                    </ul>
                    <p className="pt-2 border-t border-border">
                      <strong className="text-foreground">Note:</strong> Solo box shipping typically costs more than shared box shipping, but offers faster delivery and dedicated space for your items.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary and Payment Options */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-border bg-grey-50 p-6">
              {/* Order Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-green-600 mb-4">Total</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-lg font-semibold text-green-600">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(totals.subtotalPHP, "PHP")} PHP
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Customs duties are the responsibility of the customer.
                </p>
              </div>

              {/* Order Note */}
              <div className="mb-6">
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="text-sm text-[#FF85A2] hover:text-[#FF85A2]/80 underline"
                >
                  Add order note
                </button>
                {customerMessage && (
                  <div className="mt-3 rounded-lg border border-[#FF85A2] bg-[#FFF5F7] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your message:</p>
                        <p className="text-sm text-foreground break-words">
                          {customerMessage.length > 100 
                            ? `${customerMessage.substring(0, 100)}...` 
                            : customerMessage}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsMessageModalOpen(true)}
                        className="text-xs text-[#FF85A2] hover:text-[#FF85A2]/80 underline shrink-0 ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => {
                  if (selectedItems.size > 0) {
                    // Store message in sessionStorage to pass to checkout
                    if (customerMessage.trim()) {
                      sessionStorage.setItem('order_message', customerMessage.trim());
                    }
                    router.push(`/store/checkout${selectedItems.size > 0 ? `?items=${Array.from(selectedItems).join(',')}` : ''}`);
                  }
                }}
                disabled={selectedItems.size === 0}
                className={`w-full font-semibold py-6 text-base mb-6 ${
                  selectedItems.size > 0
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                    : 'bg-grey-400 cursor-not-allowed text-white'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Proceed to Checkout ({selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'})
              </Button>

              {/* Payment Options */}
              <div className="border-t border-border pt-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">We accept</p>
                <div className="flex flex-wrap gap-2">
                  {/* Payment Method Icons - Using actual payment methods from system */}
                  <div className="flex items-center justify-center w-16 h-8 bg-white rounded border border-[#FF85A2] text-xs font-semibold text-red-600">
                    BPI
                  </div>
                  <div className="flex items-center justify-center w-16 h-8 bg-white rounded border border-[#FF85A2] text-xs font-semibold text-blue-600">
                    BDO
                  </div>
                  <div className="flex items-center justify-center w-16 h-8 bg-white rounded border border-[#FF85A2] text-xs font-semibold text-blue-500">
                    GCash
                  </div>
                  <div className="flex items-center justify-center w-16 h-8 bg-white rounded border border-[#FF85A2] text-xs font-semibold text-purple-600">
                    GoTyme
                  </div>
                  <div className="flex items-center justify-center w-16 h-8 bg-white rounded border border-[#FF85A2] text-xs font-semibold text-green-600">
                    Maya
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-lg font-semibold">Order Message (Optional)</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave a message about your order
                </p>
              </div>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <p className="mb-3 text-sm text-muted-foreground">
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                onClick={() => setIsMessageModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsMessageModalOpen(false);
                  // Store message in sessionStorage
                  if (customerMessage.trim()) {
                    sessionStorage.setItem('order_message', customerMessage.trim());
                  } else {
                    sessionStorage.removeItem('order_message');
                  }
                }}
                className="bg-[#FF85A2] hover:bg-[#FF85A2]/90 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
