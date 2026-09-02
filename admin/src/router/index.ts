import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { loadDynamicRoutes } from './permission';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} - Nova Admin` : 'Nova Admin';

  const userStore = useUserStore();
  const isPublic = to.meta.public === true;

  if (isPublic) {
    if (to.path === '/login' && userStore.isLoggedIn) {
      next({ path: '/dashboard' });
      return;
    }
    next();
    return;
  }

  if (!userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (!userStore.routesLoaded) {
    try {
      await loadDynamicRoutes();
      next({ ...to, replace: true });
    } catch {
      userStore.resetSession();
      next({ path: '/login', query: { redirect: to.fullPath } });
    }
    return;
  }

  next();
});

export default router;
