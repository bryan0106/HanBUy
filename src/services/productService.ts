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

  // ============================================
  // Product Variations Methods
  // ============================================

  /**
   * Get all variations for a product
   */
  async getProductVariations(productId: string): Promise<ProductVariation[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(
        `/products/${productId}/variations`
      );
      
      // Transform snake_case to camelCase
      const variations = (response.data?.data || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        value: v.value,
        priceModifier: v.price_modifier ?? v.priceModifier ?? 0,
        stock: v.stock ?? 0,
        sku: v.sku,
        imageUrl: v.image_url ?? v.imageUrl,
      }));
      
      return variations;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single variation
   */
  async getVariation(productId: string, variationId: string): Promise<ProductVariation> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(
        `/products/${productId}/variations/${variationId}`
      );
      
      // Transform snake_case to camelCase
      const data = response.data.data;
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        value: data.value,
        priceModifier: data.price_modifier ?? data.priceModifier ?? 0,
        stock: data.stock ?? 0,
        sku: data.sku,
        imageUrl: data.image_url ?? data.imageUrl,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a variation
   */
  async createVariation(productId: string, variationData: Partial<ProductVariation>): Promise<ProductVariation> {
    try {
      // Transform camelCase to snake_case for backend API
      const dataToSend = {
        name: variationData.name,
        type: variationData.type,
        value: variationData.value,
        price_modifier: variationData.priceModifier ?? 0,
        stock: variationData.stock ?? 0,
        sku: variationData.sku || undefined,
        image_url: variationData.imageUrl || undefined,
      };

      const response = await apiClient.post<{ success: boolean; data: any }>(
        `/products/${productId}/variations`,
        dataToSend
      );
      
      // Transform snake_case back to camelCase
      const data = response.data.data;
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        value: data.value,
        priceModifier: data.price_modifier ?? data.priceModifier ?? 0,
        stock: data.stock ?? 0,
        sku: data.sku,
        imageUrl: data.image_url ?? data.imageUrl,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a variation
   */
  async updateVariation(
    productId: string,
    variationId: string,
    variationData: Partial<ProductVariation>
  ): Promise<ProductVariation> {
    try {
      // Transform camelCase to snake_case for backend API
      const dataToSend: any = {};
      if (variationData.name !== undefined) dataToSend.name = variationData.name;
      if (variationData.type !== undefined) dataToSend.type = variationData.type;
      if (variationData.value !== undefined) dataToSend.value = variationData.value;
      if (variationData.priceModifier !== undefined) dataToSend.price_modifier = variationData.priceModifier;
      if (variationData.stock !== undefined) dataToSend.stock = variationData.stock;
      if (variationData.sku !== undefined) dataToSend.sku = variationData.sku || undefined;
      if (variationData.imageUrl !== undefined) dataToSend.image_url = variationData.imageUrl || undefined;

      const response = await apiClient.put<{ success: boolean; data: any }>(
        `/products/${productId}/variations/${variationId}`,
        dataToSend
      );
      
      // Transform snake_case back to camelCase
      const data = response.data.data;
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        value: data.value,
        priceModifier: data.price_modifier ?? data.priceModifier ?? 0,
        stock: data.stock ?? 0,
        sku: data.sku,
        imageUrl: data.image_url ?? data.imageUrl,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a variation
   */
  async deleteVariation(productId: string, variationId: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${productId}/variations/${variationId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Batch update variations (create/update multiple at once)
   */
  async batchUpdateVariations(
    productId: string,
    variations: Partial<ProductVariation>[]
  ): Promise<{ created: number; updated: number; variations: ProductVariation[] }> {
    try {
      // Transform camelCase to snake_case for backend API
      const variationsToSend = variations.map((v) => ({
        ...(v.id && !v.id.startsWith("temp-") ? { id: v.id } : {}),
        name: v.name,
        type: v.type,
        value: v.value,
        price_modifier: v.priceModifier ?? 0,
        stock: v.stock ?? 0,
        sku: v.sku || undefined,
        image_url: v.imageUrl || undefined,
      }));

      const response = await apiClient.post<{
        success: boolean;
        data: { created: number; updated: number; variations: any[] };
      }>(`/products/${productId}/variations/batch`, { variations: variationsToSend });
      
      // Transform snake_case back to camelCase for frontend
      const transformedVariations = response.data.data.variations.map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        value: v.value,
        priceModifier: v.price_modifier ?? v.priceModifier ?? 0,
        stock: v.stock ?? 0,
        sku: v.sku,
        imageUrl: v.image_url ?? v.imageUrl,
      }));

      return {
        created: response.data.data.created,
        updated: response.data.data.updated,
        variations: transformedVariations,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============================================
  // Price Comparison Methods
  // ============================================

  /**
   * Get all price comparisons for a product
   */
  async getPriceComparisons(productId: string, includeInactive = false): Promise<Array<{
    id: string;
    product_id: string;
    website: string;
    url: string;
    price: number;
    currency: string;
    lastChecked: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          id: string;
          product_id: string;
          website: string;
          url: string;
          price: number;
          currency: string;
          lastChecked: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
      }>(`/products/${productId}/price-comparisons`, {
        params: { include_inactive: includeInactive },
      });
      return response.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single price comparison
   */
  async getPriceComparison(productId: string, comparisonId: string): Promise<{
    id: string;
    product_id: string;
    website: string;
    url: string;
    price: number;
    currency: string;
    lastChecked: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          id: string;
          product_id: string;
          website: string;
          url: string;
          price: number;
          currency: string;
          lastChecked: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      }>(`/products/${productId}/price-comparisons/${comparisonId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a price comparison
   */
  async createPriceComparison(
    productId: string,
    comparisonData: {
      website: string;
      url: string;
      price: number;
      currency?: string;
    }
  ): Promise<{
    id: string;
    product_id: string;
    website: string;
    url: string;
    price: number;
    currency: string;
    lastChecked: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          id: string;
          product_id: string;
          website: string;
          url: string;
          price: number;
          currency: string;
          lastChecked: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      }>(`/products/${productId}/price-comparisons`, comparisonData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a price comparison
   */
  async updatePriceComparison(
    productId: string,
    comparisonId: string,
    comparisonData: {
      website?: string;
      url?: string;
      price?: number;
      currency?: string;
      lastChecked?: string;
    }
  ): Promise<{
    id: string;
    product_id: string;
    website: string;
    url: string;
    price: number;
    currency: string;
    lastChecked: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: {
          id: string;
          product_id: string;
          website: string;
          url: string;
          price: number;
          currency: string;
          lastChecked: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      }>(`/products/${productId}/price-comparisons/${comparisonId}`, comparisonData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a price comparison
   */
  async deletePriceComparison(productId: string, comparisonId: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${productId}/price-comparisons/${comparisonId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Batch update price comparisons (create/update multiple at once)
   */
  async batchUpdatePriceComparisons(
    productId: string,
    comparisons: Array<{
      id?: string;
      website: string;
      url: string;
      price: number;
      currency?: string;
    }>
  ): Promise<{
    created: number;
    updated: number;
    comparisons: Array<{
      id: string;
      product_id: string;
      website: string;
      url: string;
      price: number;
      currency: string;
      lastChecked: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          created: number;
          updated: number;
          comparisons: Array<{
            id: string;
            product_id: string;
            website: string;
            url: string;
            price: number;
            currency: string;
            lastChecked: string;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          }>;
        };
      }>(`/products/${productId}/price-comparisons/batch`, { comparisons });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Submit a product suggestion for preorder
   */
  async suggestProduct(suggestion: {
    product_url: string;
    product_name?: string;
    comment?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/products/suggestions', suggestion);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
