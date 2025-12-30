"use client";

import { useEffect, useState } from "react";
import { boxService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Box } from "@/types";

export default function BoxPage() {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBox();
  }, []);

  const loadBox = async () => {
    setLoading(true);
    const data = await boxService.getBox("user-1");
    setBox(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your box...</p>
      </div>
    );
  }

  if (!box || box.items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-foreground">My Solo Box</h1>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            Your Solo Box is empty.
          </p>
          <a
            href="/store/products"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  const totalWeight = box.items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const totalValueKRW = box.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalValuePHP = totalValueKRW * 0.042; // Mock conversion

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Solo Box</h1>
          <p className="mt-2 text-muted-foreground">
            Box Number: <span className="font-semibold">{box.boxNumber}</span>
          </p>
        </div>
        <StatusBadge status={box.status} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">
            {box.items.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Weight</p>
          <p className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValuePHP, "PHP")}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(totalValueKRW, "KRW")}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Current Location
        </p>
        <p className="text-lg font-semibold">{box.currentLocation}</p>
        {box.estimatedDelivery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Estimated Delivery:{" "}
            {box.estimatedDelivery.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Items in Box</h2>
        <div className="space-y-4">
          {box.items.map((item) => {
            const itemTotalPHP = item.price * item.quantity * 0.042;
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="h-24 w-24 shrink-0 rounded-lg bg-grey-200"></div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Quantity: <span className="font-semibold">{item.quantity}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Weight: <span className="font-semibold">{item.weight} kg</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-soft-blue-600">
                    {formatCurrency(itemTotalPHP, "PHP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.price * item.quantity, "KRW")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <a
          href="/store/products"
          className="rounded-lg border border-border bg-card px-6 py-3 font-semibold transition-colors hover:bg-grey-50"
        >
          Add More Items
        </a>
        <button className="rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700">
          Request Shipment
        </button>
      </div>
    </div>
  );
}
