// Currency formatting utilities

export type Currency = "PHP" | "KRW";

/**
 * Format currency value to display string
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "PHP"
): string {
  const formatter = new Intl.NumberFormat(
    currency === "PHP" ? "en-PH" : "ko-KR",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "KRW" ? 0 : 2,
      maximumFractionDigits: currency === "KRW" ? 0 : 2,
    }
  );

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === "PHP" ? "₱" : "₩";
}

/**
 * Convert KRW to PHP (placeholder - should use real exchange rate API)
 */
export function convertKRWtoPHP(krwAmount: number, exchangeRate = 0.042): number {
  return Math.round(krwAmount * exchangeRate * 100) / 100;
}

/**
 * Convert PHP to KRW (placeholder - should use real exchange rate API)
 */
export function convertPHPtoKRW(phpAmount: number, exchangeRate = 23.81): number {
  return Math.round(phpAmount * exchangeRate);
}

