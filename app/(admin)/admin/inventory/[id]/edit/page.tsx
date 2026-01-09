"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/mockData";
import { productService } from "@/services/productService";
import type { Product } from "@/services/productService";
import toast from "react-hot-toast";

export default function EditInventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  
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

  useEffect(() => {
    if (!hasLoadedRef.current && productId) {
      hasLoadedRef.current = true;
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      console.log("Product load already in progress, skipping duplicate call");
      return;
    }

    loadingRef.current = true;
    let loadingToast: string | undefined;
    try {
      setLoading(true);
      loadingToast = toast.loading("Loading product...");
      const product = await productService.getProductById(productId);
      
      // Format dates for input fields
      const orderDate = product.order_date ? new Date(product.order_date).toISOString().split('T')[0] : "";
      const releaseDate = product.release_date ? new Date(product.release_date).toISOString().split('T')[0] : "";
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        currency: (product.currency === "KRW" || product.currency === "PHP" ? product.currency : "KRW") as "KRW" | "PHP",
        images: product.images || [],
        category: product.category || "",
        brand: product.brand || "",
        sku: product.sku || "",
        stock: product.stock || 0,
        weight: product.weight || 0,
        status: product.status || "active",
        product_type: (
          product.product_type === "preorder" || product.product_type === "preorder_and_onhand"
            ? "preorder"
            : product.product_type === "onhand"
            ? "onhand"
            : product.product_type === "kr_website"
            ? "kr_website"
            : "onhand"
        ) as "onhand" | "preorder" | "kr_website",
        order_date: orderDate,
        release_date: releaseDate,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
      });
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        toast.success("Product loaded successfully");
      }
    } catch (err: any) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load product";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      const errorMsg = "Product name is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (formData.images.length === 0) {
      const errorMsg = "At least one product image is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (formData.product_type === "preorder" && (!formData.order_date || !formData.release_date)) {
      const errorMsg = "Order date and release date are required for preorder products";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setSaving(true);
    setError("");
    let updateToast: string | undefined;
    try {
      // Prepare payload according to product table structure
      // Make sure to use correct fields: product_type and status
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price,
        currency: formData.currency,
        images: formData.images,
        category: formData.category || null,
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || null,
        stock: formData.stock,
        status: formData.status, // Must be "active", "inactive", or "out_of_stock"
        product_type: formData.product_type, // Can be "onhand", "preorder", or "kr_website"
        weight: formData.weight || null,
        dimensions: formData.dimensions.length > 0 || formData.dimensions.width > 0 || formData.dimensions.height > 0
          ? formData.dimensions
          : null,
      };

      // Add preorder-specific fields if product_type is preorder
      if (formData.product_type === "preorder") {
        payload.order_date = formData.order_date ? new Date(formData.order_date).toISOString() : null;
        payload.release_date = formData.release_date ? new Date(formData.release_date).toISOString() : null;
      }

      console.log("Updating product with payload:", payload);
      updateToast = toast.loading("Updating product...");
      await productService.updateProduct(productId, payload);
      toast.dismiss(updateToast);
      toast.success("Product updated successfully!");
      // Add query parameter to trigger refresh on inventory page
      router.push("/admin/inventory?refreshed=true");
      router.refresh(); // Force Next.js to refresh the page
    } catch (err: any) {
      console.error("Failed to update product:", err);
      if (updateToast) toast.dismiss(updateToast);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to update product";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleImageAdd = (url: string) => {
    if (url.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Edit Inventory Item</h1>
        <Link
          href="/admin/inventory"
          className="text-sm text-soft-blue-600 hover:underline sm:text-base"
        >
          ← Back to Inventory
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

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
              disabled={saving}
              className={`w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors sm:w-auto ${
                saving
                  ? "bg-grey-400 cursor-not-allowed"
                  : "bg-soft-blue-600 hover:bg-soft-blue-700"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Product"
              )}
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

