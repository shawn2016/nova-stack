<template>
  <view class="container">
    <text class="title">{{ appStore.title }}</text>
    <u-button type="primary" text="检查服务健康" @click="checkHealth" />
    <text v-if="healthStatus" class="status">{{ healthStatus }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { request } from '@/utils/request';

const appStore = useAppStore();
const healthStatus = ref('');

interface HealthData {
  status: string;
}

async function checkHealth() {
  healthStatus.value = '请求中...';
  try {
    const data = await request<HealthData>({
      url: '/health',
      method: 'GET',
    });
    healthStatus.value = `服务状态：${data.status}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : '请求失败';
    healthStatus.value = message;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  gap: 32rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #303133;
}

.status {
  font-size: 28rpx;
  color: #606266;
  text-align: center;
}
</style>
