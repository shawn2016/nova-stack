<template>
  <ElDialog
    v-model="visible"
    title="分配权限"
    width="560px"
    align-center
    @close="handleClose"
  >
    <ElAlert
      type="info"
      :closable="false"
      show-icon
      title="权限变更后，相关用户需重新登录后菜单与按钮权限才会生效。"
      class="mb-4"
    />

    <ElScrollbar v-loading="loading" height="50vh">
      <div v-for="group in PERMISSION_GROUPS" :key="group" class="permission-group">
        <div class="permission-group__title">{{ group }}</div>
        <ElCheckboxGroup v-model="checkedCodes">
          <ElCheckbox
            v-for="item in groupOptions(group)"
            :key="item.code"
            :label="item.code"
            :value="item.code"
          >
            {{ item.name }}
          </ElCheckbox>
        </ElCheckboxGroup>
      </div>
    </ElScrollbar>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { SysRoleListItem } from '@nova/shared-types'
  import { assignRolePermissions, fetchRoleDetail } from '@/api/system-manage'
  import { PERMISSION_GROUPS, PERMISSION_OPTIONS } from '@/constants/permissions'

  interface Props {
    modelValue: boolean
    roleData?: SysRoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined,
  })

  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const submitting = ref(false)
  const checkedCodes = ref<string[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const groupOptions = (group: string) =>
    PERMISSION_OPTIONS.filter((item) => item.group === group)

  async function loadRolePermissions() {
    if (!props.roleData?.id) return

    loading.value = true
    try {
      const detail = await fetchRoleDetail(props.roleData.id)
      checkedCodes.value = [...detail.permissionCodes]
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载权限失败')
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal && props.roleData) {
        loadRolePermissions()
      }
    },
  )

  const handleClose = () => {
    visible.value = false
    checkedCodes.value = []
  }

  const savePermission = async () => {
    if (!props.roleData?.id) return

    submitting.value = true
    try {
      await assignRolePermissions(props.roleData.id, {
        permissionCodes: checkedCodes.value,
      })
      ElMessage.success('权限保存成功，相关用户需重新登录后生效')
      emit('success')
      handleClose()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
  .permission-group {
    margin-bottom: 16px;
  }

  .permission-group__title {
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-checkbox) {
    display: inline-flex;
    width: 48%;
    margin-right: 0;
    margin-bottom: 8px;
  }
</style>
