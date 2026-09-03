<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        :showSearchBar="false"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton v-permission="'system:notice:create'" @click="showDialog('add')" v-ripple>
            新增公告
          </ElButton>
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

    <NoticeDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :notice-data="currentNotice"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    deleteNotice,
    fetchNoticeList,
    publishNotice,
  } from '@/api/notice'
  import type { NoticeListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import NoticeDialog from './modules/notice-dialog.vue'

  defineOptions({ name: 'Notices' })

  const userStore = useUserStore()
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentNotice = ref<NoticeListItem | undefined>(undefined)

  const statusTag: Record<0 | 1, { type: 'info' | 'success'; label: string }> = {
    0: { type: 'info', label: '草稿' },
    1: { type: 'success', label: '已发布' },
  }

  const typeLabel: Record<1 | 2, string> = {
    1: '通知',
    2: '公告',
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
  } = useTable({
    core: {
      apiFn: fetchNoticeList,
      apiParams: { current: 1, size: 20 },
      columnsFactory: () => [
        { prop: 'title', label: '标题', minWidth: 180 },
        {
          prop: 'type',
          label: '类型',
          width: 90,
          formatter: (row: NoticeListItem) => typeLabel[row.type],
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: NoticeListItem) => {
            const tag = statusTag[row.status]
            return h(ElTag, { type: tag.type }, () => tag.label)
          },
        },
        {
          prop: 'publishedAt',
          label: '发布时间',
          minWidth: 160,
          formatter: (row: NoticeListItem) => row.publishedAt ?? '-',
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          align: 'right',
          formatter: (row: NoticeListItem) => {
            const items: ButtonMoreItem[] = []
            if (userStore.hasPermission('system:notice:update')) {
              items.push({
                key: 'edit',
                label: '编辑',
                onClick: () => showDialog('edit', row),
              })
            }
            if (row.status === 0 && userStore.hasPermission('system:notice:publish')) {
              items.push({
                key: 'publish',
                label: '发布',
                onClick: () => handlePublish(row),
              })
            }
            if (row.status === 0 && userStore.hasPermission('system:notice:delete')) {
              items.push({
                key: 'delete',
                label: '删除',
                onClick: () => handleDelete(row),
              })
            }
            return h(ArtButtonMore, { items })
          },
        },
      ],
    },
  })

  function refreshData() {
    getData()
  }

  function showDialog(type: 'add' | 'edit', row?: NoticeListItem) {
    dialogType.value = type
    currentNotice.value = row
    dialogVisible.value = true
  }

  async function handlePublish(row: NoticeListItem) {
    try {
      await ElMessageBox.confirm(`确定发布「${row.title}」吗？`, '提示', { type: 'warning' })
      await publishNotice(row.id)
      ElMessage.success('发布成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '发布失败')
      }
    }
  }

  async function handleDelete(row: NoticeListItem) {
    try {
      await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, '提示', { type: 'warning' })
      await deleteNotice(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }
</script>
