"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types";
import { categories } from "@/lib/mockData";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    const category = selectedCategory === "all" ? undefined : selectedCategory;
    const data = await productService.getProducts(category);
    setProducts(data);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-foreground">Product Catalog</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64">
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

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredProducts.length} product(s)
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const priceInPHP = product.price * 0.042; // Mock conversion
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
                      <p className="text-lg font-bold text-soft-blue-600">
                        {formatCurrency(priceInPHP, "PHP")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(product.price, "KRW")}
                      </p>
                    </Link>
                  );
                })}
              </div>
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
