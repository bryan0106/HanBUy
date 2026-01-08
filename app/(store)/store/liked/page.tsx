"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { productService, type Product } from "@/services/productService";
import { likedService, type LikedItem } from "@/services/likedService";
import { LikeButton } from "@/components/store/LikeButton";

export default function LikedItemsPage() {
  const { isAuthenticated, user } = useAuth();
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadLikedItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const loadLikedItems = async () => {
    setLoading(true);
    try {
      // Get liked items from API (only called on this page, not on every product card)
      const response = await likedService.getLikedItems();
      setLikedItems(response.data);

      // Sync API data to localStorage for LikeButton components to use
      if (user?.id && typeof window !== "undefined") {
        const localStorageData = response.data.map((item) => ({
          productId: item.product_id,
          likedAt: item.created_at,
        }));
        localStorage.setItem(`hanbuy_liked_${user.id}`, JSON.stringify(localStorageData));
      }

      // Fetch product details for liked items
      if (response.data.length > 0) {
        const productPromises = response.data.map((item) =>
          productService.getProductById(item.product_id).catch(() => null)
        );
        const productResults = await Promise.all(productPromises);
        const validProducts = productResults.filter((p): p is Product => p !== null);
        setProducts(validProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading liked items:", error);
      // Fallback to localStorage on error
      try {
        const stored = localStorage.getItem(`hanbuy_liked_${user?.id || "guest"}`);
        const liked: Array<{ productId: string; likedAt: string }> = stored ? JSON.parse(stored) : [];
        if (liked.length > 0) {
          const productPromises = liked.map((item) =>
            productService.getProductById(item.productId).catch(() => null)
          );
          const productResults = await Promise.all(productPromises);
          const validProducts = productResults.filter((p): p is Product => p !== null);
          setProducts(validProducts);
        }
      } catch (fallbackError) {
        console.error("Error loading from localStorage fallback:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiked = async (productId: string) => {
    try {
      // Remove from API
      await likedService.removeFromLiked(productId);
      
      // Update local state
      setLikedItems(prev => prev.filter((item) => item.product_id !== productId));
      setProducts(prev => prev.filter((p) => p.id !== productId));
      
      // Also update localStorage as backup
      if (user?.id) {
        const stored = localStorage.getItem(`hanbuy_liked_${user.id}`);
        const liked: Array<{ productId: string; likedAt: string }> = stored ? JSON.parse(stored) : [];
        const updated = liked.filter((item) => item.productId !== productId);
        localStorage.setItem(`hanbuy_liked_${user.id}`, JSON.stringify(updated));
      }
      
      // Trigger re-render of LikeButton components
      window.dispatchEvent(new Event("likedItemsUpdated"));
    } catch (error) {
      console.error("Error removing liked item:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Liked Items
        </h1>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading liked items...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-xl font-semibold">Please log in</h2>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to view your liked items
          </p>
          <Link
            href="/auth/login?redirect=/store/liked"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Log In
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">❤️</div>
          <h2 className="mb-2 text-xl font-semibold">No liked items yet</h2>
          <p className="mb-6 text-muted-foreground">
            Start exploring our products and like items you're interested in
          </p>
          <Link
            href="/store/products"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const mainImage = product.images && product.images.length > 0 ? product.images[0] : "/placeholder-product.png";
            const priceInPHP = product.price * 0.042;
            
            return (
              <div
                key={product.id}
                className="group relative rounded-[4px] border border-[#FCE4EC] bg-white transition-shadow"
              >
                <Link href={`/store/products/${product.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-grey-100">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.png";
                      }}
                    />
                    {product.stock && product.stock > 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-success/90 px-2 py-1 text-xs font-medium text-white">
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute left-2 top-2 rounded-full bg-warning/90 px-2 py-1 text-xs font-medium text-white">
                        Pre-Order
                      </span>
                    )}
                    <LikeButton productId={product.id} size="sm" />
                  </div>
                  <div className="p-4">
                    {product.brand && (
                      <p className="mb-1 text-xs font-medium text-[#6b7280]">{product.brand}</p>
                    )}
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-[#2C2C2C] sm:text-base">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#FF85A2]">
                      ₱{priceInPHP.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {formatCurrency(product.price, product.currency as Currency)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

