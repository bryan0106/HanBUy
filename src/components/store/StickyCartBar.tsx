"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

interface StickyCartBarProps {
  price: number;
  currency: string;
  quantity: number;
  canAddToCart: boolean;
  addingToCart: boolean;
  cartSuccess: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function StickyCartBar({
  price,
  currency,
  quantity,
  canAddToCart,
  addingToCart,
  cartSuccess,
  onAddToCart,
  onBuyNow,
}: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show bar when scrolled down, hide when scrolled up
      if (currentScrollY > 300 && currentScrollY > lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!isVisible) return null;

  const totalPrice = price * quantity;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white shadow-lg transition-transform duration-300 lg:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Price Info */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-soft-blue-600">
              {formatCurrency(totalPrice, currency as "PHP" | "KRW")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onAddToCart}
              disabled={addingToCart || !canAddToCart}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {addingToCart ? "Adding..." : cartSuccess ? "✓ Added" : "Cart"}
            </Button>
            <Button
              onClick={onBuyNow}
              disabled={!canAddToCart}
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

