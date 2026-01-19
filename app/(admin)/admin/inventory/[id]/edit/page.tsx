"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/mockData";
import { productService } from "@/services/productService";
import type { Product } from "@/services/productService";
import toast from "react-hot-toast";
import { ProductVariationsModal } from "@/components/admin/ProductVariationsModal";
import { PriceComparisonModal } from "@/components/admin/PriceComparisonModal";
import type { ProductVariation } from "@/types";

export default function EditInventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
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
      const orderDeadline = product.order_deadline ? new Date(product.order_deadline).toISOString().split('T')[0] : "";
      const releaseDate = product.release_date ? new Date(product.release_date).toISOString().split('T')[0] : "";
      const expectedDelivery = product.expected_delivery ? new Date(product.expected_delivery).toISOString().split('T')[0] : "";
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        currency: (product.currency === "KRW" || product.currency === "PHP" ? product.currency : "KRW") as "KRW" | "PHP",
        images: Array.isArray(product.images) ? product.images : [],
        category: product.category || "",
        brand: product.brand || "",
        sku: product.sku || "",
        stock: product.stock || 0,
        reserved_stock: product.reserved_stock || 0,
        min_threshold: product.min_threshold || 10,
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
        order_deadline: orderDeadline,
        release_date: releaseDate,
        expected_delivery: expectedDelivery,
        deposit_percentage: product.deposit_percentage || 50,
        preorder_available_stock: product.preorder_available_stock || 0,
        preorders_claimed: product.preorders_claimed || 0,
        shipping_time_days: product.shipping_time_days || 14,
        is_preorder_available: product.is_preorder_available ?? false,
        is_onhand_available: product.is_onhand_available ?? true,
        is_new_arrival: product.is_new_arrival || false,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
        php_price: product.php_price || 0,
        price_conversion_rate: product.price_conversion_rate || 0,
        currency_rate: product.currency_rate || 0,
        original_price_markup: product.original_price_markup || 0,
        tags: Array.isArray(product.tags) ? product.tags : [],
        full_description: product.full_description || "",
        specifications: product.specifications || {},
        item_type: product.item_type || "",
        artist: product.artist || "",
        max_price_filter: product.max_price_filter || 0,
        shipping_estimate: product.shipping_estimate || "",
        new_arrival_days: product.new_arrival_days || 14,
      });

      // Load variations if available
      if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
        setVariations(product.variations);
      } else {
        // Try to load variations separately if not included in product response
        try {
          const loadedVariations = await productService.getProductVariations(productId);
          if (loadedVariations && Array.isArray(loadedVariations) && loadedVariations.length > 0) {
            setVariations(loadedVariations);
          }
        } catch (error) {
          console.log("No variations found for this product");
          setVariations([]); // Ensure it's always an array
        }
      }

      // Load price comparisons
      try {
        const loadedComparisons = await productService.getPriceComparisons(productId);
        if (loadedComparisons && Array.isArray(loadedComparisons) && loadedComparisons.length > 0) {
          setCompetitors(loadedComparisons.map(c => ({
            website: c.website,
            url: c.url,
            price: c.price,
            currency: c.currency as "KRW",
            lastChecked: c.lastChecked,
          })));
        } else {
          setCompetitors([]); // Ensure it's always an array
        }
      } catch (error) {
        console.log("No price comparison data found for this product");
        setCompetitors([]); // Ensure it's always an array
      }
      
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
    if (!formData.category || !formData.category.trim() || formData.category === "all") {
      const errorMsg = "Please select a valid category";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (formData.product_type === "preorder") {
      if (!formData.order_date) {
        const errorMsg = "Order date is required for preorder products";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      if (!formData.release_date) {
        const errorMsg = "Release date is required for preorder products";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    setSaving(true);
    setError("");
    let updateToast: string | undefined;
    try {
      // Prepare payload according to product table structure
      // Make sure to use correct fields: product_type and status
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
        status: formData.status, // Must be "active", "inactive", or "out_of_stock"
        product_type: formData.product_type, // Can be "onhand", "preorder", or "kr_website"
        weight: formData.weight || undefined,
        dimensions: (formData.dimensions && (formData.dimensions.length > 0 || formData.dimensions.width > 0 || formData.dimensions.height > 0))
          ? formData.dimensions
          : undefined,
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
        payload.is_preorder_available = formData.is_preorder_available !== undefined ? formData.is_preorder_available : true;
        payload.is_onhand_available = formData.is_onhand_available !== undefined ? formData.is_onhand_available : false;
      }
      
      // Add other fields
      payload.reserved_stock = formData.reserved_stock > 0 ? formData.reserved_stock : undefined;
      payload.min_threshold = formData.min_threshold > 0 ? formData.min_threshold : undefined;
      payload.is_new_arrival = formData.is_new_arrival || undefined;
      payload.seo_title = formData.seo_title.trim() || undefined;
      payload.seo_description = formData.seo_description.trim() || undefined;
      payload.php_price = formData.php_price > 0 ? formData.php_price : undefined;
      payload.price_conversion_rate = formData.price_conversion_rate > 0 ? formData.price_conversion_rate : undefined;
      payload.currency_rate = formData.currency_rate > 0 ? formData.currency_rate : undefined;
      payload.original_price_markup = formData.original_price_markup > 0 ? formData.original_price_markup : undefined;
      payload.tags = formData.tags.length > 0 ? formData.tags : undefined;
      payload.full_description = formData.full_description.trim() || undefined;
      payload.specifications = Object.keys(formData.specifications).length > 0 ? formData.specifications : undefined;
      payload.item_type = formData.item_type.trim() || undefined;
      payload.artist = formData.artist.trim() || undefined;
      payload.max_price_filter = formData.max_price_filter > 0 ? formData.max_price_filter : undefined;
      payload.shipping_estimate = formData.shipping_estimate.trim() || undefined;
      payload.new_arrival_days = formData.new_arrival_days > 0 ? formData.new_arrival_days : undefined;
      payload.length = formData.length > 0 ? formData.length : undefined;
      payload.width = formData.width > 0 ? formData.width : undefined;
      payload.height = formData.height > 0 ? formData.height : undefined;

      console.log("Updating product with payload:", payload);
      updateToast = toast.loading("Updating product...");
      await productService.updateProduct(productId, payload);

      // Update variations separately if any
      if (variations.length > 0) {
        try {
          await productService.batchUpdateVariations(productId, variations);
          toast.success(`${variations.length} variation(s) updated`);
        } catch (err) {
          console.error("Failed to update variations:", err);
          toast.error("Product updated but failed to update variations");
        }
      }

      // Update price comparisons separately if any
      if (competitors.length > 0) {
        try {
          await productService.batchUpdatePriceComparisons(
            productId,
            competitors.map(c => ({
              website: c.website,
              url: c.url,
              price: c.price,
              currency: c.currency,
            }))
          );
          toast.success(`${competitors.length} price comparison(s) updated`);
        } catch (err) {
          console.error("Failed to update price comparisons:", err);
          toast.error("Product updated but failed to update price comparisons");
        }
      }

      toast.dismiss(updateToast);
      toast.success("Product updated successfully!");
      // Add query parameter to trigger refresh on inventory page
      // Redirect to appropriate page based on product type
      const redirectPath = formData.product_type === "preorder" 
        ? "/admin/inventory/preorder?refreshed=true"
        : "/admin/inventory?refreshed=true";
      router.push(redirectPath);
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
                    <label className="mb-2 block text-sm font-medium">Preorders Claimed</label>
                    <input
                      type="number"
                      value={formData.preorders_claimed}
                      onChange={(e) => setFormData({ ...formData, preorders_claimed: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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

      {/* Modals */}
      <ProductVariationsModal
        isOpen={showVariationsModal}
        onClose={() => setShowVariationsModal(false)}
        variations={variations}
        productId={productId} // Pass productId for existing products - will save via API
        onSave={(newVariations) => {
          setVariations(newVariations);
          // Toast is shown in the modal after successful save
        }}
      />
      <PriceComparisonModal
        isOpen={showPriceComparisonModal}
        onClose={() => setShowPriceComparisonModal(false)}
        productId={productId} // Pass productId for existing products - will save via API
        productName={formData.name || "Product"}
        ourPrice={formData.price}
        competitors={competitors}
        onSave={(newCompetitors) => {
          setCompetitors(newCompetitors);
          // Toast is shown in the modal after successful save
        }}
      />
    </div>
  );
}

