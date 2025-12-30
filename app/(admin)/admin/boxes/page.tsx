"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Box {
  id: string;
  boxNumber: string;
  clientName: string;
  clientEmail: string;
  status: "open" | "closed" | "shipped" | "delivered";
  items: number;
  totalWeight: number;
  firstItemDate: Date;
  freePeriodEnd: Date;
  penaltyStartDate?: Date;
  currentPenalty?: number;
  createdAt: Date;
}

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPenalties, setShowPenalties] = useState(false);

  useEffect(() => {
    loadBoxes();
  }, [statusFilter, showPenalties]);

  const loadBoxes = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Box[] = [
      {
        id: "box-1",
        boxNumber: "HB-2024-001",
        clientName: "John Doe",
        clientEmail: "john@example.com",
        status: "open",
        items: 5,
        totalWeight: 1.2,
        firstItemDate: new Date("2024-10-01"),
        freePeriodEnd: new Date("2024-12-01"),
        createdAt: new Date("2024-10-01"),
      },
      {
        id: "box-2",
        boxNumber: "HB-2024-002",
        clientName: "Jane Smith",
        clientEmail: "jane@example.com",
        status: "closed",
        items: 3,
        totalWeight: 0.8,
        firstItemDate: new Date("2024-09-15"),
        freePeriodEnd: new Date("2024-11-15"),
        penaltyStartDate: new Date("2024-11-16"),
        currentPenalty: 500,
        createdAt: new Date("2024-09-15"),
      },
      {
        id: "box-3",
        boxNumber: "HB-2024-003",
        clientName: "Mike Johnson",
        clientEmail: "mike@example.com",
        status: "shipped",
        items: 2,
        totalWeight: 0.5,
        firstItemDate: new Date("2024-11-01"),
        freePeriodEnd: new Date("2025-01-01"),
        createdAt: new Date("2024-11-01"),
      },
    ];
    setBoxes(mockData);
    setLoading(false);
  };

  const filteredBoxes = boxes.filter((box) => {
    if (statusFilter !== "all" && box.status !== statusFilter) return false;
    if (showPenalties && !box.currentPenalty) return false;
    return true;
  });

  const boxesWithPenalties = boxes.filter((box) => box.currentPenalty && box.currentPenalty > 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Box Tracking</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPenalties(!showPenalties)}
            className={`rounded-lg border px-4 py-2 font-semibold transition-colors ${
              showPenalties
                ? "border-error bg-error/10 text-error"
                : "border-border bg-background hover:bg-grey-50"
            }`}
          >
            Show Penalties ({boxesWithPenalties.length})
          </button>
          <button className="rounded-lg border border-border bg-background px-4 py-2 font-semibold transition-colors hover:bg-grey-50">
            Import from Google Sheets
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Boxes</p>
          <p className="text-2xl font-bold">{boxes.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open Boxes</p>
          <p className="text-2xl font-bold text-info">
            {boxes.filter((b) => b.status === "open").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Closed Boxes</p>
          <p className="text-2xl font-bold">
            {boxes.filter((b) => b.status === "closed").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">With Penalties</p>
          <p className="text-2xl font-bold text-error">{boxesWithPenalties.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("open")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "open"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "closed"
                ? "bg-grey-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Closed
          </button>
          <button
            onClick={() => setStatusFilter("shipped")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "shipped"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Shipped
          </button>
        </div>
      </div>

      {/* Boxes Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading boxes...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Box #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Weight</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">First Item</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Free Period End</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Penalty</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBoxes.map((box) => {
                const daysOverFree = box.penaltyStartDate
                  ? Math.ceil(
                      (new Date().getTime() - box.penaltyStartDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;
                return (
                  <tr key={box.id} className="hover:bg-grey-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/boxes/${box.id}`}
                        className="font-semibold text-soft-blue-600 hover:underline"
                      >
                        {box.boxNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{box.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {box.clientEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{box.items}</td>
                    <td className="px-4 py-3 text-center">{box.totalWeight} kg</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          box.status === "open"
                            ? "bg-info/10 text-info"
                            : box.status === "closed"
                            ? "bg-grey-100 text-grey-700"
                            : box.status === "shipped"
                            ? "bg-soft-blue-50 text-soft-blue-700"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {box.status.charAt(0).toUpperCase() + box.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(box.firstItemDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(box.freePeriodEnd)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {box.currentPenalty ? (
                        <div>
                          <p className="font-semibold text-error">
                            ₱{box.currentPenalty.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {daysOverFree} days
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/boxes/${box.id}`}
                          className="text-soft-blue-600 hover:underline text-sm"
                        >
                          View
                        </Link>
                        <button className="text-soft-blue-600 hover:underline text-sm">
                          Calculate Penalty
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

