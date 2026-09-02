<template>
  <div class="dict-page art-full-height">
    <ElRow :gutter="12" class="dict-page__row">
      <ElCol :xs="24" :lg="10" class="dict-page__col">
        <ElCard class="art-table-card dict-page__card">
          <ArtTableHeader
            v-model:columns="typeColumnChecks"
            :loading="typeLoading"
            :showSearchBar="false"
            @refresh="refreshTypeData"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton
                  v-permission="'system:dict:type:create'"
                  @click="showTypeDialog('add')"
                  v-ripple
                >
                  新增类型
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            ref="typeTableRef"
            :loading="typeLoading"
            :data="typeData"
            :columns="typeColumns"
            :pagination="typePagination"
            highlight-current-row
            @row-click="handleTypeRowClick"
            @pagination:size-change="handleTypeSizeChange"
            @pagination:current-change="handleTypeCurrentChange"
          />
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="14" class="dict-page__col">
        <ElCard class="art-table-card dict-page__card">
          <ArtTableHeader
            v-model:columns="dataColumnChecks"
            :loading="dataLoading"
            :showSearchBar="false"
            @refresh="refreshDataTable"
          >
            <template #left>
              <ElSpace wrap>
                <ElButton
                  v-permission="'system:dict:data:create'"
                  :disabled="!selectedType"
                  @click="showDataDialog('add')"
                  v-ripple
                >
                  新增字典项
                </ElButton>
                <span v-if="selectedType" class="dict-page__subtitle">
                  {{ selectedType.name }}（{{ selectedType.code }}）
                </span>
                <span v-else class="dict-page__subtitle text-g-400">请先选择左侧字典类型</span>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            :loading="dataLoading"
            :data="dataTableData"
            :columns="dataColumns"
            :pagination="selectedType ? dataPagination : undefined"
            @pagination:size-change="handleDataSizeChange"
            @pagination:current-change="handleDataCurrentChange"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <DictTypeDialog
      v-model="typeDialogVisible"
      :dialog-type="typeDialogMode"
      :type-data="currentTypeData"
      @success="handleTypeSaved"
    />

    <DictDataDialog
      v-model="dataDialogVisible"
      :dialog-type="dataDialogMode"
      :type-id="selectedType?.id ?? ''"
      :type-name="selectedType?.name ?? ''"
      :data-item="currentDataItem"
      @success="refreshDataTable"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    deleteDictData,
    deleteDictType,
    fetchDictDataList,
    fetchDictTypeList,
  } from '@/api/dict'
  import type { DictDataListItem, DictTypeListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import DictTypeDialog from './modules/dict-type-dialog.vue'
  import DictDataDialog from './modules/dict-data-dialog.vue'

  defineOptions({ name: 'Dict' })

  const userStore = useUserStore()
  const typeTableRef = ref<InstanceType<typeof ArtTable>>()
  const selectedType = ref<DictTypeListItem | null>(null)

  const typeDialogVisible = ref(false)
  const typeDialogMode = ref<'add' | 'edit'>('add')
  const currentTypeData = ref<DictTypeListItem | undefined>(undefined)

  const dataDialogVisible = ref(false)
  const dataDialogMode = ref<'add' | 'edit'>('add')
  const currentDataItem = ref<DictDataListItem | undefined>(undefined)

  const syncTypeCurrentRow = (rows: DictTypeListItem[]) => {
    nextTick(() => {
      const table = typeTableRef.value?.elTableRef
      if (!table) return

      if (!rows.length) {
        selectedType.value = null
        table.setCurrentRow(undefined)
        return
      }

      const matched = selectedType.value
        ? rows.find((row) => row.id === selectedType.value?.id)
        : undefined
      const target = matched ?? rows[0]
      selectedType.value = target
      table.setCurrentRow(target)
      loadDataForSelectedType()
    })
  }

  const {
    columns: typeColumns,
    columnChecks: typeColumnChecks,
    data: typeData,
    loading: typeLoading,
    pagination: typePagination,
    getData: getTypeData,
    handleSizeChange: handleTypeSizeChange,
    handleCurrentChange: handleTypeCurrentChange,
    refreshData: refreshTypeData,
  } = useTable({
    core: {
      apiFn: fetchDictTypeList,
      apiParams: {
        current: 1,
        size: 20,
      },
      columnsFactory: () => [
        { prop: 'name', label: '类型名称', minWidth: 120 },
        { prop: 'code', label: '类型编码', minWidth: 140 },
        {
          prop: 'status',
          label: '状态',
          width: 90,
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
            if (userStore.hasPermission('system:dict:type:update')) {
              items.push({
                key: 'edit',
                label: '编辑类型',
                icon: 'ri:edit-2-line',
              })
            }
            if (userStore.hasPermission('system:dict:type:delete')) {
              items.push({
                key: 'delete',
                label: '删除类型',
                icon: 'ri:delete-bin-4-line',
                color: '#f56c6c',
              })
            }
            if (!items.length) return h('span', '-')
            return h(ArtButtonMore, {
              list: items,
              onClick: (item: ButtonMoreItem) => typeButtonClick(item, row),
            })
          },
        },
      ],
    },
    hooks: {
      onSuccess: (rows) => syncTypeCurrentRow(rows),
    },
  })

  const {
    columns: dataColumns,
    columnChecks: dataColumnChecks,
    data: dataTableData,
    loading: dataLoading,
    pagination: dataPagination,
    getData: getDataTableData,
    replaceSearchParams: replaceDataSearchParams,
    handleSizeChange: handleDataSizeChange,
    handleCurrentChange: handleDataCurrentChange,
    refreshData: refreshDataTable,
  } = useTable({
    core: {
      apiFn: fetchDictDataList,
      apiParams: {
        current: 1,
        size: 20,
        typeId: '',
      },
      immediate: false,
      columnsFactory: () => [
        { prop: 'label', label: '显示标签', minWidth: 120 },
        { prop: 'value', label: '存储值', minWidth: 120 },
        { prop: 'sort', label: '排序', width: 80 },
        {
          prop: 'status',
          label: '状态',
          width: 90,
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
            if (userStore.hasPermission('system:dict:data:update')) {
              items.push({
                key: 'edit',
                label: '编辑字典项',
                icon: 'ri:edit-2-line',
              })
            }
            if (userStore.hasPermission('system:dict:data:delete')) {
              items.push({
                key: 'delete',
                label: '删除字典项',
                icon: 'ri:delete-bin-4-line',
                color: '#f56c6c',
              })
            }
            if (!items.length) return h('span', '-')
            return h(ArtButtonMore, {
              list: items,
              onClick: (item: ButtonMoreItem) => dataButtonClick(item, row),
            })
          },
        },
      ],
    },
  })

  const loadDataForSelectedType = () => {
    if (!selectedType.value) {
      dataTableData.value = []
      return
    }
    replaceDataSearchParams({
      typeId: selectedType.value.id,
      current: 1,
      size: dataPagination.size,
    })
    getDataTableData()
  }

  const handleTypeRowClick = (row: DictTypeListItem) => {
    selectedType.value = row
    loadDataForSelectedType()
  }

  const showTypeDialog = (mode: 'add' | 'edit', row?: DictTypeListItem) => {
    typeDialogMode.value = mode
    currentTypeData.value = row
    typeDialogVisible.value = true
  }

  const showDataDialog = (mode: 'add' | 'edit', row?: DictDataListItem) => {
    if (!selectedType.value) return
    dataDialogMode.value = mode
    currentDataItem.value = row
    dataDialogVisible.value = true
  }

  const typeButtonClick = (item: ButtonMoreItem, row: DictTypeListItem) => {
    switch (item.key) {
      case 'edit':
        showTypeDialog('edit', row)
        break
      case 'delete':
        handleDeleteType(row)
        break
    }
  }

  const dataButtonClick = (item: ButtonMoreItem, row: DictDataListItem) => {
    switch (item.key) {
      case 'edit':
        showDataDialog('edit', row)
        break
      case 'delete':
        handleDeleteData(row)
        break
    }
  }

  const handleDeleteType = (row: DictTypeListItem) => {
    ElMessageBox.confirm(`确定删除字典类型「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteDictType(row.id)
        ElMessage.success('删除成功')
        if (selectedType.value?.id === row.id) {
          selectedType.value = null
        }
        refreshTypeData()
      })
      .catch(() => undefined)
  }

  const handleDeleteData = (row: DictDataListItem) => {
    ElMessageBox.confirm(`确定删除字典项「${row.label}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteDictData(row.id)
        ElMessage.success('删除成功')
        refreshDataTable()
      })
      .catch(() => undefined)
  }

  const handleTypeSaved = () => {
    refreshTypeData()
  }
</script>

<style lang="scss" scoped>
  .dict-page {
    &__row {
      height: 100%;
    }

    &__col {
      height: 100%;
    }

    &__card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    &__subtitle {
      font-size: 13px;
      line-height: 32px;
    }
  }
</style>
