import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface TrackingInfo {
  id: string;
  tracking_number: string;
  courier: string;
  description?: string;
  estimated_arrival?: string;
  status: string;
  events: TrackingEvent[];
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  tracking_id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GetTrackingResponse {
  success: boolean;
  data: TrackingInfo;
}

export interface AddIncomingPackageRequest {
  tracking_number: string;
  courier: string;
  description?: string;
  estimated_arrival?: string;
}

export interface AddIncomingPackageResponse {
  success: boolean;
  data: TrackingInfo;
  message?: string;
}

export interface GetOutgoingPackagesParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetOutgoingPackagesResponse {
  success: boolean;
  data: TrackingInfo[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const trackingService = {
  /**
   * Get tracking info by tracking number
   */
  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await apiClient.get<GetTrackingResponse>(`/tracking/${trackingNumber}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Add incoming package
   */
  async addIncomingPackage(data: AddIncomingPackageRequest): Promise<TrackingInfo> {
    try {
      const response = await apiClient.post<AddIncomingPackageResponse>('/tracking/incoming', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get outgoing packages with optional filters
   */
  async getOutgoingPackages(params?: GetOutgoingPackagesParams): Promise<GetOutgoingPackagesResponse> {
    try {
      const response = await apiClient.get<GetOutgoingPackagesResponse>('/tracking/outgoing', {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
