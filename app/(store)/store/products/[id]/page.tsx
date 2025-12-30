"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const data = await productService.getProduct(productId);
    setProduct(data);
    setLoading(false);
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

  const handleAddToBox = () => {
    alert(`Added ${quantity} x ${product.name} to your Solo Box!`);
  };

  const handleBuyNow = () => {
    alert("Buy Now feature coming soon!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg bg-grey-200"
              ></div>
            ))}
          </div>
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={handleAddToBox}
              className="flex-1"
              size="lg"
            >
              Add to Solo Box
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="outline"
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

