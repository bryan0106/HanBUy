"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService, boxTypeService, cartService, type BoxType } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([]);
  const [boxTypesLoading, setBoxTypesLoading] = useState(true);
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");
  const [selectedBoxSize, setSelectedBoxSize] = useState<"small" | "medium" | "large">("medium");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    loadProduct();
    loadBoxTypes();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const data = await productService.getProduct(productId);
    setProduct(data);
    setLoading(false);
  };

  const loadBoxTypes = async () => {
    setBoxTypesLoading(true);
    try {
      const types = await boxTypeService.getBoxTypes();
      setBoxTypes(types);
    } catch (error) {
      console.warn("Failed to fetch box types from API, using defaults:", error);
      // Fallback to default box types
      setBoxTypes([
        { code: "SOLO", name: "SOLO", description: "Solo Box" },
        { code: "SHARED", name: "SHARED", description: "Shared Box" },
      ]);
    } finally {
      setBoxTypesLoading(false);
    }
  };

  // Auto-select appropriate box size based on product weight/dimensions
  useEffect(() => {
    if (product) {
      const totalWeight = product.weight * quantity;
      const totalVolume = product.dimensions 
        ? (product.dimensions.length * product.dimensions.width * product.dimensions.height) / 1000000 * quantity
        : totalWeight / 1000;
      
      if (totalWeight <= boxSizePricing.small.maxWeight && totalVolume <= boxSizePricing.small.maxVolume) {
        setSelectedBoxSize("small");
      } else if (totalWeight <= boxSizePricing.medium.maxWeight && totalVolume <= boxSizePricing.medium.maxVolume) {
        setSelectedBoxSize("medium");
      } else {
        setSelectedBoxSize("large");
      }
    }
  }, [product, quantity]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const priceInPHP = product.price * 0.042; // Mock conversion
  const shippingEstimate = "7-14 days (Sea) / 3-5 days (Air)";
  
  // Box size pricing (PHP)
  const boxSizePricing = {
    small: {
      solo: { base: 1500, perKg: 50, perCbm: 1000 },
      shared: { base: 800, perKg: 30, perCbm: 600 },
      maxWeight: 5, // kg
      maxVolume: 0.1, // CBM
    },
    medium: {
      solo: { base: 2300, perKg: 80, perCbm: 2000 },
      shared: { base: 1500, perKg: 50, perCbm: 1200 },
      maxWeight: 15, // kg
      maxVolume: 0.3, // CBM
    },
    large: {
      solo: { base: 3500, perKg: 120, perCbm: 3000 },
      shared: { base: 2200, perKg: 70, perCbm: 1800 },
      maxWeight: 30, // kg
      maxVolume: 0.6, // CBM
    },
  };
  
  // Calculate shipping fee based on box size and type
  const calculateShippingFee = () => {
    const size = boxSizePricing[selectedBoxSize];
    const pricing = size[boxTypePreference];
    const weight = product.weight * quantity;
    const volume = (product.dimensions 
      ? (product.dimensions.length * product.dimensions.width * product.dimensions.height) / 1000000 
      : weight / 1000) * quantity; // Convert to CBM
    
    const shippingFee = pricing.base + (weight * pricing.perKg) + (volume * pricing.perCbm);
    return Math.round(shippingFee);
  };
  
  const shippingFee = calculateShippingFee();
  const subtotal = priceInPHP * quantity;
  const total = subtotal + shippingFee;

  const handleBoxTypeSelect = (boxType: "SOLO" | "SHARED") => {
    setBoxTypePreference(boxType.toLowerCase() as "solo" | "shared");
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/store/products/" + productId);
      return;
    }

    if (!product) return;

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
      await cartService.addToCart({
        user_id: user.id,
        product_id: product.id,
        quantity: quantity,
        box_type_preference: boxTypePreference,
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

  const handleBuyNow = () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/store/products/" + productId);
      return;
    }

    // Store order data in sessionStorage for payment page
    const orderData = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      boxTypePreference: boxTypePreference,
    };
    
    sessionStorage.setItem("temp_order", JSON.stringify(orderData));
    
    // Navigate to payment page
    router.push(`/store/payment?orderId=temp-order-${Date.now()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-border bg-white">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="h-full w-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png';
                  }}
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
          <h1 className="mb-4 text-4xl font-bold text-grey-900">
            {product.name}
          </h1>
          <div className="mb-6">
            <p className="text-3xl font-bold text-soft-blue-600">
              {formatCurrency(priceInPHP, "PHP")}
            </p>
            <p className="text-sm font-medium text-grey-600">
              {formatCurrency(product.price, "KRW")}
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <h3 className="mb-2 text-base font-semibold text-grey-900">Description</h3>
              <p className="text-grey-700 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold text-grey-900">Shipping Estimate</h3>
              <p className="text-grey-700 font-medium">
                {shippingEstimate} from Korea to Philippines
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold text-grey-900">Weight</h3>
              <p className="text-grey-700 font-medium">{product.weight} kg</p>
            </div>

            {product.dimensions && (
              <div>
                <h3 className="mb-2 text-base font-semibold text-grey-900">Dimensions</h3>
                <p className="text-grey-700 font-medium">
                  {product.dimensions.length}cm × {product.dimensions.width}cm ×{" "}
                  {product.dimensions.height}cm
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-base font-semibold text-grey-900">Stock</h3>
              <p className="text-grey-700 font-semibold">
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="mb-2 block text-base font-semibold text-grey-900">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-grey-300 bg-white text-grey-700 font-bold transition-colors hover:border-soft-blue-600 hover:bg-soft-blue-50 hover:text-soft-blue-700"
              >
                -
              </button>
              <span className="text-xl font-bold text-grey-900 min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-grey-300 bg-white text-grey-700 font-bold transition-colors hover:border-soft-blue-600 hover:bg-soft-blue-50 hover:text-soft-blue-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Box Type and Size Selection */}
          <div className="mb-6 space-y-4">
            {/* Box Type Selection */}
            <div>
              <label className="mb-3 block text-base font-bold text-grey-900">Box Type</label>
              <div className="flex gap-3">
                {boxTypesLoading ? (
                  <div className="flex flex-1 items-center justify-center py-4">
                    <p className="text-sm text-muted-foreground">Loading box types...</p>
                  </div>
                ) : (
                  <>
                    {boxTypes.length > 0 ? (
                      boxTypes.map((boxType) => {
                        const isSolo = boxType.code === "SOLO" || boxType.code === "solo";
                        const isShared = boxType.code === "SHARED" || boxType.code === "shared";
                        
                        if (isSolo || isShared) {
                          const isSelected = (isSolo && boxTypePreference === "solo") || 
                                           (isShared && boxTypePreference === "shared");
                          return (
                            <button
                              key={boxType.code}
                              onClick={() => handleBoxTypeSelect(isSolo ? "SOLO" : "SHARED")}
                              className={`flex-1 rounded-xl border-2 p-4 text-sm font-bold transition-all ${
                                isSelected
                                  ? "border-soft-blue-600 bg-soft-blue-600 text-white shadow-md"
                                  : "border-border bg-white text-grey-900 hover:border-soft-blue-300 hover:bg-soft-blue-50"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {isSolo ? (
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                                  </svg>
                                )}
                                <span>{boxType.name || boxType.code}</span>
                              </div>
                            </button>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <>
                        {/* Fallback: Show default buttons if API fails or returns no data */}
                        <button
                          onClick={() => handleBoxTypeSelect("SOLO")}
                          className={`flex-1 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                            boxTypePreference === "solo"
                              ? "border-soft-blue-600 bg-soft-blue-600 text-white shadow-md"
                              : "border-border bg-white text-grey-700 hover:border-soft-blue-300 hover:bg-soft-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span>SOLO</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleBoxTypeSelect("SHARED")}
                          className={`flex-1 rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                            boxTypePreference === "shared"
                              ? "border-soft-blue-600 bg-soft-blue-600 text-white shadow-md"
                              : "border-border bg-white text-grey-700 hover:border-soft-blue-300 hover:bg-soft-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                            </svg>
                            <span>SHARED</span>
                          </div>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Box Size Selection */}
            <div>
              <label className="mb-3 block text-base font-bold text-grey-900">Box Size</label>
              <div className="grid grid-cols-3 gap-3">
                {(["small", "medium", "large"] as const).map((size) => {
                  const sizeInfo = boxSizePricing[size];
                  const pricing = sizeInfo[boxTypePreference];
                  const isSelected = selectedBoxSize === size;
                  const maxWeight = sizeInfo.maxWeight;
                  const maxVolume = sizeInfo.maxVolume;
                  
                  // Check if this size can accommodate the product
                  const totalWeight = product.weight * quantity;
                  const totalVolume = product.dimensions 
                    ? (product.dimensions.length * product.dimensions.width * product.dimensions.height) / 1000000 * quantity
                    : totalWeight / 1000;
                  
                  const canFit = totalWeight <= maxWeight && totalVolume <= maxVolume;
                  const isRecommended = size === "medium" && canFit; // Medium is default recommendation
                  
                  // Size icons
                  const sizeIcons = {
                    small: (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm2 1v10h12V5H4z" />
                      </svg>
                    ),
                    medium: (
                      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm2 1v10h12V5H4z" />
                      </svg>
                    ),
                    large: (
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm2 1v10h12V5H4z" />
                      </svg>
                    ),
                  };
                  
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedBoxSize(size)}
                      disabled={!canFit}
                      className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                        isSelected
                          ? "border-soft-blue-600 bg-soft-blue-50 shadow-md scale-105"
                          : canFit
                          ? "border-border bg-white hover:border-soft-blue-300 hover:bg-soft-blue-50 hover:shadow-sm"
                          : "border-grey-200 bg-grey-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {isRecommended && !isSelected && (
                        <span className="absolute -top-2 -right-2 rounded-full bg-soft-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          ⭐ Recommended
                        </span>
                      )}
                      
                      {/* Icon */}
                      <div className={`mb-2 flex justify-center ${
                        isSelected ? "text-soft-blue-600" : canFit ? "text-grey-700" : "text-grey-400"
                      }`}>
                        {sizeIcons[size]}
                      </div>
                      
                      {/* Size Label */}
                      <div className={`mb-1 text-xs font-bold uppercase ${
                        isSelected ? "text-soft-blue-700" : canFit ? "text-grey-900" : "text-grey-500"
                      }`}>
                        {size}
                      </div>
                      
                      {/* Price */}
                      <div className={`mb-2 text-base font-bold ${
                        isSelected ? "text-soft-blue-700" : canFit ? "text-grey-900" : "text-grey-500"
                      }`}>
                        {formatCurrency(pricing.base, "PHP")}
                      </div>
                      
                      {/* Capacity Info */}
                      <div className={`text-xs leading-tight font-medium ${
                        canFit ? "text-grey-700" : "text-grey-500"
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          <span>Up to {maxWeight}kg</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          <span>{maxVolume.toFixed(1)}CBM</span>
                        </div>
                      </div>
                      
                      {!canFit && (
                        <div className="mt-2 text-[10px] font-semibold text-error">
                          ✕ Too small
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <svg className="h-4 w-4 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-xl border-2 border-soft-blue-200 bg-white p-5 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <h3 className="text-base font-bold text-grey-900">Price Summary</h3>
              </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-grey-800 font-medium">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <span>Shipping ({selectedBoxSize} {boxTypePreference}):</span>
                  </div>
                  <span className="font-bold text-grey-900">{formatCurrency(shippingFee, "PHP")}</span>
                </div>
                <div className="border-t-2 border-grey-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-grey-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-soft-blue-600">{formatCurrency(total, "PHP")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {addingToCart ? "Adding..." : cartSuccess ? "✓ Added to Cart" : "Add to Cart"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1"
              size="lg"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

