<template>
  <div class="content-articles-form art-full-height">
    <ElCard>
      <template #header>
        <span>{{ isEdit ? '编辑文章' : '新建文章' }}</span>
      </template>
      <ElEmpty description="文章表单页面将在 Task 5 实现">
        <ElButton @click="router.back()">返回</ElButton>
      </ElEmpty>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ContentArticlesForm' })

  const route = useRoute()
  const router = useRouter()
  const isEdit = computed(() => Boolean(route.params.id))
</script>
