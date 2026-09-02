<template>
  <a-card title="用户管理">
    <a-space>
      <a-button type="primary" v-permission="'system:user:create'">新增用户</a-button>
      <a-button v-permission="'system:user:update'">编辑用户</a-button>
      <a-button status="danger" v-permission="'system:user:delete'">删除用户</a-button>
    </a-space>
    <p class="text-gray-500 mt-4">用户管理页面占位，按钮按 v-permission 控制可见性。</p>
  </a-card>
</template>

<script setup lang="ts"></script>
