"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/mockData";
import toast from "react-hot-toast";
import { ProductVariationsModal } from "@/components/admin/ProductVariationsModal";
import { PriceComparisonModal } from "@/components/admin/PriceComparisonModal";
import type { ProductVariation } from "@/types";

interface ScrapedData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  brand?: string;
  sku?: string;
  category?: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [showPriceComparisonModal, setShowPriceComparisonModal] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [competitors, setCompetitors] = useState<Array<{
    website: string;
    url: string;
    price: number;
    currency: "KRW";
    lastChecked: string;
  }>>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "KRW" as "KRW" | "PHP",
    images: [] as string[],
    category: "",
    brand: "",
    sku: "",
    stock: 0,
    reserved_stock: 0,
    min_threshold: 10,
    weight: 0,
    status: "active" as "active" | "inactive" | "out_of_stock",
    product_type: "onhand" as "onhand" | "preorder" | "kr_website" | "preorder_and_onhand",
    order_date: "",
    order_deadline: "",
    release_date: "",
    expected_delivery: "",
    deposit_percentage: 50,
    preorder_available_stock: 0,
    preorders_claimed: 0,
    shipping_time_days: 14,
    is_preorder_available: false,
    is_onhand_available: true,
    is_new_arrival: false,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    length: 0,
    width: 0,
    height: 0,
    seo_title: "",
    seo_description: "",
    php_price: 0,
    price_conversion_rate: 0,
    currency_rate: 0,
    original_price_markup: 0,
    tags: [] as string[],
    full_description: "",
    specifications: {} as Record<string, any>,
    item_type: "",
    artist: "",
    max_price_filter: 0,
    shipping_estimate: "",
    new_arrival_days: 14,
  });

  const handleScrape = async () => {
    if (!url.trim()) {
      const errorMsg = "Please enter a product URL";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setScraping(true);
    setError("");
    const scrapeToast = toast.loading("Scraping product data...");

    try {
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
      
      // Auto-generate SEO fields if not provided
      const seoTitle = data.seo_title || data.name || formData.name || "";
      const seoDescription = data.seo_description || data.description || formData.description || "";
      
      // Pre-fill form with scraped data (including all new fields)
      // Note: brand is removed from scraped data as it's not accurate
      setFormData({
        ...formData,
        name: data.name || formData.name,
        description: data.description || formData.description,
        price: data.price || formData.price,
        currency: (data.currency === "KRW" || data.currency === "PHP" ? data.currency : "KRW") as "KRW" | "PHP",
        images: Array.isArray(data.images) ? data.images : formData.images,
        category: data.category || formData.category,
        // brand removed - not accurate from scraping
        sku: data.sku || formData.sku,
        weight: data.weight || formData.weight,
        dimensions: data.dimensions || formData.dimensions,
        // Auto-fill SEO fields
        seo_title: seoTitle,
        seo_description: seoDescription,
        // Additional fields from scraper
        artist: data.artist || formData.artist,
        item_type: data.item_type || formData.item_type,
        tags: Array.isArray(data.tags) ? data.tags : formData.tags,
        full_description: data.full_description || data.description || formData.full_description,
        // Handle release date for preorder products
        release_date: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : formData.release_date,
        order_deadline: data.preorderDeadline ? new Date(data.preorderDeadline).toISOString().split('T')[0] : formData.order_deadline,
      });
      
      toast.dismiss(scrapeToast);
      toast.success("Product data scraped successfully!");
      setShowUrlInput(false);
      setUrl("");
    } catch (err: any) {
      toast.dismiss(scrapeToast);
      const errorMsg = err instanceof Error ? err.message : "Failed to scrape product";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setScraping(false);
    }
  };

  // Helper function to truncate strings to max length (255 for VARCHAR fields)
  const truncateString = (str: string | undefined, maxLength: number = 255): string | undefined => {
    if (!str) return undefined;
    const trimmed = str.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.substring(0, maxLength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.category || !formData.category.trim() || formData.category === "all") {
      setError("Please select a valid category");
      return;
    }
    if (formData.images.length === 0) {
      setError("At least one product image is required");
      return;
    }
    if (formData.product_type === "preorder") {
      if (!formData.order_date) {
        setError("Order date is required for preorder products");
        return;
      }
      if (!formData.release_date) {
        setError("Release date is required for preorder products");
        return;
      }
    }

    let createToast: string | undefined;
    try {
      // Prepare payload according to product table structure
      // Truncate all string fields to 255 characters to match VARCHAR(255) database limit
      const payload: any = {
        // Required fields
        name: truncateString(formData.name.trim(), 255) || formData.name.trim().substring(0, 255),
        price: formData.price,
        
        // Basic fields (truncate VARCHAR(255) fields)
        description: formData.description.trim() || undefined, // TEXT field, no truncation needed
        currency: truncateString(formData.currency || "KRW", 10) || "KRW", // Usually 3-10 chars
        images: formData.images.length > 0 ? formData.images : undefined,
        category: truncateString(formData.category.trim(), 255) || formData.category.trim().substring(0, 255), // Required field - ensure it's never undefined
        brand: truncateString(formData.brand.trim(), 255), // Optional - user can manually enter
        sku: truncateString(formData.sku.trim(), 255),
        stock: formData.stock || 0,
        status: truncateString(formData.status || "active", 50) || "active",
        product_type: truncateString(formData.product_type || "onhand", 50) || "onhand",
        
        // Stock management
        reserved_stock: formData.reserved_stock > 0 ? formData.reserved_stock : undefined,
        min_threshold: formData.min_threshold > 0 ? formData.min_threshold : undefined,
        
        // Physical properties
        weight: formData.weight > 0 ? formData.weight : undefined,
        dimensions: (formData.dimensions.length > 0 || formData.dimensions.width > 0 || formData.dimensions.height > 0)
          ? formData.dimensions
          : undefined,
        length: formData.length > 0 ? formData.length : undefined,
        width: formData.width > 0 ? formData.width : undefined,
        height: formData.height > 0 ? formData.height : undefined,
        
        // Flags - Set defaults based on product_type
        is_preorder_available: formData.product_type === "preorder" ? (formData.is_preorder_available !== undefined ? formData.is_preorder_available : true) : undefined,
        is_onhand_available: (formData.product_type === "onhand" || formData.product_type === "preorder_and_onhand")
          ? (formData.is_onhand_available !== undefined ? formData.is_onhand_available : true) 
          : (formData.is_onhand_available !== undefined ? formData.is_onhand_available : undefined),
        is_new_arrival: formData.is_new_arrival || undefined,
        
        // SEO fields (truncate VARCHAR(255) fields)
        seo_title: truncateString(formData.seo_title.trim(), 255),
        seo_description: truncateString(formData.seo_description.trim(), 255),
        
        // Pricing fields
        php_price: formData.php_price > 0 ? formData.php_price : undefined,
        price_conversion_rate: formData.price_conversion_rate > 0 ? formData.price_conversion_rate : undefined,
        currency_rate: formData.currency_rate > 0 ? formData.currency_rate : undefined,
        original_price_markup: formData.original_price_markup > 0 ? formData.original_price_markup : undefined,
        
        // Additional fields (truncate VARCHAR(255) fields)
        tags: formData.tags.length > 0 ? formData.tags : undefined, // Array, no truncation
        full_description: formData.full_description.trim() || undefined, // TEXT field, no truncation needed
        specifications: Object.keys(formData.specifications).length > 0 ? formData.specifications : undefined, // JSONB, no truncation
        item_type: truncateString(formData.item_type.trim(), 255),
        artist: truncateString(formData.artist.trim(), 255),
        max_price_filter: formData.max_price_filter > 0 ? formData.max_price_filter : undefined,
        shipping_estimate: truncateString(formData.shipping_estimate.trim(), 255),
        new_arrival_days: formData.new_arrival_days > 0 ? formData.new_arrival_days : undefined,
      };

      // Add preorder-specific fields if product_type is preorder
      if (formData.product_type === "preorder") {
        payload.order_date = formData.order_date ? new Date(formData.order_date).toISOString() : undefined;
        payload.order_deadline = formData.order_deadline ? new Date(formData.order_deadline).toISOString() : undefined;
        payload.release_date = formData.release_date ? new Date(formData.release_date).toISOString() : undefined;
        payload.expected_delivery = formData.expected_delivery ? new Date(formData.expected_delivery).toISOString() : undefined;
        payload.deposit_percentage = formData.deposit_percentage || undefined;
        payload.preorder_available_stock = formData.preorder_available_stock > 0 ? formData.preorder_available_stock : undefined;
        payload.preorders_claimed = formData.preorders_claimed > 0 ? formData.preorders_claimed : undefined;
        payload.shipping_time_days = formData.shipping_time_days > 0 ? formData.shipping_time_days : undefined;
      }

      createToast = toast.loading("Creating product...");
      const { productService } = await import("@/services/productService");
      
      // Log the payload being sent
      console.log('📤 Creating product with payload:', {
        name: payload.name,
        product_type: payload.product_type,
        is_onhand_available: payload.is_onhand_available,
        is_preorder_available: payload.is_preorder_available,
        status: payload.status,
        category: payload.category,
        stock: payload.stock,
      });
      
      const createdProduct = await productService.createProduct(payload);
      
      // Save variations separately if any
      if (variations.length > 0 && createdProduct.id) {
        try {
          await productService.batchUpdateVariations(createdProduct.id, variations);
          toast.success(`${variations.length} variation(s) added`);
        } catch (err) {
          console.error("Failed to save variations:", err);
          toast.error("Product created but failed to save variations");
        }
      }

      // Save price comparisons separately if any
      if (competitors.length > 0 && createdProduct.id) {
        try {
          await productService.batchUpdatePriceComparisons(
            createdProduct.id,
            competitors.map(c => ({
              website: c.website,
              url: c.url,
              price: c.price,
              currency: c.currency,
            }))
          );
          toast.success(`${competitors.length} price comparison(s) added`);
        } catch (err) {
          console.error("Failed to save price comparisons:", err);
          toast.error("Product created but failed to save price comparisons");
        }
      }

      toast.dismiss(createToast);
      toast.success(`"${formData.name}" created successfully!`);
      
      // Log the created product for debugging
      console.log('✅ Product created successfully:', {
        id: createdProduct.id,
        name: createdProduct.name,
        product_type: createdProduct.product_type,
        is_onhand_available: createdProduct.is_onhand_available,
        is_preorder_available: createdProduct.is_preorder_available,
        status: createdProduct.status,
        category: createdProduct.category,
        stock: createdProduct.stock,
      });
      
      // Verify the product can be fetched immediately
      try {
        const verifyProduct = await productService.getProductById(createdProduct.id);
        console.log('✅ Verified product can be fetched:', {
          id: verifyProduct.id,
          name: verifyProduct.name,
          product_type: verifyProduct.product_type,
        });
      } catch (verifyErr) {
        console.error('❌ Could not verify product immediately:', verifyErr);
      }
      
      // Add query parameter to trigger refresh on inventory page
      // Use a longer delay to ensure backend has processed the insert and updated indexes
      // Redirect to appropriate page based on product type
      const redirectPath = formData.product_type === "preorder" 
        ? "/admin/inventory/preorder?refreshed=true"
        : "/admin/inventory?refreshed=true";
      
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh(); // Force Next.js to refresh the page
      }, 2000); // Increased to 2 seconds
    } catch (err: any) {
      if (createToast) toast.dismiss(createToast);
      
      // Enhanced error logging for debugging
      console.error("❌ Error creating product:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        product_type: formData.product_type,
        payload: {
          name: formData.name,
          category: formData.category,
          product_type: formData.product_type,
          has_order_date: !!formData.order_date,
          has_release_date: !!formData.release_date,
        }
      });
      
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to create product";
      setError(errorMessage);
      toast.error(`Failed to create ${formData.product_type} product: ${errorMessage}`);
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleImageAdd = (url: string) => {
    if (url.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), url],
      });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Add New Inventory Item</h1>
        <Link
          href="/admin/inventory"
          className="text-sm text-soft-blue-600 hover:underline sm:text-base"
        >
          ← Back to Inventory
        </Link>
      </div>

      {/* URL Import Section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Quick Import from URL</h2>
            <p className="text-sm text-muted-foreground">
              Paste a product URL to automatically fill in product details
            </p>
          </div>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 sm:w-auto"
          >
            {showUrlInput ? "Cancel" : "📥 Import from URL"}
          </button>
        </div>
        
        {showUrlInput && (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gmarket.co.kr/product/... or https://amazon.com/..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2"
              disabled={scraping}
            />
            <button
              onClick={handleScrape}
              disabled={scraping || !url.trim()}
              className="w-full rounded-lg bg-soft-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50 sm:w-auto"
            >
              {scraping ? "Scraping..." : "Scrape"}
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-6 text-lg font-semibold sm:text-xl">Product Information</h2>

          {/* Basic Info */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as "KRW" | "PHP" })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="KRW">KRW (Korean Won)</option>
                  <option value="PHP">PHP (Philippine Peso)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Brand</label>
                <input
                  type="text"
                  value={formData.brand || ""}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Product Type *</label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value as "onhand" | "preorder" | "kr_website" | "preorder_and_onhand" })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="onhand">On Hand</option>
                  <option value="preorder">Preorder</option>
                  <option value="kr_website">KR Website</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "out_of_stock" })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Variations and Price Comparison Buttons */}
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowVariationsModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-semibold transition-colors hover:bg-grey-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Manage Variations
                {variations.length > 0 && (
                  <span className="rounded-full bg-soft-blue-600 px-2 py-0.5 text-xs text-white">
                    {variations.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPriceComparisonModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-semibold transition-colors hover:bg-grey-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Price Comparison
                {competitors.length > 0 && (
                  <span className="rounded-full bg-soft-blue-600 px-2 py-0.5 text-xs text-white">
                    {competitors.length}
                  </span>
                )}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            {formData.product_type === "preorder" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Order Date *</label>
                    <input
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                      required={formData.product_type === "preorder"}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Release Date *</label>
                    <input
                      type="date"
                      value={formData.release_date}
                      onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                      required={formData.product_type === "preorder"}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Order Deadline</label>
                    <input
                      type="date"
                      value={formData.order_deadline}
                      onChange={(e) => setFormData({ ...formData, order_deadline: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Expected Delivery</label>
                    <input
                      type="date"
                      value={formData.expected_delivery}
                      onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Deposit Percentage (%)</label>
                    <input
                      type="number"
                      value={formData.deposit_percentage}
                      onChange={(e) => setFormData({ ...formData, deposit_percentage: parseInt(e.target.value) || 50 })}
                      min="0"
                      max="100"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Preorder Available Stock</label>
                    <input
                      type="number"
                      value={formData.preorder_available_stock}
                      onChange={(e) => setFormData({ ...formData, preorder_available_stock: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Shipping Time (Days)</label>
                    <input
                      type="number"
                      value={formData.shipping_time_days}
                      onChange={(e) => setFormData({ ...formData, shipping_time_days: parseInt(e.target.value) || 14 })}
                      min="0"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stock Management Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Reserved Stock</label>
                <input
                  type="number"
                  value={formData.reserved_stock}
                  onChange={(e) => setFormData({ ...formData, reserved_stock: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.min_threshold}
                  onChange={(e) => setFormData({ ...formData, min_threshold: parseInt(e.target.value) || 10 })}
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            {/* Product Flags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Product Flags</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_onhand_available}
                    onChange={(e) => setFormData({ ...formData, is_onhand_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Available Onhand</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_preorder_available}
                    onChange={(e) => setFormData({ ...formData, is_preorder_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Preorder Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">New Arrival</span>
                </label>
              </div>
            </div>

            {/* Additional Product Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Item Type</label>
                <input
                  type="text"
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                  placeholder="Album, Ticket, Bag, etc."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Artist</label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Artist name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">SEO Description</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            {/* Full Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">Full Description</label>
              <textarea
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-4 py-2"
                placeholder="Detailed product description..."
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="mb-2 block text-sm font-medium">Dimensions (cm)</label>
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="number"
                  placeholder="Length"
                  value={formData.dimensions?.length || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions,
                        length: parseFloat(e.target.value) || 0,
                        width: formData.dimensions?.width || 0,
                        height: formData.dimensions?.height || 0,
                      },
                    })
                  }
                  min="0"
                  step="0.1"
                  className="rounded-lg border border-border bg-background px-4 py-2"
                />
                <input
                  type="number"
                  placeholder="Width"
                  value={formData.dimensions?.width || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions,
                        length: formData.dimensions?.length || 0,
                        width: parseFloat(e.target.value) || 0,
                        height: formData.dimensions?.height || 0,
                      },
                    })
                  }
                  min="0"
                  step="0.1"
                  className="rounded-lg border border-border bg-background px-4 py-2"
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={formData.dimensions?.height || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions,
                        length: formData.dimensions?.length || 0,
                        width: formData.dimensions?.width || 0,
                        height: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  min="0"
                  step="0.1"
                  className="rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Product Images *</label>
            <p className="mb-2 text-xs text-muted-foreground">At least one image is required</p>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <input
                type="url"
                placeholder="Add image URL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleImageAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2"
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleImageAdd(input.value);
                  input.value = "";
                }}
                className="w-full rounded-lg bg-grey-200 px-4 py-2 hover:bg-grey-300 sm:w-auto"
              >
                Add Image
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {formData.images?.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.png";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute right-2 top-2 rounded-full bg-error px-2 py-1 text-xs text-white hover:bg-error/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {formData.images.length === 0 && (
              <p className="text-sm text-error">No images added yet. At least one image is required.</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="submit"
              className="w-full rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto"
            >
              Save Product
            </button>
            <Link
              href="/admin/inventory"
              className="w-full rounded-lg border border-border bg-background px-6 py-3 text-center font-semibold transition-colors hover:bg-grey-50 sm:w-auto"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Modals */}
      <ProductVariationsModal
        isOpen={showVariationsModal}
        onClose={() => setShowVariationsModal(false)}
        variations={variations}
        productId={undefined} // No productId for new products - will be saved after product creation
        onSave={(newVariations) => {
          setVariations(newVariations);
          toast.success(`${newVariations.length} variation(s) added`);
        }}
      />
      <PriceComparisonModal
        isOpen={showPriceComparisonModal}
        onClose={() => setShowPriceComparisonModal(false)}
        productId={undefined} // No productId for new products - will be saved after product creation
        productName={formData.name || "New Product"}
        ourPrice={formData.price}
        competitors={competitors}
        onSave={(newCompetitors) => {
          setCompetitors(newCompetitors);
          toast.success(`${newCompetitors.length} competitor price(s) added`);
        }}
      />
    </div>
  );
}

