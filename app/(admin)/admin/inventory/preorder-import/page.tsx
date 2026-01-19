"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import type { ScrapedProductData } from "@/utils/webScraper";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

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

  // Mock data mapping for ktown4u URLs
  const getMockScrapedData = (url: string) => {
    // Map ktown4u event URLs to mock data
    const urlMappings: Record<string, any> = {
      "43965357": {
        name: "LA POEM Event",
        description: "LA POEM Store Event - Limited Edition",
        price: 35000,
        currency: "KRW",
        images: [
          "https://www.ktown4u.com/goods_files/SH0164/event_images/043957/EV43956132.default.2.png",
        ],
        brand: "LA POEM",
        category: "k-pop",
        order_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        release_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    // Extract event number from URL
    const eventMatch = url.match(/eve_no=(\d+)/);
    const eventNo = eventMatch ? eventMatch[1] : null;

    if (eventNo && urlMappings[eventNo]) {
      return urlMappings[eventNo];
    }

    // Default mock data for any ktown4u URL
    if (url.includes("ktown4u.com")) {
      return {
        name: "K-Pop Event Product",
        description: "Pre-order event product from Ktown4u",
        price: 30000,
        currency: "KRW",
        images: ["https://via.placeholder.com/400x400?text=K-Pop+Product"],
        brand: "Unknown",
        category: "k-pop",
        order_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        release_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return null;
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setScrapedData(null);
    const scrapeToast = toast.loading("Scraping product data...");

    try {
      // Use real API scraper - supports all websites via generic scraper
      console.log("🔗 Scraping URL via API:", url);
      
      const response = await fetch("/api/products/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to scrape product");
      }

      const data = result.data;
      console.log("✅ Scraped data:", data);
      
      if (!data || !data.name) {
        throw new Error("Could not extract product data from URL. The website may not be supported or the page structure may have changed.");
      }
        
      // Create scrapedData object for preview
      const hostname = new URL(url).hostname.toLowerCase();
      const sourceSite = hostname.includes("ktown4u") ? "ktown4u" :
                        hostname.includes("cnakpop") ? "cnakpop" :
                        hostname.includes("mnetplus") ? "mnetplus" :
                        hostname.includes("makestar") ? "makestar" :
                        hostname.includes("gqkorea") ? "gqkorea" :
                        hostname.includes("gmarket") ? "gmarket" :
                        hostname.includes("coupang") ? "coupang" : "generic";
      
      setScrapedData({
        sourceSite,
        sourceUrl: url,
        name: data.name || "",
        price: data.price || 0,
        releaseDate: data.releaseDate || data.release_date || "",
        preorderDeadline: data.preorderDeadline || data.order_deadline || "",
        preorderStartDate: data.order_date || data.preorderStartDate || "",
        description: data.description || "",
        images: Array.isArray(data.images) ? data.images : [],
        brand: data.brand || "",
        category: data.category || "k-pop",
      });
        
        // Pre-fill form with scraped data
        setProductData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          currency: data.currency || "KRW",
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || "k-pop",
          brand: data.brand || "",
        orderDate: data.order_date ? new Date(data.order_date).toISOString().slice(0, 16) : "",
        orderDeadline: data.order_deadline || data.preorderDeadline ? new Date(data.order_deadline || data.preorderDeadline).toISOString().slice(0, 16) : "",
        releaseDate: data.release_date || data.releaseDate ? new Date(data.release_date || data.releaseDate).toISOString().slice(0, 16) : "",
          depositPercentage: 50,
          preorderAvailableStock: 500,
          shippingTimeDays: 14,
        });
        
        toast.dismiss(scrapeToast);
        toast.success("Product data scraped successfully!");
    } catch (err: any) {
      console.error("Scraping error:", err);
      const errorMsg = err.message || "Failed to scrape product. Please check the URL and try again.";
      setError(errorMsg);
      toast.dismiss(scrapeToast);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!productData.name || !productData.price || !productData.releaseDate) {
      const errorMsg = "Please fill in all required fields (Name, Price, Release Date)";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    const createToast = toast.loading("Creating preorder product...");

    try {
      // Prepare payload for API call
      const { productService } = await import("@/services/productService");
      
      const payload = {
        name: productData.name.trim(),
        description: productData.description.trim() || undefined,
        price: parseFloat(productData.price),
        currency: productData.currency as "KRW" | "PHP",
        images: productData.images.length > 0 ? productData.images : undefined,
        category: productData.category || undefined,
        brand: productData.brand.trim() || undefined,
        product_type: "preorder" as const,
        stock: 0,
        status: "active" as const,
        is_preorder_available: true,
        is_onhand_available: false,
        // Preorder-specific fields
        order_date: productData.orderDate ? new Date(productData.orderDate).toISOString() : undefined,
        order_deadline: productData.orderDeadline ? new Date(productData.orderDeadline).toISOString() : undefined,
        release_date: productData.releaseDate ? new Date(productData.releaseDate).toISOString() : undefined,
        deposit_percentage: productData.depositPercentage || 50,
        preorder_available_stock: productData.preorderAvailableStock || 500,
        preorders_claimed: 0,
        shipping_time_days: productData.shippingTimeDays || 14,
      };

      console.log("📤 Creating preorder product via API:", payload);
      
      // Create product via API
      const createdProduct = await productService.createProduct(payload);
      
      console.log("✅ Preorder product created:", {
        id: createdProduct.id,
        name: createdProduct.name,
        product_type: createdProduct.product_type,
      });
      
      toast.dismiss(createToast);
      toast.success("Preorder product created successfully!");
      
      // Redirect to inventory page
      setTimeout(() => {
        window.location.href = "/admin/inventory/preorder?refreshed=true";
      }, 1000);
      
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
      console.error("Error creating product:", err);
      const errorMsg = err.message || "Failed to create product. Please try again.";
      setError(errorMsg);
      toast.dismiss(createToast);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Import Pre-Order Product</h1>
        <p className="mb-6 text-muted-foreground">
          Enter a URL from any supported website (Ktown4u, CNAKPop, Mnet Plus, Makestar, GQ Korea, Gmarket, Coupang, Amazon, eBay, Shopee, Lazada, or any website with Open Graph meta tags) to automatically extract product information.
        </p>

        {/* URL Input */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <label className="mb-2 block text-sm font-semibold">Product URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://cnakpop.com/proc or https://www.ktown4u.com/eventinfo?eve_no=..."
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
