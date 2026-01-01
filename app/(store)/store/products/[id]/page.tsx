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
            <>
              <img
                src={product.images[0]}
                alt={product.name}
                className="mb-4 aspect-square w-full rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name} ${idx + 2}`}
                      className="aspect-square rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  ))}
                </div>
              )}
            </>
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
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            {product.name}
          </h1>
          <div className="mb-6">
            <p className="text-3xl font-bold text-soft-blue-600">
              {formatCurrency(priceInPHP, "PHP")}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(product.price, "KRW")}
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Shipping Estimate</h3>
              <p className="text-muted-foreground">
                {shippingEstimate} from Korea to Philippines
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Weight</h3>
              <p className="text-muted-foreground">{product.weight} kg</p>
            </div>

            {product.dimensions && (
              <div>
                <h3 className="mb-2 font-semibold">Dimensions</h3>
                <p className="text-muted-foreground">
                  {product.dimensions.length}cm × {product.dimensions.width}cm ×{" "}
                  {product.dimensions.height}cm
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-semibold">Stock</h3>
              <p className="text-muted-foreground">
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border"
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Box Type Selection */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold">Box Type</label>
            <div className="flex gap-2">
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
                            className={`flex-1 rounded-lg border-2 p-3 text-sm font-semibold transition-colors ${
                              isSelected
                                ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                                : "border-border bg-background hover:bg-grey-50"
                            }`}
                          >
                            {boxType.name || boxType.code}
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
                        className={`flex-1 rounded-lg border-2 p-3 text-sm font-semibold transition-colors ${
                          boxTypePreference === "solo"
                            ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                            : "border-border bg-background hover:bg-grey-50"
                        }`}
                      >
                        SOLO
                      </button>
                      <button
                        onClick={() => handleBoxTypeSelect("SHARED")}
                        className={`flex-1 rounded-lg border-2 p-3 text-sm font-semibold transition-colors ${
                          boxTypePreference === "shared"
                            ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                            : "border-border bg-background hover:bg-grey-50"
                        }`}
                      >
                        SHARED
                      </button>
                    </>
                  )}
                </>
              )}
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

