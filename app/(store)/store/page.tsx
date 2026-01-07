"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { LikeButton } from "@/components/store/LikeButton";
import type { Product } from "@/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    loadHomePageData();
  }, []);

  // Banner slides configuration
  const banners = [
    {
      id: 1,
      title: "Shop Authentic Korean Products",
      subtitle: "Delivered directly to the Philippines",
      buttonText: "Shop Now",
      buttonLink: "/store/products",
      productIndex: 0,
    },
    {
      id: 2,
      title: "New Arrivals This Week",
      subtitle: "Latest Korean Beauty & Fashion",
      buttonText: "Explore New Items",
      buttonLink: "/store/products",
      productIndex: 1,
    },
    {
      id: 3,
      title: "Special Offer: Free Shipping",
      subtitle: "On orders over ₱2,000",
      buttonText: "Shop & Save",
      buttonLink: "/store/products",
      productIndex: 2,
    },
  ];

  useEffect(() => {
    // Auto-rotate banners every 5 seconds
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  // Swipe detection for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next banner
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      // Swipe right - go to previous banner
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const loadHomePageData = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getProducts();
      // Featured products (first 8 products)
      setFeaturedProducts(allProducts.slice(0, 8));
    } catch (error) {
      console.error("Error loading homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBannerProduct = (index: number) => {
    return featuredProducts[index] || featuredProducts[0] || null;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const priceInPHP = product.price * 0.042; // Mock conversion rate
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : "/placeholder-product.png";

    return (
      <Link href={`/store/products/${product.id}`} className="group">
        <div className="bg-white">
          {/* Product Image */}
          <div className="relative aspect-square w-full overflow-hidden bg-[#FFF5F7]">
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-product.png";
              }}
            />
            <div className="absolute top-2 right-2">
              <LikeButton productId={product.id} size="sm" />
            </div>
          </div>
          
          {/* Product Info - Flat Design */}
          <div className="p-4">
            <p className="mb-1 text-xs font-medium text-[#6b7280]">{product.brand}</p>
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-[#2C2C2C]">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-[#2C2C2C]">
                ₱{priceInPHP.toFixed(2)}
              </p>
              <p className="text-xs text-[#6b7280]">
                {formatCurrency(product.price, product.currency)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Flat Design: 50/50 Split with Sliding Banners */}
      <section 
        className="border-b border-[#FCE4EC] bg-white relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="relative">
            {/* Banner Slides */}
            {banners.map((banner, index) => {
              const bannerProduct = getBannerProduct(banner.productIndex);
              const bannerImage = bannerProduct?.images && bannerProduct.images.length > 0 
                ? bannerProduct.images[0] 
                : "/placeholder-product.png";

              return (
                <div
                  key={banner.id}
                  className={`grid md:grid-cols-2 gap-8 items-center transition-opacity duration-500 ${
                    index === currentBanner ? "opacity-100 relative" : "opacity-0 absolute inset-0"
                  }`}
                >
                  {/* Left Side: Bold H1 + CTA Button */}
                  <div className="text-center md:text-left relative z-0">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C2C2C] mb-6 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-lg md:text-xl text-[#6b7280] mb-8">
                      {banner.subtitle}
                    </p>
                    <Link
                      href={banner.buttonLink}
                      className="inline-block rounded-[4px] bg-[#FF85A2] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                      style={{ color: 'white' }}
                    >
                      {banner.buttonText}
                    </Link>
                  </div>

                  {/* Right Side: Featured Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FFF5F7] z-0">
                    {loading ? (
                      <div className="h-full w-full animate-pulse bg-[#FFF5F7]" />
                    ) : (
                      <img
                        src={bannerImage}
                        alt={bannerProduct?.name || "Featured Product"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Navigation Arrows - Positioned on sides, outside content */}
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 xl:-translate-x-20 z-10 p-2.5 text-[#2C2C2C] hover:text-[#FF85A2] transition-colors border border-[#FCE4EC] bg-white rounded-[4px] hidden lg:flex items-center justify-center w-10 h-10"
              aria-label="Previous banner"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 xl:translate-x-20 z-10 p-2.5 text-[#2C2C2C] hover:text-[#FF85A2] transition-colors border border-[#FCE4EC] bg-white rounded-[4px] hidden lg:flex items-center justify-center w-10 h-10"
              aria-label="Next banner"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Navigation Dots - Flat Design */}
            <div className="flex justify-center gap-2 mt-8">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`rounded-[4px] transition-all duration-300 ${
                    index === currentBanner
                      ? "bg-[#FF85A2] w-8 h-2"
                      : "bg-[#FCE4EC] w-2 h-2 hover:bg-[#FF85A2]/50"
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid - Flat Design: 4-column responsive */}
      <section className="bg-[#FFF5F7] py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#2C2C2C] sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-[#6b7280]">Handpicked favorites from our collection</p>
            </div>
            <Link
              href="/store/products"
              className="hidden rounded-[4px] border border-[#FCE4EC] bg-white px-6 py-2 font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7] sm:block"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse bg-white" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/store/products"
                  className="inline-block rounded-[4px] bg-[#FF85A2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
                  style={{ color: 'white' }}
                >
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
