"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/mockData";
import type { InventoryItem } from "@/types/admin";

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
  
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    description: "",
    price: 0,
    currency: "KRW",
    images: [],
    category: "all",
    brand: "",
    sku: "",
    quantity: 0,
    minStock: 10,
    weight: 0,
    status: "onhand",
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
  });

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a product URL");
      return;
    }

    setScraping(true);
    setError("");

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
        currency: data.currency || formData.currency,
        images: data.images || formData.images,
        category: data.category || formData.category,
        brand: data.brand || formData.brand,
        sku: data.sku || formData.sku,
        weight: data.weight || formData.weight,
        dimensions: data.dimensions || formData.dimensions,
      });
      
      setShowUrlInput(false);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape product");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // TODO: Save to database via API
    // For now, just show success message
    alert("Product added successfully! (This will save to database in production)");
    router.push("/admin/inventory");
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
              <label className="mb-2 block text-sm font-medium">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
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
                <label className="mb-2 block text-sm font-medium">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Minimum Stock *</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Weight (kg) *</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "onhand" | "preorder" | "out_of_stock" })}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="onhand">On Hand</option>
                  <option value="preorder">Preorder</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
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
            <label className="mb-2 block text-sm font-medium">Product Images</label>
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
            {formData.images?.length === 0 && (
              <p className="text-sm text-muted-foreground">No images added yet</p>
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
    </div>
  );
}

