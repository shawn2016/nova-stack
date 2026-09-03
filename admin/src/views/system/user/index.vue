<template>
  <div class="user-page art-full-height">
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-permission="'system:user:create'" @click="showDialog('add')" v-ripple>
              新增用户
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

      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { deleteUser as deleteUserApi, fetchUserList } from '@/api/system-manage'
  import type { UserListQuery } from '@/api/system-manage'
  import type { SysUserListItem } from '@nova/shared-types'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'User' })

  const userStore = useUserStore()

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<SysUserListItem>>({})

  const searchForm = ref<UserListQuery>({
    keyword: undefined,
  })

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
      apiFn: fetchUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value,
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'username', label: '用户名', minWidth: 120 },
        { prop: 'nickname', label: '昵称', minWidth: 120 },
        { prop: 'deptName', label: '部门', minWidth: 120, formatter: (row) => row.deptName || '-' },
        {
          prop: 'roleCodes',
          label: '角色',
          minWidth: 160,
          formatter: (row) => (row.roleCodes?.length ? row.roleCodes.join(', ') : '-'),
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const enabled = row.status === 1
            return h(
              ElTag,
              { type: enabled ? 'success' : 'info' },
              () => (enabled ? '启用' : '禁用'),
            )
          },
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) => {
            const buttons = []
            if (userStore.hasPermission('system:user:update')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row),
                }),
              )
            }
            if (userStore.hasPermission('system:user:delete')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => handleDeleteUser(row),
                }),
              )
            }
            return h('div', buttons)
          },
        },
      ],
    },
  })

  const handleSearch = (params: UserListQuery) => {
    replaceSearchParams(params)
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: SysUserListItem): void => {
    dialogType.value = type
    currentUserData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleDeleteUser = (row: SysUserListItem): void => {
    ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteUserApi(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => undefined)
  }
</script>
