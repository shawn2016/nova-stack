<template>
  <a-layout class="min-h-screen">
    <a-layout-sider
      :collapsed="appStore.sidebarCollapsed"
      collapsible
      breakpoint="lg"
      @collapse="onCollapse"
    >
      <div class="h-12 flex items-center justify-center text-white font-semibold">
        Nova Admin
      </div>
      <a-menu
        :selected-keys="selectedKeys"
        theme="dark"
        @menu-item-click="onMenuClick"
      >
        <a-menu-item key="/dashboard">仪表盘</a-menu-item>
        <template v-for="item in menuItems" :key="item.key">
          <a-sub-menu v-if="item.children?.length" :key="item.key">
            <template #title>{{ item.title }}</template>
            <a-menu-item v-for="child in item.children" :key="child.key">
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="item.key">{{ item.title }}</a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="layout-header flex items-center justify-between px-4">
        <a-button type="text" @click="appStore.toggleSidebar">
          <template #icon>
            <icon-menu-fold v-if="!appStore.sidebarCollapsed" />
            <icon-menu-unfold v-else />
          </template>
        </a-button>
        <a-space>
          <span class="text-gray-600">{{ userStore.adminInfo?.nickname || '管理后台' }}</span>
          <a-button type="text" @click="handleLogout">退出</a-button>
        </a-space>
      </a-layout-header>

      <a-layout-content class="p-4">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon';
import type { MenuNode } from '@nova/shared-types';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';

interface SidebarItem {
  key: string;
  title: string;
  children?: SidebarItem[];
}

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

function buildSidebarItems(menus: MenuNode[]): SidebarItem[] {
  const items: SidebarItem[] = [];

  for (const menu of menus) {
    if (menu.type === 'button') {
      continue;
    }

    if (menu.type === 'directory') {
      items.push({
        key: menu.path,
        title: menu.name,
        children: menu.children
          ?.filter((child) => child.type === 'menu')
          .map((child) => ({
            key: child.path,
            title: child.name,
          })),
      });
      continue;
    }

    if (menu.type === 'menu') {
      items.push({
        key: menu.path,
        title: menu.name,
      });
    }
  }

  return items;
}

const menuItems = computed(() => buildSidebarItems(userStore.menus));

const selectedKeys = computed(() => [route.path]);

function onCollapse(collapsed: boolean) {
  appStore.sidebarCollapsed = collapsed;
}

function onMenuClick(key: string) {
  router.push(key);
}

async function handleLogout() {
  await userStore.logout();
  Message.success('已退出登录');
  router.replace('/login');
}
</script>

<style scoped>
.layout-header {
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
}
</style>
