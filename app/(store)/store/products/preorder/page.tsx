"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/productService";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { categories } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { LikeButton } from "@/components/store/LikeButton";
import { PreorderCountdown } from "@/components/store/PreorderCountdown";
import { PreorderProgress } from "@/components/store/PreorderProgress";
import { PreorderPaymentInfo } from "@/components/store/PreorderPaymentInfo";

interface PreorderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  images: string[];
  category: string;
  brand?: string;
  quantity: number;
  orderDate: Date; // When preorder started
  orderDeadline: Date; // When preorders close
  releaseDate: Date;
  
  // Stock Management (Option 2: Separate Onhand Stock Field)
  stock: number;                    // Available onhand stock (if available)
  preorder_stock?: number;          // Preorder stock (if still accepting)
  
  // Flags (Option 2)
  is_preorder_available?: boolean;  // Accepting preorders?
  is_onhand_available?: boolean;    // Available now?
  
  // Preorder-specific fields
  depositPercentage?: number; // e.g., 50 for 50%
  preorderAvailableStock?: number; // Max preorders allowed
  preordersClaimed?: number; // How many already ordered
  shippingTimeDays?: number; // Days from release to delivery (default: 7)
}

type ViewType = "list" | "single" | "grid";

export default function PreorderProductsPage() {
  const [products, setProducts] = useState<PreorderProduct[]>([]);
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
    try {
      const params: any = {
        page: 1,
        limit: 50,
      };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedBrand !== 'all') {
        params.brand = selectedBrand;
      }
      if (priceRange[0] > 0 || priceRange[1] < 100000) {
        params.min_price = priceRange[0];
        params.max_price = priceRange[1];
      }
      const response = await productService.getPreorderProducts(params);
      // Convert API response to PreorderProduct format (Option 2: Separate Onhand Stock)
      const products: PreorderProduct[] = response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        currency: (p.currency === 'PHP' || p.currency === 'KRW' ? p.currency : 'KRW') as Currency,
        images: p.images || [],
        category: p.category || '',
        brand: p.brand,
        quantity: p.stock || 0,
        orderDate: p.order_date ? new Date(p.order_date) : new Date(),
        orderDeadline: p.order_deadline ? new Date(p.order_deadline) : p.release_date ? new Date(p.release_date) : new Date(),
        releaseDate: p.release_date ? new Date(p.release_date) : new Date(),
        
        // Stock Management (Option 2)
        stock: p.stock || 0,                    // Onhand stock
        preorder_stock: p.preorder_stock || p.preorder_available_stock || p.stock || 100, // Preorder stock
        
        // Flags (Option 2)
        is_preorder_available: p.is_preorder_available ?? (p.product_type === 'preorder' || p.product_type === 'preorder_and_onhand'),
        is_onhand_available: p.is_onhand_available ?? (p.product_type === 'onhand' || (p.stock > 0 && p.product_type === 'preorder_and_onhand')),
        
        // Preorder-specific fields (with defaults if not provided)
        depositPercentage: p.deposit_percentage || 50, // Default 50%
        preorderAvailableStock: p.preorder_available_stock || p.preorder_stock || p.stock || 100,
        preordersClaimed: p.preorders_claimed || 0,
        shippingTimeDays: p.shipping_time_days || 7, // Default 7 days
      }));
      setProducts(products);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const priceInPHP = product.price * 0.042; // Mock conversion
    const matchesPrice =
      priceInPHP >= priceRange[0] && priceInPHP <= priceRange[1];
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesPrice && matchesBrand && matchesCategory;
  });

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Pre-Order Items
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Pre-order items with estimated release dates
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
        <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
          <button
            onClick={() => setViewType("list")}
            className={cn(
              "rounded-lg p-2 transition-all",
              viewType === "list"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
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
              "rounded-lg p-2 transition-all",
              viewType === "single"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
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
              "rounded-lg p-2 transition-all",
              viewType === "grid"
                ? "bg-soft-blue-600 text-white shadow-sm"
                : "text-grey-700 hover:bg-grey-100 hover:text-grey-900"
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
              <p className="text-muted-foreground">No pre-order items available.</p>
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
                    const expectedDelivery = new Date(product.releaseDate);
                    expectedDelivery.setDate(expectedDelivery.getDate() + (product.shippingTimeDays || 7));
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/store/products/${product.id}`}
                        className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-soft-blue-300 hover:shadow-sm sm:p-4"
                      >
                        <div className="flex gap-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                          ) : (
                            <div className="h-20 w-20 shrink-0 rounded-lg bg-grey-200 sm:h-24 sm:w-24"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 font-semibold sm:mb-2">{product.name}</h3>
                            {product.brand && (
                              <p className="mb-2 text-xs text-muted-foreground sm:text-sm">
                                {product.brand}
                              </p>
                            )}
                            
                            {/* Payment Info with Deposit */}
                            <PreorderPaymentInfo
                              price={product.price}
                              currency={product.currency}
                              depositPercentage={product.depositPercentage || 50}
                              className="mb-2"
                            />
                            
                            {/* Option 2: Available Now Badge (if product has onhand stock) */}
                            {product.is_onhand_available && product.stock > 0 && (
                              <div className="mb-2 rounded-lg bg-green-100 p-2 text-xs font-medium text-green-700">
                                ✅ Available Now: {product.stock} units
                              </div>
                            )}
                            
                            {/* Countdown & Progress */}
                            {product.is_preorder_available && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                <PreorderCountdown
                                  deadline={product.orderDeadline}
                                  className="text-xs"
                                />
                                {product.preorderAvailableStock && (
                                  <PreorderProgress
                                    claimed={product.preordersClaimed || 0}
                                    available={product.preorderAvailableStock}
                                    className="flex-1 min-w-[120px]"
                                  />
                                )}
                              </div>
                            )}
                            
                            {/* Timeline */}
                            <div className="mt-2 text-xs text-muted-foreground">
                              {product.is_preorder_available && (
                                <>Release: {formatDate(product.releaseDate)} → Delivery: {formatDate(expectedDelivery)}</>
                              )}
                              {product.is_onhand_available && !product.is_preorder_available && (
                                <>🚀 Ready to Ship Now</>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : viewType === "single" ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredProducts.map((product) => {
                    const expectedDelivery = new Date(product.releaseDate);
                    expectedDelivery.setDate(expectedDelivery.getDate() + (product.shippingTimeDays || 7));
                    
                    return (
                      <div
                        key={product.id}
                        className="rounded-lg border border-border bg-card p-4 sm:p-6"
                      >
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="mb-4 aspect-video w-full rounded-lg object-cover sm:aspect-square sm:h-64"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.png';
                            }}
                          />
                        ) : (
                          <div className="mb-4 aspect-video w-full rounded-lg bg-grey-200 sm:aspect-square sm:h-64"></div>
                        )}
                        <h3 className="mb-2 text-lg font-semibold sm:text-xl">{product.name}</h3>
                        {product.brand && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            {product.brand}
                          </p>
                        )}
                        
                        {/* Payment Info with Deposit */}
                        <PreorderPaymentInfo
                          price={product.price}
                          currency={product.currency}
                          depositPercentage={product.depositPercentage || 50}
                          className="mb-4"
                        />
                        
                        {/* Countdown Timer */}
                        <PreorderCountdown
                          deadline={product.orderDeadline}
                          className="mb-4"
                        />
                        
                        {/* Progress Bar */}
                        {product.is_preorder_available && product.preorderAvailableStock && (
                          <PreorderProgress
                            claimed={product.preordersClaimed || 0}
                            available={product.preorderAvailableStock}
                            className="mb-4"
                          />
                        )}
                        
                        {/* Option 2: Available Now Badge (if product has onhand stock) */}
                        {product.is_onhand_available && product.stock > 0 && (
                          <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm font-medium text-green-700">
                            ✅ Available Now: {product.stock} units in stock (Ready to Ship)
                          </div>
                        )}
                        
                        {/* Timeline Info */}
                        <div className="mb-4 rounded-lg bg-grey-50 p-3 space-y-2">
                          {product.is_preorder_available && (
                            <>
                              <p className="text-sm font-medium text-foreground">
                                ⏰ Order Deadline: {formatDate(product.orderDeadline)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                📅 Release Date: {formatDate(product.releaseDate)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                🚚 Expected Delivery: {formatDate(expectedDelivery)}
                              </p>
                            </>
                          )}
                          {product.is_onhand_available && (
                            <p className="text-sm font-medium text-green-600">
                              🚀 Ready to Ship Now ({product.stock} units available)
                            </p>
                          )}
                        </div>
                        
                        {/* Option 2: Dual Purchase Buttons (if both available) */}
                        {product.is_onhand_available && product.is_preorder_available && product.stock > 0 ? (
                          <div className="space-y-2">
                            <Link
                              href={`/store/products/${product.id}?purchase=onhand`}
                              className="block w-full rounded-lg bg-green-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-green-700"
                            >
                              Buy Now ({product.stock} in stock)
                            </Link>
                            <Link
                              href={`/store/products/${product.id}?purchase=preorder`}
                              className="block w-full rounded-lg border-2 border-soft-blue-600 bg-white px-4 py-2 text-center font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50"
                            >
                              Pre-Order Now
                            </Link>
                          </div>
                        ) : (
                          /* Single Button */
                          <Link
                            href={`/store/products/${product.id}`}
                            className="block w-full rounded-lg bg-soft-blue-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-soft-blue-700"
                          >
                            {product.is_onhand_available && product.stock > 0 ? 'Buy Now' : 'Pre-Order Now'}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const expectedDelivery = new Date(product.releaseDate);
                    expectedDelivery.setDate(expectedDelivery.getDate() + (product.shippingTimeDays || 7));
                    
                    return (
                      <div
                        key={product.id}
                        className="rounded-lg border border-border bg-card p-3 sm:p-4"
                      >
                        <Link href={`/store/products/${product.id}`}>
                          <div className="relative mb-3 aspect-square w-full overflow-hidden sm:mb-4">
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
                            <LikeButton productId={product.id} size="sm" />
                          </div>
                        </Link>
                        <h3 className="mb-1 font-semibold sm:mb-2">{product.name}</h3>
                        {product.brand && (
                          <p className="mb-1 text-xs text-muted-foreground sm:text-sm">
                            {product.brand}
                          </p>
                        )}
                        
                        {/* Payment Info with Deposit */}
                        <PreorderPaymentInfo
                          price={product.price}
                          currency={product.currency}
                          depositPercentage={product.depositPercentage || 50}
                          className="mb-2"
                        />
                        
                        {/* Countdown Timer - Only show if accepting preorders */}
                        {product.is_preorder_available && (
                          <PreorderCountdown
                            deadline={product.orderDeadline}
                            className="mb-2"
                          />
                        )}
                        
                        {/* Progress Bar - Only show if accepting preorders */}
                        {product.is_preorder_available && product.preorderAvailableStock && (
                          <PreorderProgress
                            claimed={product.preordersClaimed || 0}
                            available={product.preorderAvailableStock}
                            className="mb-2"
                          />
                        )}
                        
                        {/* Option 2: Available Now Badge (if product has onhand stock) */}
                        {product.is_onhand_available && product.stock > 0 && (
                          <div className="mb-2 rounded-lg bg-green-100 p-2 text-xs font-medium text-green-700">
                            ✅ Available Now: {product.stock} units in stock
                          </div>
                        )}
                        
                        {/* Timeline Info */}
                        <div className="mb-3 space-y-1 rounded-lg bg-grey-50 p-2 text-xs">
                          {product.is_preorder_available && (
                            <>
                              <p className="text-muted-foreground">
                                📅 Release: {formatDate(product.releaseDate)}
                              </p>
                              <p className="text-muted-foreground">
                                🚚 Expected: {formatDate(expectedDelivery)}
                              </p>
                            </>
                          )}
                          {product.is_onhand_available && (
                            <p className="text-green-600 font-medium">
                              🚀 Ready to Ship Now
                            </p>
                          )}
                        </div>
                        
                        {/* Option 2: Dual Purchase Buttons (if both available) */}
                        {product.is_onhand_available && product.is_preorder_available && product.stock > 0 ? (
                          <div className="space-y-2">
                            <Link
                              href={`/store/products/${product.id}?purchase=onhand`}
                              className="block w-full rounded-lg bg-green-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-green-700"
                            >
                              Buy Now ({product.stock} in stock)
                            </Link>
                            <Link
                              href={`/store/products/${product.id}?purchase=preorder`}
                              className="block w-full rounded-lg border-2 border-soft-blue-600 bg-white px-4 py-2 text-center font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50"
                            >
                              Pre-Order Now
                            </Link>
                          </div>
                        ) : (
                          /* Single Button (only preorder or only onhand) */
                          <Link
                            href={`/store/products/${product.id}`}
                            className="block w-full rounded-lg bg-soft-blue-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-soft-blue-700"
                          >
                            {product.is_onhand_available && product.stock > 0 ? 'Buy Now' : 'Pre-Order Now'}
                          </Link>
                        )}
                      </div>
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

