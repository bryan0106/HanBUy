import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface ShippingAddress {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  region?: string;
  postal_code: string;
  label?: string; // e.g., "Home", "Work", "Office"
  is_default?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  region?: string;
  postal_code: string;
  label?: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

export interface GetAddressesResponse {
  success: boolean;
  data: ShippingAddress[];
}

export interface CreateAddressResponse {
  success: boolean;
  data: ShippingAddress;
  message?: string;
}

export interface UpdateAddressResponse {
  success: boolean;
  data: ShippingAddress;
  message?: string;
}

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
}

export const addressService = {
  /**
   * Get all shipping addresses for the current user
   * Returns addresses sorted by default first, then by creation date
   */
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await apiClient.get<GetAddressesResponse>('/shipping-addresses');
      return response.data.data || response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single shipping address by ID
   */
  async getAddressById(id: string): Promise<ShippingAddress> {
    try {
      const response = await apiClient.get<CreateAddressResponse>(`/shipping-addresses/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new shipping address
   */
  async createAddress(data: CreateAddressRequest): Promise<ShippingAddress> {
    try {
      const response = await apiClient.post<CreateAddressResponse>('/shipping-addresses', data);
      return response.data.data || response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing shipping address
   * Only update fields that are provided
   */
  async updateAddress(data: UpdateAddressRequest): Promise<ShippingAddress> {
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put<UpdateAddressResponse>(`/shipping-addresses/${id}`, updateData);
      return response.data.data || response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a shipping address (soft delete - sets is_active = false)
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      await apiClient.delete<DeleteAddressResponse>(`/shipping-addresses/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Set an address as the default
   * Automatically unsets other default addresses
   */
  async setDefaultAddress(id: string): Promise<ShippingAddress> {
    try {
      const response = await apiClient.post<UpdateAddressResponse>(`/shipping-addresses/${id}/set-default`);
      return response.data.data || response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

