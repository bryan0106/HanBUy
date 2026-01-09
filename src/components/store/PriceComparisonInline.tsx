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

interface PriceComparisonInlineProps {
  product: Product;
  currentPrice: number;
  priceInPHP: number;
  onViewFull: () => void;
}

export function PriceComparisonInline({ 
  product, 
  currentPrice, 
  priceInPHP,
  onViewFull 
}: PriceComparisonInlineProps) {
  const [competitors, setCompetitors] = useState<CompetitorPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [product]);

  const loadComparisonData = async () => {
    setLoading(true);
    // TODO: Fetch from API based on product ID
    // For now, use mock data
    const mockCompetitors: CompetitorPrice[] = [
      {
        website: "Coupang",
        url: `https://www.coupang.com/vp/products/search?q=${encodeURIComponent(product.name)}`,
        price: Math.round(currentPrice * 1.08), // Mock: 8% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
      {
        website: "Gmarket",
        url: `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(product.name)}`,
        price: Math.round(currentPrice * 1.12), // Mock: 12% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
      {
        website: "11st",
        url: `https://www.11st.co.kr/search/SearchAction.tmall?kwd=${encodeURIComponent(product.name)}`,
        price: Math.round(currentPrice * 1.05), // Mock: 5% higher
        currency: "KRW",
        lastChecked: new Date(),
      },
    ];
    
    setCompetitors(mockCompetitors);
    setLoading(false);
  };

  const bestCompetitorPrice = competitors.length > 0 
    ? Math.min(...competitors.map(c => c.price))
    : currentPrice;
  const isBestPrice = currentPrice <= bestCompetitorPrice;
  const savings = isBestPrice && competitors.length > 0
    ? bestCompetitorPrice - currentPrice
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-sm text-muted-foreground">Loading price comparison...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Desktop: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Our Price - Highlighted */}
        <div className={`rounded-lg border-2 p-2 ${
          isBestPrice
            ? "border-[#FF85A2] bg-[#FFF5F7]"
            : "border-soft-blue-200 bg-soft-blue-50"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-grey-900">HanBuy Price</p>
            {isBestPrice && (
              <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#FF85A2] text-white">
                Best ✓
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-[#FF85A2]">
            {formatCurrency(priceInPHP, "PHP")}
          </p>
          <p className="text-[10px] text-grey-600">
            {formatCurrency(currentPrice, "KRW")}
          </p>
        </div>

        {/* Competitor Prices - Compact Grid */}
        <div className="space-y-1.5">
          {competitors.slice(0, 2).map((competitor, idx) => {
            const competitorPricePHP = competitor.price * 0.042;
            const priceDiff = competitor.price - currentPrice;
            const isHigher = priceDiff > 0;
            
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-grey-200 bg-grey-50 p-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[11px] font-semibold text-grey-900">{competitor.website}</p>
                    {isHigher && (
                      <span className="text-[9px] text-grey-600">
                        (+{formatCurrency(priceDiff, "KRW")})
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-grey-900">
                    {formatCurrency(competitorPricePHP, "PHP")}
                  </p>
                  <p className="text-[9px] text-grey-600">
                    {formatCurrency(competitor.price, "KRW")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Info - Full Width */}
      {savings > 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-2">
          <p className="text-[11px] font-semibold text-green-800">
            💰 Save {formatCurrency(savings, "KRW")} ({formatCurrency(savings * 0.042, "PHP")}) vs lowest competitor!
          </p>
        </div>
      )}

      {/* View Full Comparison Button */}
      <button
        onClick={onViewFull}
        className="w-full rounded-lg border border-[#FCE4EC] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7] flex items-center justify-center gap-1.5"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        View Full Comparison
      </button>
    </div>
  );
}

