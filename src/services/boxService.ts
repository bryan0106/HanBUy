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

export interface AvailableSharedBox extends Box {
  current_weight?: number;
  current_volume?: number;
  max_weight?: number;
  max_volume?: number;
  participant_count?: number;
  max_participants?: number;
  is_full?: boolean;
  available_space?: {
    weight: number;
    volume: number;
  };
  tracking_id?: string; // Tracking ID for the shared box
}

export interface GetAvailableSharedBoxesResponse {
  success: boolean;
  data: AvailableSharedBox[];
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

  /**
   * Get available shared boxes (open and not full)
   * Shared boxes from admin/other customers that customers can join
   */
  async getAvailableSharedBoxes(): Promise<AvailableSharedBox[]> {
    try {
      const response = await apiClient.get<GetAvailableSharedBoxesResponse>('/boxes/shared/available');
      return response.data.data;
    } catch (error) {
      // If endpoint doesn't exist yet, return empty array
      console.warn('Available shared boxes endpoint not available:', error);
      return [];
    }
  },

  /**
   * Get user's available solo boxes (pending, not full, not delivered)
   * Customer's own boxes that they can continue filling with more items
   */
  async getAvailableSoloBoxes(userId: string): Promise<AvailableSharedBox[]> {
    try {
      const response = await apiClient.get<GetAvailableSharedBoxesResponse>('/boxes/solo/available', {
        params: { user_id: userId },
      });
      return response.data.data;
    } catch (error) {
      // If endpoint doesn't exist yet, return empty array
      console.warn('Available solo boxes endpoint not available:', error);
      return [];
    }
  },

  /**
   * Create a default shared box (starter box)
   * Used when no shared boxes are available
   */
  async createDefaultSharedBox(): Promise<Box> {
    try {
      const response = await apiClient.post<CreateBoxResponse>('/boxes/shared/default', {
        box_type: 'shared',
        items: [],
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
