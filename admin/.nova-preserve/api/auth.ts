import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMeResponse,
  MenuNode,
  TokenPair,
} from '@nova/shared-types';
import { request } from './request';

export function login(data: AdminLoginRequest) {
  return request<AdminLoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data,
  });
}

export function logout() {
  return request<void>({
    url: '/auth/logout',
    method: 'POST',
  });
}

export function refreshToken(refreshToken: string) {
  return request<TokenPair>({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken },
  });
}

export function getMe() {
  return request<AdminMeResponse>({
    url: '/auth/me',
    method: 'GET',
  });
}

export function getMenus() {
  return request<MenuNode[]>({
    url: '/auth/me/menus',
    method: 'GET',
  });
}
