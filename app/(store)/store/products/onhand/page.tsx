"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";
import { categories, mockProducts } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { LikeButton } from "@/components/store/LikeButton";
import { PasabuyModal, type PasabuyRequest } from "@/components/store/PasabuyModal";

type ViewType = "list" | "single" | "grid";

export default function OnhandProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showPasabuyModal, setShowPasabuyModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Use mock data directly - no API calls
      let filtered = [...mockProducts];
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (selectedBrand !== 'all') {
        filtered = filtered.filter(p => p.brand === selectedBrand);
      }
      
      // Filter by price range (convert KRW to PHP for comparison)
      filtered = filtered.filter(p => {
        const priceInPHP = p.price * 0.042;
        return priceInPHP >= priceRange[0] && priceInPHP <= priceRange[1];
      });
      
      setProducts(filtered);
    } catch (error) {
      console.error("Error loading onhand products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const handleSubmitPasabuy = async (request: PasabuyRequest) => {
    try {
      // Mock pasabuy request - no API call
      console.log("Pasabuy request (mock):", request);
      alert("Pasabuy request submitted successfully! We'll contact you once we find the product.");
    } catch (error: any) {
      throw new Error(error.message || "Failed to submit pasabuy request");
    }
  };

  const filteredProducts = products.filter((product) => {
    const priceInPHP = product.price * 0.042; // Mock conversion
    const matchesPrice =
      priceInPHP >= priceRange[0] && priceInPHP <= priceRange[1];
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    return matchesPrice && matchesBrand;
  });

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Onhand Items
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Available items ready for immediate shipping
        </p>
      </div>

      {/* Mobile Category Chips - Horizontal Scroll */}
      <div className="mb-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-pink-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === cat.slug
                ? "bg-pink-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Button and View Type Controls */}
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-grey-800 transition-colors hover:bg-grey-50 hover:border-pink-300"
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
                ? "bg-pink-600 text-white shadow-sm"
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
                ? "bg-pink-600 text-white shadow-sm"
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
                ? "bg-pink-600 text-white shadow-sm"
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

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-full lg:block lg:w-64">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Filters</h2>

              {/* Category Filter */}
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
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2"
                      />
                      {cat.name}
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
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
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
          </aside>

        {/* Products Display */}
        <div className="flex-1">
          {loading ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">No onhand items available.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm text-muted-foreground sm:mb-4">
                Showing {filteredProducts.length} product(s)
              </div>

              {/* Different View Types */}
              {viewType === "list" ? (
                <div className="space-y-3 sm:space-y-4">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042;
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
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full rounded-lg bg-grey-200"></div>
                            )}
                            <LikeButton productId={product.id} size="sm" />
                          </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="mb-1 font-semibold group-hover:text-pink-600 sm:mb-2">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="mb-2 text-xs text-muted-foreground sm:text-sm">
                              {product.brand}
                            </p>
                          )}
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <p className="text-base font-bold text-pink-600 sm:text-lg">
                                {formatCurrency(priceInPHP, "PHP")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(product.price, "KRW")}
                              </p>
                            </div>
                            <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                              In Stock ({product.stock})
                            </span>
                          </div>
                        </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : viewType === "single" ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042;
                    return (
                      <div
                        key={product.id}
                        className="group relative block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
                      >
                        <Link href={`/store/products/${product.id}`}>
                          <div className="relative mb-4 aspect-square w-full sm:mb-6">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="aspect-square w-full rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                }}
                              />
                            ) : (
                              <div className="aspect-square w-full rounded-lg bg-grey-200"></div>
                            )}
                            <LikeButton productId={product.id} />
                          </div>
                        <h3 className="mb-2 text-lg font-semibold group-hover:text-pink-600 sm:text-xl">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            {product.brand}
                          </p>
                        )}
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-pink-600">
                              {formatCurrency(priceInPHP, "PHP")}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(product.price, "KRW")}
                            </p>
                          </div>
                          <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            In Stock ({product.stock})
                          </span>
                        </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042;
                    // Calculate original price (add 30% markup for strikethrough effect)
                    const originalPrice = priceInPHP * 1.3;
                    
                    return (
                      <div
                        key={product.id}
                        className="group relative rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
                      >
                        {/* In Stock Badge */}
                        <div className="absolute top-2 left-2 z-10 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                          In Stock
                        </div>
                        
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
                          {/* Brand */}
                          {product.brand && (
                            <p className="mb-1 text-xs font-medium text-muted-foreground sm:text-sm">
                              {product.brand}
                            </p>
                          )}
                          
                          {/* Product Name */}
                          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
                            {product.name}
                          </h3>
                          
                          {/* Price - Simple with strikethrough */}
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

              {/* Pasabuy Card - Last Item */}
              <div
                className={cn(
                  "group relative rounded-lg border-2 border-dashed border-pink-300 bg-pink-50/50 p-4 transition-all hover:border-pink-400 hover:bg-pink-50 hover:shadow-md",
                  viewType === "list" ? "col-span-1" : viewType === "single" ? "w-full" : "col-span-2"
                )}
                onClick={() => setShowPasabuyModal(true)}
              >
                <div className="flex flex-col items-center justify-center text-center py-4 sm:py-6">
                  <div className="mb-3 rounded-full bg-pink-100 p-3 sm:mb-4 sm:p-4">
                    <svg
                      className="h-6 w-6 text-pink-500 sm:h-8 sm:w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground sm:text-lg">
                    Can't find what you're looking for?
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
                    Request a pasabuy! Send us the product URL or description, and we'll find and buy it for you.
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-pink-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-pink-600 sm:px-6 sm:py-2.5 sm:text-sm"
                  >
                    Request Pasabuy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pasabuy Modal */}
      <PasabuyModal
        isOpen={showPasabuyModal}
        onClose={() => setShowPasabuyModal(false)}
        onSubmit={handleSubmitPasabuy}
      />
    </div>
  );
}


