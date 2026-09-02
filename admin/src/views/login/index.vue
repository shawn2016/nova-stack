<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-100">
    <a-card class="w-96" title="Nova Admin 登录">
      <a-form :model="form" layout="vertical" @submit="handleSubmit">
        <a-form-item field="username" label="用户名" required>
          <a-input v-model="form.username" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item field="password" label="密码" required>
          <a-input-password v-model="form.password" placeholder="请输入密码" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" long :loading="loading">登录</a-button>
        </a-form-item>
      </a-form>
      <p class="text-sm text-gray-500 text-center mt-2">默认账号：admin / admin123</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { loadDynamicRoutes } from '@/router/permission';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);

const form = reactive({
  username: 'admin',
  password: 'admin123',
});

async function handleSubmit() {
  if (!form.username || !form.password) {
    Message.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    await userStore.login(form.username, form.password);
    await loadDynamicRoutes();

    const redirect = (route.query.redirect as string) || '/dashboard';
    await router.replace(redirect);
    Message.success('登录成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败';
    Message.error(message);
  } finally {
    loading.value = false;
  }
}
</script>
