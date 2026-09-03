<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    embedded
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
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '用户名或昵称',
      clearable: true
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch(params: UserListQuery) {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
