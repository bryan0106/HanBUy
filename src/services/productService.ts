import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import { shouldUseMockData, getApiBaseUrl, isLocalhost } from '@/utils/env';
import type { ProductVariation } from '@/types';
import { mockProducts } from '@/lib/mockData';

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
  
  // Stock Management
  stock: number;                    // Available onhand stock
  preorder_stock?: number;          // Preorder stock (if still accepting preorders)
  reserved_stock?: number;          // Reserved stock
  min_threshold?: number;           // Low stock threshold (default: 10)
  
  status: 'active' | 'inactive' | 'out_of_stock';
  product_type: 'onhand' | 'preorder' | 'kr_website' | 'preorder_and_onhand';
  
  // Flags
  is_preorder_available?: boolean;  // Accepting preorders?
  is_onhand_available?: boolean;    // Available now?
  is_new_arrival?: boolean;         // New arrival flag (default: false)
  
  // Preorder fields (optional, NULL for onhand-only products)
  order_date?: string;              // When preorder started (ISO date)
  order_deadline?: string;          // When preorders close (ISO date)
  release_date?: string;            // Expected release date (ISO date)
  expected_delivery?: string;       // Expected delivery date (ISO date)
  deposit_percentage?: number;      // e.g., 50 for 50% (default: 50)
  preorder_available_stock?: number; // Max preorders allowed
  preorders_claimed?: number;       // How many preorders made (default: 0)
  shipping_time_days?: number;      // Days from release to delivery (default: 14)
  
  // Physical properties
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  length?: number;                 // Individual dimension fields
  width?: number;
  height?: number;
  
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  
  // Pricing fields
  php_price?: number;               // Price in PHP
  price_conversion_rate?: number;  // Conversion rate
  currency_rate?: number;           // Currency rate
  original_price_markup?: number;   // Price markup
  
  // Additional product info
  tags?: string[];                  // Product tags (array)
  full_description?: string;        // Full description
  specifications?: Record<string, any>; // Product specs (object)
  item_type?: string;               // Item type (Album, Ticket, Bag, etc.)
  artist?: string;                  // Artist name
  
  // Filtering and display
  max_price_filter?: number;        // Max price filter
  shipping_estimate?: string;       // Shipping estimate
  new_arrival_days?: number;        // New arrival period (default: 14)
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Product variations (size, color, etc.)
  variations?: ProductVariation[];
  
  // Reviews summary
  reviews_count?: number;
  average_rating?: number;
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
    // Always use API - no mock data fallback
    try {
      const apiUrl = getApiBaseUrl();
      const fullUrl = `${apiUrl}/products/${id}`;
      console.log('🔗 Fetching product from API:', fullUrl);
      console.log('📡 API Base URL:', apiUrl);
      console.log('🆔 Product ID:', id);
      console.log('🌐 Using API (mock data disabled)');
      
      const response = await apiClient.get<GetProductResponse>(`/products/${id}`);
      console.log('✅ Product fetched successfully:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching product:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });
      
      // If API fails, show helpful message but don't fall back to mock
      if (isLocalhost() && !process.env.NEXT_PUBLIC_USE_MOCK_DATA) {
        console.warn('⚠️ API call failed. Make sure your backend is running on localhost:3001');
        console.warn('💡 To use mock data temporarily, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local');
      }
      
      throw handleApiError(error);
    }
  },

  /**
   * Get onhand items only
   * Query params: page, limit, category, brand, search, min_price, max_price, in_stock, sort
   */
  async getOnhandProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    try {
      const apiUrl = getApiBaseUrl();
      console.log('🔗 Fetching onhand products from API:', `${apiUrl}/products/onhand`);
      console.log('📡 Query params:', params);
      
      const response = await apiClient.get<GetProductsResponse>('/products/onhand', { params });
      
      console.log('✅ Onhand API response:', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        total: response.data.pagination?.total || 0,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching onhand products:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      throw handleApiError(error);
    }
  },

  /**
   * Get preorder items only
   * Query params: page, limit, category, brand, search, min_price, max_price, sort
   */
  async getPreorderProducts(params?: Omit<GetProductsParams, 'in_stock'>): Promise<GetProductsResponse> {
    // Always use API - no mock data fallback
    try {
      const apiUrl = getApiBaseUrl();
      console.log('🔗 Fetching preorder products from API:', `${apiUrl}/products/preorder`);
      console.log('📡 Query params:', params);
      console.log('🌐 Using API (mock data disabled)');
      
      const response = await apiClient.get<GetProductsResponse>('/products/preorder', { params });
      console.log('✅ Preorder products fetched:', response.data.data?.length || 0, 'items');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching preorder products:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });
      
      // If API fails, show helpful message but don't fall back to mock
      if (isLocalhost() && !process.env.NEXT_PUBLIC_USE_MOCK_DATA) {
        console.warn('⚠️ API call failed. Make sure your backend is running on localhost:3001');
        console.warn('💡 To use mock data temporarily, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local');
      }
      
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
   * Requires Admin authentication
   * Only include fields you want to update
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const apiUrl = getApiBaseUrl();
      console.log('🔗 Updating product via API:', `${apiUrl}/products/${id}`);
      console.log('📝 Fields to update:', Object.keys(productData));
      
      const response = await apiClient.put<GetProductResponse>(`/products/${id}`, productData);
      console.log('✅ Product updated successfully:', response.data.data?.id);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      throw handleApiError(error);
    }
  },

  /**
   * Delete a product
   * Requires Admin authentication
   * Returns 204 No Content on success
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const apiUrl = getApiBaseUrl();
      console.log('🔗 Deleting product via API:', `${apiUrl}/products/${id}`);
      
      const response = await apiClient.delete(`/products/${id}`);
      console.log('✅ Product deleted successfully');
      
      // Handle 204 No Content response
      if (response.status === 204) {
        return;
      }
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
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

  /**
   * Submit a pasabuy request (customer wants seller to find and buy a product)
   */
  async submitPasabuyRequest(request: {
    product_url?: string;
    product_name?: string;
    comment?: string;
  }): Promise<{ success: boolean; message: string; data?: { id: string; request_number: string } }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data?: { id: string; request_number: string } }>('/pasabuy', request);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get pasabuy requests for the current user
   */
  async getPasabuyRequests(params?: {
    status?: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
  }): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      request_number: string;
      customer_id: string;
      customer_name: string;
      customer_email: string;
      product_url?: string;
      product_name?: string;
      comment?: string;
      estimated_price?: number;
      currency: 'KRW' | 'PHP';
      status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
      images?: string[];
      category?: string;
      sku?: string;
      created_at: string;
      updated_at: string;
      approved_at?: string;
      paid_at?: string;
      bought_at?: string;
      in_storage_at?: string;
      rejected_at?: string;
      rejection_reason?: string;
      admin_notes?: string;
    }>;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          id: string;
          request_number: string;
          customer_id: string;
          customer_name: string;
          customer_email: string;
          product_url?: string;
          product_name?: string;
          comment?: string;
          estimated_price?: number;
          currency: 'KRW' | 'PHP';
          status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
          images?: string[];
          category?: string;
          sku?: string;
          created_at: string;
          updated_at: string;
          approved_at?: string;
          paid_at?: string;
          bought_at?: string;
          in_storage_at?: string;
          rejected_at?: string;
          rejection_reason?: string;
          admin_notes?: string;
        }>;
      }>('/pasabuy', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single pasabuy request by ID
   */
  async getPasabuyRequestById(id: string): Promise<{
    success: boolean;
    data: {
      id: string;
      request_number: string;
      customer_id: string;
      customer_name: string;
      customer_email: string;
      product_url?: string;
      product_name?: string;
      comment?: string;
      estimated_price?: number;
      currency: 'KRW' | 'PHP';
      status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
      images?: string[];
      category?: string;
      sku?: string;
      created_at: string;
      updated_at: string;
      approved_at?: string;
      paid_at?: string;
      bought_at?: string;
      in_storage_at?: string;
      rejected_at?: string;
      rejection_reason?: string;
      admin_notes?: string;
    };
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          id: string;
          request_number: string;
          customer_id: string;
          customer_name: string;
          customer_email: string;
          product_url?: string;
          product_name?: string;
          comment?: string;
          estimated_price?: number;
          currency: 'KRW' | 'PHP';
          status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
          images?: string[];
          category?: string;
          sku?: string;
          created_at: string;
          updated_at: string;
          approved_at?: string;
          paid_at?: string;
          bought_at?: string;
          in_storage_at?: string;
          rejected_at?: string;
          rejection_reason?: string;
          admin_notes?: string;
        };
      }>(`/pasabuy/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all pasabuy requests (Admin only)
   */
  async getAdminPasabuyRequests(params?: {
    status?: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
    customer_id?: string;
  }): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      request_number: string;
      customer_id: string;
      customer_name: string;
      customer_email: string;
      product_url?: string;
      product_name?: string;
      comment?: string;
      estimated_price?: number;
      currency: 'KRW' | 'PHP';
      status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
      images?: string[];
      category?: string;
      sku?: string;
      created_at: string;
      updated_at: string;
      approved_at?: string;
      paid_at?: string;
      bought_at?: string;
      in_storage_at?: string;
      rejected_at?: string;
      rejection_reason?: string;
      admin_notes?: string;
    }>;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          id: string;
          request_number: string;
          customer_id: string;
          customer_name: string;
          customer_email: string;
          product_url?: string;
          product_name?: string;
          comment?: string;
          estimated_price?: number;
          currency: 'KRW' | 'PHP';
          status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
          images?: string[];
          category?: string;
          sku?: string;
          created_at: string;
          updated_at: string;
          approved_at?: string;
          paid_at?: string;
          bought_at?: string;
          in_storage_at?: string;
          rejected_at?: string;
          rejection_reason?: string;
          admin_notes?: string;
        }>;
      }>('/admin/pasabuy', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update pasabuy request status (Admin only)
   */
  async updatePasabuyStatus(id: string, data: {
    status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
    admin_notes?: string;
    rejection_reason?: string;
  }): Promise<{
    success: boolean;
    data: {
      id: string;
      request_number: string;
      customer_id: string;
      customer_name: string;
      customer_email: string;
      product_url?: string;
      product_name?: string;
      comment?: string;
      estimated_price?: number;
      currency: 'KRW' | 'PHP';
      status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
      images?: string[];
      category?: string;
      sku?: string;
      created_at: string;
      updated_at: string;
      approved_at?: string;
      paid_at?: string;
      bought_at?: string;
      in_storage_at?: string;
      rejected_at?: string;
      rejection_reason?: string;
      admin_notes?: string;
    };
  }> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: {
          id: string;
          request_number: string;
          customer_id: string;
          customer_name: string;
          customer_email: string;
          product_url?: string;
          product_name?: string;
          comment?: string;
          estimated_price?: number;
          currency: 'KRW' | 'PHP';
          status: 'pending' | 'approved' | 'paid' | 'bought' | 'in_storage' | 'rejected';
          images?: string[];
          category?: string;
          sku?: string;
          created_at: string;
          updated_at: string;
          approved_at?: string;
          paid_at?: string;
          bought_at?: string;
          in_storage_at?: string;
          rejected_at?: string;
          rejection_reason?: string;
          admin_notes?: string;
        };
      }>(`/admin/pasabuy/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
