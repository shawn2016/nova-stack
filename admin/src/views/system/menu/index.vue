<template>
  <a-card title="菜单管理">
    <a-space>
      <a-button type="primary" v-permission="'system:menu:create'">新增菜单</a-button>
      <a-button v-permission="'system:menu:update'">编辑菜单</a-button>
      <a-button status="danger" v-permission="'system:menu:delete'">删除菜单</a-button>
    </a-space>
    <p class="text-gray-500 mt-4">菜单管理页面占位，按钮按 v-permission 控制可见性。</p>
  </a-card>
</template>

<script setup lang="ts"></script>
