import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import type { ProductVariation } from '@/types';

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
  
  // Stock Management (Option 2: Separate Onhand Stock Field)
  stock: number;                    // Available onhand stock
  preorder_stock?: number;          // Preorder stock (if still accepting preorders)
  
  status: 'active' | 'inactive' | 'out_of_stock';
  product_type: 'onhand' | 'preorder' | 'kr_website' | 'preorder_and_onhand';
  
  // Flags (Option 2)
  is_preorder_available?: boolean;  // Accepting preorders?
  is_onhand_available?: boolean;    // Available now?
  
  // Preorder fields (optional, NULL for onhand-only products)
  order_date?: string;              // When preorder started
  order_deadline?: string;          // When preorders close
  release_date?: string;            // Expected release date
  deposit_percentage?: number;      // e.g., 50 for 50%
  preorder_available_stock?: number; // Max preorders allowed
  preorders_claimed?: number;       // How many preorders made
  shipping_time_days?: number;      // Days from release to delivery
  
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  created_at?: string;
  updated_at?: string;
  
  // Product variations (size, color, etc.)
  variations?: ProductVariation[];
  
  // Reviews summary
  reviews_count?: number;
  average_rating?: number;
  
  // Currency rate info
  currency_rate?: {
    krw_to_php: number;
    updated_at: string;
  };
}

export interface GetProductsParams {
  page?: number; // 1-1000, default: 1
  limit?: number; // 1-100, default: 50
  category?: string;
  brand?: string;
  search?: string; // Search in name/description
  min_price?: number;
  max_price?: number;
  in_stock?: boolean; // onhand only
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'created_desc' | 'created_asc' | 'stock_desc';
}

export interface GetProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
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
   * Query params: page, limit, category, brand, search, min_price, max_price, in_stock, sort
   */
  async getOnhandProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products/onhand', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get preorder items only
   * Query params: page, limit, category, brand, search, min_price, max_price, sort
   */
  async getPreorderProducts(params?: Omit<GetProductsParams, 'in_stock'>): Promise<GetProductsResponse> {
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

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await apiClient.post<GetProductResponse>('/products', productData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await apiClient.put<GetProductResponse>(`/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
