<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-show="showSearchBar"
      v-model="searchForm"
      :items="searchItems"
      :showExpand="false"
      @reset="handleSearchReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" :style="{ marginTop: showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="loadData"
      >
        <template #left>
          <ElSpace wrap>
            <ElRadioGroup v-model="activeTab" @change="handleTabChange">
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
  import ArtTableActions from '@/components/core/tables/art-table-actions/index.vue'
  import type { TableActionItem } from '@/components/core/tables/art-table-actions/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import {
    deleteMessage,
    fetchMessageInbox,
    fetchMessageSent,
    markMessageRead,
  } from '@/api/notice'
  import type { MessageListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import SendDialog from './modules/send-dialog.vue'

  defineOptions({ name: 'Messages' })

  const activeTab = ref<'inbox' | 'sent'>('inbox')
  const showSearchBar = ref(true)
  const sendVisible = ref(false)
  const loading = ref(false)
  const tableData = ref<MessageListItem[]>([])
  const pagination = reactive({ current: 1, size: 20, total: 0 })
  const searchForm = reactive({ keyword: '' })

  const searchItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '标题' },
    },
  ])

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
        const items: TableActionItem[] = []
        if (activeTab.value === 'inbox' && row.isRead === 0) {
          items.push({
            key: 'read',
            label: '标记已读',
            auth: 'system:message:list',
            onClick: () => handleMarkRead(row),
          })
        }
        items.push({
          key: 'delete',
          label: '删除',
          danger: true,
          auth: 'system:message:delete',
          onClick: () => handleDelete(row),
        })
        return h(ArtTableActions, { items })
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
      const res = await api({
        current: pagination.current,
        size: pagination.size,
        keyword: searchForm.keyword || undefined,
      })
      tableData.value = res.records
      pagination.total = res.total
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      loading.value = false
    }
  }

  function handleTabChange() {
    pagination.current = 1
    loadData()
  }

  function handleSearch() {
    pagination.current = 1
    loadData()
  }

  function handleSearchReset() {
    searchForm.keyword = ''
    handleSearch()
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
