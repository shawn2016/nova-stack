import type { AppRouteRecord } from '@/types/router';

/** 不进侧栏菜单的静态补充路由 */
export const hiddenRoutes: AppRouteRecord[] = [
  {
    path: '/content/articles/create',
    name: 'content-articles-create',
    component: '/content/articles/form',
    meta: {
      title: '新建文章',
      isHide: true,
      isHideTab: true,
    },
  },
  {
    path: '/content/articles/:id/edit',
    name: 'content-articles-edit',
    component: '/content/articles/form',
    meta: {
      title: '编辑文章',
      isHide: true,
      isHideTab: true,
      activePath: '/content/articles',
    },
  },
];

let removeHiddenRouteFns: Array<() => void> = [];

export function appendHiddenRoutes(menuList: AppRouteRecord[]): AppRouteRecord[] {
  return [...menuList, ...hiddenRoutes];
}

export function trackHiddenRouteRemovers(fns: Array<() => void>): void {
  removeHiddenRouteFns = fns;
}

export function resetDynamicRoutes(): void {
  removeHiddenRouteFns.forEach((fn) => fn());
  removeHiddenRouteFns = [];
}
