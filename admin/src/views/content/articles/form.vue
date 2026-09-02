<template>
  <div class="content-articles-form art-full-height">
    <ElCard>
      <template #header>
        <span>{{ isEdit ? '编辑文章' : '新建文章' }}</span>
      </template>

      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="88px"
        style="max-width: 720px"
      >
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="form.title" placeholder="请输入标题" clearable />
        </ElFormItem>
        <ElFormItem label="摘要" prop="summary">
          <ElInput
            v-model="form.summary"
            type="textarea"
            placeholder="请输入摘要"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </ElFormItem>
        <ElFormItem label="封面 URL" prop="coverUrl">
          <ElInput v-model="form.coverUrl" placeholder="可选，封面图片地址" clearable />
        </ElFormItem>
        <ElFormItem label="正文" prop="content">
          <ElInput
            v-model="form.content"
            type="textarea"
            placeholder="请输入正文"
            :autosize="{ minRows: 8, maxRows: 16 }"
          />
        </ElFormItem>
        <ElFormItem>
          <ElSpace wrap>
            <ElButton type="primary" :loading="saving" @click="handleSave" v-ripple>
              保存
            </ElButton>
            <ElButton
              v-if="isEdit && articleStatus === 0"
              v-permission="'content:article:publish'"
              type="success"
              plain
              :loading="publishing"
              @click="handlePublish"
            >
              发布
            </ElButton>
            <ElButton @click="goBack">返回</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    createArticle,
    getArticle,
    publishArticle,
    updateArticle,
  } from '@/api/article'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ContentArticlesForm' })

  const route = useRoute()
  const router = useRouter()

  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const publishing = ref(false)
  const articleStatus = ref<0 | 1>(0)

  const articleId = computed(() => {
    const raw = route.params.id
    if (typeof raw !== 'string') return null
    const id = Number(raw)
    return Number.isFinite(id) ? id : null
  })

  const isEdit = computed(() => articleId.value !== null)

  const form = reactive({
    title: '',
    summary: '',
    content: '',
    coverUrl: '',
  })

  const rules: FormRules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  }

  async function loadArticle() {
    if (!articleId.value) return

    try {
      const article = await getArticle(articleId.value)
      form.title = article.title
      form.summary = article.summary
      form.content = article.content
      form.coverUrl = article.coverUrl ?? ''
      articleStatus.value = article.status
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载文章失败')
      router.replace('/content/articles')
    }
  }

  async function handleSave() {
    const formEl = formRef.value
    if (!formEl) return

    const valid = await formEl.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      const payload = {
        title: form.title,
        summary: form.summary || undefined,
        content: form.content,
        coverUrl: form.coverUrl || undefined,
      }

      if (isEdit.value && articleId.value) {
        await updateArticle(articleId.value, payload)
        ElMessage.success('更新成功')
      } else {
        const created = await createArticle(payload)
        ElMessage.success('创建成功')
        router.replace(`/content/articles/${created.id}/edit`)
      }
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      saving.value = false
    }
  }

  async function handlePublish() {
    if (!articleId.value) return

    publishing.value = true
    try {
      const article = await publishArticle(articleId.value)
      articleStatus.value = article.status
      ElMessage.success('发布成功')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '发布失败')
    } finally {
      publishing.value = false
    }
  }

  function goBack() {
    router.push('/content/articles')
  }

  onMounted(() => {
    loadArticle()
  })
</script>
