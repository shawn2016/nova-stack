<template>
  <div class="not-found flex flex-col items-center justify-center min-h-60vh">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
    <p class="text-gray-500 mb-6">抱歉，您访问的页面不存在</p>
    <a-button type="primary" @click="goHome">返回首页</a-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push({ name: 'Dashboard' });
}
</script>

<style scoped>
.min-h-60vh {
  min-height: 60vh;
}
</style>
