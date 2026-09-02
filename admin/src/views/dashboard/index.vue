<template>
  <a-card title="仪表盘">
    <p class="text-gray-600 mb-4">欢迎使用 Nova 管理后台。</p>
    <a-space wrap>
      <a-button type="primary" :loading="loading" @click="fetchHealth">
        测试 API 连接
      </a-button>
      <a-button v-permission="'system:user:create'">权限按钮示例</a-button>
      <span v-if="healthStatus" class="text-sm text-green-600">{{ healthStatus }}</span>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { request } from '@/api/request';

const loading = ref(false);
const healthStatus = ref('');

async function fetchHealth() {
  loading.value = true;
  healthStatus.value = '';
  try {
    const data = await request<{ status: string }>({ url: '/health', method: 'GET' });
    healthStatus.value = `服务状态：${data.status}`;
    Message.success('API 连接正常');
  } catch {
    Message.error('API 连接失败，请确认后端已启动');
  } finally {
    loading.value = false;
  }
}
</script>
