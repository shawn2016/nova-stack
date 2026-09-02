<template>
  <div class="menu-icon-picker">
    <div class="menu-icon-picker__input">
      <ElInput
        :model-value="modelValue"
        placeholder="如 ri:user-line"
        clearable
        @update:model-value="emit('update:modelValue', $event)"
      >
        <template #prepend>
          <div class="menu-icon-picker__preview flex-cc">
            <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-lg" />
            <span v-else class="text-g-400 text-xs">无</span>
          </div>
        </template>
      </ElInput>
    </div>
    <div class="menu-icon-picker__grid">
      <button
        v-for="icon in MENU_ICON_PRESETS"
        :key="icon"
        type="button"
        class="menu-icon-picker__item flex-cc"
        :class="{ 'is-active': modelValue === icon }"
        :title="icon"
        @click="emit('update:modelValue', icon)"
      >
        <ArtSvgIcon :icon="icon" class="text-lg" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { MENU_ICON_PRESETS } from '@/constants/menu-icons'

  defineOptions({ name: 'MenuIconPicker' })

  defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()
</script>

<style scoped>
  .menu-icon-picker__input {
    width: 100%;
  }

  .menu-icon-picker__preview {
    width: 28px;
    height: 28px;
  }

  .menu-icon-picker__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    max-height: 160px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .menu-icon-picker__item {
    width: 36px;
    height: 36px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    background: var(--el-fill-color-blank);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .menu-icon-picker__item:hover,
  .menu-icon-picker__item.is-active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
</style>
