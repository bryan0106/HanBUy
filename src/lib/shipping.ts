// Shipping fee calculation utilities

/**
 * Calculate ISF (International Service Fee) - Korea to Manila
 */
export function calculateISF(
  weight: number,
  volume: number // CBM
): number {
  // Base calculation for international shipping from Korea to Manila
  // Mock calculation - in production, use actual international shipping rates
  const baseISF = volume * 6000 + weight * 80; // PHP
  return Math.round(baseISF);
}

/**
 * Calculate LSF (Local Service Fee) - Manila to customer via courier
 */
export function calculateLSF(
  boxTypePreference: "solo" | "shared",
  weight: number,
  volume: number, // CBM
  distance?: number // Distance in km (optional, for future use)
): number {
  // Base calculation for local courier delivery
  const baseLSF = volume * 2000 + weight * 20; // PHP
  
  // Shared box: Customer pays reduced LSF (cost shared)
  if (boxTypePreference === "shared") {
    const sharedMultiplier = 0.4; // 40% of solo LSF
    return Math.round(baseLSF * sharedMultiplier);
  }
  
  // Solo box: Customer pays full LSF
  return Math.round(baseLSF);
}

/**
 * Calculate total shipping fee (ISF + LSF) based on box type preference
 * Solo box: Full fees (customer pays full cost)
 * Shared box: Reduced LSF (cost is shared with other customers or owner's items)
 */
export function calculateShippingFee(
  boxTypePreference: "solo" | "shared",
  weight: number,
  volume: number, // CBM
  distance?: number // Distance in km (optional, for future use)
): {
  isf: number; // International Service Fee (always same for solo/shared)
  lsf: number; // Local Service Fee (different for solo/shared)
  total: number; // ISF + LSF
  soloISF: number;
  soloLSF: number;
  soloTotal: number;
  sharedISF: number;
  sharedLSF: number;
  sharedTotal: number;
} {
  const isf = calculateISF(weight, volume);
  const soloLSF = calculateLSF("solo", weight, volume, distance);
  const sharedLSF = calculateLSF("shared", weight, volume, distance);
  
  const selectedLSF = boxTypePreference === "solo" ? soloLSF : sharedLSF;
  
  return {
    isf,
    lsf: selectedLSF,
    total: isf + selectedLSF,
    soloISF: isf,
    soloLSF,
    soloTotal: isf + soloLSF,
    sharedISF: isf,
    sharedLSF,
    sharedTotal: isf + sharedLSF,
  };
}

/**
 * Get shipping fee breakdown for display
 */
export function getShippingFeeBreakdown(
  boxTypePreference: "solo" | "shared",
  weight: number,
  volume: number,
  distance?: number
) {
  const fees = calculateShippingFee(boxTypePreference, weight, volume, distance);
  
  return {
    isf: fees.isf,
    lsf: fees.lsf,
    total: fees.total,
    soloISF: fees.soloISF,
    soloLSF: fees.soloLSF,
    soloTotal: fees.soloTotal,
    sharedISF: fees.sharedISF,
    sharedLSF: fees.sharedLSF,
    sharedTotal: fees.sharedTotal,
    savings: fees.soloTotal - fees.sharedTotal,
    boxType: boxTypePreference,
  };
}

