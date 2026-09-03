<template>
  <div class="art-full-height">
    <SiteConfigSearch
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
            <ElButton v-permission="'system:config:create'" @click="showDialog('add')" v-ripple>
              新增配置
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

    <SiteConfigDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :config-data="currentConfigData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { deleteSiteConfig, fetchSiteConfigList } from '@/api/site-config'
  import type { SiteConfigListQuery } from '@/api/site-config'
  import type { SiteConfigListItem } from '@nova/shared-types'
  import { ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import SiteConfigSearch from './modules/site-config-search.vue'
  import SiteConfigDialog from './modules/site-config-dialog.vue'

  defineOptions({ name: 'SiteConfig' })

  const userStore = useUserStore()

  const searchForm = ref<SiteConfigListQuery>({
    keyword: undefined,
    group: undefined,
  })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentConfigData = ref<SiteConfigListItem | undefined>(undefined)

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
      apiFn: fetchSiteConfigList,
      apiParams: {
        current: 1,
        size: 20,
      },
      columnsFactory: () => [
        { prop: 'configKey', label: '配置键', minWidth: 140 },
        { prop: 'configName', label: '配置名称', minWidth: 120 },
        {
          prop: 'configValue',
          label: '配置值',
          minWidth: 180,
          showOverflowTooltip: true,
        },
        {
          prop: 'configGroup',
          label: '分组',
          width: 100,
          formatter: (row) => row.configGroup || '-',
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 120,
          showOverflowTooltip: true,
          formatter: (row) => row.remark || '-',
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) => {
            const items: ButtonMoreItem[] = []
            if (userStore.hasPermission('system:config:update')) {
              items.push({
                key: 'edit',
                label: '编辑配置',
                icon: 'ri:edit-2-line',
              })
            }
            if (userStore.hasPermission('system:config:delete')) {
              items.push({
                key: 'delete',
                label: '删除配置',
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

  const showDialog = (type: 'add' | 'edit', row?: SiteConfigListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentConfigData.value = row
  }

  const handleSearch = (params: SiteConfigListQuery) => {
    replaceSearchParams(params)
    getData()
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: SiteConfigListItem) => {
    switch (item.key) {
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleDelete = (row: SiteConfigListItem) => {
    ElMessageBox.confirm(`确定删除配置「${row.configName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteSiteConfig(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => undefined)
  }
</script>
