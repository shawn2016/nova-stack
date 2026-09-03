<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader :loading="loading" v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElInput
            v-model="keyword"
            clearable
            placeholder="搜索用户名或 IP"
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
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
  import { useTable } from '@/hooks/core/useTable'
  import { fetchOnlineSessionList, kickOnlineSession } from '@/api/online-session'
  import type { OnlineSessionListItem } from '@nova/shared-types'
  import { useUserStore } from '@/store/modules/user'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'OnlineSession' })

  const userStore = useUserStore()
  const keyword = ref('')
  const currentTokenId = ref('')

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
  } = useTable({
    core: {
      apiFn: async (params) => {
        const result = await fetchOnlineSessionList(params)
        currentTokenId.value = result.currentTokenId
        return {
          records: result.list,
          total: result.total,
          current: result.page,
          size: result.pageSize,
        }
      },
      apiParams: {
        current: 1,
        size: 20,
      },
      columnsFactory: () => [
        { prop: 'username', label: '用户名', minWidth: 120 },
        { prop: 'ip', label: 'IP', minWidth: 140 },
        {
          prop: 'userAgent',
          label: '浏览器',
          minWidth: 200,
          formatter: (row: OnlineSessionListItem) => row.userAgent || '-',
        },
        {
          prop: 'loginAt',
          label: '登录时间',
          minWidth: 180,
          formatter: (row: OnlineSessionListItem) =>
            new Date(row.loginAt).toLocaleString('zh-CN'),
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: OnlineSessionListItem) => {
            const isCurrent = row.tokenId === currentTokenId.value
            if (!userStore.hasPermission('system:session:kick') || isCurrent) {
              return h('span', isCurrent ? '当前会话' : '-')
            }
            return h(
              'a',
              {
                class: 'text-danger cursor-pointer',
                onClick: () => handleKick(row),
              },
              '踢下线',
            )
          },
        },
      ],
    },
  })

  function handleSearch() {
    replaceSearchParams({ keyword: keyword.value || undefined })
    getData()
  }

  async function handleKick(row: OnlineSessionListItem) {
    await ElMessageBox.confirm(`确定强制「${row.username}」下线吗？`, '踢下线确认', {
      type: 'warning',
    })
    await kickOnlineSession(row.tokenId)
    ElMessage.success('已踢下线')
    refreshData()
  }
</script>

<style scoped>
  .text-danger {
    color: var(--el-color-danger);
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
