"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (suggestion: ProductSuggestion) => Promise<void>;
}

export interface ProductSuggestion {
  product_url: string;
  product_name?: string;
  comment?: string;
}

export function ProductSuggestionModal({
  isOpen,
  onClose,
  onSubmit,
}: ProductSuggestionModalProps) {
  const [formData, setFormData] = useState<ProductSuggestion>({
    product_url: "",
    product_name: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // At least URL or comment must be provided
    if (!formData.product_url.trim() && !(formData.comment || "").trim()) {
      setError("Please provide either a product URL or a comment describing what you're looking for");
      return;
    }

    // If URL is provided, validate it
    if (formData.product_url.trim()) {
      try {
        new URL(formData.product_url);
      } catch {
        setError("Please enter a valid URL");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        product_url: "",
        product_name: "",
        comment: "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        product_url: "",
        product_name: "",
        comment: "",
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl sm:max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6 shrink-0">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Suggest a Pre-Order Product
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg p-2 text-grey-600 transition-colors hover:bg-grey-100 disabled:opacity-50"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 p-4 sm:p-6">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 sm:mb-4 sm:p-3 sm:text-sm shrink-0">
              {error}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1">
            {/* Product URL */}
            <div>
              <label
                htmlFor="product_url"
                className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm"
              >
                Product URL (Optional)
              </label>
              <input
                type="url"
                id="product_url"
                value={formData.product_url}
                onChange={(e) =>
                  setFormData({ ...formData, product_url: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-600/20 sm:px-3 sm:py-2"
                placeholder="https://example.com/product"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste the link to the product (if you have it)
              </p>
            </div>

            {/* Product Name */}
            <div>
              <label
                htmlFor="product_name"
                className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm"
              >
                Product Name (Optional)
              </label>
              <input
                type="text"
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-600/20 sm:px-3 sm:py-2"
                placeholder="e.g., Korean Skincare Set"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Help us identify what product this URL is for
              </p>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="comment"
                className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm"
              >
                What product are you looking for? {!formData.product_url.trim() && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:border-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-soft-blue-600/20 sm:px-3 sm:py-2 sm:rows-5"
                placeholder="Describe the product you're looking for. If you don't have a URL, we'll search for it based on your description..."
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.product_url.trim() 
                  ? "Add any additional notes or information about the product"
                  : "Describe the product you want. We'll search for it if you don't have a URL."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-2 shrink-0 sm:mt-6 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                "border border-border bg-white text-foreground hover:bg-grey-50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "sm:px-4 sm:py-2 sm:text-sm"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors",
                "bg-pink-500 hover:bg-pink-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "sm:px-4 sm:py-2 sm:text-sm"
              )}
            >
              {submitting ? "Submitting..." : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
