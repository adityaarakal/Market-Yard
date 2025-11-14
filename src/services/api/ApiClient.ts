/**
 * API Client - Base HTTP client for API requests
 * This provides an abstraction layer that can switch between localStorage and API
 */

import { ApiRequestConfig, ApiResponse, ApiError } from './types';
import StorageService from '../StorageService';
import { APP_CONFIG } from '../../utils/constants';

class ApiClient {
  private baseURL: string;
  private useLocalStorage: boolean;

  constructor() {
    // In development, use localStorage. In production, use API
    this.useLocalStorage = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Get authentication token from session
   */
  private getAuthToken(): string | null {
    const session = StorageService.getSession();
    return session?.token || null;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
    if (!params || Object.keys(params).length === 0) {
      return url.startsWith('http') ? url : `${this.baseURL}${url}`;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const separator = url.includes('?') ? '&' : '?';
    return url.startsWith('http') ? `${url}${separator}${queryString}` : `${this.baseURL}${url}${separator}${queryString}`;
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: any, statusCode?: number): ApiResponse {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details,
      statusCode: statusCode || 500,
    };

    return {
      success: false,
      error: apiError,
    };
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // If using localStorage mode, return error (services should use StorageService directly)
    if (this.useLocalStorage) {
      return {
        success: false,
        error: {
          code: 'LOCAL_STORAGE_MODE',
          message: 'API calls are disabled. Using local storage mode.',
          statusCode: 503,
        },
      };
    }

    try {
      const url = this.buildUrl(config.url, config.params);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
      };

      // Add auth token if required
      if (config.requireAuth !== false) {
        const token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const fetchConfig: RequestInit = {
        method: config.method,
        headers,
        signal: config.timeout
          ? AbortSignal.timeout(config.timeout)
          : undefined,
      };

      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        fetchConfig.body = JSON.stringify(config.data);
      }

      const response = await fetch(url, fetchConfig);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      let responseData: any;
      if (isJson) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = text ? { message: text } : {};
      }

      if (!response.ok) {
        return this.createErrorResponse(
          responseData.error || { message: responseData.message || 'Request failed' },
          response.status
        );
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
      };
    } catch (error: any) {
      console.error('API request error:', error);

      if (error.name === 'AbortError') {
        return this.createErrorResponse(
          { code: 'TIMEOUT', message: 'Request timeout' },
          408
        );
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return this.createErrorResponse(
          { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' },
          0
        );
      }

      return this.createErrorResponse(error, 500);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    params?: Record<string, string | number | boolean>,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  /**
   * Check if using local storage mode
   */
  isLocalStorageMode(): boolean {
    return this.useLocalStorage;
  }

  /**
   * Set API base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Enable/disable local storage mode
   */
  setLocalStorageMode(enabled: boolean): void {
    this.useLocalStorage = enabled;
  }

  /**
   * Static method to set localStorage mode (for FeatureFlagsService)
   */
  static setLocalStorageMode(enabled: boolean): void {
    apiClient.setLocalStorageMode(enabled);
  }
}

const apiClient = new ApiClient();
export default apiClient;

