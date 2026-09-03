<template>
  <div class="dict-page art-full-height">
    <ElRow :gutter="12" class="dict-page__row">
      <ElCol :xs="24" :lg="12" class="dict-page__col">
        <ArtSearchBar
          v-show="showTypeSearchBar"
          v-model="typeSearchForm"
          :items="typeSearchItems"
          :span="12"
          :showExpand="false"
          @reset="handleTypeSearchReset"
          @search="handleTypeSearch"
        />

        <ElCard
          class="art-table-card dict-page__card"
          :style="{ marginTop: showTypeSearchBar ? '12px' : '0' }"
        >
          <ArtTableHeader
            v-model:columns="typeColumnChecks"
            v-model:showSearchBar="showTypeSearchBar"
            :loading="typeLoading"
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

      <ElCol :xs="24" :lg="12" class="dict-page__col">
        <ArtSearchBar
          v-show="showDataSearchBar"
          v-model="dataSearchForm"
          :items="dataSearchItems"
          :span="12"
          :showExpand="false"
          @reset="handleDataSearchReset"
          @search="handleDataSearch"
        />

        <ElCard
          class="art-table-card dict-page__card"
          :style="{ marginTop: showDataSearchBar ? '12px' : '0' }"
        >
          <ArtTableHeader
            v-model:columns="dataColumnChecks"
            v-model:showSearchBar="showDataSearchBar"
            :loading="dataLoading"
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
  import ArtTableActions from '@/components/core/tables/art-table-actions/index.vue'
  import type { TableActionItem } from '@/components/core/tables/art-table-actions/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { deleteDictData, deleteDictType, fetchDictDataList, fetchDictTypeList } from '@/api/dict'
  import type { DictDataListItem, DictTypeListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import DictTypeDialog from './modules/dict-type-dialog.vue'
  import DictDataDialog from './modules/dict-data-dialog.vue'

  defineOptions({ name: 'Dict' })

  const typeTableRef = ref<InstanceType<typeof ArtTable>>()
  const selectedType = ref<DictTypeListItem | null>(null)
  const showTypeSearchBar = ref(true)
  const showDataSearchBar = ref(true)
  const typeSearchForm = reactive({ keyword: '' })
  const dataSearchForm = reactive({ keyword: '' })

  const typeSearchItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '类型名称或编码' }
    }
  ])

  const dataSearchItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '显示标签或存储值' }
    }
  ])

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
    replaceSearchParams: replaceTypeSearchParams,
    handleSizeChange: handleTypeSizeChange,
    handleCurrentChange: handleTypeCurrentChange,
    refreshData: refreshTypeData
  } = useTable({
    core: {
      apiFn: fetchDictTypeList,
      apiParams: {
        current: 1,
        size: 20
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
            return h(ElTag, { type: enabled ? 'success' : 'warning' }, () =>
              enabled ? '启用' : '禁用'
            )
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          align: 'right',
          fixed: 'right',
          formatter: (row) => {
            const items: TableActionItem[] = [
              {
                key: 'edit',
                label: '编辑',
                auth: 'system:dict:type:update',
                onClick: () => typeButtonClick({ key: 'edit' }, row)
              },
              {
                key: 'delete',
                label: '删除',
                danger: true,
                auth: 'system:dict:type:delete',
                onClick: () => typeButtonClick({ key: 'delete' }, row)
              }
            ]
            return h(ArtTableActions, { items })
          }
        }
      ]
    },
    hooks: {
      onSuccess: (rows) => syncTypeCurrentRow(rows)
    }
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
    refreshData: refreshDataTable
  } = useTable({
    core: {
      apiFn: fetchDictDataList,
      apiParams: {
        current: 1,
        size: 20,
        typeId: ''
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
            return h(ElTag, { type: enabled ? 'success' : 'warning' }, () =>
              enabled ? '启用' : '禁用'
            )
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          align: 'right',
          fixed: 'right',
          formatter: (row) => {
            const items: TableActionItem[] = [
              {
                key: 'edit',
                label: '编辑',
                auth: 'system:dict:data:update',
                onClick: () => dataButtonClick({ key: 'edit' }, row)
              },
              {
                key: 'delete',
                label: '删除',
                danger: true,
                auth: 'system:dict:data:delete',
                onClick: () => dataButtonClick({ key: 'delete' }, row)
              }
            ]
            return h(ArtTableActions, { items })
          }
        }
      ]
    }
  })

  const loadDataForSelectedType = () => {
    if (!selectedType.value) {
      dataTableData.value = []
      return
    }
    replaceDataSearchParams({
      typeId: selectedType.value.id,
      keyword: dataSearchForm.keyword || undefined,
      current: 1,
      size: dataPagination.size
    })
    getDataTableData()
  }

  function handleTypeSearch() {
    replaceTypeSearchParams({
      keyword: typeSearchForm.keyword || undefined,
      current: 1,
      size: typePagination.size
    })
    getTypeData()
  }

  function handleTypeSearchReset() {
    typeSearchForm.keyword = ''
    handleTypeSearch()
  }

  function handleDataSearch() {
    if (!selectedType.value) {
      ElMessage.warning('请先选择左侧字典类型')
      return
    }
    replaceDataSearchParams({
      typeId: selectedType.value.id,
      keyword: dataSearchForm.keyword || undefined,
      current: 1,
      size: dataPagination.size
    })
    getDataTableData()
  }

  function handleDataSearchReset() {
    dataSearchForm.keyword = ''
    handleDataSearch()
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

  const typeButtonClick = (item: Pick<TableActionItem, 'key'>, row: DictTypeListItem) => {
    switch (item.key) {
      case 'edit':
        showTypeDialog('edit', row)
        break
      case 'delete':
        handleDeleteType(row)
        break
    }
  }

  const dataButtonClick = (item: Pick<TableActionItem, 'key'>, row: DictDataListItem) => {
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
      type: 'warning'
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
      type: 'warning'
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
      min-width: 0;
    }

    &__card {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    &__subtitle {
      font-size: 13px;
      line-height: 32px;
    }

    :deep(.art-search-bar) {
      padding: 12px 12px 0;
    }

    :deep(.art-table .el-table__cell) {
      .cell {
        overflow: visible;
        white-space: nowrap;
      }
    }
  }
</style>
