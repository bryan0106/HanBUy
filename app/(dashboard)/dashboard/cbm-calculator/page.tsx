"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

interface ItemInput {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  weight: number;
}

export default function CBMCalculatorPage() {
  const [items, setItems] = useState<ItemInput[]>([
    { id: "1", name: "", length: 0, width: 0, height: 0, quantity: 1, weight: 0 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        length: 0,
        width: 0,
        height: 0,
        quantity: 1,
        weight: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemInput, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Calculate CBM for each item
  const calculateItemCBM = (item: ItemInput): number => {
    const cbmPerUnit = (item.length * item.width * item.height) / 1000000; // Convert cm³ to m³
    return cbmPerUnit * item.quantity;
  };

  // Calculate total CBM
  const totalCBM = items.reduce((sum, item) => sum + calculateItemCBM(item), 0);

  // Calculate total weight
  const totalWeight = items.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );

  // Shipping cost estimates (mock)
  const seaFreightCost = totalCBM * 5000 + totalWeight * 50; // PHP per CBM + weight
  const airFreightCost = totalCBM * 15000 + totalWeight * 200; // PHP per CBM + weight

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">CBM Calculator</h1>
      <p className="mb-8 text-muted-foreground">
        Calculate the cubic meter (CBM) of your items to estimate shipping costs.
        Enter dimensions in centimeters (cm).
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-2">
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
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-error hover:underline text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Item Name (optional)
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="e.g., Cosmetics Box"
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

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Weight per unit (kg)
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
                </div>

                {item.length > 0 && item.width > 0 && item.height > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    CBM: {calculateItemCBM(item).toFixed(4)} m³
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Shipping Estimate</h2>

            <div className="mb-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total CBM</p>
                <p className="text-2xl font-bold">{totalCBM.toFixed(4)} m³</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <p className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
              </div>
            </div>

            <div className="mb-6 space-y-4 border-t border-border pt-6">
              <div>
                <p className="mb-2 text-sm font-medium">Sea Freight</p>
                <p className="text-xl font-bold text-soft-blue-600">
                  {formatCurrency(seaFreightCost, "PHP")}
                </p>
                <p className="text-xs text-muted-foreground">7-14 days</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Air Freight</p>
                <p className="text-xl font-bold text-soft-blue-600">
                  {formatCurrency(airFreightCost, "PHP")}
                </p>
                <p className="text-xs text-muted-foreground">3-5 days</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * Estimates are approximate and may vary based on actual shipping
              conditions and customs fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

