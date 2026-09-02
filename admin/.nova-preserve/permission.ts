import type { App, Directive } from 'vue';
import { useUserStore } from '@/store/modules/user';

const permissionDirective: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userStore = useUserStore();
    if (!userStore.hasPermission(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective);
}
