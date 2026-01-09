"use client";

import { formatCurrency, type Currency } from "@/lib/currency";

interface PreorderPaymentInfoProps {
  price: number;
  currency: Currency;
  depositPercentage: number;
  className?: string;
}

export function PreorderPaymentInfo({
  price,
  currency,
  depositPercentage,
  className = "",
}: PreorderPaymentInfoProps) {
  const priceInPHP = price * 0.042; // Mock conversion
  const depositAmount = (priceInPHP * depositPercentage) / 100;
  const balanceAmount = priceInPHP - depositAmount;

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <p className="text-base font-bold text-soft-blue-600 sm:text-lg">
          {formatCurrency(priceInPHP, "PHP")}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(price, currency)}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-grey-50 p-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Deposit:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(depositAmount, "PHP")} ({depositPercentage}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Balance:</span>
          <span className="text-muted-foreground">
            {formatCurrency(balanceAmount, "PHP")} (on release)
          </span>
        </div>
      </div>
    </div>
  );
}

