"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { LikeButton } from "@/components/store/LikeButton";
import { getPrimaryImage, getDisplayPrice, getDisplayCurrency, getBrandName, getAvailableStock, isInStock } from "@/lib/productUtils";

type ViewType = "list" | "single" | "grid";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Build API params from filters
  const apiParams = {
    product_type: "all" as const,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    brand: selectedBrand === "all" ? undefined : selectedBrand,
    min_price: priceRange[0] > 0 ? priceRange[0] / 0.042 : undefined, // Convert PHP to KRW
    max_price: priceRange[1] < 100000 ? priceRange[1] / 0.042 : undefined,
    page: currentPage,
    limit: 20,
    sort: "created_desc" as const,
  };

  const { products, loading, error, pagination, aggregations, loadMore } = useProducts(apiParams);

  // Get brands from aggregations or extract from products
  const brands = aggregations?.brands || 
    Array.from(new Set(products.map((p) => getBrandName(p)).filter(Boolean))) as string[];

  // Get categories from aggregations
  const categories = aggregations?.categories || [];

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <h1 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl md:text-4xl">
        Product Catalog
      </h1>

      {/* Mobile Category Chips - Horizontal Scroll */}
      <div className="mb-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat.slug
                  ? "bg-soft-blue-600 text-white"
                  : "bg-grey-100 text-grey-700 hover:bg-grey-200"
              )}
            >
              {cat.name} {cat.count !== undefined && `(${cat.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Button and View Type Controls */}
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-grey-800 transition-colors hover:bg-grey-50 hover:border-soft-blue-300"
        >
          <svg
            className="h-5 w-5 text-grey-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </button>

        {/* View Type Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
          <button
            onClick={() => setViewType("list")}
            className={cn(
              "rounded-lg p-2 transition-all",
              viewType === "list"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
            )}
            aria-label="List view"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewType("single")}
            className={cn(
              "rounded-lg p-2 transition-all",
              viewType === "single"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
            )}
            aria-label="Single column view"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewType("grid")}
            className={cn(
              "rounded-lg p-2 transition-all",
              viewType === "grid"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
            )}
            aria-label="Grid view"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Filters Dropdown */}
      {showFilters && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4 lg:hidden">
          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Brand
              </h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Price Range (PHP)
            </h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-full lg:block lg:w-64">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Filters</h2>

            {/* Category Filter - Desktop */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Category
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === "all"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  All Products
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={selectedCategory === cat.slug}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="mr-2"
                    />
                    {cat.name} {cat.count !== undefined && `(${cat.count})`}
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Brand
                </h3>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand) => {
                    const brandName = typeof brand === 'string' ? brand : brand.name;
                    const brandId = typeof brand === 'string' ? brand : brand.id;
                    return (
                      <option key={brandId} value={brandName}>
                        {brandName} {typeof brand === 'object' && brand.count !== undefined && `(${brand.count})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Price Range (PHP)
              </h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => {
                    setPriceRange([Number(e.target.value), priceRange[1]]);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], Number(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Display */}
        <div className="flex-1">
          {loading && products.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-error">Error: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm text-muted-foreground sm:mb-4">
                Showing {products.length} of {pagination?.total || 0} product(s)
              </div>
              
              {/* Different View Types */}
              {viewType === "list" ? (
                <div className="space-y-3 sm:space-y-4">
                  {products.map((product) => {
                    const displayPrice = getDisplayPrice(product);
                    const displayCurrency = getDisplayCurrency(product);
                    const brandName = getBrandName(product);
                    return (
                      <div
                        key={product.id}
                        className="group flex gap-4 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:p-4"
                      >
                        <Link
                          href={`/store/products/${product.id}`}
                          className="flex gap-4 flex-1"
                        >
                          <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="h-full w-full rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                            <LikeButton productId={product.id} size="sm" />
                          </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="mb-1 font-semibold group-hover:text-soft-blue-600 sm:mb-2">
                            {product.name}
                          </h3>
                          {brandName && (
                            <p className="mb-2 text-xs text-muted-foreground sm:text-sm">
                              {brandName}
                            </p>
                          )}
                          <p className="text-base font-bold text-soft-blue-600 sm:text-lg">
                            {formatCurrency(displayPrice, displayCurrency)}
                          </p>
                          {product.currency === 'KRW' && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatCurrency(product.price, "KRW")}
                            </p>
                          )}
                          {isInStock(product) && (
                            <span className="mt-1 inline-block rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                              In Stock ({getAvailableStock(product)})
                            </span>
                          )}
                        </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : viewType === "single" ? (
                <div className="space-y-4 sm:space-y-6">
                  {products.map((product) => {
                    const displayPrice = getDisplayPrice(product);
                    const displayCurrency = getDisplayCurrency(product);
                    const brandName = getBrandName(product);
                    return (
                      <div
                        key={product.id}
                        className="group relative block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
                      >
                        <Link href={`/store/products/${product.id}`}>
                          <div className="relative mb-4 aspect-square w-full sm:mb-6">
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="aspect-square w-full rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                            <LikeButton productId={product.id} />
                          </div>
                        <h3 className="mb-2 font-semibold group-hover:text-soft-blue-600 sm:text-lg">
                          {product.name}
                        </h3>
                        {brandName && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            {brandName}
                          </p>
                        )}
                        <p className="text-lg font-bold text-soft-blue-600 sm:text-xl">
                          {formatCurrency(displayPrice, displayCurrency)}
                        </p>
                        {product.currency === 'KRW' && (
                          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            {formatCurrency(product.price, "KRW")}
                          </p>
                        )}
                        {isInStock(product) && (
                          <span className="mt-2 inline-block rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            In Stock ({getAvailableStock(product)})
                          </span>
                        )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
                  {products.map((product) => {
                    const displayPrice = getDisplayPrice(product);
                    const displayCurrency = getDisplayCurrency(product);
                    const brandName = getBrandName(product);
                    return (
                      <div
                        key={product.id}
                        className="group relative rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:p-4"
                      >
                        <Link href={`/store/products/${product.id}`}>
                          <div className="relative mb-3 aspect-square w-full sm:mb-4">
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="aspect-square w-full rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                            <LikeButton productId={product.id} size="sm" />
                          </div>
                        <h3 className="mb-1 text-sm font-semibold group-hover:text-soft-blue-600 sm:mb-2 sm:text-base">
                          {product.name}
                        </h3>
                        {brandName && (
                          <p className="mb-1 text-xs text-muted-foreground sm:mb-2 sm:text-sm">
                            {brandName}
                          </p>
                        )}
                        <p className="text-base font-bold text-soft-blue-600 sm:text-lg">
                          {formatCurrency(displayPrice, displayCurrency)}
                        </p>
                        {product.currency === 'KRW' && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatCurrency(product.price, "KRW")}
                          </p>
                        )}
                        {isInStock(product) && (
                          <span className="mt-1 inline-block rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            In Stock ({getAvailableStock(product)})
                          </span>
                        )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    disabled={!pagination.has_prev || loading}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    disabled={!pagination.has_next || loading}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  {pagination.has_next && (
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-foreground">Product Catalog</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

