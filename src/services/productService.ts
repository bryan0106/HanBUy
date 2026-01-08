import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  category?: string;
  brand?: string;
  sku?: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  product_type: 'onhand' | 'preorder' | 'kr_website';
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface GetProductsParams {
  category?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  product_type?: 'onhand' | 'preorder' | 'kr_website';
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetProductResponse {
  success: boolean;
  data: Product;
}

export interface KrComparisonResponse {
  success: boolean;
  data: {
    product_id: string;
    kr_price: number;
    ph_price: number;
    savings: number;
    savings_percentage: number;
  };
}

export const productService = {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<GetProductResponse>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get onhand items only
   */
  async getOnhandProducts(params?: { page?: number; limit?: number }): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products/onhand', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get preorder items only
   */
  async getPreorderProducts(params?: { page?: number; limit?: number }): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products/preorder', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get price comparison for Korean products
   */
  async getKrComparison(productId: string): Promise<KrComparisonResponse['data']> {
    try {
      const response = await apiClient.get<KrComparisonResponse>('/products/kr-comparison', {
        params: { product_id: productId },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
