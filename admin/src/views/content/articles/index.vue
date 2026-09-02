<template>
  <div class="content-articles-page art-full-height">
    <ArticleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'content:article:create'"
              type="primary"
              @click="goCreate"
              v-ripple
            >
              新建文章
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    deleteArticle as deleteArticleApi,
    fetchArticleList,
    publishArticle as publishArticleApi,
  } from '@/api/article'
  import type { ArticleListQuery } from '@/api/article'
  import type { ArticleListItem } from '@nova/shared-types'
  import ArticleSearch from './modules/article-search.vue'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ContentArticles' })

  const router = useRouter()
  const userStore = useUserStore()

  const searchForm = ref<ArticleListQuery>({
    status: undefined,
  })

  function formatDate(value?: string) {
    if (!value) return '-'
    return new Date(value).toLocaleString('zh-CN')
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
  } = useTable({
    core: {
      apiFn: fetchArticleList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value,
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'title', label: '标题', minWidth: 180, showOverflowTooltip: true },
        { prop: 'summary', label: '摘要', minWidth: 200, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const published = row.status === 1
            return h(
              ElTag,
              { type: published ? 'success' : 'info' },
              () => (published ? '已发布' : '草稿'),
            )
          },
        },
        {
          prop: 'publishedAt',
          label: '发布时间',
          width: 180,
          formatter: (row) => formatDate(row.publishedAt),
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) => {
            const items: ButtonMoreItem[] = []
            if (userStore.hasPermission('content:article:update')) {
              items.push({
                key: 'edit',
                label: '编辑',
                icon: 'ri:edit-2-line',
              })
            }
            if (row.status === 0 && userStore.hasPermission('content:article:publish')) {
              items.push({
                key: 'publish',
                label: '发布',
                icon: 'ri:send-plane-line',
              })
            }
            if (userStore.hasPermission('content:article:delete')) {
              items.push({
                key: 'delete',
                label: '删除',
                icon: 'ri:delete-bin-4-line',
                color: '#f56c6c',
              })
            }
            if (!items.length) return h('span', '-')
            return h(ArtButtonMore, {
              list: items,
              onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row),
            })
          },
        },
      ],
    },
  })

  const handleSearch = (params: ArticleListQuery) => {
    replaceSearchParams(params)
    getData()
  }

  const goCreate = () => {
    router.push('/content/articles/create')
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: ArticleListItem) => {
    switch (item.key) {
      case 'edit':
        router.push(`/content/articles/${row.id}/edit`)
        break
      case 'publish':
        handlePublish(row.id)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handlePublish = (id: number) => {
    ElMessageBox.confirm('确定发布该文章吗？', '发布文章', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
      .then(async () => {
        await publishArticleApi(id)
        ElMessage.success('发布成功')
        refreshData()
      })
      .catch(() => undefined)
  }

  const handleDelete = (row: ArticleListItem) => {
    ElMessageBox.confirm(`确定删除文章「${row.title}」吗？此操作不可恢复！`, '删除文章', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteArticleApi(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => undefined)
  }
</script>
