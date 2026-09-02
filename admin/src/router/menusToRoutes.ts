import type { MenuNode } from '@nova/shared-types';
import type { RouteRecordRaw } from 'vue-router';

const viewModules = import.meta.glob('../views/**/*.vue');

export function normalizeComponentPath(component: string): string {
  const stripped = component.replace(/^views\//, '').replace(/^\//, '');
  return stripped.replace(/\/index$/, '') || stripped;
}

function loadView(component: string) {
  const normalized = normalizeComponentPath(component);
  const candidates = [
    `../views/${normalized}.vue`,
    `../views/${normalized}/index.vue`,
  ];
  for (const key of candidates) {
    const loader = viewModules[key];
    if (loader) {
      return loader;
    }
  }
  return () => import('../views/exception/404/index.vue');
}

function routeNameFromPath(path: string) {
  return path.replace(/^\//, '').replace(/\//g, '-') || 'root';
}

export function menusToRoutes(menus: MenuNode[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  for (const menu of menus) {
    if (menu.type === 'button') {
      continue;
    }

    if (menu.type === 'directory') {
      if (menu.children?.length) {
        routes.push(...menusToRoutes(menu.children));
      }
      continue;
    }

    if (menu.type === 'menu' && menu.component) {
      const routePath = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;
      routes.push({
        path: routePath,
        name: routeNameFromPath(menu.path),
        component: loadView(menu.component),
        meta: {
          title: menu.name,
          icon: menu.icon,
        },
      });
    }
  }

  return routes;
}

export function collectRouteNames(routes: RouteRecordRaw[]): string[] {
  const names: string[] = [];
  for (const route of routes) {
    if (route.name) {
      names.push(String(route.name));
    }
    if (route.children?.length) {
      names.push(...collectRouteNames(route.children));
    }
  }
  return names;
}
