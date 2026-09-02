import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ErrorCode, type ApiResponse, type TokenPair } from '@nova/shared-types';
import { useUserStore } from '@/store/modules/user';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
let routerPromise: Promise<typeof import('@/router/index').default> | null = null;

function getRouter() {
  if (!routerPromise) {
    routerPromise = import('@/router/index').then((m) => m.default);
  }
  return routerPromise;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  const response = await axios.post<ApiResponse<TokenPair>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  );
  if (response.data.code !== ErrorCode.SUCCESS) {
    throw new Error(response.data.message || '刷新令牌失败');
  }
  return response.data.data;
}

function processRefreshQueue(token: string) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

function rejectRefreshQueue() {
  refreshQueue = [];
}

instance.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    const userStore = useUserStore();
    if (!userStore.refreshToken) {
      userStore.resetSession();
      const router = await getRouter();
      await router.replace('/login');
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          instance.request(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const tokens = await refreshAccessToken(userStore.refreshToken);
      userStore.updateAccessToken(tokens.accessToken);
      processRefreshQueue(tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return instance.request(originalRequest);
    } catch (refreshError) {
      rejectRefreshQueue();
      userStore.resetSession();
      const router = await getRouter();
      await router.replace('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

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
