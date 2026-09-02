<template>
  <a-card title="角色管理">
    <a-space>
      <a-button type="primary" v-permission="'system:role:create'">新增角色</a-button>
      <a-button v-permission="'system:role:update'">编辑角色</a-button>
      <a-button status="danger" v-permission="'system:role:delete'">删除角色</a-button>
    </a-space>
    <p class="text-gray-500 mt-4">角色管理页面占位，按钮按 v-permission 控制可见性。</p>
  </a-card>
</template>

<script setup lang="ts"></script>
