"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, type Currency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { categories } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { LikeButton } from "@/components/store/LikeButton";
import { PreorderCountdown } from "@/components/store/PreorderCountdown";
import { PreorderProgress } from "@/components/store/PreorderProgress";
import { PreorderPaymentInfo } from "@/components/store/PreorderPaymentInfo";
import { ProductSuggestionModal, type ProductSuggestion } from "@/components/store/ProductSuggestionModal";
import { useAuth } from "@/hooks/useAuth";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { productService } from "@/services/productService";
import type { Product as ServiceProduct } from "@/services/productService";

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
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<PreorderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Mock artists list - in real app, this would come from product data
  const artists = ["BTS", "BLACKPINK", "NewJeans", "IVE", "LE SSERAFIM", "aespa", "Stray Kids", "TWICE"];

  // Helper function to convert ServiceProduct to PreorderProduct
  const convertServiceProductToPreorderProduct = (serviceProduct: ServiceProduct): PreorderProduct => {
    return {
      id: serviceProduct.id,
      name: serviceProduct.name,
      description: serviceProduct.description || '',
      price: serviceProduct.price,
      currency: (serviceProduct.currency || 'KRW') as Currency,
      images: serviceProduct.images || [],
      category: serviceProduct.category || '',
      brand: serviceProduct.brand,
      quantity: serviceProduct.stock || 0,
      orderDate: serviceProduct.order_date ? new Date(serviceProduct.order_date) : new Date(),
      orderDeadline: serviceProduct.order_deadline ? new Date(serviceProduct.order_deadline) : serviceProduct.release_date ? new Date(serviceProduct.release_date) : new Date(),
      releaseDate: serviceProduct.release_date ? new Date(serviceProduct.release_date) : new Date(),
      stock: serviceProduct.stock || 0,
      preorder_stock: serviceProduct.preorder_stock || serviceProduct.preorder_available_stock || serviceProduct.stock || 100,
      is_preorder_available: serviceProduct.is_preorder_available ?? (serviceProduct.product_type === 'preorder' || serviceProduct.product_type === 'preorder_and_onhand'),
      is_onhand_available: serviceProduct.is_onhand_available ?? (serviceProduct.product_type === 'onhand' || (serviceProduct.stock > 0 && serviceProduct.product_type === 'preorder_and_onhand')),
      depositPercentage: serviceProduct.deposit_percentage || 50,
      preorderAvailableStock: serviceProduct.preorder_available_stock || serviceProduct.preorder_stock || serviceProduct.stock || 100,
      preordersClaimed: serviceProduct.preorders_claimed || 0,
      shippingTimeDays: serviceProduct.shipping_time_days || 7,
    };
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedBrand, priceRange]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params: any = {
        page: 1,
        limit: 100, // API max is 100; we'll page if needed
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedBrand !== 'all') {
        params.brand = selectedBrand;
      }

      // Fetch products from API (page through if there are more than 100)
      const allServiceProducts: ServiceProduct[] = [];
      let currentPage = 1;
      while (true) {
        const response = await productService.getPreorderProducts({
          ...params,
          page: currentPage,
        });

        allServiceProducts.push(...response.data);

        if (!response.pagination?.hasNextPage) break;
        currentPage += 1;
        if (currentPage > 1000) break; // safety
      }

      // Convert service products to PreorderProduct type
      let convertedProducts = allServiceProducts.map(convertServiceProductToPreorderProduct);
      
      // Filter by price range client-side (convert KRW to PHP for comparison)
      convertedProducts = convertedProducts.filter(p => {
        const priceInPHP = p.price * 0.042;
        return priceInPHP >= priceRange[0] && priceInPHP <= priceRange[1];
      });
      
      setProducts(convertedProducts);
    } catch (error) {
      console.error("Error loading preorder products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for badge (compact format)
  const formatDateForBadge = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  };

  // Helper function to extract item type from product name
  const getItemType = (productName: string, brand?: string): string => {
    const name = productName.toLowerCase();
    
    // Check for common item types
    if (name.includes('album') || name.includes('cd') || name.includes('photobook')) {
      return 'Album';
    }
    if (name.includes('ticket') || name.includes('tour') || name.includes('concert') || name.includes('event')) {
      return 'Ticket';
    }
    if (name.includes('bag') || name.includes('tote') || name.includes('backpack')) {
      return 'Bag';
    }
    if (name.includes('accessory') || name.includes('accessories') || name.includes('keychain') || name.includes('pin') || name.includes('badge')) {
      return 'Accessories';
    }
    if (name.includes('poster') || name.includes('postcard')) {
      return 'Poster';
    }
    if (name.includes('clothing') || name.includes('shirt') || name.includes('hoodie') || name.includes('jacket')) {
      return 'Clothing';
    }
    
    // Default fallback
    return 'Item';
  };

  // Helper function to get days until date and status
  const getDateStatus = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", days: Math.abs(diffDays), label: "Expired", showDate: true };
    } else if (diffDays === 0) {
      return { status: "today", days: 0, label: "Today", showDate: false };
    } else if (diffDays === 3) {
      return { status: "ending_soon", days: 3, label: "3 days", showDate: false };
    } else if (diffDays === 7) {
      return { status: "ending_soon", days: 7, label: "Week", showDate: false };
    } else if (diffDays < 7) {
      return { status: "ending_soon", days: diffDays, label: `${diffDays} days`, showDate: false };
    } else {
      return { status: "upcoming", days: diffDays, label: formatDateForBadge(d), showDate: true };
    }
  };

  // Extract brands from products
  const brands: string[] = Array.from(new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b))));

  // Calculate max price for slider
  const maxPrice = Math.max(...products.map(p => p.price * 0.042), 100000);

  // Filter products client-side
  const filteredProducts = products.filter((product) => {
    const priceInPHP = product.price * 0.042; // Convert KRW to PHP for comparison
    const matchesPrice =
      priceInPHP >= priceRange[0] && priceInPHP <= priceRange[1];
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    // Mock artist matching - in real app, this would check product.artist
    const matchesArtist = selectedArtist === "all" || 
      product.name.toLowerCase().includes(selectedArtist.toLowerCase());
    return matchesPrice && matchesBrand && matchesCategory && matchesArtist;
  });

  const handleSubmitSuggestion = async (suggestion: ProductSuggestion) => {
    try {
      // Mock suggestion - no API call
      console.log("Product suggestion (mock):", suggestion);
      alert("Thank you! Your product suggestion has been submitted. We'll review it and add it to our pre-order page if approved.");
    } catch (error: any) {
      throw new Error(error.message || "Failed to submit suggestion. Please try again.");
    }
  };

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
        <div className="mb-4 lg:hidden">
          <FilterSidebar
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedArtist={selectedArtist}
            priceRange={priceRange}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onArtistChange={setSelectedArtist}
            onPriceRangeChange={setPriceRange}
            categories={categories}
            brands={brands}
            artists={artists}
            maxPrice={maxPrice}
          />
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-full lg:block lg:w-64">
          <FilterSidebar
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedArtist={selectedArtist}
            priceRange={priceRange}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onArtistChange={setSelectedArtist}
            onPriceRangeChange={setPriceRange}
            categories={categories}
            brands={brands}
            artists={artists}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Products Display */}
        <div className="flex-1">
          {loading ? (
            <div className="py-8 text-center sm:py-12">
              <p className="text-muted-foreground">Loading preorder products...</p>
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
                    const priceInPHP = product.price * 0.042; // Mock conversion
                    const originalPrice = priceInPHP * 1.3;
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
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                  {product.brand}
                                </p>
                                <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-white bg-grey-600 sm:text-xs">
                                  {getItemType(product.name, product.brand)}
                                </span>
                              </div>
                            )}
                            
                            {/* Payment Info with Deposit - Desktop Only */}
                            <div className="hidden sm:block mb-2">
                              <PreorderPaymentInfo
                                price={product.price}
                                currency={product.currency}
                                depositPercentage={product.depositPercentage || 50}
                                className="mb-2"
                              />
                            </div>
                            
                            {/* Price - Mobile: Simple with deadline inline, Desktop: Full payment info */}
                            <div className="mb-2 sm:hidden">
                              <div className="flex flex-col">
                                <p className="text-base font-bold text-pink-600">
                                  From {formatCurrency(priceInPHP, "PHP")}
                                </p>
                                {product.is_preorder_available && (
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(originalPrice, "PHP")}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                      <span className="font-medium">📅 Deadline:</span>{" "}
                                      <span className="font-semibold text-foreground">{formatDateForBadge(product.orderDeadline)}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Desktop Only: Additional Info */}
                            <div className="hidden sm:block">
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
                              
                              {/* Timeline - Enhanced for New Item Releases */}
                              <div className="mt-2 space-y-1">
                                {product.is_preorder_available && (
                                  <>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="font-medium text-foreground">📅 Pre-Order:</span>
                                      <span>{formatDate(product.orderDate)} - {formatDate(product.orderDeadline)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="font-medium text-foreground">🎬 Release:</span>
                                      <span>{formatDate(product.releaseDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="font-medium text-foreground">🚚 Expected Arrival:</span>
                                      <span>{formatDate(expectedDelivery)}</span>
                                    </div>
                                  </>
                                )}
                                {product.is_onhand_available && !product.is_preorder_available && (
                                  <div className="text-xs font-medium text-green-600">
                                    🚀 Ready to Ship Now
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  
                  {/* Suggestion Card - Only show for logged in users */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowSuggestionModal(true)}
                      className="w-full rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-6 text-center transition-colors hover:border-pink-400 hover:bg-pink-50"
                    >
                      <svg
                        className="mx-auto mb-3 h-12 w-12 text-grey-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <h3 className="mb-1 text-base font-semibold text-foreground">
                        Can't find what you're looking for?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Suggest a product and we'll add it to our pre-order list
                      </p>
                    </button>
                  )}
                </div>
              ) : viewType === "single" ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042; // Mock conversion
                    const originalPrice = priceInPHP * 1.3;
                    const expectedDelivery = new Date(product.releaseDate);
                    expectedDelivery.setDate(expectedDelivery.getDate() + (product.shippingTimeDays || 7));
                    
                    return (
                      <div
                        key={product.id}
                        className="rounded-lg border border-border bg-card p-4 sm:p-6"
                      >
                        <div className="relative mb-4 aspect-square w-full">
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
                          {/* Release Date Badge with Status */}
                          {product.is_preorder_available && (() => {
                            const dateStatus = getDateStatus(product.releaseDate);
                            const badgeColor = 
                              dateStatus.status === "expired" ? "bg-red-600" :
                              dateStatus.status === "ending_soon" || dateStatus.status === "today" ? "bg-orange-600" :
                              "bg-blue-600";
                            
                            return (
                              <div className={`absolute top-2 left-2 z-10 rounded px-2.5 py-1 text-xs font-semibold text-white ${badgeColor}`}>
                                {dateStatus.status === "expired" ? (
                                  <span>⚠️ Expired: {formatDateForBadge(product.releaseDate)}</span>
                                ) : dateStatus.status === "today" ? (
                                  <span>⏰ Today</span>
                                ) : dateStatus.status === "ending_soon" ? (
                                  <span>⏰ {dateStatus.label}</span>
                                ) : (
                                  <span>Release: {dateStatus.label}</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold sm:text-xl">{product.name}</h3>
                        {product.brand && (
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground">
                              {product.brand}
                            </p>
                            <span className="rounded px-2 py-0.5 text-xs font-semibold text-white bg-grey-600">
                              {getItemType(product.name, product.brand)}
                            </span>
                          </div>
                        )}
                        
                        {/* Payment Info with Deposit - Desktop Only */}
                        <div className="hidden sm:block mb-4">
                          <PreorderPaymentInfo
                            price={product.price}
                            currency={product.currency}
                            depositPercentage={product.depositPercentage || 50}
                            className="mb-4"
                          />
                        </div>
                        
                        {/* Price - Mobile: Simple with deadline inline, Desktop: Full payment info */}
                        <div className="mb-4 sm:hidden">
                          <div className="flex flex-col">
                            <p className="text-base font-bold text-pink-600">
                              From {formatCurrency(priceInPHP, "PHP")}
                            </p>
                            {product.is_preorder_available && (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(originalPrice, "PHP")}
                                </p>
                                <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  <span className="font-medium">📅 Deadline:</span>{" "}
                                  <span className="font-semibold text-foreground">{formatDateForBadge(product.orderDeadline)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Only: Additional Info */}
                        <div className="hidden sm:block">
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
                          
                          {/* Timeline Info - Enhanced for New Item Releases */}
                          <div className="mb-4 rounded-lg bg-grey-50 p-3 space-y-2">
                            {product.is_preorder_available && (
                              <>
                                <div className="border-b border-grey-200 pb-2 mb-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Pre-Order Period</p>
                                  <p className="text-sm font-medium text-foreground">
                                    📅 {formatDate(product.orderDate)} - {formatDate(product.orderDeadline)}
                                  </p>
                                </div>
                                <div className="border-b border-grey-200 pb-2 mb-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Release Date</p>
                                  <p className="text-sm font-medium text-foreground">
                                    🎬 {formatDate(product.releaseDate)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Shipments will begin sequentially from the release date
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Expected Arrival</p>
                                  <p className="text-sm font-medium text-foreground">
                                    🚚 {formatDate(expectedDelivery)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Estimated delivery after release (subject to shipping)
                                  </p>
                                </div>
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
                      </div>
                    );
                  })}
                  
                  {/* Suggestion Card - Only show for logged in users */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowSuggestionModal(true)}
                      className="w-full rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-8 text-center transition-colors hover:border-pink-400 hover:bg-pink-50 sm:p-12"
                    >
                      <svg
                        className="mx-auto mb-4 h-16 w-16 text-grey-400 sm:mb-6 sm:h-20 sm:w-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <h3 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">
                        Can't find what you're looking for?
                      </h3>
                      <p className="text-sm text-muted-foreground sm:text-base">
                        Suggest a product and we'll add it to our pre-order list
                      </p>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const priceInPHP = product.price * 0.042; // Mock conversion
                    // Calculate original price (add 30% markup for strikethrough effect)
                    const originalPrice = priceInPHP * 1.3;
                    
                    return (
                      <div
                        key={product.id}
                        className="group relative rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
                      >
                        {/* Release Date Badge with Status */}
                        {product.is_preorder_available && (() => {
                          const dateStatus = getDateStatus(product.releaseDate);
                          const badgeColor = 
                            dateStatus.status === "expired" ? "bg-red-600" :
                            dateStatus.status === "ending_soon" || dateStatus.status === "today" ? "bg-orange-600" :
                            "bg-blue-600";
                          
                          return (
                            <div className={`absolute top-2 left-2 z-10 rounded px-2.5 py-1 text-xs font-semibold text-white ${badgeColor}`}>
                              {dateStatus.status === "expired" ? (
                                <span>⚠️ Expired: {formatDateForBadge(product.releaseDate)}</span>
                              ) : dateStatus.status === "today" ? (
                                <span>⏰ Today</span>
                              ) : dateStatus.status === "ending_soon" ? (
                                <span>⏰ {dateStatus.label}</span>
                              ) : (
                                <span>Release: {dateStatus.label}</span>
                              )}
                            </div>
                          );
                        })()}
                        
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
                          {/* Brand with Item Type */}
                          {product.brand && (
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {product.brand}
                              </p>
                              <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-white bg-grey-600 sm:text-xs">
                                {getItemType(product.name, product.brand)}
                              </span>
                            </div>
                          )}
                          
                          {/* Product Name */}
                          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
                            {product.name}
                          </h3>
                          
                          {/* Price - Simple with strikethrough */}
                          <div className="mb-2 flex flex-col">
                            <p className="text-base font-bold text-pink-600 sm:text-lg">
                              From {formatCurrency(priceInPHP, "PHP")}
                            </p>
                            {/* Discount price with deadline inline on right */}
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(originalPrice, "PHP")}
                              </p>
                              {product.is_preorder_available && (
                                <p className="text-[10px] text-muted-foreground sm:text-xs whitespace-nowrap">
                                  <span className="font-medium">📅 Deadline:</span>{" "}
                                  <span className="font-semibold text-foreground">{formatDateForBadge(product.orderDeadline)}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Suggestion Card - Only show for logged in users */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowSuggestionModal(true)}
                      className="col-span-2 rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-6 text-center transition-colors hover:border-pink-400 hover:bg-pink-50 sm:col-span-2 sm:p-8"
                    >
                      <svg
                        className="mx-auto mb-3 h-12 w-12 text-grey-400 sm:mb-4 sm:h-16 sm:w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <h3 className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                        Can't find what you're looking for?
                      </h3>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Suggest a product and we'll add it to our pre-order list
                      </p>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Suggestion Modal */}
      <ProductSuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        onSubmit={handleSubmitSuggestion}
      />
    </div>
  );
}

