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
  import type { ArticleListQuery } from '@/api/article'

  interface Props {
    modelValue: ArticleListQuery
  }

  interface Emits {
    (e: 'update:modelValue', value: ArticleListQuery): void
    (e: 'search', params: ArticleListQuery): void
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
    { label: '草稿', value: 0 },
    { label: '已发布', value: 1 },
  ]

  const formItems = computed(() => [
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

  const handleSearch = async (params: ArticleListQuery) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
