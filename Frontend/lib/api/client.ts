import { APIError, AuthenticationError } from './errors';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Store the current auth token
let currentAuthToken: string | null = null;

// Request interceptor - Get auth headers
function getAuthHeaders(): HeadersInit {
  // Use the current token or try to get it from storage
  const token = currentAuthToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null) ||
    Cookies.get('token');

  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  return {};
}

// Response interceptor - Handle response processing
async function handleResponse<T>(response: Response): Promise<T> {
  // Handle empty responses (204, etc)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');

  // Only parse JSON if the response is actually JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear auth state
          localStorage.removeItem('token');
          Cookies.remove('token');
          currentAuthToken = null;
          // Redirect to login
          window.location.href = '/login';
        }
        throw new AuthenticationError(data?.message || 'Unauthorized');
      }

      // Handle other errors
      throw APIError.fromResponse(response, data);
    }

    return data;
  } else {
    // For non-JSON responses, return the text
    const text = await response.text();
    if (!response.ok) {
      throw new APIError(text || `HTTP ${response.status}`, response.status);
    }
    return text as unknown as T;
  }
}

// Main API client class with method helpers
class ApiClient {
  // Set the auth token
  setAuthToken(token: string | null) {
    currentAuthToken = token;
  }

  // Base request method
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the old function for backward compatibility
export async function apiClientLegacy<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return apiClient.request<T>(endpoint, options);
}
