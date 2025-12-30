"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

interface ComparisonItem {
  id: string;
  name: string;
  ourPrice: number;
  competitors: {
    website: string;
    url: string;
    price: number;
    currency: "KRW";
    lastChecked: Date;
  }[];
  bestPrice: number;
  savings: number;
  imageUrl?: string;
}

export default function KRComparisonPage() {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: ComparisonItem[] = [
      {
        id: "comp-1",
        name: "COSRX Advanced Snail 96 Mucin Power Essence",
        ourPrice: 25000,
        competitors: [
          {
            website: "Gmarket",
            url: "https://gmarket.co.kr",
            price: 28000,
            currency: "KRW",
            lastChecked: new Date(),
          },
          {
            website: "Coupang",
            url: "https://coupang.com",
            price: 27000,
            currency: "KRW",
            lastChecked: new Date(),
          },
        ],
        bestPrice: 25000,
        savings: 3000,
      },
    ];
    setItems(mockData);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-foreground">
          KR Website Price Comparison
        </h1>
        <p className="text-muted-foreground">
          Compare prices across Korean websites and find the best deals
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading comparisons...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No price comparisons available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const ourPricePHP = item.ourPrice * 0.042;
            const isBestPrice = item.bestPrice === item.ourPrice;
            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="mb-4 text-xl font-semibold">{item.name}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Our Price */}
                  <div
                    className={`rounded-lg border-2 p-4 ${
                      isBestPrice
                        ? "border-success bg-success/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold">HanBuy Price</p>
                      {isBestPrice && (
                        <span className="rounded-full bg-success px-2 py-1 text-xs font-medium text-white">
                          Best Price
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-soft-blue-600">
                      {formatCurrency(ourPricePHP, "PHP")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.ourPrice, "KRW")}
                    </p>
                  </div>

                  {/* Competitor Prices */}
                  <div className="space-y-3">
                    <p className="font-semibold">Other Websites</p>
                    {item.competitors.map((competitor, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-border bg-grey-50 p-3"
                      >
                        <div>
                          <p className="font-medium">{competitor.website}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(competitor.price, "KRW")}
                          </p>
                        </div>
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-soft-blue-600 hover:underline text-sm"
                        >
                          View →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                {item.savings > 0 && (
                  <div className="mt-4 rounded-lg bg-success/10 p-3">
                    <p className="text-sm font-medium text-success">
                      Save {formatCurrency(item.savings, "KRW")} compared to
                      highest competitor
                    </p>
                  </div>
                )}
                <button className="mt-4 w-full rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700">
                  Order from HanBuy
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

