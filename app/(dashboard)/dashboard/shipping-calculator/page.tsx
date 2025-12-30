"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

interface ShippingItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
}

export default function ShippingCalculatorPage() {
  const [items, setItems] = useState<ShippingItem[]>([
    {
      id: "1",
      name: "",
      quantity: 1,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      value: 0,
    },
  ]);
  const [destination, setDestination] = useState({
    city: "",
    province: "",
    zipCode: "",
  });
  const [quote, setQuote] = useState<{
    sea: number;
    air: number;
    express: number;
    estimatedDays: { sea: number; air: number; express: number };
  } | null>(null);

  const calculateQuote = () => {
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );
    const totalVolume =
      items.reduce(
        (sum, item) =>
          sum +
          (item.length * item.width * item.height * item.quantity) / 1000000,
        0
      ) || 0.1; // Minimum 0.1 CBM

    // Mock calculation (in real app, this would call API)
    const baseSea = totalVolume * 5000 + totalWeight * 50;
    const baseAir = totalVolume * 15000 + totalWeight * 200;
    const baseExpress = totalVolume * 25000 + totalWeight * 400;

    setQuote({
      sea: baseSea,
      air: baseAir,
      express: baseExpress,
      estimatedDays: {
        sea: 14,
        air: 5,
        express: 3,
      },
    });
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        quantity: 1,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        value: 0,
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof ShippingItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        International Shipping Quote Calculator
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Destination */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Destination</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">City</label>
                <input
                  type="text"
                  value={destination.city}
                  onChange={(e) =>
                    setDestination({ ...destination, city: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Manila"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Province
                </label>
                <input
                  type="text"
                  value={destination.province}
                  onChange={(e) =>
                    setDestination({ ...destination, province: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Metro Manila"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={destination.zipCode}
                  onChange={(e) =>
                    setDestination({ ...destination, zipCode: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Items</h2>
              <button
                onClick={addItem}
                className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Item {idx + 1}</h3>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-error hover:underline text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.weight || ""}
                        onChange={(e) =>
                          updateItem(item.id, "weight", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.length || ""}
                        onChange={(e) =>
                          updateItem(item.id, "length", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.width || ""}
                        onChange={(e) =>
                          updateItem(item.id, "width", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.height || ""}
                        onChange={(e) =>
                          updateItem(item.id, "height", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={calculateQuote}
            className="w-full rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            Calculate Shipping Quote
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Shipping Options</h2>
            {quote ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-2 text-sm font-medium">Sea Freight</p>
                  <p className="text-2xl font-bold text-soft-blue-600">
                    {formatCurrency(quote.sea, "PHP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quote.estimatedDays.sea} days estimated
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-2 text-sm font-medium">Air Freight</p>
                  <p className="text-2xl font-bold text-soft-blue-600">
                    {formatCurrency(quote.air, "PHP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quote.estimatedDays.air} days estimated
                  </p>
                </div>
                <div className="rounded-lg border-2 border-soft-blue-600 bg-soft-blue-50 p-4">
                  <p className="mb-2 text-sm font-medium">Express</p>
                  <p className="text-2xl font-bold text-soft-blue-600">
                    {formatCurrency(quote.express, "PHP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quote.estimatedDays.express} days estimated
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Enter items and click "Calculate" to get shipping quotes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

