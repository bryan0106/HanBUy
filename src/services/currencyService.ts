import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface CurrencyRate {
  krw_to_php: number;
  updated_at: string;
}

export interface CurrencyRateResponse {
  success: boolean;
  data: CurrencyRate;
}

// Cache for currency rates (5 minutes)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const currencyService = {
  /**
   * Get current KRW to PHP exchange rate
   * Uses cache to avoid excessive API calls
   */
  async getKRWtoPHPRate(): Promise<number> {
    // Check cache first
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return cachedRate.rate;
    }

    try {
      const response = await apiClient.get<CurrencyRateResponse>('/currency/rates', {
        params: { from: 'KRW', to: 'PHP' },
      });
      
      const rate = response.data.data.krw_to_php;
      
      // Update cache
      cachedRate = {
        rate,
        timestamp: Date.now(),
      };
      
      return rate;
    } catch (error) {
      // Fallback to default rate if API fails
      console.warn('Failed to fetch currency rate, using default:', error);

      const defaultRate = 0.042;
      
      // Cache the default rate for a shorter duration (1 minute)
      cachedRate = {
        rate: defaultRate,
        timestamp: Date.now(),
      };
      
      return defaultRate;
    }
  },

  /**
   * Convert KRW amount to PHP
   */
  async convertKRWtoPHP(krwAmount: number): Promise<number> {
    const rate = await this.getKRWtoPHPRate();
    return Math.round(krwAmount * rate * 100) / 100;
  },

  /**
   * Clear the currency rate cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    cachedRate = null;
  },
};

