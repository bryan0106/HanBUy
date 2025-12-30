"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface PreorderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "KRW";
  images: string[];
  category: string;
  brand?: string;
  quantity: number;
  orderDate: Date;
  releaseDate: Date;
  stock: number;
}

export default function PreorderProductsPage() {
  const [products, setProducts] = useState<PreorderProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    // TODO: Fetch preorder items from API
    const mockData: PreorderProduct[] = [
      {
        id: "pre-1",
        name: "Limited Edition K-Beauty Set",
        description: "Exclusive pre-order item",
        price: 50000,
        currency: "KRW",
        images: [],
        category: "skincare",
        brand: "K-Beauty",
        quantity: 50,
        orderDate: new Date("2024-12-15"),
        releaseDate: new Date("2025-01-15"),
        stock: 30,
      },
    ];
    setProducts(mockData);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-foreground">
          Pre-Order Items
        </h1>
        <p className="text-muted-foreground">
          Pre-order items with estimated release dates
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pre-order items available.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const priceInPHP = product.price * 0.042;
            const daysUntilRelease = Math.ceil(
              (product.releaseDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={product.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
                <h3 className="mb-2 font-semibold">{product.name}</h3>
                {product.brand && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    {product.brand}
                  </p>
                )}
                <div className="mb-4 space-y-2">
                  <div>
                    <p className="text-lg font-bold text-soft-blue-600">
                      {formatCurrency(priceInPHP, "PHP")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price, "KRW")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-warning/10 p-3">
                    <p className="text-sm font-medium text-warning">
                      Order Deadline: {formatDate(product.orderDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Release Date: {formatDate(product.releaseDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {daysUntilRelease} days until release
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Available: {product.stock}
                    </span>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700">
                  Pre-Order Now
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

