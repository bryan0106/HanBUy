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

export interface Courier {
  id: string;
  code: string;
  name: string;
  description?: string;
  estimatedDays?: number;
  icon?: string;
}

export interface GetCouriersResponse {
  success: boolean;
  data: Courier[];
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
   * Get available couriers for local delivery
   */
  async getCouriers(): Promise<Courier[]> {
    try {
      const response = await apiClient.get<GetCouriersResponse>('/couriers');
      return response.data.data;
    } catch (error) {
      // Return mock data if API fails
      console.warn("Failed to fetch couriers, using defaults:", error);
      return getDefaultCouriers();
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

/**
 * Default couriers for local delivery
 */
function getDefaultCouriers(): Courier[] {
  return [
    {
      id: "jnt",
      code: "JNT",
      name: "J&T Express",
      description: "Fast and reliable delivery",
      estimatedDays: 2,
    },
    {
      id: "lbc",
      code: "LBC",
      name: "LBC Express",
      description: "Nationwide coverage",
      estimatedDays: 3,
    },
    {
      id: "2go",
      code: "2GO",
      name: "2GO Express",
      description: "Reliable shipping service",
      estimatedDays: 3,
    },
    {
      id: "grab",
      code: "GRAB",
      name: "Grab Express",
      description: "Same-day delivery available",
      estimatedDays: 1,
    },
    {
      id: "lalamove",
      code: "LALAMOVE",
      name: "Lalamove",
      description: "On-demand delivery",
      estimatedDays: 1,
    },
    {
      id: "flash",
      code: "FLASH",
      name: "Flash Express",
      description: "Quick delivery service",
      estimatedDays: 2,
    },
  ];
}
