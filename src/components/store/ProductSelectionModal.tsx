"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import type { ProductVariation } from "@/types";

interface ProductSelectionModalProps {
  product: Product & { variations?: ProductVariation[] };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (quantity: number, selectedVariations: Record<string, string>) => void;
  onBuyNow: (quantity: number, selectedVariations: Record<string, string>) => void;
  actionType: "addToCart" | "buyNow";
  currentPrice: number;
  priceInPHP: number;
  currencyRate: number;
  initialQuantity?: number;
  initialVariations?: Record<string, string>;
}

export function ProductSelectionModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  actionType,
  currentPrice,
  priceInPHP,
  currencyRate,
  initialQuantity = 1,
  initialVariations = {},
}: ProductSelectionModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(initialVariations);

  // Reset when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setSelectedVariations(initialVariations);
    }
  }, [isOpen, initialQuantity, initialVariations]);

  // Get available stock for selected variations
  const getAvailableStock = () => {
    if (!product.variations || product.variations.length === 0) {
      return product.stock || 0;
    }
    
    const selectedVariationIds = Object.values(selectedVariations);
    if (selectedVariationIds.length > 0) {
      const firstSelectedId = selectedVariationIds[0];
      const selectedVariation = product.variations?.find((v) => v.id === firstSelectedId);
      if (selectedVariation) {
        return selectedVariation.stock;
      }
    }
    
    if (product.variations.length > 0) {
      const minStock = Math.min(...product.variations.map((v) => v.stock));
      return minStock;
    }
    
    return product.stock || 0;
  };

  const availableStock = getAvailableStock();

  // Check if all required variation types are selected
  const hasRequiredVariations = () => {
    if (!product.variations || product.variations.length === 0) {
      return true;
    }
    
    const variationTypes = [...new Set(product.variations.map((v) => v.type))];
    return variationTypes.every((type) => selectedVariations[type] !== undefined);
  };

  const canProceed = hasRequiredVariations() && availableStock > 0 && quantity > 0;

  // Calculate price with selected variations
  const calculatePriceWithVariations = () => {
    let basePrice = currentPrice;
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

  const currentPriceWithVariations = calculatePriceWithVariations();
  const priceInPHPWithVariations = currentPriceWithVariations * currencyRate;

  const handleSubmit = () => {
    if (!canProceed) return;
    
    if (actionType === "buyNow") {
      onBuyNow(quantity, selectedVariations);
    } else {
      onAddToCart(quantity, selectedVariations);
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalPrice = priceInPHPWithVariations * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-grey-600 hover:text-grey-900 transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Product Image and Price */}
          <div className="mb-6 flex gap-4">
            {product.images && product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-lg object-cover border border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-grey-900 mb-2 line-clamp-2">{product.name}</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold text-soft-blue-600">
                  {formatCurrency(priceInPHPWithVariations, "PHP")}
                </p>
                <p className="text-sm text-grey-600">
                  {formatCurrency(currentPriceWithVariations, "KRW")}
                </p>
              </div>
            </div>
          </div>

          {/* Variations Section */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-6 space-y-4">
              <label className="block text-base font-semibold text-grey-900">Select Options</label>
              {["size", "color", "other"].map((variationType) => {
                const variationsOfType = product.variations?.filter(
                  (v) => v.type === variationType
                ) || [];
                
                if (variationsOfType.length === 0) return null;
                
                return (
                  <div key={variationType}>
                    <label className="mb-2 block text-sm font-medium text-grey-700 capitalize">
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
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
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
                                  className="h-4 w-4 rounded-full border border-grey-300"
                                  style={{
                                    backgroundColor: variation.value.toLowerCase(),
                                  }}
                                />
                              )}
                              <span>{variation.value}</span>
                              {variation.priceModifier && variation.priceModifier !== 0 && (
                                <span className="text-xs">
                                  ({variation.priceModifier > 0 ? "+" : ""}
                                  {formatCurrency(variation.priceModifier * currencyRate, "PHP")})
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
              {!hasRequiredVariations() && (
                <p className="text-sm text-soft-blue-600 font-medium">
                  Please select all required options
                </p>
              )}
            </div>
          )}

          {/* Quantity Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-grey-900">Quantity</label>
              {availableStock > 0 && (
                <span className="text-sm text-grey-600">
                  {availableStock} {availableStock === 1 ? 'item' : 'items'} available
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-grey-300 bg-white text-grey-700 font-bold text-lg transition-all hover:border-soft-blue-600 hover:bg-soft-blue-50 hover:text-soft-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const clampedValue = Math.max(1, Math.min(availableStock, value));
                  setQuantity(clampedValue);
                }}
                onBlur={(e) => {
                  if (!e.target.value || parseInt(e.target.value) < 1) {
                    setQuantity(1);
                  }
                }}
                className="h-12 w-20 rounded-lg border-2 border-grey-300 bg-white text-center text-lg font-bold text-grey-900 focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-200 transition-all"
                aria-label="Quantity"
              />
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-grey-300 bg-white text-grey-700 font-bold text-lg transition-all hover:border-soft-blue-600 hover:bg-soft-blue-50 hover:text-soft-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {availableStock <= 5 && availableStock > 0 && (
              <p className="mt-2 text-xs text-orange-600 font-medium">
                ⚠️ Only {availableStock} {availableStock === 1 ? 'item' : 'items'} left in stock!
              </p>
            )}
            {availableStock === 0 && (
              <p className="mt-2 text-xs text-red-600 font-medium">
                ❌ Out of stock
              </p>
            )}
          </div>

          {/* Total Price */}
          <div className="mb-6 rounded-lg border-2 border-soft-blue-200 bg-soft-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-grey-900">Total:</span>
              <span className="text-xl font-bold text-soft-blue-600">
                {formatCurrency(totalPrice, "PHP")}
              </span>
            </div>
            <p className="text-xs text-grey-600 mt-1">
              {quantity} {quantity === 1 ? 'item' : 'items'} × {formatCurrency(priceInPHPWithVariations, "PHP")}
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            {actionType === "buyNow" ? "Buy Now" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

