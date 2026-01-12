/**
 * Environment detection utilities
 */

/**
 * Check if running on localhost
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we should use mock data
 * Uses mock data if:
 * - Running on localhost
 * - OR environment variable USE_MOCK_DATA is set to 'true'
 */
export function shouldUseMockData(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return true;
  }
  return isLocalhost();
}

/**
 * Get the API base URL
 * On localhost, defaults to localhost:3001/api for testing
 * Can be overridden with NEXT_PUBLIC_API_URL environment variable
 */
export function getApiBaseUrl(): string {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // On localhost, default to localhost API for testing
  if (isLocalhost()) {
    return 'https://hanbuy-api.onrender.com/api';
  }
  
  // Production default
  return 'https://hanbuy-api.onrender.com/api';
}
