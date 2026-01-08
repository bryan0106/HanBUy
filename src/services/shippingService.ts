import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface CalculateShippingQuoteRequest {
  weight: number; // in kg
  cbm: number; // cubic meters
  origin: string;
  destination: string;
  box_type: 'solo' | 'shared';
}

export interface ShippingQuote {
  base_fee: number;
  weight_fee: number;
  cbm_fee: number;
  total: number;
  currency: string;
  estimated_days: number;
  carrier?: string;
}

export interface CalculateShippingQuoteResponse {
  success: boolean;
  data: ShippingQuote;
}

export interface CalculateCBMRequest {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'inch';
}

export interface CalculateCBMResponse {
  success: boolean;
  data: {
    cbm: number;
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export const shippingService = {
  /**
   * Calculate shipping quote
   */
  async calculateShippingQuote(data: CalculateShippingQuoteRequest): Promise<ShippingQuote> {
    try {
      const response = await apiClient.post<CalculateShippingQuoteResponse>(
        '/shipping/quote',
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Calculate CBM (Cubic Meters)
   */
  async calculateCBM(data: CalculateCBMRequest): Promise<CalculateCBMResponse['data']> {
    try {
      const response = await apiClient.post<CalculateCBMResponse>('/shipping/cbm-calculate', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
