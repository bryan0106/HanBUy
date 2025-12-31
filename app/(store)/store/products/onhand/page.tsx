"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";
import { categories } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type ViewType = "list" | "single" | "grid";

export default function OnhandProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    // TODO: Filter for onhand items only
    const category = selectedCategory === "all" ? undefined : selectedCategory;
    const data = await productService.getProducts(category);
    setProducts(data.filter((p) => p.stock > 0));
    setLoading(false);
  };

  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

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
                ? "bg-soft-blue-600 text-white"
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
                  ? "bg-soft-blue-600 text-white"
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
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50"
        >
          <svg
            className="h-5 w-5"
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
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("list")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewType === "list"
                ? "bg-soft-blue-100 text-soft-blue-700"
                : "text-grey-600 hover:bg-grey-50"
            )}
            aria-label="List View"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewType("single")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewType === "single"
                ? "bg-soft-blue-100 text-soft-blue-700"
                : "text-grey-600 hover:bg-grey-50"
            )}
            aria-label="Single Column View"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16v12H4V6z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewType("grid")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewType === "grid"
                ? "bg-soft-blue-100 text-soft-blue-700"
                : "text-grey-600 hover:bg-grey-50"
            )}
            aria-label="Grid View"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h8M4 10h8M4 14h8M4 18h8M16 6h4M16 10h4M16 14h4M16 18h4"
              />
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
                      <Link
                        key={product.id}
                        href={`/store/products/${product.id}`}
                        className="group flex gap-4 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:p-4"
                      >
                        <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200 sm:h-24 sm:w-24"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="mb-1 font-semibold group-hover:text-soft-blue-600 sm:mb-2">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="mb-2 text-xs text-muted-foreground sm:text-sm">
                              {product.brand}
                            </p>
                          )}
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <p className="text-base font-bold text-soft-blue-600 sm:text-lg">
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
                    );
                  })}
                </div>
              ) : viewType === "single" ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042;
                    return (
                      <Link
                        key={product.id}
                        href={`/store/products/${product.id}`}
                        className="group block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
                      >
                        <div className="mb-4 aspect-video w-full rounded-lg bg-grey-200 sm:aspect-square sm:h-64"></div>
                        <h3 className="mb-2 text-lg font-semibold group-hover:text-soft-blue-600 sm:text-xl">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            {product.brand}
                          </p>
                        )}
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-soft-blue-600">
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
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042;
                    return (
                      <Link
                        key={product.id}
                        href={`/store/products/${product.id}`}
                        className="group rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:p-4"
                      >
                        <div className="mb-3 aspect-square w-full rounded-lg bg-grey-200 sm:mb-4"></div>
                        <h3 className="mb-1 font-semibold group-hover:text-soft-blue-600 sm:mb-2">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="mb-1 text-xs text-muted-foreground sm:text-sm">
                            {product.brand}
                          </p>
                        )}
                        <div className="mb-2">
                          <p className="text-base font-bold text-soft-blue-600 sm:text-lg">
                            {formatCurrency(priceInPHP, "PHP")}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatCurrency(product.price, "KRW")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            In Stock ({product.stock})
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

