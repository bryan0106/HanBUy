// Product types for unified Product API

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary?: boolean;
  order?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductStock {
  available: number;
  reserved: number;
  total: number;
  min_threshold?: number;
  location?: string;
}

export interface ProductStore {
  store_id: string;
  store_name: string;
  store_location: string;
  stock: number;
  available: boolean;
}

export interface PreorderInfo {
  order_deadline: string;
  release_date: string;
  expected_delivery?: string;
  days_until_release: number;
  is_deadline_passed: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductVariation {
  id: string;
  type: string;
  name: string;
  value: string;
  sku: string;
  price_modifier: number;
  stock: number;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  currency: "KRW" | "PHP";
  php_price: number;
  price_conversion_rate: number;
  images: ProductImage[];
  category: ProductCategory | null;
  brand: ProductBrand | null;
  product_type: "onhand" | "preorder" | "kr_website";
  status: "active" | "inactive" | "out_of_stock";
  stock: ProductStock;
  stores?: ProductStore[];
  preorder?: PreorderInfo;
  weight?: number;
  dimensions?: ProductDimensions;
  variations?: ProductVariation[];
  seo_title?: string;
  seo_description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GetProductsParams {
  product_type?: "onhand" | "preorder" | "kr_website" | "all";
  status?: "active" | "inactive" | "out_of_stock";
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "created_desc" | "stock_desc";
  min_price?: number;
  max_price?: number;
  store_id?: string;
  include_out_of_stock?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AggregationCategory {
  id: string;
  name: string;
  count: number;
}

export interface AggregationBrand {
  id: string;
  name: string;
  count: number;
}

export interface ProductAggregations {
  total_products: number;
  price_range: {
    min: number;
    max: number;
  };
  categories: AggregationCategory[];
  brands: AggregationBrand[];
}

export interface GetProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: PaginationInfo;
    filters_applied?: Record<string, any>;
    aggregations?: ProductAggregations;
  };
}

export interface ProductDetail extends Product {
  full_description?: string;
  specifications?: Record<string, any>;
  related_products?: Product[];
  price_comparison?: {
    our_price: number;
    competitor_prices: Array<{
      website: string;
      url: string;
      price: number;
      currency: string;
      last_checked: string;
    }>;
    best_price: number;
    savings: number;
    savings_percentage: number;
  };
  reviews?: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
    recent_reviews: any[];
  };
}

export interface GetProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

