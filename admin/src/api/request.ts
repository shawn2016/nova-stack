import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ErrorCode, type ApiResponse } from '@nova/shared-types';
import { useUserStore } from '@/store/modules/user';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const payload = response.data;
  if (payload.code !== ErrorCode.SUCCESS) {
    throw new Error(payload.message || '请求失败');
  }
  return payload.data;
}

export async function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<ApiResponse<T>>(config);
  return unwrapResponse(response);
}

export default instance;
