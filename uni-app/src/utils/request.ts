import { ErrorCode, type ApiResponse, type TokenPair } from '@nova/shared-types';
import { useMemberStore } from '@/store/member';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface RequestOptions extends Omit<UniApp.RequestOptions, 'url'> {
  url: string;
  _retry?: boolean;
  _skipAuth?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function resolveUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `${baseURL}${url}`;
}

function unwrapResponse<T>(payload: ApiResponse<T>): T {
  if (payload.code !== ErrorCode.SUCCESS) {
    throw new Error(payload.message || '请求失败');
  }
  return payload.data;
}

function shouldAttemptRefresh(url: string): boolean {
  return (
    !url.includes('/member/auth/refresh') &&
    !url.includes('/member/auth/login') &&
    !url.includes('/member/auth/register')
  );
}

function redirectToLogin() {
  uni.reLaunch({ url: '/pages/login/login' });
}

function processRefreshQueue(token: string) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

function rejectRefreshQueue() {
  refreshQueue = [];
}

function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.header as Record<string, string> | undefined),
  };

  if (!options._skipAuth) {
    const memberStore = useMemberStore();
    if (memberStore.token) {
      headers.Authorization = `Bearer ${memberStore.token}`;
    }
  }

  return headers;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: resolveUrl('/member/auth/refresh'),
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { refreshToken },
      success: (res) => {
        try {
          const payload = res.data as ApiResponse<TokenPair>;
          if (res.statusCode === 401 || payload.code !== ErrorCode.SUCCESS) {
            reject(new Error(payload.message || '刷新令牌失败'));
            return;
          }
          resolve(unwrapResponse(payload));
        } catch (error) {
          reject(error);
        }
      },
      fail: reject,
    });
  });
}

async function handleUnauthorized<T>(options: RequestOptions): Promise<T> {
  if (!shouldAttemptRefresh(options.url) || options._retry) {
    throw new Error('未授权');
  }

  const memberStore = useMemberStore();

  if (!memberStore.refreshToken) {
    memberStore.resetSession();
    redirectToLogin();
    throw new Error('登录已过期，请重新登录');
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push((token: string) => {
        request<T>({ ...options, _retry: true, header: { Authorization: `Bearer ${token}` } })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  isRefreshing = true;

  try {
    const tokens = await refreshAccessToken(memberStore.refreshToken);
    memberStore.updateAccessToken(tokens.accessToken);
    processRefreshQueue(tokens.accessToken);
    return request<T>({ ...options, _retry: true });
  } catch {
    rejectRefreshQueue();
    memberStore.resetSession();
    redirectToLogin();
    throw new Error('登录已过期，请重新登录');
  } finally {
    isRefreshing = false;
  }
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: resolveUrl(options.url),
      header: buildHeaders(options),
      success: async (res) => {
        const payload = res.data as ApiResponse<T>;
        const statusCode = res.statusCode ?? 200;

        if (statusCode === 401 && !options._skipAuth) {
          try {
            const data = await handleUnauthorized<T>(options);
            resolve(data);
          } catch (error) {
            reject(error);
          }
          return;
        }

        if (statusCode >= 400) {
          reject(new Error(payload?.message || `请求失败 (${statusCode})`));
          return;
        }

        try {
          resolve(unwrapResponse(payload));
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}
