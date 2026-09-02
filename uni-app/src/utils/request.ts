import { ErrorCode, type ApiResponse } from '@nova/shared-types';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export interface RequestOptions extends Omit<UniApp.RequestOptions, 'url'> {
  url: string;
}

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

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: resolveUrl(options.url),
      success: (res) => {
        try {
          const payload = res.data as ApiResponse<T>;
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
