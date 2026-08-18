import axios from 'axios';
import { API_BASE_URL } from './endpoints';
import { ApiResponse } from './types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('donation_admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper methods with Unified Response parsing
export async function apiGet<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url, { params });
    return res.data;
  } catch (error: any) {
    const data = error.response?.data;
    return {
      success: false,
      data: null as any,
      message: data?.message || error.message || 'حدث خطأ في الاتصال بالخادم',
    };
  }
}

export async function apiPost<T = any>(url: string, body?: any, config?: any): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.post<ApiResponse<T>>(url, body, config);
    return res.data;
  } catch (error: any) {
    const data = error.response?.data;
    return {
      success: false,
      data: null as any,
      message: data?.message || error.message || 'حدث خطأ أثناء معالجة الطلب',
    };
  }
}

export async function apiPatch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.patch<ApiResponse<T>>(url, body);
    return res.data;
  } catch (error: any) {
    const data = error.response?.data;
    return {
      success: false,
      data: null as any,
      message: data?.message || error.message || 'حدث خطأ أثناء التحديث',
    };
  }
}

export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.delete<ApiResponse<T>>(url);
    return res.data;
  } catch (error: any) {
    const data = error.response?.data;
    return {
      success: false,
      data: null as any,
      message: data?.message || error.message || 'حدث خطأ أثناء الحذف',
    };
  }
}
