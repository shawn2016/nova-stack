import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} - Nova Admin` : 'Nova Admin';

  // 路由守卫占位：后续 auth change 实现登录校验
  next();
});

export default router;
