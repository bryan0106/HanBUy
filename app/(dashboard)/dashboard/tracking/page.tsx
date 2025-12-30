"use client";

import { useState } from "react";
import { trackingService } from "@/services/api";
import { formatDateTime } from "@/lib/utils";
import { BOX_STATUS_LABELS } from "@/lib/constants";
import type { TrackingEvent } from "@/types";

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await trackingService.searchTracking(trackingId.trim());
      setEvents(data);
      if (data.length === 0) {
        setError("No tracking information found for this ID");
      }
    } catch (err) {
      setError("Failed to fetch tracking information");
    } finally {
      setLoading(false);
    }
  };

  const statusOrder: Record<string, number> = {
    in_warehouse: 1,
    in_transit: 2,
    in_customs: 3,
    at_ph_hub: 4,
    out_for_delivery: 5,
    delivered: 6,
  };

  const sortedEvents = [...events].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Box Tracking</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking ID (e.g., HB-2024-001)"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-soft-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
      </form>

      {/* Tracking Timeline */}
      {events.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-semibold">Tracking History</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-grey-200"></div>

            {/* Events */}
            <div className="space-y-6">
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Dot */}
                  <div
                    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      index === sortedEvents.length - 1
                        ? "bg-soft-blue-600"
                        : "bg-grey-300"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-6">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">
                        {BOX_STATUS_LABELS[event.status] || event.status}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">{event.location}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Example Tracking IDs */}
      {events.length === 0 && !loading && (
        <div className="rounded-lg border border-border bg-grey-50 p-6">
          <h3 className="mb-2 font-semibold">Example Tracking IDs:</h3>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
            <li>HB-2024-001</li>
            <li>HB-2024-002</li>
          </ul>
        </div>
      )}
    </div>
  );
}
