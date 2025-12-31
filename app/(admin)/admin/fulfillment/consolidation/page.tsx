"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { ConsolidationBox } from "@/types/fulfillment";

export default function ConsolidationPage() {
  const [boxes, setBoxes] = useState<ConsolidationBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [boxTypeFilter, setBoxTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadBoxes();
  }, [boxTypeFilter, statusFilter]);

  const loadBoxes = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: ConsolidationBox[] = [
      {
        id: "box-1",
        boxNumber: "CONS-2024-001",
        boxType: "solo",
        orders: ["order-1"],
        customers: [
          {
            orderId: "order-1",
            userId: "user-1",
            customerName: "John Doe",
            customerEmail: "john@example.com",
            shippingAddress: {
              street: "123 Main St",
              city: "Manila",
              province: "Metro Manila",
              zipCode: "1000",
              country: "Philippines",
            },
            items: [],
          },
        ],
        items: [],
        totalWeight: 2.5,
        totalVolume: 0.05,
        status: "open",
        createdAt: new Date("2024-12-28"),
      },
      {
        id: "box-2",
        boxNumber: "CONS-2024-002",
        boxType: "shared",
        orders: ["order-2", "order-3"],
        customers: [
          {
            orderId: "order-2",
            userId: "user-2",
            customerName: "Jane Smith",
            customerEmail: "jane@example.com",
            shippingAddress: {
              street: "456 Oak Ave",
              city: "Quezon City",
              province: "Metro Manila",
              zipCode: "1100",
              country: "Philippines",
            },
            items: [],
          },
          {
            orderId: "order-3",
            userId: "user-3",
            customerName: "Mike Johnson",
            customerEmail: "mike@example.com",
            shippingAddress: {
              street: "789 Pine Rd",
              city: "Makati",
              province: "Metro Manila",
              zipCode: "1200",
              country: "Philippines",
            },
            items: [],
          },
        ],
        ownerPersonalItems: [
          {
            id: "owner-1",
            name: "Owner Personal Item 1",
            quantity: 2,
            weight: 0.5,
            notes: "Owner's personal items",
          },
        ],
        items: [],
        totalWeight: 1.8,
        totalVolume: 0.03,
        status: "closed",
        closedAt: new Date("2024-12-29"),
        createdAt: new Date("2024-12-27"),
      },
    ];
    setBoxes(mockData);
    setLoading(false);
  };

  const filteredBoxes = boxes.filter((box) => {
    if (boxTypeFilter !== "all" && box.boxType !== boxTypeFilter) return false;
    if (statusFilter !== "all" && box.status !== statusFilter) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    open: "bg-info/10 text-info",
    closed: "bg-grey-100 text-grey-700",
    ready_for_courier: "bg-warning/10 text-warning",
    dispatched: "bg-soft-blue-50 text-soft-blue-700",
    delivered: "bg-success/10 text-success",
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Box Consolidation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage solo and shared boxes for customer orders
          </p>
        </div>
        <button className="w-full rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto">
          + Create New Box
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Boxes</p>
          <p className="text-2xl font-bold">{boxes.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Open Boxes</p>
          <p className="text-2xl font-bold text-info">
            {boxes.filter((b) => b.status === "open").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Shared Boxes</p>
          <p className="text-2xl font-bold text-warning">
            {boxes.filter((b) => b.boxType === "shared").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Ready for Courier</p>
          <p className="text-2xl font-bold text-soft-blue-600">
            {boxes.filter((b) => b.status === "ready_for_courier").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-2 text-xs font-medium sm:text-sm">Box Type:</span>
          <button
            onClick={() => setBoxTypeFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              boxTypeFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setBoxTypeFilter("solo")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              boxTypeFilter === "solo"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => setBoxTypeFilter("shared")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              boxTypeFilter === "shared"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Shared
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-2 text-xs font-medium sm:text-sm">Status:</span>
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
            onClick={() => setStatusFilter("open")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "open"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "closed"
                ? "bg-grey-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Closed
          </button>
          <button
            onClick={() => setStatusFilter("ready_for_courier")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "ready_for_courier"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Ready for Courier
          </button>
        </div>
      </div>

      {/* Boxes Table */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading consolidation boxes...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[900px]">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Box #
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Type
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Customers
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Orders
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Weight
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Status
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Created
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBoxes.map((box) => (
                <tr key={box.id} className="hover:bg-grey-50">
                  <td className="px-2 py-3 sm:px-4">
                    <Link
                      href={`/admin/fulfillment/consolidation/${box.id}`}
                      className="font-semibold text-soft-blue-600 hover:underline"
                    >
                      {box.boxNumber}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        box.boxType === "solo"
                          ? "bg-info/10 text-info"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {box.boxType === "solo" ? "Solo" : "Shared"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center text-xs sm:px-4 sm:text-sm">
                    <div>{box.customers.length} customer{box.customers.length > 1 ? "s" : ""}</div>
                    {box.boxType === "shared" && box.ownerPersonalItems && box.ownerPersonalItems.length > 0 && (
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        + Owner items ({box.ownerPersonalItems.length})
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center text-xs sm:px-4 sm:text-sm">
                    {box.orders.length} order{box.orders.length > 1 ? "s" : ""}
                  </td>
                  <td className="px-2 py-3 text-center text-xs sm:px-4 sm:text-sm">
                    {box.totalWeight} kg
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[box.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {box.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                    {formatDate(box.createdAt)}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/fulfillment/consolidation/${box.id}`}
                        className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm"
                      >
                        View
                      </Link>
                      <button className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm">
                        Manage
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

