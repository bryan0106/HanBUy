"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface LikedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: "KRW";
  imageUrl?: string;
  status: "onhand" | "preorder";
  likedAt: Date;
}

export default function LikedItemsPage() {
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);

  // TODO: Fetch from API
  const mockItems: LikedItem[] = [
    {
      id: "liked-1",
      productId: "550e8400-e29b-41d4-a716-446655440010",
      name: "COSRX Advanced Snail 96 Mucin Power Essence",
      price: 25000,
      currency: "KRW",
      imageUrl: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
      status: "onhand",
      likedAt: new Date("2024-12-28"),
    },
    {
      id: "liked-2",
      productId: "550e8400-e29b-41d4-a716-446655440012",
      name: "Laneige Water Bank Hyaluronic Cream",
      price: 35000,
      currency: "KRW",
      imageUrl: "https://image-optimizer-th.production.sephora-asia.net/images/product_images/zoom_1_Product_8809803572255-Laneige-Water-Bank-Blue-Hyaluronic-Cream-Moisturizer-50ml_6b1e0066b28e5faf9de7d801a9f753e077b9eeea_1702890332.png",
      status: "preorder",
      likedAt: new Date("2024-12-27"),
    },
  ];

  const handleRemoveLiked = (id: string) => {
    setLikedItems(likedItems.filter((item) => item.id !== id));
    // TODO: Call API to remove from liked items
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Liked Items
        </h1>
      </div>

      {likedItems.length === 0 ? (
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
          {mockItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <Link href={`/store/products/${item.productId}`}>
                <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-grey-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === "onhand"
                        ? "bg-success/90 text-white"
                        : "bg-warning/90 text-white"
                    }`}
                  >
                    {item.status === "onhand" ? "Onhand" : "Pre-Order"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold sm:text-base">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-soft-blue-600">
                    {formatCurrency(item.price, item.currency)}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveLiked(item.id)}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-error opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove from liked"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

