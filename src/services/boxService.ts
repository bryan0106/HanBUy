import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface Box {
  id: string;
  user_id: string;
  box_number: string;
  box_type: 'solo' | 'shared';
  status: 'in_warehouse' | 'in_transit' | 'in_customs' | 'at_ph_hub' | 'out_for_delivery' | 'delivered';
  items: BoxItem[];
  current_location?: string;
  tracking_history?: TrackingEvent[];
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

export interface BoxItem {
  id: string;
  box_id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  currency: 'KRW' | 'PHP';
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  image_url?: string;
  sku?: string;
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  box_id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GetBoxesParams {
  status?: 'in_warehouse' | 'in_transit' | 'in_customs' | 'at_ph_hub' | 'out_for_delivery' | 'delivered';
  page?: number;
  limit?: number;
}

export interface GetBoxesResponse {
  success: boolean;
  data: Box[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetBoxResponse {
  success: boolean;
  data: Box;
}

export interface CreateBoxRequest {
  box_type: 'solo' | 'shared';
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    currency: 'KRW' | 'PHP';
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    image_url?: string;
    sku?: string;
  }>;
}

export interface CreateBoxResponse {
  success: boolean;
  data: Box;
  message?: string;
}

export interface UpdateBoxStatusRequest {
  status: 'in_warehouse' | 'in_transit' | 'in_customs' | 'at_ph_hub' | 'out_for_delivery' | 'delivered';
}

export interface UpdateBoxStatusResponse {
  success: boolean;
  data: Box;
  message?: string;
}

export interface BoxPenalty {
  id: string;
  box_id: string;
  penalty_type: string;
  amount: number;
  currency: string;
  reason: string;
  created_at: string;
}

export interface GetBoxPenaltyResponse {
  success: boolean;
  data: BoxPenalty[];
}

export const boxService = {
  /**
   * Get user boxes with optional filters
   */
  async getBoxes(params?: GetBoxesParams): Promise<GetBoxesResponse> {
    try {
      const response = await apiClient.get<GetBoxesResponse>('/boxes', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single box by ID
   */
  async getBoxById(id: string): Promise<Box> {
    try {
      const response = await apiClient.get<GetBoxResponse>(`/boxes/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create new box
   */
  async createBox(data: CreateBoxRequest): Promise<Box> {
    try {
      const response = await apiClient.post<CreateBoxResponse>('/boxes', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update box status (Admin only)
   */
  async updateBoxStatus(id: string, status: UpdateBoxStatusRequest['status']): Promise<Box> {
    try {
      const response = await apiClient.patch<UpdateBoxStatusResponse>(`/boxes/${id}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get box penalty information
   */
  async getBoxPenalty(id: string): Promise<BoxPenalty[]> {
    try {
      const response = await apiClient.get<GetBoxPenaltyResponse>(`/boxes/${id}/penalty`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
