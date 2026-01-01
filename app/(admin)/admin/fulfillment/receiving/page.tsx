"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import type { ManilaReceiving } from "@/types/fulfillment";

export default function ManilaReceivingPage() {
  const [receivings, setReceivings] = useState<ManilaReceiving[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadReceivings();
  }, [statusFilter]);

  const loadReceivings = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: ManilaReceiving[] = [
      {
        id: "rec-1",
        orderId: "order-1",
        orderNumber: "ORD-2024-001",
        items: [
          {
            id: "item-1",
            orderItemId: "oi-1",
            productId: "550e8400-e29b-41d4-a716-446655440010",
            productName: "COSRX Snail Essence",
            quantity: 2,
            receivedQuantity: 2,
            condition: "good",
          },
          {
            id: "item-2",
            orderItemId: "oi-2",
            productId: "prod-2",
            productName: "Samyang Ramen",
            quantity: 5,
            receivedQuantity: 5,
            condition: "good",
          },
        ],
        receivedBy: "Admin User",
        receivedAt: new Date("2024-12-28"),
        condition: "good",
        status: "received",
      },
      {
        id: "rec-2",
        orderId: "order-2",
        orderNumber: "ORD-2024-002",
        items: [
          {
            id: "item-3",
            orderItemId: "oi-3",
            productId: "prod-3",
            productName: "Laneige Cream",
            quantity: 1,
            receivedQuantity: 1,
            condition: "good",
          },
        ],
        receivedBy: "Admin User",
        receivedAt: new Date("2024-12-27"),
        condition: "good",
        status: "in_storage",
      },
    ];
    setReceivings(mockData);
    setLoading(false);
  };

  const filteredReceivings =
    statusFilter === "all"
      ? receivings
      : receivings.filter((r) => r.status === statusFilter);

  const statusColors: Record<string, string> = {
    received: "bg-info/10 text-info",
    in_storage: "bg-soft-blue-50 text-soft-blue-700",
    allocated: "bg-warning/10 text-warning",
    dispatched: "bg-success/10 text-success",
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Manila Office - Receiving
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage items received from Korea
          </p>
        </div>
        <button className="w-full rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto">
          + Record New Receipt
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Received</p>
          <p className="text-2xl font-bold">{receivings.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">In Storage</p>
          <p className="text-2xl font-bold text-info">
            {receivings.filter((r) => r.status === "in_storage").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Allocated</p>
          <p className="text-2xl font-bold text-warning">
            {receivings.filter((r) => r.status === "allocated").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Dispatched</p>
          <p className="text-2xl font-bold text-success">
            {receivings.filter((r) => r.status === "dispatched").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("received")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "received"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setStatusFilter("in_storage")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "in_storage"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            In Storage
          </button>
          <button
            onClick={() => setStatusFilter("allocated")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "allocated"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Allocated
          </button>
          <button
            onClick={() => setStatusFilter("dispatched")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "dispatched"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Dispatched
          </button>
        </div>
      </div>

      {/* Receivings Table */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading receiving records...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[800px]">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Order #
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Items
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Condition
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Status
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Received By
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Received At
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReceivings.map((receiving) => (
                <tr key={receiving.id} className="hover:bg-grey-50">
                  <td className="px-2 py-3 sm:px-4">
                    <Link
                      href={`/admin/orders/${receiving.orderId}`}
                      className="font-semibold text-soft-blue-600 hover:underline"
                    >
                      {receiving.orderNumber}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                    <div className="space-y-1">
                      {receiving.items.map((item) => (
                        <div key={item.id}>
                          {item.productName} × {item.receivedQuantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        receiving.condition === "good"
                          ? "bg-success/10 text-success"
                          : receiving.condition === "damaged"
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {receiving.condition === "good"
                        ? "Good"
                        : receiving.condition === "damaged"
                        ? "Damaged"
                        : "Missing Items"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[receiving.status] ||
                        "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {receiving.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                    {receiving.receivedBy}
                  </td>
                  <td className="px-2 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                    {formatDate(receiving.receivedAt)}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/fulfillment/receiving/${receiving.id}`}
                        className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm"
                      >
                        View
                      </Link>
                      <button className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm">
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

