<template>
  <div class="content-articles-page art-full-height">
    <ElCard>
      <template #header>
        <span>文章管理</span>
      </template>
      <ElEmpty description="文章列表页面将在 Task 5 实现">
        <ElButton
          v-permission="'content:article:create'"
          type="primary"
          @click="router.push('/content/articles/create')"
        >
          新建文章
        </ElButton>
      </ElEmpty>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ContentArticles' })

  const router = useRouter()
</script>
