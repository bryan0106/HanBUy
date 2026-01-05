"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { boxService, trackingService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import { BOX_STATUS_LABELS } from "@/lib/constants";
import type { Box, TrackingEvent } from "@/types";
import Link from "next/link";

export default function BoxTrackingPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/box-tracking");
      return;
    }
    if (!authLoading && isAuthenticated && user?.id) {
      loadBoxes();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadBoxes = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's boxes
      const boxesData = await boxService.getUserBoxes(user.id);
      setBoxes(boxesData || []);
      
      // If there's at least one box, load tracking for the first one
      if (boxesData && boxesData.length > 0) {
        setSelectedBox(boxesData[0]);
        await loadTracking(boxesData[0].boxNumber);
      }
    } catch (err: any) {
      console.error("Error loading boxes:", err);
      setError("Failed to load boxes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadTracking = async (boxNumber: string) => {
    setTrackingLoading(true);
    setError(null);
    try {
      const events = await trackingService.searchTracking(boxNumber);
      setTrackingEvents(events || []);
    } catch (err: any) {
      console.error("Error loading tracking:", err);
      setError("Failed to load tracking information.");
      setTrackingEvents([]);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleBoxSelect = async (box: Box) => {
    setSelectedBox(box);
    await loadTracking(box.boxNumber);
  };

  const statusOrder: Record<string, number> = {
    in_warehouse: 1,
    in_transit: 2,
    in_customs: 3,
    at_ph_hub: 4,
    out_for_delivery: 5,
    delivered: 6,
  };

  const sortedEvents = [...trackingEvents].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Box Tracking</h1>
        <p className="text-muted-foreground">
          Track your boxes and items being shipped to you
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your boxes...</p>
        </div>
      ) : error && boxes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">📬</div>
          <h2 className="mb-2 text-xl font-semibold">No boxes found</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Link
            href="/store/products"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : boxes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">📬</div>
          <h2 className="mb-2 text-xl font-semibold">No boxes yet</h2>
          <p className="mb-6 text-muted-foreground">
            Your boxes will appear here once you place orders
          </p>
          <Link
            href="/store/products"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Box List */}
          <div className="lg:col-span-1">
            <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Your Boxes</h2>
            <div className="space-y-2 sm:space-y-3">
              {boxes.map((box) => {
                const totalValueKRW = box.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                const totalValuePHP = totalValueKRW * 0.042;

                return (
                  <button
                    key={box.id}
                    onClick={() => handleBoxSelect(box)}
                    className={`w-full rounded-lg border p-3 text-left transition-all sm:p-4 ${
                      selectedBox?.id === box.id
                        ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                        : "border-border bg-card hover:border-soft-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        {box.boxNumber}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          box.status === "delivered"
                            ? "bg-success/10 text-success"
                            : box.status === "out_for_delivery"
                            ? "bg-info/10 text-info"
                            : "bg-soft-blue-50 text-soft-blue-700"
                        }`}
                      >
                        {BOX_STATUS_LABELS[box.status] || box.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {box.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatCurrency(totalValuePHP, "PHP")}
                    </p>
                    {box.estimatedDelivery && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Est. Delivery:{" "}
                        {box.estimatedDelivery.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tracking Details */}
          <div className="lg:col-span-2">
            {selectedBox ? (
              <>
                <div className="mb-4 rounded-lg border border-border bg-card p-4 sm:mb-6 sm:p-6">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                        {selectedBox.boxNumber}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        {selectedBox.currentLocation}
                      </p>
                    </div>
                    <span
                      className={`self-start rounded-full px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${
                        selectedBox.status === "delivered"
                          ? "bg-success/10 text-success"
                          : selectedBox.status === "out_for_delivery"
                          ? "bg-info/10 text-info"
                          : "bg-soft-blue-50 text-soft-blue-700"
                      }`}
                    >
                      {BOX_STATUS_LABELS[selectedBox.status] || selectedBox.status}
                    </span>
                  </div>

                  {/* Box Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                      <p className="text-base font-bold sm:text-lg">
                        {selectedBox.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Weight</p>
                      <p className="text-base font-bold sm:text-lg">
                        {selectedBox.items
                          .reduce((sum, item) => sum + item.weight * item.quantity, 0)
                          .toFixed(2)}{" "}
                        kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Value</p>
                      <p className="text-base font-bold sm:text-lg">
                        {formatCurrency(
                          selectedBox.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          ) * 0.042,
                          "PHP"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                  <h3 className="mb-4 text-base font-semibold sm:mb-6 sm:text-lg">Tracking History</h3>
                  
                  {trackingLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading tracking information...</p>
                    </div>
                  ) : trackingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No tracking information available yet
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-grey-200 sm:left-4"></div>

                      {/* Events */}
                      <div className="space-y-4 sm:space-y-6">
                        {sortedEvents.map((event, index) => (
                          <div key={event.id} className="relative flex gap-3 sm:gap-4">
                            {/* Timeline Dot */}
                            <div
                              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                                index === sortedEvents.length - 1
                                  ? "bg-soft-blue-600"
                                  : "bg-grey-300"
                              }`}
                            >
                              <div className="h-2 w-2 rounded-full bg-white sm:h-3 sm:w-3"></div>
                            </div>

                            {/* Event Content */}
                            <div className="flex-1 pb-4 sm:pb-6">
                              <div className="mb-1 flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-foreground sm:text-base">
                                  {BOX_STATUS_LABELS[event.status] || event.status}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground sm:text-sm">{event.location}</p>
                              {event.description && (
                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                  {event.description}
                                </p>
                              )}
                              <p className="mt-2 text-xs text-muted-foreground">
                                {formatDateTime(event.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Box Items */}
                <div className="mt-4 rounded-lg border border-border bg-card p-4 sm:mt-6 sm:p-6">
                  <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Items in Box</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedBox.items.map((item) => {
                      const itemTotalPHP = item.price * item.quantity * 0.042;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-lg border border-border bg-white p-3 sm:gap-4 sm:p-4"
                        >
                          {/* Product Image */}
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 shrink-0 rounded-lg bg-grey-200 sm:h-20 sm:w-20"></div>
                          )}
                          
                          <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.name}</h4>
                              {item.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 sm:text-sm">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm">
                                <span className="text-muted-foreground">
                                  Qty: <span className="font-semibold">{item.quantity}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Weight: <span className="font-semibold">{item.weight} kg</span>
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-left sm:mt-0 sm:text-right">
                              <p className="font-semibold text-soft-blue-600 text-sm sm:text-base">
                                {formatCurrency(itemTotalPHP, "PHP")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.price * item.quantity, "KRW")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">Select a box to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

