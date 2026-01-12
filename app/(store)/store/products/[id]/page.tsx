"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService, type Product } from "@/services/productService";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { currencyService } from "@/services/currencyService";
import { formatCurrency } from "@/lib/currency";
import type { Product as ProductFromTypes, ProductVariation, ProductReview } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { getProductReviews, getAverageRating } from "@/lib/mockData";
import { PriceComparison } from "@/components/store/PriceComparison";
import { PriceComparisonInline } from "@/components/store/PriceComparisonInline";
import { ProductImageSkeleton, ProductInfoSkeleton, ReviewSkeleton } from "@/components/ui/skeleton";
import { ImageZoom } from "@/components/store/ImageZoom";
import { StickyCartBar } from "@/components/store/StickyCartBar";
import { SocialShare } from "@/components/store/SocialShare";
import { ErrorBoundary } from "@/components/store/ErrorBoundary";
import { ProductSelectionModal } from "@/components/store/ProductSelectionModal";
import { PreorderCountdown } from "@/components/store/PreorderCountdown";
import { PreorderPaymentInfo } from "@/components/store/PreorderPaymentInfo";
import { PreorderProgress } from "@/components/store/PreorderProgress";
import { formatDate } from "@/lib/utils";

// Extended Product type that includes variations for this component
type ProductWithVariations = Product & {
  variations?: ProductVariation[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Box selection removed - will be done on request shipping page
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  // Accordion states
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [priceComparisonOpen, setPriceComparisonOpen] = useState(false);
  const [priceSummaryOpen, setPriceSummaryOpen] = useState(false);
  // Product selection modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalActionType, setModalActionType] = useState<"addToCart" | "buyNow">("addToCart");
  // Variation states
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  // Swipe states for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // Slider ref (mobile only)
  const sliderRef = useRef<HTMLDivElement>(null);
  // Review tab state
  const [activeReviewTab, setActiveReviewTab] = useState<"reviews" | "write">("reviews");
  // Write review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  // Price comparison modal state
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  // Purchase verification state
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  // Image zoom state
  const [showImageZoom, setShowImageZoom] = useState(false);
  // Currency rate state
  const [currencyRate, setCurrencyRate] = useState<number>(0.042);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Box selection moved to request shipping page

  useEffect(() => {
    loadProduct();
    loadCurrencyRate();
  }, [productId]);

  const loadCurrencyRate = async () => {
    setCurrencyLoading(true);
    try {
      const rate = await currencyService.getKRWtoPHPRate();
      setCurrencyRate(rate);
    } catch (error) {
      console.warn("Failed to load currency rate, using default");
      setCurrencyRate(0.042);
    } finally {
      setCurrencyLoading(false);
    }
  };


  useEffect(() => {
    if (isAuthenticated && user && product) {
      checkUserPurchase();
    } else {
      setCheckingPurchase(false);
      setHasPurchased(false);
    }
  }, [isAuthenticated, user, product]);

  const loadProduct = async (retry = false) => {
    if (!retry) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await productService.getProductById(productId);
      setProduct(data as any);
      
      // Load reviews for this product
      if (data) {
        const productReviews = getProductReviews(data.id);
        setReviews(productReviews);
        
        // Load related products - mix of same category and popular products
        const response = await productService.getProducts();
        const allProducts = response.data;
        
        // Get products from same category
        const sameCategoryProducts = allProducts
          .filter((p) => p.id !== data.id && p.category === data.category)
          .slice(0, 2);
        
        // Get popular products from other categories (high stock or different categories)
        const otherCategoryProducts = allProducts
          .filter((p) => p.id !== data.id && p.category !== data.category)
          .sort((a, b) => (b.stock || 0) - (a.stock || 0)) // Sort by stock (popularity indicator)
          .slice(0, 6);
        
        // Mix and shuffle recommendations
        const mixed = [...sameCategoryProducts, ...otherCategoryProducts]
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 8); // Get 8 products
        
        setRelatedProducts(mixed);
      }
      setRetryCount(0);
    } catch (error: any) {
      console.error("Error loading product:", error);
      const errorMessage = error?.message || "Failed to load product. Please try again.";
      setError(errorMessage);
      
      // Auto-retry up to 3 times
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadProduct(true);
        }, 2000);
      }
    } finally {
      setReviewsLoading(false);
      setLoading(false);
    }
  };


  const checkUserPurchase = async () => {
    if (!isAuthenticated || !user || !product) {
      setCheckingPurchase(false);
      setHasPurchased(false);
      return;
    }

    setCheckingPurchase(true);
    try {
      // Get user's orders (only paid or partially paid orders)
      const ordersResponse = await orderService.getOrders({
        user_id: user.id,
        payment_status: 'paid'
      });
      const orders = ordersResponse?.data || [];
      
      // Also check partial payments
      let partialOrders: any[] = [];
      try {
        const partialOrdersResponse = await orderService.getOrders({
          user_id: user.id,
          payment_status: 'partial'
        });
        partialOrders = partialOrdersResponse?.data || [];
      } catch (partialError) {
        // Silently handle partial orders error - not critical
        console.warn("Could not fetch partial orders:", partialError);
      }
      
      const allOrders = [...orders, ...partialOrders];
      
      // Check if user has purchased this product
      const hasPurchasedProduct = allOrders.some(order => {
        // Check if any order item matches this product
        return order.order_items?.some((item: any) => item.product_id === product.id);
      });

      setHasPurchased(hasPurchasedProduct);

      // Check if user has already reviewed this product
      if (hasPurchasedProduct) {
        const userReview = reviews.find(r => r.userId === user.id);
        setHasAlreadyReviewed(!!userReview);
      }
    } catch (error: any) {
      // Only log if it's a real error, not just missing data
      if (error?.message || error?.response) {
        console.error("Error checking user purchase:", error?.message || error);
      }
      // Default to not purchased on error
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

    // Auto-select first variation if available
  useEffect(() => {
    if (product && product.variations && product.variations.length > 0) {
      const initialVariations: Record<string, string> = {};
      ["size", "color", "other"].forEach((type) => {
        const firstOfType = product.variations?.find((v) => v.type === type && v.stock > 0);
        if (firstOfType) {
          initialVariations[type] = firstOfType.id;
        }
      });
      if (Object.keys(initialVariations).length > 0) {
        setSelectedVariations(initialVariations);
      }
    }
  }, [product]);


  if (loading && !product) {
    return (
      <ErrorBoundary onRetry={() => loadProduct()}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <ProductImageSkeleton />
            <ProductInfoSkeleton />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error && !product && retryCount >= 3) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
          <p className="mb-4 text-lg font-semibold text-error">{error}</p>
          <Button onClick={() => { setRetryCount(0); loadProduct(); }} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href="/store/products" className="mt-4 inline-block text-soft-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  // Swipe handlers for mobile image navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && product.images && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Box selection functions removed - handled on request shipping page

  // Open modal for add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/store/products/" + productId);
      return;
    }
    setModalActionType("addToCart");
    setShowProductModal(true);
  };

  // Open modal for buy now
  const handleBuyNow = () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/store/products/" + productId);
      return;
    }
    setModalActionType("buyNow");
    setShowProductModal(true);
  };

  // Actually add to cart (called from modal)
  const handleAddToCartSubmit = async (qty: number, variations: Record<string, string>) => {
    if (!product || !user) return;

    // Validate product ID is a UUID (backend requirement)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product.id)) {
      console.error("Product ID is not a valid UUID:", product.id);
      alert("This product cannot be added to cart. Product ID format is invalid.");
      return;
    }

    // Validate user ID is a UUID
    if (!uuidRegex.test(user.id)) {
      console.error("User ID is not a valid UUID:", user.id);
      alert("Invalid user session. Please log in again.");
      return;
    }

    setAddingToCart(true);
    setCartSuccess(false);

    try {
      // Add to cart - box selection will be done on request shipping page
      await cartService.addToCart({
        user_id: user.id,
        product_id: product.id,
        quantity: qty,
        // No box info needed - will be selected when requesting shipping
      });

      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage = error?.message || "Failed to add item to cart. Please try again.";
      
      // Show more specific error messages
      if (errorMessage.includes("uuid") || errorMessage.includes("UUID")) {
        alert("Invalid product ID format. Please refresh the page and try again.");
      } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        alert("Product not found. Please refresh the page and try again.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Actually buy now (called from modal)
  const handleBuyNowSubmit = (qty: number, variations: Record<string, string>) => {
    if (!product) return;

    // Prepare variation data
    const variationData: Record<string, string> = {};
    if (product.variations && Object.keys(variations).length > 0) {
      Object.entries(variations).forEach(([type, variationId]) => {
        const variation = product.variations?.find((v) => v.id === variationId);
        if (variation) {
          variationData[type] = variation.value;
        }
      });
    }

    // Calculate price with selected variations
    let basePrice = product.price;
    if (product.variations && product.variations.length > 0) {
      Object.values(variations).forEach((variationId) => {
        const variation = product.variations?.find((v) => v.id === variationId);
        if (variation && variation.priceModifier) {
          basePrice += variation.priceModifier;
        }
      });
    }

    // Store order data in sessionStorage for payment page
    const orderData = {
      productId: product.id,
      name: product.name,
      price: basePrice,
      quantity: qty,
      // Box selection will be done on request shipping page
      variations: Object.keys(variationData).length > 0 ? variationData : undefined,
      selectedVariationIds: Object.values(variations).length > 0 
        ? Object.values(variations) 
        : undefined,
    };
    
    sessionStorage.setItem("temp_order", JSON.stringify(orderData));
    
    // Navigate to payment page
    router.push(`/store/payment?orderId=temp-order-${Date.now()}`);
  };

  // Early return if no product
  if (!product) return null;

  // Calculate price with variations
  const calculatePrice = () => {
    let basePrice = product.price;
    if (product.variations && product.variations.length > 0) {
      Object.values(selectedVariations).forEach((variationId) => {
        const variation = product.variations?.find((v) => v.id === variationId);
        if (variation && variation.priceModifier) {
          basePrice += variation.priceModifier;
        }
      });
    }
    return basePrice;
  };

  const currentPrice = calculatePrice();
  const priceInPHP = currentPrice * currencyRate;
  const shippingEstimate = "7-14 days (Sea) / 3-5 days (Air)";
  
  // Get available stock for selected variations
  const getAvailableStock = () => {
    if (!product.variations || product.variations.length === 0) {
      return product.stock;
    }
    
    // If variations are selected, find the specific variation
    const selectedVariationIds = Object.values(selectedVariations);
    if (selectedVariationIds.length > 0) {
      // For now, use the first selected variation's stock
      // In a more complex system, you'd track stock per combination
      const firstSelectedId = selectedVariationIds[0];
      const selectedVariation = product.variations?.find(
        (v) => v.id === firstSelectedId
      );
      if (selectedVariation) {
        return selectedVariation.stock;
      }
    }
    
    // If no variation selected, return minimum stock from all variations
    const minStock = Math.min(...product.variations.map((v) => v.stock));
    return minStock;
  };

  const availableStock = getAvailableStock();
  
  // Check if all required variation types are selected
  const hasRequiredVariations = () => {
    if (!product.variations || product.variations.length === 0) {
      return true;
    }
    
    // Get unique variation types
    const variationTypes = [...new Set(product.variations.map((v) => v.type))];
    
    // Check if at least one variation of each type is selected
    return variationTypes.every((type) => selectedVariations[type] !== undefined);
  };

  // Check if can add to cart (no box selection needed on product page)
  const canAddToCart = hasRequiredVariations() && availableStock > 0;

  // Shipping fee will be calculated on request shipping page
  const subtotal = priceInPHP * quantity;
  const total = subtotal; // Only item price, shipping paid later

  return (
    <ErrorBoundary onRetry={() => loadProduct()}>
      {/* Price Comparison Modal */}
      <PriceComparison
        product={product as unknown as ProductFromTypes}
        isOpen={showPriceComparison}
        onClose={() => setShowPriceComparison(false)}
      />

      {/* Product Selection Modal */}
      {product && (
        <ProductSelectionModal
          product={product as unknown as ProductFromTypes & { variations?: ProductVariation[] }}
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onAddToCart={handleAddToCartSubmit}
          onBuyNow={handleBuyNowSubmit}
          actionType={modalActionType}
          currentPrice={currentPrice}
          priceInPHP={priceInPHP}
          currencyRate={currencyRate}
          initialQuantity={quantity}
          initialVariations={selectedVariations}
        />
      )}

      {/* Image Zoom Modal */}
      {product.images && product.images.length > 0 && (
        <ImageZoom
          images={product.images}
          currentIndex={selectedImageIndex}
          isOpen={showImageZoom}
          onClose={() => setShowImageZoom(false)}
          onIndexChange={setSelectedImageIndex}
        />
      )}

      {/* Sticky Cart Bar (Mobile) */}
      <StickyCartBar
        price={priceInPHP}
        currency="PHP"
        quantity={quantity}
        canAddToCart={canAddToCart}
        addingToCart={addingToCart}
        cartSuccess={cartSuccess}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image - Swipeable on Mobile */}
              <div 
                className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-border bg-white md:cursor-pointer"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => setShowImageZoom(true)}
              >
                <img
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="h-full w-full object-cover transition-opacity duration-300 select-none touch-none"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png';
                  }}
                />
                {/* Image Indicator Dots - Mobile Only */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {product.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full transition-all ${
                          selectedImageIndex === idx
                            ? "bg-white w-6"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery - Hidden on Mobile, Visible on Desktop */}
              {product.images.length > 1 && (
                <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-soft-blue-600 ring-2 ring-soft-blue-200 scale-105 shadow-md"
                          : "border-border hover:border-soft-blue-300 opacity-75 hover:opacity-100"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                      {selectedImageIndex === idx && (
                        <div className="absolute inset-0 bg-soft-blue-600/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg bg-grey-200"
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="mb-2 text-sm font-semibold text-grey-700">
              {product.brand}
            </p>
          )}
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-grey-900 sm:text-4xl">
              {product.name}
            </h1>
            <SocialShare
              productName={product.name}
              productUrl={`/store/products/${product.id}`}
              productImage={product.images?.[0]}
            />
          </div>
          {/* Check if product is preorder */}
          {(() => {
            const isPreorder = product.product_type === 'preorder' || product.is_preorder_available;
            const orderDate = product.order_date ? new Date(product.order_date) : undefined;
            const orderDeadline = product.order_deadline ? new Date(product.order_deadline) : undefined;
            const releaseDate = product.release_date ? new Date(product.release_date) : undefined;
            const depositPercentage = product.deposit_percentage || 50;
            const preorderAvailableStock = product.preorder_available_stock || product.preorder_stock || 0;
            const preordersClaimed = product.preorders_claimed || 0;
            const shippingTimeDays = product.shipping_time_days || 7;
            const expectedDelivery = releaseDate ? new Date(releaseDate) : undefined;
            if (expectedDelivery) {
              expectedDelivery.setDate(expectedDelivery.getDate() + shippingTimeDays);
            }

            return (
              <>
                {/* Price Display */}
                <div className="mb-6">
                  {isPreorder ? (
                    <PreorderPaymentInfo
                      price={currentPrice}
                      currency={product.currency as any}
                      depositPercentage={depositPercentage}
                    />
                  ) : (
                    <>
                      <div className="mb-2">
                        <p className="text-3xl font-bold text-soft-blue-600">
                          {formatCurrency(priceInPHP, "PHP")}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-grey-600">
                        {formatCurrency(currentPrice, "KRW")}
                        {currentPrice !== product.price && (
                          <span className="ml-2 text-xs line-through text-grey-400">
                            {formatCurrency(product.price, "KRW")}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>

                {/* Preorder Information */}
                {isPreorder && orderDeadline && (
                  <div className="mb-6 space-y-4 rounded-lg border-2 border-pink-200 bg-pink-50/30 p-4">
                    {/* Preorder Countdown */}
                    {orderDeadline && (
                      <PreorderCountdown deadline={orderDeadline} />
                    )}

                    {/* Preorder Progress */}
                    {preorderAvailableStock > 0 && (
                      <PreorderProgress
                        claimed={preordersClaimed}
                        available={preorderAvailableStock}
                      />
                    )}

                    {/* Preorder Timeline */}
                    {orderDate && releaseDate && expectedDelivery && (
                      <div className="space-y-2 rounded-lg bg-white p-3 border border-pink-200">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">📅 Pre-Order Period:</span>
                          <span>{formatDate(orderDate)} - {formatDate(orderDeadline)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">🎬 Release Date:</span>
                          <span>{formatDate(releaseDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">🚚 Expected Arrival:</span>
                          <span>{formatDate(expectedDelivery)}</span>
                        </div>
                      </div>
                    )}

                    {/* Preorder Notice */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs font-medium text-blue-800 mb-1">📦 Pre-Order Payment System</p>
                      <p className="text-xs text-blue-700">
                        Pay {depositPercentage}% deposit now to secure your pre-order. The remaining balance will be paid when the item arrives at our warehouse.
                      </p>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Product Specifications - Compact Grid Layout */}
          <div className="mb-6 space-y-4">
            {/* Description - Not Accordion */}
            <div>
              <h3 className="mb-2 text-base font-semibold text-grey-900">Description</h3>
              <p className="text-grey-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details - Accordion on Mobile, Always Visible on Desktop */}
            <div className="rounded-lg border-2 border-grey-200 bg-white">
              {/* Mobile: Accordion */}
              <div className="lg:hidden">
                <button
                  onClick={() => setProductDetailsOpen(!productDetailsOpen)}
                  className="w-full flex items-center justify-between p-4 transition-all hover:bg-grey-50"
                >
                  <h3 className="text-base font-semibold text-grey-900">Product Details</h3>
                  <svg
                    className={`h-5 w-5 text-grey-600 transition-transform ${productDetailsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {productDetailsOpen && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shipping Estimate */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-grey-600 mb-0.5">Shipping</p>
                  <p className="text-sm font-semibold text-grey-900 leading-tight">
                    {shippingEstimate}
                  </p>
                </div>
              </div>

              {/* Stock Status */}
              <div className={`flex items-start gap-3 rounded-lg border border-border p-3 ${
                availableStock > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {availableStock > 0 ? (
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-grey-600 mb-0.5">Stock</p>
                  <p className={`text-sm font-semibold leading-tight ${
                    availableStock > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {availableStock > 0 ? `${availableStock} available` : "Out of stock"}
                  </p>
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-grey-600 mb-0.5">Weight</p>
                  <p className="text-sm font-semibold text-grey-900">{product.weight} kg</p>
                </div>
              </div>

              {/* Dimensions */}
              {product.dimensions && (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-grey-600 mb-0.5">Dimensions</p>
                    <p className="text-sm font-semibold text-grey-900 leading-tight">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                    </p>
                  </div>
                </div>
              )}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Always Visible */}
              <div className="hidden lg:block">
                <div className="p-4">
                  <h3 className="mb-4 text-base font-semibold text-grey-900">Product Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Shipping Estimate */}
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-grey-600 mb-0.5">Shipping</p>
                        <p className="text-sm font-semibold text-grey-900 leading-tight">
                          {shippingEstimate}
                        </p>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className={`flex items-start gap-3 rounded-lg border border-border p-3 ${
                      availableStock > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {availableStock > 0 ? (
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-grey-600 mb-0.5">Stock</p>
                        <p className={`text-sm font-semibold leading-tight ${
                          availableStock > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {availableStock > 0 ? `${availableStock} available` : "Out of stock"}
                        </p>
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-grey-600 mb-0.5">Weight</p>
                        <p className="text-sm font-semibold text-grey-900">{product.weight} kg</p>
                      </div>
                    </div>

                    {/* Dimensions */}
                    {product.dimensions && (
                      <div className="flex items-start gap-3 rounded-lg border border-border bg-grey-50 p-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-grey-600 mb-0.5">Dimensions</p>
                          <p className="text-sm font-semibold text-grey-900 leading-tight">
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variations */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Group variations by type */}
              {["size", "color", "other"].map((variationType) => {
                const variationsOfType = product.variations?.filter(
                  (v) => v.type === variationType
                ) || [];
                
                if (variationsOfType.length === 0) return null;
                
                return (
                  <div key={variationType}>
                    <label className="mb-3 block text-base font-bold text-grey-900 capitalize">
                      {variationType === "other" ? "Options" : variationType}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variationsOfType.map((variation) => {
                        const isSelected = selectedVariations[variationType] === variation.id;
                        const isOutOfStock = variation.stock === 0;
                        
                        return (
                          <button
                            key={variation.id}
                            onClick={() => {
                              if (!isOutOfStock) {
                                setSelectedVariations((prev) => ({
                                  ...prev,
                                  [variationType]: variation.id,
                                }));
                                // Update image if variation has specific image
                                if (variation.imageUrl && product.images.includes(variation.imageUrl)) {
                                  const imageIndex = product.images.indexOf(variation.imageUrl);
                                  setSelectedImageIndex(imageIndex);
                                }
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
                              isSelected
                                ? "border-soft-blue-600 bg-soft-blue-600 text-white shadow-md"
                                : isOutOfStock
                                ? "border-grey-200 bg-grey-50 text-grey-400 cursor-not-allowed opacity-50"
                                : "border-border bg-white text-grey-900 hover:border-soft-blue-300 hover:bg-soft-blue-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {variation.type === "color" && (
                                <div
                                  className="h-5 w-5 rounded-full border-2 border-grey-300"
                                  style={{
                                    backgroundColor: variation.value.toLowerCase(),
                                  }}
                                />
                              )}
                              <span>{variation.value}</span>
                              {variation.priceModifier && variation.priceModifier !== 0 && (
                                <span className="text-xs">
                                  ({variation.priceModifier > 0 ? "+" : ""}
                                  {formatCurrency(variation.priceModifier * 0.042, "PHP")})
                                </span>
                              )}
                            </div>
                            {isOutOfStock && (
                              <span className="block text-[10px] mt-1">Out of stock</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity selector moved to modal - variations kept here for reference */}

          {/* Price Comparison - Accordion (Hidden for preorder items) */}
          {!(product.product_type === 'preorder' || product.is_preorder_available) && (
            <div className="mb-6">
              <div className="rounded-lg border-2 border-soft-blue-200 bg-white">
                <button
                  onClick={() => setPriceComparisonOpen(!priceComparisonOpen)}
                  className="w-full flex items-center justify-between p-4 transition-all hover:bg-soft-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-[#FF85A2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-base font-semibold text-grey-900">Price Comparison</p>
                      <p className="text-xs text-grey-600">Compare with other Korean websites</p>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-grey-600 transition-transform ${priceComparisonOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {priceComparisonOpen && (
                  <div className="px-4 pb-4">
                    <PriceComparisonInline 
                      product={product as unknown as ProductFromTypes}
                      currentPrice={currentPrice}
                      priceInPHP={priceInPHP}
                      onViewFull={() => setShowPriceComparison(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Summary - Accordion */}
          <div className="mb-6">
            <div className="rounded-xl border-2 border-soft-blue-200 bg-white shadow-md">
              <button
                onClick={() => setPriceSummaryOpen(!priceSummaryOpen)}
                className="w-full flex items-center justify-between p-5 transition-all hover:bg-soft-blue-50"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-grey-900">Price Summary</h3>
                    <span className="text-lg font-bold text-soft-blue-600">
                      {formatCurrency(total, "PHP")}
                    </span>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-grey-600 transition-transform ${priceSummaryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {priceSummaryOpen && (
                <div className="px-5 pb-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-grey-800 font-medium">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                      </div>
                      <span className="font-bold text-grey-900">{formatCurrency(subtotal, "PHP")}</span>
                    </div>
                    {(() => {
                      const isPreorder = product.product_type === 'preorder' || product.is_preorder_available;
                      const depositPercentage = product.deposit_percentage || 50;
                      const depositAmount = (total * depositPercentage) / 100;
                      const balanceAmount = total - depositAmount;

                      if (isPreorder) {
                        return (
                          <div className="rounded-lg bg-pink-50 border border-pink-200 p-3 mt-4">
                            <p className="text-xs text-pink-800 font-medium mb-2">📦 Pre-Order Payment System</p>
                            <div className="space-y-1 text-xs text-pink-700">
                              <div className="flex justify-between">
                                <span>Deposit ({depositPercentage}%):</span>
                                <span className="font-semibold">{formatCurrency(depositAmount, "PHP")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Balance (on release):</span>
                                <span>{formatCurrency(balanceAmount, "PHP")}</span>
                              </div>
                              <p className="mt-2 text-xs text-pink-600">
                                Pay deposit now to secure your pre-order. Remaining balance will be paid when item arrives.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mt-4">
                          <p className="text-xs text-blue-800 font-medium mb-1">📦 3-Way Payment System</p>
                          <p className="text-xs text-blue-700">
                            Pay for items now. Shipping fee will be paid separately when you request shipping from your storage.
                          </p>
                        </div>
                      );
                    })()}
                    <div className="border-t-2 border-grey-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-grey-900">Total to Pay:</span>
                        <span className="text-2xl font-bold text-soft-blue-600">{formatCurrency(total, "PHP")}</span>
                      </div>
                      <p className="text-xs text-grey-500 mt-2">
                        Items will be stored after payment
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {product.variations && product.variations.length > 0 && !hasRequiredVariations() && (
              <p className="mb-2 text-sm text-soft-blue-600 font-medium">
                Please select all required options (size, color, etc.)
              </p>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart || !canAddToCart}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {addingToCart ? "Adding..." : cartSuccess ? "✓ Added to Cart" : "Add to Cart"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!canAddToCart}
              className="flex-1"
              size="lg"
            >
              {product.product_type === 'preorder' || product.is_preorder_available ? 'Pre-Order Now' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-grey-900">Customer Reviews</h2>
          {product && reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(getAverageRating(product.id))
                          ? "text-yellow-400"
                          : "text-grey-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-semibold text-grey-900">
                  {getAverageRating(product.id).toFixed(1)}
                </span>
              </div>
              <span className="text-grey-600">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveReviewTab("reviews")}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                activeReviewTab === "reviews"
                  ? "border-[#FF85A2] text-[#FF85A2]"
                  : "border-transparent text-[#6b7280] hover:text-[#2C2C2C]"
              }`}
            >
              Reviews ({reviews.length})
            </button>
            {/* Only show Write a Review tab if user has purchased the product */}
            {hasPurchased && !hasAlreadyReviewed && (
              <button
                onClick={() => setActiveReviewTab("write")}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                  activeReviewTab === "write"
                    ? "border-[#FF85A2] text-[#FF85A2]"
                    : "border-transparent text-[#6b7280] hover:text-[#2C2C2C]"
                }`}
              >
                Write a Review
              </button>
            )}
          </div>
        </div>

        {/* Reviews Tab Content */}
        {activeReviewTab === "reviews" && (
          <>
            {reviewsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-8 text-center">
                <p className="mb-4 text-[#6b7280]">No reviews yet.</p>
                {isAuthenticated && hasPurchased && !hasAlreadyReviewed && (
                  <button
                    onClick={() => setActiveReviewTab("write")}
                    className="rounded-[4px] bg-[#FF85A2] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                  >
                    Write First Review
                  </button>
                )}
                {isAuthenticated && !hasPurchased && (
                  <p className="text-sm text-[#6b7280]">Purchase this product to write the first review!</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-border bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-blue-100 text-lg font-bold text-soft-blue-600">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-grey-900">{review.userName}</h3>
                            {review.verifiedPurchase && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400" : "text-grey-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-grey-600">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="mb-2 font-semibold text-grey-900">{review.title}</h4>
                    )}
                    <p className="mb-4 text-grey-700 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-grey-600 hover:text-soft-blue-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        Helpful ({review.helpfulCount})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Write Review Tab Content */}
        {activeReviewTab === "write" && (
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="mb-4 text-[#6b7280]">Please log in to write a review.</p>
                <Link
                  href={`/auth/login?redirect=/store/products/${productId}`}
                  className="inline-block rounded-[4px] bg-[#FF85A2] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                >
                  Login to Review
                </Link>
              </div>
            ) : checkingPurchase ? (
              <div className="text-center py-8">
                <p className="text-[#6b7280]">Checking purchase status...</p>
              </div>
            ) : hasAlreadyReviewed ? (
              <div className="text-center py-8">
                <p className="mb-4 text-[#6b7280]">You have already reviewed this product.</p>
                <button
                  onClick={() => setActiveReviewTab("reviews")}
                  className="inline-block rounded-[4px] bg-[#FF85A2] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                >
                  View Your Review
                </button>
              </div>
            ) : !hasPurchased ? (
              <div className="text-center py-8">
                <p className="mb-2 text-lg font-semibold text-[#2C2C2C]">Purchase Required</p>
                <p className="mb-4 text-[#6b7280]">
                  You need to purchase this product before you can write a review.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleAddToCart}
                    className="rounded-[4px] border border-[#FCE4EC] bg-white px-6 py-2 font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7]"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="rounded-[4px] bg-[#FF85A2] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!product || !user) return;

                  setSubmittingReview(true);
                  // Simulate API call
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  
                  // In a real app, you would submit to an API here
                  // For now, we'll just show a success message
                  alert("Thank you for your review! (This is a demo - review not saved)");
                  
                  // Mark that user has reviewed
                  setHasAlreadyReviewed(true);
                  
                  // Reset form
                  setReviewRating(5);
                  setReviewTitle("");
                  setReviewComment("");
                  setSubmittingReview(false);
                  setActiveReviewTab("reviews");
                }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 transition-colors ${
                            rating <= reviewRating
                              ? "text-yellow-400"
                              : "text-grey-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-[#6b7280]">
                      {reviewRating === 5
                        ? "Excellent"
                        : reviewRating === 4
                        ? "Very Good"
                        : reviewRating === 3
                        ? "Good"
                        : reviewRating === 2
                        ? "Fair"
                        : "Poor"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="review-title" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Review Title (Optional)
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your review"
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-sm text-[#2C2C2C] placeholder:text-[#6b7280] focus:border-[#FF85A2] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Your Review *
                  </label>
                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={6}
                    required
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-sm text-[#2C2C2C] placeholder:text-[#6b7280] focus:border-[#FF85A2] focus:outline-none resize-none"
                  />
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Minimum 10 characters required
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submittingReview || reviewComment.length < 10}
                    className="flex-1 rounded-[4px] bg-[#FF85A2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewRating(5);
                      setReviewTitle("");
                      setReviewComment("");
                    }}
                    className="rounded-[4px] border border-[#FCE4EC] bg-white px-6 py-3 font-semibold text-[#2C2C2C] transition-colors hover:bg-[#FFF5F7]"
                  >
                    Clear
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-grey-900">You May Also Like</h2>
              <p className="text-sm text-grey-600">Recommended products for you</p>
            </div>
            <Link
              href="/store/products"
              className="hidden text-sm font-semibold text-soft-blue-600 hover:text-soft-blue-700 sm:block"
            >
              View All →
            </Link>
          </div>
          {/* Mobile: Horizontal Slider, Desktop: Grid */}
          <div className="relative">
            {/* Mobile Slider Container */}
            <div 
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:hidden"
            >
              {relatedProducts.map((relatedProduct) => {
                const relatedPriceInPHP = relatedProduct.price * 0.042;
                const mainImage = relatedProduct.images && relatedProduct.images.length > 0 
                  ? relatedProduct.images[0] 
                  : "/placeholder-product.png";

                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/store/products/${relatedProduct.id}`}
                    className="group flex-shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-lg hover:border-soft-blue-300 w-[calc(50vw-1.5rem)]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-grey-100">
                      <img
                        src={mainImage}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                      {relatedProduct.stock > 0 && relatedProduct.stock < 10 && (
                        <div className="absolute top-2 right-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                          Low Stock
                        </div>
                      )}
                      {relatedProduct.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {relatedProduct.brand && (
                        <p className="mb-1 text-xs font-medium text-grey-600 uppercase">
                          {relatedProduct.brand}
                        </p>
                      )}
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-grey-900 group-hover:text-soft-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-soft-blue-600">
                            {formatCurrency(relatedPriceInPHP, "PHP")}
                          </p>
                          <p className="text-xs text-grey-500">
                            {formatCurrency(relatedProduct.price, "KRW")}
                          </p>
                        </div>
                        {relatedProduct.stock > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>In Stock</span>
                          </div>
                        )}
                      </div>
                      {/* Category Badge */}
                      <div className="mt-2">
                        <span className="inline-block rounded-full bg-grey-100 px-2 py-0.5 text-xs font-medium text-grey-700 capitalize">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Grid Container */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedPriceInPHP = relatedProduct.price * 0.042;
                const mainImage = relatedProduct.images && relatedProduct.images.length > 0 
                  ? relatedProduct.images[0] 
                  : "/placeholder-product.png";

                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/store/products/${relatedProduct.id}`}
                    className="group overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-lg hover:border-soft-blue-300"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-grey-100">
                      <img
                        src={mainImage}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                      {relatedProduct.stock > 0 && relatedProduct.stock < 10 && (
                        <div className="absolute top-2 right-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                          Low Stock
                        </div>
                      )}
                      {relatedProduct.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {relatedProduct.brand && (
                        <p className="mb-1 text-xs font-medium text-grey-600 uppercase">
                          {relatedProduct.brand}
                        </p>
                      )}
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-grey-900 group-hover:text-soft-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-soft-blue-600">
                            {formatCurrency(relatedPriceInPHP, "PHP")}
                          </p>
                          <p className="text-xs text-grey-500">
                            {formatCurrency(relatedProduct.price, "KRW")}
                          </p>
                        </div>
                        {relatedProduct.stock > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>In Stock</span>
                          </div>
                        )}
                      </div>
                      {/* Category Badge */}
                      <div className="mt-2">
                        <span className="inline-block rounded-full bg-grey-100 px-2 py-0.5 text-xs font-medium text-grey-700 capitalize">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

