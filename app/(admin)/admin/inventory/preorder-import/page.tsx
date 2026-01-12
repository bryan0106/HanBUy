"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { scrapeProductFromUrl, parseKoreanDate, parseKoreanPrice } from "@/utils/webScraper";
import type { ScrapedProductData } from "@/utils/webScraper";
import { formatDate } from "@/lib/utils";

export default function PreorderImportPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "KRW",
    images: [] as string[],
    category: "k-pop",
    brand: "",
    orderDate: "",
    orderDeadline: "",
    releaseDate: "",
    depositPercentage: 50,
    preorderAvailableStock: 500,
    shippingTimeDays: 14,
  });

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      // Call backend API to scrape the URL
      // For now, we'll use a mock response structure
      const response = await fetch("/api/admin/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape product data");
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setScrapedData(result.data);
        
        // Pre-fill form with scraped data
        setProductData({
          name: result.data.name || "",
          description: result.data.description || "",
          price: result.data.price?.toString() || "",
          currency: result.data.currency || "KRW",
          images: result.data.images || [],
          category: result.data.category || "k-pop",
          brand: result.data.brand || "",
          orderDate: result.data.preorderStartDate || "",
          orderDeadline: result.data.preorderDeadline || "",
          releaseDate: result.data.releaseDate || "",
          depositPercentage: 50,
          preorderAvailableStock: 500,
          shippingTimeDays: 14,
        });
      } else {
        setError(result.error || "Failed to scrape product data");
      }
    } catch (err: any) {
      console.error("Scraping error:", err);
      setError(err.message || "Failed to scrape product. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!productData.name || !productData.price || !productData.releaseDate) {
      setError("Please fill in all required fields (Name, Price, Release Date)");
      return;
    }

    try {
      // Create preorder product
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price),
          product_type: "preorder",
          is_preorder_available: true,
          is_onhand_available: false,
          stock: 0,
          preorder_stock: productData.preorderAvailableStock,
          order_date: productData.orderDate ? new Date(productData.orderDate).toISOString() : undefined,
          order_deadline: productData.orderDeadline ? new Date(productData.orderDeadline).toISOString() : undefined,
          release_date: productData.releaseDate ? new Date(productData.releaseDate).toISOString() : undefined,
          deposit_percentage: productData.depositPercentage,
          preorder_available_stock: productData.preorderAvailableStock,
          shipping_time_days: productData.shippingTimeDays,
          source_url: scrapedData?.sourceUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create preorder product");
      }

      alert("Preorder product created successfully!");
      
      // Reset form
      setUrl("");
      setScrapedData(null);
      setProductData({
        name: "",
        description: "",
        price: "",
        currency: "KRW",
        images: [],
        category: "k-pop",
        brand: "",
        orderDate: "",
        orderDeadline: "",
        releaseDate: "",
        depositPercentage: 50,
        preorderAvailableStock: 500,
        shippingTimeDays: 14,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Import Pre-Order Product</h1>
        <p className="mb-6 text-muted-foreground">
          Enter a URL from Ktown4u, Mnet Plus, Makestar, or GQ Korea to automatically extract product information.
        </p>

        {/* URL Input */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <label className="mb-2 block text-sm font-semibold">Product URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.ktown4u.com/eventinfo?eve_no=..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2"
            />
            <Button onClick={handleScrape} disabled={loading}>
              {loading ? "Scraping..." : "Extract Data"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Scraped Data Preview */}
        {scrapedData && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">✓ Data Extracted Successfully</h3>
            <div className="text-sm text-green-700">
              <p><strong>Source:</strong> {scrapedData.sourceSite}</p>
              {scrapedData.name && <p><strong>Name:</strong> {scrapedData.name}</p>}
              {scrapedData.price && <p><strong>Price:</strong> ₩{scrapedData.price.toLocaleString()}</p>}
              {scrapedData.releaseDate && <p><strong>Release Date:</strong> {scrapedData.releaseDate}</p>}
            </div>
          </div>
        )}

        {/* Product Form */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Product Details</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">Product Name *</label>
              <input
                type="text"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="mb-1 block text-sm font-medium">Brand</label>
              <input
                type="text"
                value={productData.brand}
                onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-1 block text-sm font-medium">Price (KRW) *</label>
              <input
                type="number"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                value={productData.category}
                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              >
                <option value="k-pop">K-Pop</option>
                <option value="skincare">Skincare</option>
                <option value="food">Food</option>
                <option value="fashion">Fashion</option>
              </select>
            </div>

            {/* Pre-Order Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">Pre-Order Start Date</label>
              <input
                type="datetime-local"
                value={productData.orderDate}
                onChange={(e) => setProductData({ ...productData, orderDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Pre-Order Deadline */}
            <div>
              <label className="mb-1 block text-sm font-medium">Pre-Order Deadline</label>
              <input
                type="datetime-local"
                value={productData.orderDeadline}
                onChange={(e) => setProductData({ ...productData, orderDeadline: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">Release Date *</label>
              <input
                type="datetime-local"
                value={productData.releaseDate}
                onChange={(e) => setProductData({ ...productData, releaseDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
                required
              />
            </div>

            {/* Deposit Percentage */}
            <div>
              <label className="mb-1 block text-sm font-medium">Deposit Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={productData.depositPercentage}
                onChange={(e) => setProductData({ ...productData, depositPercentage: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Available Stock */}
            <div>
              <label className="mb-1 block text-sm font-medium">Pre-Order Available Stock</label>
              <input
                type="number"
                min="0"
                value={productData.preorderAvailableStock}
                onChange={(e) => setProductData({ ...productData, preorderAvailableStock: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            {/* Shipping Time */}
            <div>
              <label className="mb-1 block text-sm font-medium">Shipping Time (Days)</label>
              <input
                type="number"
                min="1"
                value={productData.shippingTimeDays}
                onChange={(e) => setProductData({ ...productData, shippingTimeDays: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={productData.description}
              onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>

          {/* Images */}
          {productData.images.length > 0 && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Product Images</label>
              <div className="grid grid-cols-4 gap-2">
                {productData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Product ${idx + 1}`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex gap-2">
            <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
              Create Pre-Order Product
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setUrl("");
                setScrapedData(null);
                setProductData({
                  name: "",
                  description: "",
                  price: "",
                  currency: "KRW",
                  images: [],
                  category: "k-pop",
                  brand: "",
                  orderDate: "",
                  orderDeadline: "",
                  releaseDate: "",
                  depositPercentage: 50,
                  preorderAvailableStock: 500,
                  shippingTimeDays: 14,
                });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
