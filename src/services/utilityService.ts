import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface BankType {
  code: string;
  name: string;
  color?: string;
}

export interface GetBankTypesResponse {
  success: boolean;
  data: BankType[];
}

export interface BoxType {
  code: string;
  name: string;
  description?: string;
  color?: string;
}

export interface GetBoxTypesResponse {
  success: boolean;
  data: BoxType[];
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

export const utilityService = {
  /**
   * Get all bank types
   */
  async getBankTypes(): Promise<BankType[]> {
    try {
      const response = await apiClient.get<GetBankTypesResponse>('/bank-type');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all box types
   */
  async getBoxTypes(): Promise<BoxType[]> {
    try {
      const response = await apiClient.get<GetBoxTypesResponse>('/box-type');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await apiClient.get<HealthCheckResponse>('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
