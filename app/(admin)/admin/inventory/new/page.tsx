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
    weight: 0,
    status: "active" as "active" | "inactive" | "out_of_stock",
    product_type: "onhand" as "onhand" | "preorder" | "kr_website",
    order_date: "",
    release_date: "",
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
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
      
      // Pre-fill form with scraped data
      setFormData({
        ...formData,
        name: data.name || formData.name,
        description: data.description || formData.description,
        price: data.price || formData.price,
        currency: (data.currency === "KRW" || data.currency === "PHP" ? data.currency : "KRW") as "KRW" | "PHP",
        images: Array.isArray(data.images) ? data.images : formData.images,
        category: data.category || formData.category,
        brand: data.brand || formData.brand,
        sku: data.sku || formData.sku,
        weight: data.weight || formData.weight,
        dimensions: data.dimensions || formData.dimensions,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (formData.images.length === 0) {
      setError("At least one product image is required");
      return;
    }
    if (formData.product_type === "preorder" && (!formData.order_date || !formData.release_date)) {
      setError("Order date and release date are required for preorder products");
      return;
    }

    let createToast: string | undefined;
    try {
      // Prepare payload according to product table structure
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        currency: formData.currency,
        images: formData.images,
        category: formData.category || undefined,
        brand: formData.brand.trim() || undefined,
        sku: formData.sku.trim() || undefined,
        stock: formData.stock,
        status: formData.status,
        product_type: formData.product_type,
        weight: formData.weight || undefined,
        dimensions: formData.dimensions.length > 0 || formData.dimensions.width > 0 || formData.dimensions.height > 0
          ? formData.dimensions
          : undefined,
      };

      // Add preorder-specific fields if product_type is preorder
      if (formData.product_type === "preorder") {
        payload.order_date = formData.order_date ? new Date(formData.order_date).toISOString() : undefined;
        payload.release_date = formData.release_date ? new Date(formData.release_date).toISOString() : undefined;
      }

      createToast = toast.loading("Creating product...");
      const { productService } = await import("@/services/productService");
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
      // Add query parameter to trigger refresh on inventory page
      router.push("/admin/inventory?refreshed=true");
      router.refresh(); // Force Next.js to refresh the page
    } catch (err: any) {
      if (createToast) toast.dismiss(createToast);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to create product";
      setError(errorMessage);
      toast.error(errorMessage);
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
                  <option value="all">All Categories</option>
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
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value as "onhand" | "preorder" | "kr_website" })}
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
            )}

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

