"use client";

import { useState, useEffect } from "react";
import type { ProductVariation } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { productService } from "@/services/productService";
import toast from "react-hot-toast";

interface ProductVariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variations: ProductVariation[];
  onSave: (variations: ProductVariation[]) => void;
  productId?: string; // Product ID for saving variations
  currencyRate?: number;
}

export function ProductVariationsModal({
  isOpen,
  onClose,
  variations: initialVariations,
  onSave,
  productId,
  currencyRate = 0.042,
}: ProductVariationsModalProps) {
  const [variations, setVariations] = useState<ProductVariation[]>(initialVariations || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVariations(initialVariations || []);
    }
  }, [isOpen, initialVariations]);

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: `temp-${Date.now()}`,
      name: "",
      type: "other",
      value: "",
      priceModifier: 0,
      stock: 0,
      sku: "",
      imageUrl: undefined,
    };
    setVariations([...variations, newVariation]);
  };

  const removeVariation = async (index: number) => {
    const variation = variations[index];
    
    // If variation has a real ID and productId exists, delete immediately via API
    if (productId && variation.id && !variation.id.startsWith("temp-")) {
      const deleteToast = toast.loading("Deleting variation...");
      try {
        await productService.deleteVariation(productId, variation.id);
        toast.dismiss(deleteToast);
        toast.success("✓ Variation deleted successfully");
        // Remove from local state
        const updated = variations.filter((_, i) => i !== index);
        setVariations(updated);
        // Update parent state
        onSave(updated);
      } catch (error: any) {
        console.error("Error deleting variation:", error);
        toast.dismiss(deleteToast);
        const errorMessage =
          error?.message || error?.response?.data?.message || "Failed to delete variation";
        toast.error(errorMessage);
      }
    } else {
      // No real ID or no productId, just remove from local state
      const updated = variations.filter((_, i) => i !== index);
      setVariations(updated);
      toast.success("Removed from list (will be saved when product is created)");
    }
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  // Quick save for individual variation (PUT endpoint - for real-time updates)
  const quickSaveVariation = async (variation: ProductVariation) => {
    if (!productId || !variation.id || variation.id.startsWith("temp-")) {
      toast.error("Cannot save: Product must be created first");
      return; // Can't save if no productId or temp ID
    }

    // Validate required fields
    if (!variation.name.trim() || !variation.value.trim()) {
      toast.error("Please fill in Name and Value before saving");
      return;
    }

    const saveToast = toast.loading("Saving variation...");
    try {
      const updated = await productService.updateVariation(productId, variation.id, {
        name: variation.name.trim(),
        type: variation.type,
        value: variation.value.trim(),
        priceModifier: variation.priceModifier || 0,
        stock: variation.stock || 0,
        sku: variation.sku?.trim() || undefined,
        imageUrl: variation.imageUrl?.trim() || undefined,
      });
      
      // Update local state with server response
      const updatedVariations = variations.map((v) => (v.id === variation.id ? updated : v));
      setVariations(updatedVariations);
      onSave(updatedVariations);
      toast.dismiss(saveToast);
      toast.success("✓ Variation saved successfully");
    } catch (error: any) {
      console.error("Error saving variation:", error);
      toast.dismiss(saveToast);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save variation";
      console.error("Full error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    // Validate variations
    if (variations.length === 0) {
      toast.error("Please add at least one variation before saving");
      return;
    }

    for (const variation of variations) {
      if (!variation.name.trim() || !variation.value.trim()) {
        toast.error(`Please fill in Name and Value for "${variation.name || 'Variation ' + (variations.indexOf(variation) + 1)}"`);
        return;
      }
    }

    // If productId is provided, save to database via API
    if (productId) {
      setSaving(true);
      const saveToast = toast.loading("Saving variations...");
      try {
        // Prepare variations for API (remove temp IDs, map field names)
        const variationsToSave = variations.map((v) => ({
          ...(v.id && !v.id.startsWith("temp-") ? { id: v.id } : {}), // Only include id if it's a real ID
          name: v.name.trim(),
          type: v.type,
          value: v.value.trim(),
          priceModifier: v.priceModifier || 0,
          stock: v.stock || 0,
          sku: v.sku?.trim() || undefined,
          imageUrl: v.imageUrl?.trim() || undefined,
        }));

        // Use batch update endpoint
        const result = await productService.batchUpdateVariations(productId, variationsToSave);
        
        toast.dismiss(saveToast);
        toast.success(
          `✓ Saved ${result.created + result.updated} variation(s) (${result.created} new, ${result.updated} updated)`
        );
        
        // Update local state with saved variations (they now have real IDs)
        setVariations(result.variations);
        onSave(result.variations);
        onClose();
      } catch (error: any) {
        console.error("Error saving variations:", error);
        toast.dismiss(saveToast);
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save variations";
        console.error("Full error details:", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: errorMessage,
        });
        toast.error(errorMessage);
      } finally {
        setSaving(false);
      }
    } else {
      // No productId, just call onSave callback (for new products before they're created)
      toast.success(`✓ ${variations.length} variation(s) will be saved when product is created`);
      onSave(variations);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl rounded-lg border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Manage Product Variations</h2>
          <p className="text-sm text-muted-foreground">
            Add size, color, or other variations for this product. Each variation can have its own price modifier, stock, and SKU.
          </p>
          {!productId && (
            <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Note: Variations will be saved after the product is created. Use "Save Variations" button to save all at once.
              </p>
            </div>
          )}
        </div>

        {/* Variations List */}
        <div className="space-y-4 mb-6">
          {variations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <p className="font-medium mb-1">No variations added yet</p>
              <p className="text-sm">Click "Add Variation" below to create your first variation</p>
            </div>
          ) : (
            variations.map((variation, index) => (
              <div key={variation.id || index} className="rounded-lg border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Variation {index + 1}</h3>
                  <div className="flex gap-2">
                    {productId && variation.id && !variation.id.startsWith("temp-") && (
                      <button
                        onClick={() => quickSaveVariation(variation)}
                        className="rounded-lg bg-green-600/10 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-600/20 transition-colors"
                        title="Quick save this variation individually"
                      >
                        💾 Save Individual
                      </button>
                    )}
                    <button
                      onClick={() => removeVariation(index)}
                      className="rounded-lg bg-error/10 px-3 py-1 text-sm font-medium text-error hover:bg-error/20 transition-colors"
                      title="Remove this variation"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Variation Type *</label>
                    <select
                      value={variation.type}
                      onChange={(e) => updateVariation(index, "type", e.target.value as "size" | "color" | "other")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    >
                      <option value="size">Size</option>
                      <option value="color">Color</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Value *</label>
                    <input
                      type="text"
                      value={variation.value}
                      onChange={(e) => updateVariation(index, "value", e.target.value)}
                      placeholder="e.g., Large, Red, Premium"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Display Name *</label>
                    <input
                      type="text"
                      value={variation.name}
                      onChange={(e) => updateVariation(index, "name", e.target.value)}
                      placeholder="e.g., Size: Large"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Price Modifier (KRW)</label>
                    <input
                      type="number"
                      value={variation.priceModifier || 0}
                      onChange={(e) => updateVariation(index, "priceModifier", parseFloat(e.target.value) || 0)}
                      placeholder="0 (can be negative)"
                      step="0.01"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                    {(variation.priceModifier ?? 0) !== 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(variation.priceModifier ?? 0) > 0 ? "+" : ""}
                        {formatCurrency(variation.priceModifier ?? 0, "KRW")} (
                        {formatCurrency((variation.priceModifier ?? 0) * currencyRate, "PHP")})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Stock *</label>
                    <input
                      type="number"
                      value={variation.stock}
                      onChange={(e) => updateVariation(index, "stock", parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">SKU</label>
                    <input
                      type="text"
                      value={variation.sku || ""}
                      onChange={(e) => updateVariation(index, "sku", e.target.value)}
                      placeholder="Optional SKU for this variation"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Variation Image URL</label>
                    <input
                      type="url"
                      value={variation.imageUrl || ""}
                      onChange={(e) => updateVariation(index, "imageUrl", e.target.value || undefined)}
                      placeholder="Optional image URL for this specific variation"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={addVariation}
            className="w-full rounded-lg border-2 border-dashed border-border bg-background px-4 py-2 font-semibold transition-colors hover:bg-grey-50 hover:border-soft-blue-600 sm:w-auto"
          >
            + Add Variation
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="w-full rounded-lg border border-border bg-background px-6 py-2 font-semibold transition-colors hover:bg-grey-50 disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || variations.length === 0}
              className={`w-full rounded-lg px-6 py-2 font-semibold text-white transition-colors sm:w-auto ${
                saving || variations.length === 0
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
                  Saving...
                </span>
              ) : (
                `Save ${variations.length > 0 ? `${variations.length} ` : ''}Variation${variations.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

