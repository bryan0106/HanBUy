"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";

export default function OnhandProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    // TODO: Filter for onhand items only
    const data = await productService.getProducts();
    setProducts(data.filter((p) => p.stock > 0));
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-foreground">
          Onhand Items
        </h1>
        <p className="text-muted-foreground">
          Available items ready for immediate shipping
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No onhand items available.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const priceInPHP = product.price * 0.042;
            return (
              <Link
                key={product.id}
                href={`/store/products/${product.id}`}
                className="group rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
                <h3 className="mb-2 font-semibold group-hover:text-soft-blue-600">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    {product.brand}
                  </p>
                )}
                <div className="mb-2">
                  <p className="text-lg font-bold text-soft-blue-600">
                    {formatCurrency(priceInPHP, "PHP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(product.price, "KRW")}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                    In Stock ({product.stock})
                  </span>
                  <button className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700">
                    Order Now
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

