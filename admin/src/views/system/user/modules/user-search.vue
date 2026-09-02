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
  import type { UserListQuery } from '@/api/system-manage'

  interface Props {
    modelValue: UserListQuery
  }

  interface Emits {
    (e: 'update:modelValue', value: UserListQuery): void
    (e: 'search', params: UserListQuery): void
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
      label: '用户名',
      key: 'username',
      type: 'input',
      placeholder: '请输入用户名',
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

  function handleReset() {
    emit('reset')
  }

  async function handleSearch(params: UserListQuery) {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
