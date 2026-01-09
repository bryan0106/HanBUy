"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import { productService } from "@/services/productService";
import toast from "react-hot-toast";

interface CompetitorPrice {
  id?: string; // Optional ID for existing comparisons
  website: string;
  url: string;
  price: number;
  currency: "KRW";
  lastChecked: string; // ISO date string
}

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName: string;
  ourPrice: number;
  competitors: CompetitorPrice[];
  onSave: (competitors: CompetitorPrice[]) => void;
  currencyRate?: number;
}

export function PriceComparisonModal({
  isOpen,
  onClose,
  productId,
  productName,
  ourPrice,
  competitors: initialCompetitors,
  onSave,
  currencyRate = 0.042,
}: PriceComparisonModalProps) {
  const [competitors, setCompetitors] = useState<CompetitorPrice[]>(initialCompetitors || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompetitors(initialCompetitors || []);
      if (productId) {
        loadComparisonData();
      }
    }
  }, [isOpen, productId, initialCompetitors]);

  const loadComparisonData = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const { productService } = await import("@/services/productService");
      const loadedComparisons = await productService.getPriceComparisons(productId, true);
      if (loadedComparisons.length > 0) {
        setCompetitors(loadedComparisons.map(c => ({
          id: c.id, // Preserve ID for updates
          website: c.website,
          url: c.url,
          price: c.price,
          currency: c.currency as "KRW",
          lastChecked: c.lastChecked,
        })));
      }
    } catch (error) {
      console.error("Failed to load comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = () => {
    const newCompetitor: CompetitorPrice = {
      website: "",
      url: "",
      price: 0,
      currency: "KRW",
      lastChecked: new Date().toISOString().split("T")[0],
    };
    setCompetitors([...competitors, newCompetitor]);
  };

  const removeCompetitor = async (index: number) => {
    const competitor = competitors[index];
    
    // If competitor has an ID and productId exists, delete immediately via API
    if (productId && competitor.id) {
      const deleteToast = toast.loading("Deleting price comparison...");
      try {
        await productService.deletePriceComparison(productId, competitor.id);
        toast.dismiss(deleteToast);
        toast.success("✓ Price comparison deleted successfully");
        // Remove from local state
        const updated = competitors.filter((_, i) => i !== index);
        setCompetitors(updated);
        // Update parent state
        onSave(updated);
      } catch (error: any) {
        console.error("Error deleting price comparison:", error);
        toast.dismiss(deleteToast);
        const errorMessage =
          error?.message || error?.response?.data?.message || "Failed to delete price comparison";
        toast.error(errorMessage);
      }
    } else {
      // No ID or no productId, just remove from local state
      const updated = competitors.filter((_, i) => i !== index);
      setCompetitors(updated);
      toast.success("Removed from list (will be saved when product is created)");
    }
  };

  const updateCompetitor = (index: number, field: keyof CompetitorPrice, value: any) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
    setCompetitors(updated);
  };

  // Quick save for individual comparison (optional - for real-time updates)
  const quickSaveComparison = async (competitor: CompetitorPrice) => {
    if (!productId || !competitor.id) {
      toast.error("Cannot save: Product must be created first");
      return; // Can't save if no productId or ID
    }

    // Validate required fields
    if (!competitor.website.trim() || !competitor.url.trim() || competitor.price <= 0) {
      toast.error("Please fill in Website, URL, and Price (must be greater than 0) before saving");
      return;
    }

    const saveToast = toast.loading("Saving price comparison...");
    try {
      const updated = await productService.updatePriceComparison(productId, competitor.id, {
        website: competitor.website.trim(),
        url: competitor.url.trim(),
        price: competitor.price,
        currency: competitor.currency,
        lastChecked: competitor.lastChecked,
      });
      
      // Update local state with server response
      const updatedCompetitors = competitors.map((c) => 
        c.id === competitor.id 
          ? {
              id: updated.id,
              website: updated.website,
              url: updated.url,
              price: updated.price,
              currency: updated.currency as "KRW",
              lastChecked: updated.lastChecked,
            }
          : c
      );
      setCompetitors(updatedCompetitors);
      onSave(updatedCompetitors);
      toast.dismiss(saveToast);
      toast.success("✓ Price comparison saved successfully");
    } catch (error: any) {
      console.error("Error saving comparison:", error);
      toast.dismiss(saveToast);
      const errorMessage =
        error?.message || error?.response?.data?.message || "Failed to save price comparison";
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    // Validate competitors
    for (const competitor of competitors) {
      if (!competitor.website.trim() || !competitor.url.trim() || competitor.price <= 0) {
        const competitorNum = competitors.indexOf(competitor) + 1;
        toast.error(`Please fill in Website, URL, and Price (must be > 0) for Competitor ${competitorNum}`);
        return;
      }
    }

    // If productId is provided, save to database via API
    if (productId) {
      setSaving(true);
      const saveToast = toast.loading("Saving price comparisons...");
      try {
        // Prepare comparisons for API (preserve IDs for updates)
        const comparisonsToSave = competitors.map((c) => ({
          ...(c.id ? { id: c.id } : {}), // Only include id if it exists (for updates)
          website: c.website.trim(),
          url: c.url.trim(),
          price: c.price,
          currency: c.currency || "KRW",
        }));

        // Use batch update endpoint
        const result = await productService.batchUpdatePriceComparisons(productId, comparisonsToSave);
        
        toast.dismiss(saveToast);
        toast.success(
          `✓ Saved ${result.created + result.updated} comparison(s) (${result.created} new, ${result.updated} updated)`
        );
        
        // Update local state with saved comparisons (preserve IDs)
        const updatedCompetitors = result.comparisons.map((c) => ({
          id: c.id, // Preserve ID for future updates
          website: c.website,
          url: c.url,
          price: c.price,
          currency: c.currency as "KRW",
          lastChecked: c.lastChecked,
        }));
        setCompetitors(updatedCompetitors);
        onSave(updatedCompetitors);
        onClose();
      } catch (error: any) {
        console.error("Error saving price comparisons:", error);
        toast.dismiss(saveToast);
        const errorMessage =
          error?.message || error?.response?.data?.message || "Failed to save price comparisons";
        toast.error(errorMessage);
      } finally {
        setSaving(false);
      }
    } else {
      // No productId, just call onSave callback (for new products before they're created)
      toast.success(`✓ ${competitors.length} price comparison(s) will be saved when product is created`);
      onSave(competitors);
      onClose();
    }
  };

  const bestCompetitorPrice = competitors.length > 0
    ? Math.min(...competitors.map(c => c.price))
    : ourPrice;
  const isBestPrice = ourPrice <= bestCompetitorPrice;
  const savings = isBestPrice && competitors.length > 0
    ? bestCompetitorPrice - ourPrice
    : 0;

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Manage Price Comparison</h2>
          <p className="text-sm text-muted-foreground">{productName}</p>
          {!productId && (
            <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Note: Price comparisons will be saved after the product is created. Use "Save Comparison" button to save all at once.
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading price comparison data...</p>
          </div>
        ) : (
          <>
            {/* Our Price Display */}
            <div className={`mb-6 rounded-lg border-2 p-4 ${
              isBestPrice
                ? "border-soft-blue-600 bg-soft-blue-50"
                : "border-border bg-background"
            }`}>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-foreground">Our Price (HanBuy)</p>
                {isBestPrice && (
                  <span className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    Best Price ✓
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-soft-blue-600">
                {formatCurrency(ourPrice * currencyRate, "PHP")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(ourPrice, "KRW")}
              </p>
            </div>

            {/* Competitors List */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Competitor Prices</h3>
                <button
                  onClick={addCompetitor}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-grey-50"
                >
                  + Add Competitor
                </button>
              </div>

              {competitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-medium mb-1">No competitors added yet</p>
                  <p className="text-sm">Click "Add Competitor" above to start tracking competitor prices</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {competitors.map((competitor, index) => {
                    const priceDiff = competitor.price - ourPrice;
                    const isHigher = priceDiff > 0;
                    
                    return (
                      <div key={index} className="rounded-lg border border-border bg-background p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Competitor {index + 1}</h4>
                          <div className="flex gap-2">
                            {productId && competitor.id && (
                              <button
                                onClick={() => quickSaveComparison(competitor)}
                                className="rounded-lg bg-green-600/10 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-600/20 transition-colors"
                                title="Quick save this comparison individually"
                              >
                                💾 Save Individual
                              </button>
                            )}
                            <button
                              onClick={() => removeCompetitor(index)}
                              className="rounded-lg bg-error/10 px-3 py-1 text-sm font-medium text-error hover:bg-error/20 transition-colors"
                              title="Remove this competitor"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">Website Name *</label>
                            <input
                              type="text"
                              value={competitor.website}
                              onChange={(e) => updateCompetitor(index, "website", e.target.value)}
                              placeholder="e.g., Gmarket, Coupang, 11st"
                              className="w-full rounded-lg border border-border bg-background px-4 py-2"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">Price (KRW) *</label>
                            <input
                              type="number"
                              value={competitor.price}
                              onChange={(e) => updateCompetitor(index, "price", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full rounded-lg border border-border bg-background px-4 py-2"
                            />
                            {competitor.price > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatCurrency(competitor.price * currencyRate, "PHP")}
                                {isHigher && (
                                  <span className="ml-2 text-error">
                                    (+{formatCurrency(priceDiff, "KRW")})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">Product URL *</label>
                            <input
                              type="url"
                              value={competitor.url}
                              onChange={(e) => updateCompetitor(index, "url", e.target.value)}
                              placeholder="https://..."
                              className="w-full rounded-lg border border-border bg-background px-4 py-2"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">Last Checked Date</label>
                            <input
                              type="date"
                              value={competitor.lastChecked}
                              onChange={(e) => updateCompetitor(index, "lastChecked", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-4 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Savings Info */}
            {savings > 0 && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-semibold text-foreground">
                  💰 You save {formatCurrency(savings, "KRW")} ({formatCurrency(savings * currencyRate, "PHP")}) compared to the lowest competitor!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                disabled={saving}
                className="w-full rounded-lg border border-border bg-background px-6 py-2 font-semibold transition-colors hover:bg-grey-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full rounded-lg px-6 py-2 font-semibold text-white transition-colors sm:w-auto ${
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
                    Saving...
                  </span>
                ) : (
                  `Save ${competitors.length > 0 ? `${competitors.length} ` : ''}Comparison${competitors.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

