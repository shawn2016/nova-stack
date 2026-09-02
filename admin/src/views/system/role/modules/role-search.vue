<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { RoleListQuery } from '@/api/system-manage'

  interface Props {
    modelValue: RoleListQuery
  }

  interface Emits {
    (e: 'update:modelValue', value: RoleListQuery): void
    (e: 'search', params: RoleListQuery): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const rules = {}

  const statusOptions = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]

  const formItems = computed(() => [
    {
      label: '角色名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入角色名称',
      clearable: true,
    },
    {
      label: '角色编码',
      key: 'code',
      type: 'input',
      placeholder: '请输入角色编码',
      clearable: true,
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: statusOptions,
        clearable: true,
      },
    },
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: RoleListQuery) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
