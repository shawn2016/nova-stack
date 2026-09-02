<template>
  <a-card :title="isEdit ? '编辑文章' : '新建文章'">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="max-width: 720px">
      <a-form-item field="title" label="标题">
        <a-input v-model="form.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item field="summary" label="摘要">
        <a-textarea v-model="form.summary" placeholder="请输入摘要" :auto-size="{ minRows: 2, maxRows: 4 }" />
      </a-form-item>
      <a-form-item field="coverUrl" label="封面 URL">
        <a-input v-model="form.coverUrl" placeholder="可选，封面图片地址" />
      </a-form-item>
      <a-form-item field="content" label="正文">
        <a-textarea v-model="form.content" placeholder="请输入正文" :auto-size="{ minRows: 8, maxRows: 16 }" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
          <a-button
            v-if="isEdit && articleStatus === 0"
            type="outline"
            status="success"
            :loading="publishing"
            v-permission="'content:article:publish'"
            @click="handlePublish"
          >
            发布
          </a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue';
import * as articleApi from '@/api/article';

const route = useRoute();
const router = useRouter();

const formRef = ref<FormInstance>();
const saving = ref(false);
const publishing = ref(false);
const articleStatus = ref<0 | 1>(0);

const articleId = computed(() => {
  const raw = route.params.id;
  if (typeof raw !== 'string') return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
});

const isEdit = computed(() => articleId.value !== null);

const form = reactive({
  title: '',
  summary: '',
  content: '',
  coverUrl: '',
});

const rules = {
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入正文' }],
};

async function loadArticle() {
  if (!articleId.value) return;

  try {
    const article = await articleApi.getArticle(articleId.value);
    form.title = article.title;
    form.summary = article.summary;
    form.content = article.content;
    form.coverUrl = article.coverUrl ?? '';
    articleStatus.value = article.status;
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '加载文章失败');
    router.replace('/content/articles');
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate();
  if (valid) return;

  saving.value = true;
  try {
    const payload = {
      title: form.title,
      summary: form.summary || undefined,
      content: form.content,
      coverUrl: form.coverUrl || undefined,
    };

    if (isEdit.value && articleId.value) {
      await articleApi.updateArticle(articleId.value, payload);
      Message.success('更新成功');
    } else {
      const created = await articleApi.createArticle(payload);
      Message.success('创建成功');
      router.replace(`/content/articles/${created.id}/edit`);
    }
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '保存失败');
  } finally {
    saving.value = false;
  }
}

async function handlePublish() {
  if (!articleId.value) return;

  publishing.value = true;
  try {
    const article = await articleApi.publishArticle(articleId.value);
    articleStatus.value = article.status;
    Message.success('发布成功');
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '发布失败');
  } finally {
    publishing.value = false;
  }
}

function goBack() {
  router.push('/content/articles');
}

onMounted(() => {
  loadArticle();
});
</script>
