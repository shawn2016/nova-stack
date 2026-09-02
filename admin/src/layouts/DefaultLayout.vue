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
        <a-menu-item key="dashboard">仪表盘</a-menu-item>
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
        <span class="text-gray-600">管理后台</span>
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
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon';
import { useAppStore } from '@/store/modules/app';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const selectedKeys = computed(() => {
  if (route.name === 'Dashboard') {
    return ['dashboard'];
  }
  return [];
});

function onCollapse(collapsed: boolean) {
  appStore.sidebarCollapsed = collapsed;
}

function onMenuClick(key: string) {
  if (key === 'dashboard') {
    router.push({ name: 'Dashboard' });
  }
}
</script>

<style scoped>
.layout-header {
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
}
</style>
