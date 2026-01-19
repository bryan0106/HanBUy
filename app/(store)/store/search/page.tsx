"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { mockProducts } from "@/lib/mockData";
import { mockPreorderProducts } from "@/lib/mockPreorderData";
import type { Product } from "@/types";
import type { Product as ServiceProduct } from "@/services/productService";
import { LikeButton } from "@/components/store/LikeButton";

// Extended Product type that includes preorder properties
type ExtendedProduct = Product & {
  product_type?: 'onhand' | 'preorder' | 'kr_website' | 'preorder_and_onhand';
  is_preorder_available?: boolean;
  is_onhand_available?: boolean;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Get initial search query from URL
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Combine both onhand and preorder products
      // Normalize products to ensure they match the expected Product type
      const normalizedPreorderProducts: ExtendedProduct[] = mockPreorderProducts.map((product: ServiceProduct) => ({
        ...product,
        description: product.description || '',
        currency: (product.currency || 'KRW') as 'KRW',
        category: product.category || '',
        sku: product.sku || '',
        weight: product.weight || 0,
        images: product.images || [],
        createdAt: product.created_at ? new Date(product.created_at) : new Date(),
        updatedAt: product.updated_at ? new Date(product.updated_at) : new Date(),
        // Preserve preorder-specific properties
        product_type: product.product_type,
        is_preorder_available: product.is_preorder_available,
        is_onhand_available: product.is_onhand_available,
      }));
      
      const allProducts: ExtendedProduct[] = [...mockProducts, ...normalizedPreorderProducts];
      
      // Search in name, brand, category, and description
      const searchLower = query.toLowerCase().trim();
      const filtered = allProducts.filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const brandMatch = product.brand?.toLowerCase().includes(searchLower);
        const categoryMatch = product.category?.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
        
        return nameMatch || brandMatch || categoryMatch || descriptionMatch;
      });

      setProducts(filtered);
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-grey-900">Search Products</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search for products, brands, or categories..."
              className="flex-1 rounded-lg border-2 border-border bg-white px-4 py-3 text-grey-900 placeholder:text-grey-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Search Results Count */}
        {hasSearched && !loading && (
          <p className="text-sm text-grey-600">
            {products.length === 0
              ? "No products found"
              : `Found ${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-grey-600">Searching...</div>
        </div>
      )}

      {/* No Search Query */}
      {!hasSearched && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-2 text-xl font-semibold text-grey-900">Start Your Search</h2>
          <p className="text-grey-600">
            Enter a product name, brand, or category to find what you're looking for
          </p>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h2 className="mb-2 text-xl font-semibold text-grey-900">No Results Found</h2>
          <p className="mb-4 text-grey-600">
            Try different keywords or browse our categories
          </p>
          <Link
            href="/store/products"
            className="rounded-lg bg-pink-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Browse All Products
          </Link>
        </div>
      )}

      {/* Search Results */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const priceInPHP = product.price * 0.042;
            const originalPrice = priceInPHP * 1.3; // 30% markup for strikethrough
            const isPreorder = product.product_type === 'preorder' || product.is_preorder_available;
            
            return (
              <div
                key={product.id}
                className="group relative rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Status Badge */}
                {isPreorder ? (
                  <div className="absolute top-2 left-2 z-10 rounded-md bg-pink-700 px-2 py-1 text-xs font-semibold text-white">
                    Pre-Order
                  </div>
                ) : product.stock > 0 ? (
                  <div className="absolute top-2 left-2 z-10 rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    In Stock
                  </div>
                ) : null}
                
                <Link href={`/store/products/${product.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-grey-200"></div>
                    )}
                    <div className="absolute top-2 right-2">
                      <LikeButton productId={product.id} size="sm" />
                    </div>
                  </div>
                </Link>
                <div className="p-3">
                  {product.brand && (
                    <p className="mb-1 text-xs font-medium text-muted-foreground sm:text-sm">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
                    {product.name}
                  </h3>
                  <div className="flex flex-col">
                    <p className="text-base font-bold text-pink-600 sm:text-lg">
                      From {formatCurrency(priceInPHP, "PHP")}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(originalPrice, "PHP")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-grey-600">Loading...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

