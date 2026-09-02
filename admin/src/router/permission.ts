import type { RouteRecordRaw } from 'vue-router';
import { getMe, getMenus } from '@/api/auth';
import { useUserStore } from '@/store/modules/user';
import { collectRouteNames, menusToRoutes } from './menusToRoutes';

const LAYOUT_ROUTE_NAME = 'Layout';

let addedRouteNames: string[] = [];
let routerPromise: Promise<import('vue-router').Router> | null = null;

function getRouter() {
  if (!routerPromise) {
    routerPromise = import('./index').then((m) => m.default);
  }
  return routerPromise;
}

export function resetDynamicRoutes() {
  void getRouter().then((router) => {
    for (const name of addedRouteNames) {
      if (router.hasRoute(name)) {
        router.removeRoute(name);
      }
    }
    addedRouteNames = [];
  });
}

export async function loadDynamicRoutes(): Promise<RouteRecordRaw[]> {
  const userStore = useUserStore();

  if (userStore.routesLoaded) {
    return [];
  }

  if (!userStore.adminInfo) {
    const me = await getMe();
    userStore.setAdminInfo(me);
  }

  const menus = await getMenus();
  userStore.setMenus(menus);

  const dynamicRoutes = menusToRoutes(menus);
  const router = await getRouter();

  for (const route of dynamicRoutes) {
    router.addRoute(LAYOUT_ROUTE_NAME, route);
  }

  addedRouteNames = collectRouteNames(dynamicRoutes);
  userStore.setRoutesLoaded(true);

  return dynamicRoutes;
}
