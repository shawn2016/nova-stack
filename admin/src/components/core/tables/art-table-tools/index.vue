<!-- 表格工具：搜索折叠、刷新、密度、全屏、列设置、表格设置 -->
<template>
  <div v-if="variant === 'inline'" class="art-table-tools art-table-tools--inline flex-c">
    <div
      v-if="showSearchBar != null && shouldShow('search')"
      class="button"
      :class="showSearchBar ? 'active !bg-theme hover:!bg-theme/80' : ''"
      @click="search"
    >
      <ArtSvgIcon icon="ri:search-line" :class="showSearchBar ? 'text-white' : 'text-g-700'" />
    </div>
    <div
      v-if="shouldShow('refresh')"
      class="button"
      :class="{ loading: loading && isManualRefresh }"
      @click="refresh"
    >
      <ArtSvgIcon
        icon="ri:refresh-line"
        :class="loading && isManualRefresh ? 'animate-spin text-g-600' : ''"
      />
    </div>

    <ElDropdown v-if="shouldShow('size')" @command="handleTableSizeChange">
      <div class="button">
        <ArtSvgIcon icon="ri:arrow-up-down-fill" />
      </div>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="item in tableSizeOptions"
            :key="item.value"
            :command="item.value"
            :class="tableSize === item.value ? '!bg-g-300/55' : ''"
          >
            {{ item.label }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <div v-if="shouldShow('fullscreen')" class="button" @click="toggleFullScreen">
      <ArtSvgIcon :icon="isFullScreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" />
    </div>

    <div v-if="shouldShow('columns')" class="button" @click="columnSettingsVisible = true">
      <ArtSvgIcon icon="ri:align-right" />
    </div>

    <ArtTableColumnSettings
      v-if="shouldShow('columns')"
      v-model="columnSettingsVisible"
      :columns="columns"
      :default-columns="defaultColumns"
      @confirm="handleColumnSettingsConfirm"
    />

    <ElPopover v-if="shouldShow('settings')" placement="bottom" trigger="click">
      <template #reference>
        <div class="button">
          <ArtSvgIcon icon="ri:settings-line" />
        </div>
      </template>
      <div>
        <ElCheckbox v-if="showZebra" v-model="isZebra">{{ t('table.zebra') }}</ElCheckbox>
        <ElCheckbox v-if="showBorder" v-model="isBorder">{{ t('table.border') }}</ElCheckbox>
        <ElCheckbox v-if="showHeaderBackground" v-model="isHeaderBackground">
          {{ t('table.headerBackground') }}
        </ElCheckbox>
      </div>
    </ElPopover>
  </div>

  <ElPopover
    v-else
    v-model:visible="menuVisible"
    placement="bottom-end"
    trigger="click"
    :width="292"
    popper-class="art-table-tools-popover"
  >
    <template #reference>
      <button
        type="button"
        class="art-table-tools__trigger"
        :class="{ 'is-active': menuVisible }"
        aria-label="表格设置"
        @click.stop
      >
        <ArtSvgIcon icon="ri:settings-3-line" />
      </button>
    </template>
    <div class="art-table-tools art-table-tools--menu">
      <ArtTableTools
        variant="inline"
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBarModel"
        :show-zebra="showZebra"
        :show-border="showBorder"
        :show-header-background="showHeaderBackground"
        :full-class="fullClass"
        :layout="layout"
        :loading="loading"
        @refresh="emit('refresh')"
        @search="emit('search')"
      />
    </div>
  </ElPopover>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import ArtTableColumnSettings from '@/components/core/tables/art-table-column-settings/index.vue'
  import { TableSizeEnum } from '@/enums/formEnum'
  import { useTableStore } from '@/store/modules/table'
  import type { ColumnOption } from '@/types/component'

  defineOptions({ name: 'ArtTableTools' })

  const { t } = useI18n()

  interface Props {
    variant?: 'inline' | 'menu'
    showZebra?: boolean
    showBorder?: boolean
    showHeaderBackground?: boolean
    fullClass?: string
    layout?: string
    loading?: boolean
    showSearchBar?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'inline',
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    loading: false,
    showSearchBar: undefined
  })

  const columns = defineModel<ColumnOption[]>('columns', {
    required: false,
    default: () => []
  })

  const emit = defineEmits<{
    refresh: []
    search: []
    'update:showSearchBar': [value: boolean]
  }>()

  const menuVisible = ref(false)
  const columnSettingsVisible = ref(false)
  const defaultColumns = ref<ColumnOption[]>([])
  const isManualRefresh = ref(false)
  const isFullScreen = ref(false)
  const originalOverflow = ref('')

  const tableStore = useTableStore()
  const { tableSize, isZebra, isBorder, isHeaderBackground } = storeToRefs(tableStore)

  const showSearchBarModel = computed({
    get: () => props.showSearchBar,
    set: (value: boolean | undefined) => {
      if (value !== undefined) emit('update:showSearchBar', value)
    }
  })

  const tableSizeOptions = [
    { value: TableSizeEnum.SMALL, label: t('table.sizeOptions.small') },
    { value: TableSizeEnum.DEFAULT, label: t('table.sizeOptions.default') },
    { value: TableSizeEnum.LARGE, label: t('table.sizeOptions.large') }
  ]

  const layoutItems = computed(() => props.layout.split(',').map((item) => item.trim()))

  const shouldShow = (componentName: string) => layoutItems.value.includes(componentName)

  function cloneColumns(cols: ColumnOption[]): ColumnOption[] {
    return cols.map((col) => ({ ...col }))
  }

  watch(
    columns,
    (value) => {
      if (defaultColumns.value.length === 0 && value.length > 0) {
        defaultColumns.value = cloneColumns(value)
      }
    },
    { immediate: true, deep: true }
  )

  function handleColumnSettingsConfirm(nextColumns: ColumnOption[]) {
    columns.value = nextColumns
  }

  const search = () => {
    emit('update:showSearchBar', !props.showSearchBar)
    emit('search')
  }

  const refresh = () => {
    isManualRefresh.value = true
    emit('refresh')
  }

  const handleTableSizeChange = (command: TableSizeEnum) => {
    tableStore.setTableSize(command)
  }

  const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`)
    if (!el) return

    isFullScreen.value = !isFullScreen.value

    if (isFullScreen.value) {
      originalOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      el.classList.add('el-full-screen')
      tableStore.setIsFullScreen(true)
    } else {
      document.body.style.overflow = originalOverflow.value
      el.classList.remove('el-full-screen')
      tableStore.setIsFullScreen(false)
    }
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen.value) toggleFullScreen()
  }

  onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
    if (isFullScreen.value) {
      document.body.style.overflow = originalOverflow.value
      document.querySelector(`.${props.fullClass}`)?.classList.remove('el-full-screen')
    }
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-table-tools--inline {
    @apply flex-wrap md:justify-end;
  }

  .art-table-tools--menu :deep(.art-table-tools--inline) {
    gap: 8px;
  }

  .art-table-tools__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover,
    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }
  }

  .button {
    @apply ml-2 size-8 flex items-center justify-center cursor-pointer rounded-md bg-g-300/55 dark:bg-g-300/40 text-g-700 hover:bg-g-300 md:ml-0 md:mr-2.5;
  }

  .art-table-tools--menu .button {
    @apply ml-0 mr-0;
  }
</style>
