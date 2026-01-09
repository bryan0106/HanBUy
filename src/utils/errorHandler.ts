import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Parse API errors and return user-friendly error messages
 */
export function handleApiError(error: unknown): ApiError {
  // Axios errors - use isAxiosError helper instead of instanceof
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Handle different error types
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        message: 'Request timeout. Please try again.',
        status: 408,
        code: error.code,
      };
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return {
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        code: error.code,
      };
    }

    // Handle API response errors
    if (data) {
      // Standard API error format: { success: false, error: "...", message: "..." }
      const errorMessage = data.error || data.message || error.message || 'An error occurred';
      
      return {
        message: errorMessage,
        status: status || 500,
        code: data.code,
        details: data.details || data.validation,
      };
    }

    // Handle HTTP status codes
    switch (status) {
      case 400:
        return {
          message: data?.error || data?.message || 'Invalid request. Please check your input.',
          status: 400,
        };
      case 401:
        return {
          message: data?.message || data?.error || 'Invalid email or password',
          status: 401,
        };
      case 403:
        return {
          message: data?.error || data?.message || 'Access denied. You do not have permission.',
          status: 403,
        };
      case 404:
        return {
          message: data?.error || data?.message || 'Resource not found.',
          status: 404,
        };
      case 422:
        return {
          message: data?.error || data?.message || 'Validation error. Please check your input.',
          status: 422,
          details: data?.details || data?.validation,
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          status: 500,
        };
      default:
        return {
          message: data?.error || data?.message || error.message || 'An error occurred',
          status: status || 500,
        };
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Unknown error type
  return {
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Get user-friendly error message from error
 */
export function getErrorMessage(error: unknown): string {
  return handleApiError(error).message;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response || error.code === 'ERR_NETWORK';
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}
