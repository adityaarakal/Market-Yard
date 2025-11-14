/**
 * API Error Handler
 * Centralized error handling for API responses
 */

import { ApiError, ApiResponse } from './types';

export class ApiException extends Error {
  public error: ApiError;
  public statusCode?: number;

  constructor(error: ApiError, statusCode?: number) {
    super(error.message);
    this.name = 'ApiException';
    this.error = error;
    this.statusCode = statusCode;
  }
}

/**
 * Handle API response and throw if error
 */
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.error) {
    throw new ApiException(
      response.error || {
        code: 'UNKNOWN_ERROR',
        message: response.message || 'An error occurred',
      },
      response.error?.statusCode
    );
  }

  if (response.data === undefined) {
    throw new ApiException({
      code: 'NO_DATA',
      message: 'Response contains no data',
    });
  }

  return response.data;
}

/**
 * Handle API error and return user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiException) {
    return error.error.code === 'NETWORK_ERROR' || error.statusCode === 0;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiException) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof ApiException) {
    return error.error.code === 'TIMEOUT' || error.statusCode === 408;
  }
  return false;
}

