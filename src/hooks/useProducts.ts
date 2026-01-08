'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/productService';
import type { GetProductsParams, Product, ProductDetail } from '@/types/product';
import { handleApiError } from '@/utils/errorHandler';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  aggregations: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    price_range: { min: number; max: number };
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useProducts(params?: GetProductsParams): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsReturn['pagination']>(null);
  const [aggregations, setAggregations] = useState<UseProductsReturn['aggregations']>(null);
  const [currentParams, setCurrentParams] = useState<GetProductsParams | undefined>(params);

  const fetchProducts = useCallback(async (reset = false) => {
    if (!reset) setLoading(true);
    setError(null);

    try {
      const response = await productService.getProducts(currentParams);
      
      if (reset) {
        setProducts(response.data.products);
      } else {
        setProducts(prev => [...prev, ...response.data.products]);
      }
      
      setPagination(response.data.pagination);
      if (response.data.aggregations) {
        setAggregations({
          categories: response.data.aggregations.categories || [],
          brands: response.data.aggregations.brands || [],
          price_range: response.data.aggregations.price_range || { min: 0, max: 0 },
        });
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      if (reset) {
        setProducts([]);
      }
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  useEffect(() => {
    setCurrentParams(params);
  }, [params]);

  useEffect(() => {
    fetchProducts(true);
  }, [currentParams]);

  const loadMore = useCallback(async () => {
    if (!pagination?.has_next || loading) return;
    
    const nextPage = pagination.page + 1;
    setCurrentParams(prev => ({ ...prev, page: nextPage }));
  }, [pagination, loading]);

  return {
    products,
    loading,
    error,
    pagination,
    aggregations,
    refetch: () => fetchProducts(true),
    loadMore,
  };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setError(errorMessage);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
