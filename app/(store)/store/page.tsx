"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { categories } from "@/lib/mockData";
import type { Product } from "@/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    loadHomePageData();
    // Auto-rotate banner every 5 seconds
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

  const loadHomePageData = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getProducts();
      
      // Featured products (first 8 products)
      setFeaturedProducts(allProducts.slice(0, 8));
      
      // New arrivals (sort by createdAt, newest first)
      const sortedByDate = [...allProducts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNewArrivals(sortedByDate.slice(0, 6));
      
      // Best sellers (mock: products with highest stock or price)
      const sortedByPopularity = [...allProducts].sort(
        (a, b) => (b.stock || 0) - (a.stock || 0)
      );
      setBestSellers(sortedByPopularity.slice(0, 6));
    } catch (error) {
      console.error("Error loading homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const banners = [
    {
      id: 1,
      title: "Shop Authentic Korean Products",
      subtitle: "Delivered directly to the Philippines",
      description: "Consolidate your Korean purchases into one convenient Solo Box",
      image: "/banners/banner-1.jpg",
      link: "/store/products",
      buttonText: "Shop Now",
      bgGradient: "from-soft-blue-600 to-soft-blue-800",
    },
    {
      id: 2,
      title: "New Arrivals This Week",
      subtitle: "Latest Korean Beauty & Fashion",
      description: "Discover the newest additions to our collection",
      image: "/banners/banner-2.jpg",
      link: "/store/products",
      buttonText: "Explore New Items",
      bgGradient: "from-pink-500 to-rose-600",
    },
    {
      id: 3,
      title: "Special Offer: Free Shipping",
      subtitle: "On orders over ₱2,000",
      description: "Limited time offer - Shop now and save on shipping",
      image: "/banners/banner-3.jpg",
      link: "/store/products",
      buttonText: "Shop & Save",
      bgGradient: "from-purple-600 to-indigo-700",
    },
  ];

  const ProductCard = ({ product }: { product: Product }) => {
    const priceInPHP = product.price * 0.042; // Mock conversion rate
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : "/placeholder-product.png";

    return (
      <Link
        href={`/store/products/${product.id}`}
        className="group relative overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-lg"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-grey-100">
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.png";
            }}
          />
          {product.stock && product.stock < 10 && (
            <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              Low Stock
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="mb-1 text-xs font-medium text-grey-600">{product.brand}</p>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-grey-900 group-hover:text-soft-blue-600">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-grey-900">
                ₱{priceInPHP.toFixed(2)}
              </p>
              <p className="text-xs text-grey-500">
                {formatCurrency(product.price, product.currency)}
              </p>
            </div>
            {product.stock && product.stock > 0 && (
              <span className="text-xs text-grey-600">In Stock</span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className={`h-full w-full bg-gradient-to-r ${banner.bgGradient}`}>
                <div className="container mx-auto flex h-full items-center px-4">
                  <div className="max-w-2xl text-white">
                    <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">
                      {banner.title}
                    </h1>
                    <p className="mb-2 text-xl font-semibold sm:text-2xl">
                      {banner.subtitle}
                    </p>
                    <p className="mb-6 text-base text-white/90 sm:text-lg">
                      {banner.description}
                    </p>
                    <Link
                      href={banner.link}
                      className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-soft-blue-600 transition-colors hover:bg-grey-50"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Banner Indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentBanner ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="Previous banner"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="Next banner"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Category Banners */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-grey-900 sm:text-4xl">
            Shop by Category
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/store/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-border bg-white shadow-md transition-all hover:shadow-xl"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-soft-blue-50 to-soft-blue-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">
                        {category.slug === "skincare" && "✨"}
                        {category.slug === "food" && "🍜"}
                        {category.slug === "fashion" && "👗"}
                      </div>
                      <h3 className="text-2xl font-bold text-grey-900">{category.name}</h3>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <p className="text-grey-700">{category.description}</p>
                  <div className="mt-4 flex items-center text-soft-blue-600 group-hover:text-soft-blue-700">
                    <span className="font-semibold">Shop {category.name}</span>
                    <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-grey-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-grey-900 sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-grey-600">Handpicked favorites from our collection</p>
            </div>
            <Link
              href="/store/products"
              className="hidden rounded-lg border-2 border-soft-blue-600 px-6 py-2 font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50 sm:block"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-grey-200" />
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
                  className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
                >
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-grey-900 sm:text-4xl">
                New Arrivals
              </h2>
              <p className="mt-2 text-grey-600">Latest additions to our store</p>
            </div>
            <Link
              href="/store/products"
              className="hidden rounded-lg border-2 border-soft-blue-600 px-6 py-2 font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50 sm:block"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-grey-200" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/store/products"
                  className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
                >
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-grey-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-grey-900 sm:text-4xl">
                Best Sellers
              </h2>
              <p className="mt-2 text-grey-600">Most popular products this month</p>
            </div>
            <Link
              href="/store/products"
              className="hidden rounded-lg border-2 border-soft-blue-600 px-6 py-2 font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50 sm:block"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-grey-200" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/store/products"
                  className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
                >
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Special Offers / Promotions */}
      <section className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Special Offers This Week
            </h2>
            <p className="mb-8 text-lg text-soft-blue-100">
              Get free shipping on orders over ₱2,000. Limited time only!
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-3 text-4xl">🚚</div>
                <h3 className="mb-2 text-xl font-semibold">Free Shipping</h3>
                <p className="text-sm text-soft-blue-100">On orders over ₱2,000</p>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-3 text-4xl">📦</div>
                <h3 className="mb-2 text-xl font-semibold">Solo Box</h3>
                <p className="text-sm text-soft-blue-100">Consolidate your purchases</p>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-3 text-4xl">⭐</div>
                <h3 className="mb-2 text-xl font-semibold">Best Prices</h3>
                <p className="text-sm text-soft-blue-100">Compare and save</p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/store/products"
                className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-soft-blue-600 transition-colors hover:bg-grey-50"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-soft-blue-50 to-soft-blue-100 p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-grey-900">
              Stay Updated
            </h2>
            <p className="mb-6 text-grey-700">
              Subscribe to our newsletter and get the latest Korean product updates, exclusive deals, and shipping notifications.
            </p>
            <form className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-border px-4 py-3 text-grey-900 placeholder-grey-500 focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-200"
              />
              <button
                type="submit"
                className="rounded-lg bg-soft-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-xs text-grey-600">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-t border-border bg-grey-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/store/products/onhand"
              className="group rounded-xl border border-border bg-white p-6 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">📦</div>
              <h3 className="mb-2 font-semibold text-grey-900">Onhand Items</h3>
              <p className="text-sm text-grey-600">Ready to ship now</p>
            </Link>
            <Link
              href="/store/products/preorder"
              className="group rounded-xl border border-border bg-white p-6 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">📅</div>
              <h3 className="mb-2 font-semibold text-grey-900">Pre-Order</h3>
              <p className="text-sm text-grey-600">Reserve upcoming items</p>
            </Link>
            <Link
              href="/store/products/kr-comparison"
              className="group rounded-xl border border-border bg-white p-6 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">💰</div>
              <h3 className="mb-2 font-semibold text-grey-900">Price Comparison</h3>
              <p className="text-sm text-grey-600">Compare and save</p>
            </Link>
            <Link
              href="/store/how-it-works"
              className="group rounded-xl border border-border bg-white p-6 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">❓</div>
              <h3 className="mb-2 font-semibold text-grey-900">How It Works</h3>
              <p className="text-sm text-grey-600">Learn more</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
