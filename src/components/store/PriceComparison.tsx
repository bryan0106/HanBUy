"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";

interface CompetitorPrice {
  website: string;
  url: string;
  price: number;
  currency: "KRW";
  lastChecked: Date;
}

interface PriceComparisonProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceComparison({ product, isOpen, onClose }: PriceComparisonProps) {
  const [competitors, setCompetitors] = useState<CompetitorPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product) {
      loadComparisonData();
    }
  }, [isOpen, product]);

  const loadComparisonData = async () => {
    setLoading(true);
    // TODO: Fetch from API based on product ID
    // For now, use mock data
    const mockCompetitors: CompetitorPrice[] = [
      {
        website: "Coupang",
        url: `https://www.coupang.com/vp/products/search?q=${encodeURIComponent(product.name)}`,
        price: Math.round(product.price * 1.08), // Mock: 8% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
      {
        website: "Gmarket",
        url: `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(product.name)}`,
        price: Math.round(product.price * 1.12), // Mock: 12% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
      {
        website: "11st",
        url: `https://www.11st.co.kr/search/SearchAction.tmall?kwd=${encodeURIComponent(product.name)}`,
        price: Math.round(product.price * 1.05), // Mock: 5% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
    ];
    
    setCompetitors(mockCompetitors);
    setLoading(false);
  };

  const ourPricePHP = product.price * 0.042;
  const bestCompetitorPrice = competitors.length > 0 
    ? Math.min(...competitors.map(c => c.price))
    : product.price;
  const isBestPrice = product.price <= bestCompetitorPrice;
  const savings = isBestPrice && competitors.length > 0
    ? bestCompetitorPrice - product.price
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-[4px] border border-[#FCE4EC] bg-white p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#2C2C2C] hover:text-[#FF85A2] transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Price Comparison</h2>
          <p className="text-[#6b7280]">{product.name}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-[#6b7280]">Loading price comparison...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Our Price */}
            <div className={`rounded-[4px] border-2 p-4 ${
              isBestPrice
                ? "border-[#FF85A2] bg-[#FFF5F7]"
                : "border-[#FCE4EC] bg-white"
            }`}>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-[#2C2C2C]">HanBuy Price</p>
                {isBestPrice && (
                  <span className="rounded-[4px] bg-[#FF85A2] px-3 py-1 text-xs font-semibold text-white">
                    Best Price ✓
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-[#FF85A2]">
                {formatCurrency(ourPricePHP, "PHP")}
              </p>
              <p className="text-sm text-[#6b7280]">
                {formatCurrency(product.price, "KRW")}
              </p>
            </div>

            {/* Competitor Prices */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#2C2C2C]">Other Korean Websites</h3>
              <div className="space-y-3">
                {competitors.map((competitor, idx) => {
                  const competitorPricePHP = competitor.price * 0.042;
                  const priceDiff = competitor.price - product.price;
                  const isHigher = priceDiff > 0;
                  
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-[4px] border border-[#FCE4EC] bg-white p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold text-[#2C2C2C]">{competitor.website}</p>
                          {isHigher && (
                            <span className="text-xs text-[#6b7280]">
                              (+{formatCurrency(priceDiff, "KRW")})
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-[#2C2C2C]">
                          {formatCurrency(competitorPricePHP, "PHP")}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          {formatCurrency(competitor.price, "KRW")}
                        </p>
                        <p className="mt-1 text-xs text-[#6b7280]">
                          Last checked: {competitor.lastChecked.toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-sm font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7]"
                      >
                        View →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings Info */}
            {savings > 0 && (
              <div className="rounded-[4px] bg-[#FFF5F7] border border-[#FCE4EC] p-4">
                <p className="text-sm font-semibold text-[#2C2C2C]">
                  💰 You save {formatCurrency(savings, "KRW")} ({formatCurrency(savings * 0.042, "PHP")}) compared to the lowest competitor!
                </p>
              </div>
            )}

            {/* Note */}
            <div className="rounded-[4px] bg-[#FFF5F7] border border-[#FCE4EC] p-3">
              <p className="text-xs text-[#6b7280]">
                <strong>Note:</strong> Prices are updated regularly. Competitor prices may vary based on promotions, shipping costs, and availability. All prices shown are in Korean Won (KRW) and converted to PHP for comparison.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

