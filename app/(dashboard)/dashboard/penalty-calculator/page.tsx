"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface PenaltyInfo {
  boxId: string;
  boxNumber: string;
  firstItemDate: Date;
  freePeriodEnd: Date;
  penaltyStartDate: Date;
  daysOverFree: number;
  dailyPenalty: number;
  currentPenalty: number;
  daysRemaining: number;
}

export default function PenaltyCalculatorPage() {
  const [penaltyInfo, setPenaltyInfo] = useState<PenaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    const mockData: PenaltyInfo = {
      boxId: "box-1",
      boxNumber: "HB-2024-001",
      firstItemDate: new Date("2024-10-01"),
      freePeriodEnd: new Date("2024-12-01"),
      penaltyStartDate: new Date("2024-12-02"),
      daysOverFree: 10,
      dailyPenalty: 50,
      currentPenalty: 500,
      daysRemaining: 20,
    };
    setPenaltyInfo(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading penalty information...</p>
      </div>
    );
  }

  if (!penaltyInfo) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No penalty information available.</p>
      </div>
    );
  }

  const isInFreePeriod = new Date() < penaltyInfo.freePeriodEnd;
  const daysUntilPenalty = Math.ceil(
    (penaltyInfo.freePeriodEnd.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Free Stay / Penalty Calculator
      </h1>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        {/* Free Period Status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Free Period Status</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Box Number</p>
              <p className="font-semibold">{penaltyInfo.boxNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">First Item Date</p>
              <p className="font-semibold">
                {formatDate(penaltyInfo.firstItemDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Free Period Ends</p>
              <p className="font-semibold">
                {formatDate(penaltyInfo.freePeriodEnd)}
              </p>
            </div>
            {isInFreePeriod ? (
              <div className="rounded-lg bg-success/10 p-3">
                <p className="font-semibold text-success">
                  {daysUntilPenalty} days remaining in free period
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-error/10 p-3">
                <p className="font-semibold text-error">
                  Free period ended. Penalty is being calculated.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Penalty Information */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Penalty Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Daily Penalty Rate</p>
              <p className="text-2xl font-bold">
                {formatCurrency(penaltyInfo.dailyPenalty, "PHP")} / day
              </p>
            </div>
            {!isInFreePeriod && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Days Over Free Period</p>
                  <p className="text-xl font-bold">{penaltyInfo.daysOverFree} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Penalty</p>
                  <p className="text-3xl font-bold text-error">
                    {formatCurrency(penaltyInfo.currentPenalty, "PHP")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Penalty Calculator</h2>
        <p className="mb-4 text-muted-foreground">
          Calculate estimated penalty based on future dates
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Estimated Ship Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
              onChange={(e) => {
                if (e.target.value) {
                  const selectedDate = new Date(e.target.value);
                  const daysDiff = Math.ceil(
                    (selectedDate.getTime() - penaltyInfo.penaltyStartDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const estimatedPenalty =
                    daysDiff > 0 ? daysDiff * penaltyInfo.dailyPenalty : 0;
                  // Update display
                }
              }}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Estimated Penalty</p>
            <p className="text-2xl font-bold text-soft-blue-600">
              {formatCurrency(penaltyInfo.currentPenalty, "PHP")}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on current date
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-warning/20 bg-warning/10 p-4">
        <p className="text-sm text-warning">
          <strong>Note:</strong> You have 2 months free storage from the date of
          your first item arrival. After the free period, a daily penalty of{" "}
          {formatCurrency(penaltyInfo.dailyPenalty, "PHP")} will be applied.
        </p>
      </div>
    </div>
  );
}

