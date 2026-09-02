<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-100">
    <a-card class="w-96" title="登录">
      <a-form :model="form" layout="vertical" @submit="handleSubmit">
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" long>登录</a-button>
        </a-form-item>
      </a-form>
      <p class="text-sm text-gray-500 text-center mt-2">登录功能待后续 auth change 实现</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
});

function handleSubmit() {
  Message.info('登录功能尚未实现');
  router.push({ name: 'Dashboard' });
}
</script>
