import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminInfo, MenuNode } from '@nova/shared-types';
import * as authApi from '@/api/auth';
import { resetDynamicRoutes } from '@/router/permission';

const TOKEN_KEY = 'nova_admin_token';
const REFRESH_TOKEN_KEY = 'nova_admin_refresh_token';

function readStorage(key: string): string | null {
  return localStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(readStorage(TOKEN_KEY));
  const refreshToken = ref<string | null>(readStorage(REFRESH_TOKEN_KEY));
  const adminInfo = ref<AdminInfo | null>(null);
  const menus = ref<MenuNode[]>([]);
  const routesLoaded = ref(false);

  const permissions = computed(() => adminInfo.value?.permissions ?? []);
  const isLoggedIn = computed(() => !!token.value);

  function setTokens(access: string, refresh: string) {
    token.value = access;
    refreshToken.value = refresh;
    writeStorage(TOKEN_KEY, access);
    writeStorage(REFRESH_TOKEN_KEY, refresh);
  }

  function setAdminInfo(info: AdminInfo) {
    adminInfo.value = info;
  }

  function setMenus(value: MenuNode[]) {
    menus.value = value;
  }

  function setRoutesLoaded(value: boolean) {
    routesLoaded.value = value;
  }

  function hasPermission(code: string) {
    return permissions.value.includes(code);
  }

  async function login(username: string, password: string) {
    const data = await authApi.login({ username, password });
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setAdminInfo(data.user);
  }

  async function logout() {
    try {
      if (token.value) {
        await authApi.logout();
      }
    } catch {
      // ignore logout API errors
    } finally {
      resetSession();
    }
  }

  function resetSession() {
    token.value = null;
    refreshToken.value = null;
    adminInfo.value = null;
    menus.value = [];
    routesLoaded.value = false;
    writeStorage(TOKEN_KEY, null);
    writeStorage(REFRESH_TOKEN_KEY, null);
    resetDynamicRoutes();
  }

  function updateAccessToken(access: string) {
    token.value = access;
    writeStorage(TOKEN_KEY, access);
  }

  return {
    token,
    refreshToken,
    adminInfo,
    menus,
    routesLoaded,
    permissions,
    isLoggedIn,
    setTokens,
    setAdminInfo,
    setMenus,
    setRoutesLoaded,
    hasPermission,
    login,
    logout,
    resetSession,
    updateAccessToken,
  };
});
