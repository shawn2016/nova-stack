<template>
  <div class="art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ marginTop: showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton v-permission="'system:role:create'" @click="showDialog('add')" v-ripple>
              新增角色
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

    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { deleteRole as deleteRoleApi, fetchRoleList } from '@/api/system-manage'
  import type { RoleListQuery } from '@/api/system-manage'
  import type { SysRoleListItem } from '@nova/shared-types'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'Role' })

  const userStore = useUserStore()

  const searchForm = ref<RoleListQuery>({
    name: undefined,
    code: undefined,
    status: undefined,
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const currentRoleData = ref<SysRoleListItem | undefined>(undefined)
  const dialogType = ref<'add' | 'edit'>('add')

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
      apiFn: fetchRoleList,
      apiParams: {
        current: 1,
        size: 20,
      },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'name', label: '角色名称', minWidth: 120 },
        { prop: 'code', label: '角色编码', minWidth: 140 },
        { prop: 'sort', label: '排序', width: 80 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const enabled = row.status === 1
            return h(
              ElTag,
              { type: enabled ? 'success' : 'warning' },
              () => (enabled ? '启用' : '禁用'),
            )
          },
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) => {
            const items: ButtonMoreItem[] = []
            if (userStore.hasPermission('system:role:update')) {
              items.push({
                key: 'permission',
                label: '分配权限',
                icon: 'ri:shield-keyhole-line',
              })
              items.push({
                key: 'edit',
                label: '编辑角色',
                icon: 'ri:edit-2-line',
              })
            }
            if (userStore.hasPermission('system:role:delete') && row.code !== 'super_admin') {
              items.push({
                key: 'delete',
                label: '删除角色',
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

  const showDialog = (type: 'add' | 'edit', row?: SysRoleListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  const handleSearch = (params: RoleListQuery) => {
    replaceSearchParams(params)
    getData()
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: SysRoleListItem) => {
    switch (item.key) {
      case 'permission':
        showPermissionDialog(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        handleDeleteRole(row)
        break
    }
  }

  const showPermissionDialog = (row?: SysRoleListItem) => {
    permissionDialog.value = true
    currentRoleData.value = row
  }

  const handleDeleteRole = (row: SysRoleListItem) => {
    ElMessageBox.confirm(`确定删除角色「${row.name}」吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteRoleApi(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => undefined)
  }
</script>
