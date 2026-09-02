import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { MemberInfo } from '@nova/shared-types';
import * as memberApi from '@/api/member';

const TOKEN_KEY = 'nova_member_token';
const REFRESH_TOKEN_KEY = 'nova_member_refresh_token';
const MEMBER_INFO_KEY = 'nova_member_info';

function readStorage(key: string): string | null {
  try {
    const value = uni.getStorageSync(key);
    return value || null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value) {
      uni.setStorageSync(key, value);
    } else {
      uni.removeStorageSync(key);
    }
  } catch {
    // ignore storage errors
  }
}

function readMemberInfo(): MemberInfo | null {
  const raw = readStorage(MEMBER_INFO_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as MemberInfo;
  } catch {
    return null;
  }
}

function writeMemberInfo(info: MemberInfo | null) {
  writeStorage(MEMBER_INFO_KEY, info ? JSON.stringify(info) : null);
}

export const useMemberStore = defineStore('member', () => {
  const token = ref<string | null>(readStorage(TOKEN_KEY));
  const refreshToken = ref<string | null>(readStorage(REFRESH_TOKEN_KEY));
  const memberInfo = ref<MemberInfo | null>(readMemberInfo());

  const isLoggedIn = computed(() => !!token.value);

  function setTokens(access: string, refresh: string) {
    token.value = access;
    refreshToken.value = refresh;
    writeStorage(TOKEN_KEY, access);
    writeStorage(REFRESH_TOKEN_KEY, refresh);
  }

  function setMemberInfo(info: MemberInfo) {
    memberInfo.value = info;
    writeMemberInfo(info);
  }

  function updateAccessToken(access: string) {
    token.value = access;
    writeStorage(TOKEN_KEY, access);
  }

  function resetSession() {
    token.value = null;
    refreshToken.value = null;
    memberInfo.value = null;
    writeStorage(TOKEN_KEY, null);
    writeStorage(REFRESH_TOKEN_KEY, null);
    writeMemberInfo(null);
  }

  async function login(phone: string, password: string) {
    const data = await memberApi.login({ phone, password });
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setMemberInfo(data.user);
  }

  async function register(phone: string, password: string, nickname?: string) {
    const data = await memberApi.register({ phone, password, nickname });
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setMemberInfo(data.user);
  }

  async function logout() {
    try {
      if (token.value) {
        await memberApi.logout();
      }
    } catch {
      // ignore logout API errors
    } finally {
      resetSession();
    }
  }

  return {
    token,
    refreshToken,
    memberInfo,
    isLoggedIn,
    setTokens,
    setMemberInfo,
    updateAccessToken,
    resetSession,
    login,
    register,
    logout,
  };
});
