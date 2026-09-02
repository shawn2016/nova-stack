import type {
  MemberLoginRequest,
  MemberLoginResponse,
  MemberRegisterRequest,
} from '@nova/shared-types';
import { request } from '@/utils/request';

export function login(data: MemberLoginRequest) {
  return request<MemberLoginResponse>({
    url: '/member/auth/login',
    method: 'POST',
    data,
  });
}

export function register(data: MemberRegisterRequest) {
  return request<MemberLoginResponse>({
    url: '/member/auth/register',
    method: 'POST',
    data,
  });
}

export function logout() {
  return request<{ success: true }>({
    url: '/member/auth/logout',
    method: 'POST',
  });
}
