import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import { shouldUseMockData } from '@/utils/env';

export interface CalculateShippingRequest {
  box_type: 'solo' | 'shared';
  items: Array<{
    product_id: string;
    quantity: number;
    weight?: number; // kg per item (optional)
    volume?: number; // CBM per item (optional)
  }>;
  destination: {
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  number_of_customers?: number; // For shared boxes
}

export interface ShippingCalculation {
  isf: number; // International Service Fee
  lsf: number; // Local Service Fee
  shippingFee: number; // Total
  soloShippingFee: number;
  sharedShippingFee: number;
  estimatedDays: number;
}

export interface CalculateShippingResponse {
  success: boolean;
  data: ShippingCalculation;
}

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
   * Calculate shipping fees (ISF + LSF)
   * This is the main endpoint for checkout flow
   */
  async calculateShipping(data: CalculateShippingRequest): Promise<ShippingCalculation> {
    // Use mock calculation for localhost if needed
    if (shouldUseMockData()) {
      console.log('📦 Using mock shipping calculation (localhost)');
      // Return mock calculation based on items
      const estimatedWeight = data.items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);
      const estimatedVolume = data.items.reduce((sum, item) => sum + ((item.volume || 0.001) * item.quantity), 0);
      
      // Mock calculation
      const isf = estimatedVolume * 6000 + estimatedWeight * 80;
      const soloLSF = estimatedVolume * 2000 + estimatedWeight * 20;
      const sharedLSF = soloLSF * 0.4;
      
      return {
        isf: Math.round(isf),
        lsf: data.box_type === 'solo' ? Math.round(soloLSF) : Math.round(sharedLSF),
        shippingFee: Math.round(isf + (data.box_type === 'solo' ? soloLSF : sharedLSF)),
        soloShippingFee: Math.round(isf + soloLSF),
        sharedShippingFee: Math.round(isf + sharedLSF),
        estimatedDays: 14,
      };
    }

    try {
      const response = await apiClient.post<CalculateShippingResponse>(
        '/shipping/calculate',
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Error calculating shipping:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Calculate shipping quote (legacy endpoint)
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
