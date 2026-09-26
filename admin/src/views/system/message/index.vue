<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" :showSearchBar="false" @refresh="loadData">
        <template #left>
          <ElSpace wrap>
            <ElRadioGroup v-model="activeTab" @change="loadData">
              <ElRadioButton value="inbox">收件箱</ElRadioButton>
              <ElRadioButton value="sent">发件箱</ElRadioButton>
            </ElRadioGroup>
            <ElButton
              v-if="activeTab === 'inbox'"
              v-permission="'system:message:send'"
              @click="sendVisible = true"
              v-ripple
            >
              发送消息
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <SendDialog v-model="sendVisible" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import {
    deleteMessage,
    fetchMessageInbox,
    fetchMessageSent,
    markMessageRead,
  } from '@/api/notice'
  import type { MessageListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import SendDialog from './modules/send-dialog.vue'

  defineOptions({ name: 'Messages' })

  const userStore = useUserStore()
  const activeTab = ref<'inbox' | 'sent'>('inbox')
  const sendVisible = ref(false)
  const loading = ref(false)
  const tableData = ref<MessageListItem[]>([])
  const pagination = reactive({ current: 1, size: 20, total: 0 })

  const { columns } = useTableColumns(() => [
    { prop: 'title', label: '标题', minWidth: 160 },
    {
      prop: 'isRead',
      label: '状态',
      width: 90,
      formatter: (row: MessageListItem) =>
        h(ElTag, { type: row.isRead ? 'success' : 'warning' }, () =>
          row.isRead ? '已读' : '未读',
        ),
    },
    { prop: 'createdAt', label: '时间', minWidth: 160 },
    {
      prop: 'operation',
      label: '操作',
      width: 140,
      align: 'right',
      formatter: (row: MessageListItem) => {
        const items: ButtonMoreItem[] = []
        if (
          activeTab.value === 'inbox' &&
          row.isRead === 0 &&
          userStore.hasPermission('system:message:list')
        ) {
          items.push({
            key: 'read',
            label: '标记已读',
            onClick: () => handleMarkRead(row),
          })
        }
        if (userStore.hasPermission('system:message:delete')) {
          items.push({
            key: 'delete',
            label: '删除',
            onClick: () => handleDelete(row),
          })
        }
        return h(ArtButtonMore, { items })
      },
    },
  ])

  onMounted(() => {
    loadData()
  })

  async function loadData() {
    loading.value = true
    try {
      const api = activeTab.value === 'inbox' ? fetchMessageInbox : fetchMessageSent
      const res = await api({ current: pagination.current, size: pagination.size })
      tableData.value = res.records
      pagination.total = res.total
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      loading.value = false
    }
  }

  function handleSizeChange(size: number) {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  function handleCurrentChange(current: number) {
    pagination.current = current
    loadData()
  }

  async function handleMarkRead(row: MessageListItem) {
    try {
      await markMessageRead(row.id)
      ElMessage.success('已标记为已读')
      await loadData()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  async function handleDelete(row: MessageListItem) {
    try {
      await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, '提示', { type: 'warning' })
      await deleteMessage(row.id)
      ElMessage.success('删除成功')
      await loadData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }
</script>
