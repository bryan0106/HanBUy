// Utility functions for working with Product types

import type { Product, ProductImage } from '@/types/product';

/**
 * Get the primary image URL from a product's images array
 * Handles both old format (string[]) and new format (ProductImage[])
 */
export function getProductImage(product: Product, index: number = 0): string {
  if (!product.images || product.images.length === 0) {
    return '/placeholder-product.png';
  }

  const image = product.images[index];
  
  // Handle new ProductImage format
  if (typeof image === 'object' && 'url' in image) {
    return image.url;
  }
  
  // Handle old string format (backward compatibility)
  if (typeof image === 'string') {
    return image;
  }
  
  return '/placeholder-product.png';
}

/**
 * Get the primary image (first image marked as primary, or first image)
 */
export function getPrimaryImage(product: Product): string {
  if (!product.images || product.images.length === 0) {
    return '/placeholder-product.png';
  }

  // Find primary image
  const primaryImage = product.images.find(img => 
    typeof img === 'object' && img.is_primary
  );
  
  if (primaryImage && typeof primaryImage === 'object') {
    return primaryImage.url;
  }
  
  // Fallback to first image
  return getProductImage(product, 0);
}

/**
 * Get display price in PHP (uses php_price if available, otherwise calculates)
 */
export function getDisplayPrice(product: Product): number {
  if (product.php_price) {
    return product.php_price;
  }
  
  // Fallback calculation
  if (product.currency === 'KRW') {
    return product.price * (product.price_conversion_rate || 0.042);
  }
  
  return product.price;
}

/**
 * Get display currency
 */
export function getDisplayCurrency(product: Product): 'PHP' | 'KRW' {
  return product.currency === 'KRW' ? 'PHP' : product.currency;
}

/**
 * Get brand name (handles both old string and new object format)
 */
export function getBrandName(product: Product): string | undefined {
  if (!product.brand) return undefined;
  
  if (typeof product.brand === 'string') {
    return product.brand;
  }
  
  return product.brand.name;
}

/**
 * Get category name (handles both old string and new object format)
 */
export function getCategoryName(product: Product): string | undefined {
  if (!product.category) return undefined;
  
  if (typeof product.category === 'string') {
    return product.category;
  }
  
  return product.category.name;
}

/**
 * Get available stock count
 */
export function getAvailableStock(product: Product): number {
  if (typeof product.stock === 'number') {
    return product.stock;
  }
  
  return product.stock?.available || 0;
}

/**
 * Check if product is in stock
 */
export function isInStock(product: Product): boolean {
  return getAvailableStock(product) > 0;
}

