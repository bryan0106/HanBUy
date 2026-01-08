import apiClient from '@/lib/apiClient';
import type { 
  GetProductsParams, 
  GetProductsResponse, 
  Product, 
  ProductDetail,
  GetProductDetailResponse 
} from '@/types/product';

export const productService = {
  /**
   * Get all products with unified filtering
   */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products', { params });
      return response.data;
    } catch (error) {
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<ProductDetail> {
    try {
      const response = await apiClient.get<GetProductDetailResponse>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Get onhand products (convenience method)
   */
  async getOnhandProducts(params?: Omit<GetProductsParams, 'product_type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, product_type: 'onhand' });
  },

  /**
   * Get preorder products (convenience method)
   */
  async getPreorderProducts(params?: Omit<GetProductsParams, 'product_type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, product_type: 'preorder' });
  },

  /**
   * Get products by store/warehouse
   */
  async getProductsByStore(storeId: string, params?: Omit<GetProductsParams, 'store_id'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, store_id: storeId });
  },

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, params?: Omit<GetProductsParams, 'search'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, search: searchTerm });
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, params?: Omit<GetProductsParams, 'category'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, category });
  },

  /**
   * Get products by brand
   */
  async getProductsByBrand(brand: string, params?: Omit<GetProductsParams, 'brand'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, brand });
  },

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    params?: Omit<GetProductsParams, 'min_price' | 'max_price'>
  ): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, min_price: minPrice, max_price: maxPrice });
  },
};

// Export types for backward compatibility
export type { Product, ProductDetail, GetProductsParams, GetProductsResponse };
