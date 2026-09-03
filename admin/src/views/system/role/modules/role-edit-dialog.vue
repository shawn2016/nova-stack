<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="480px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
      <ElFormItem label="角色名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="code">
        <ElInput
          v-model="form.code"
          :disabled="dialogType === 'edit' && form.code === 'super_admin'"
          placeholder="请输入角色编码"
        />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { SysRoleListItem } from '@nova/shared-types'
  import { createRole, updateRole } from '@/api/system-manage'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: SysRoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined,
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' },
    ],
    code: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    ],
  })

  const form = reactive({
    id: '' as string,
    name: '',
    code: '',
    sort: 0,
    enabled: true,
  })

  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        id: props.roleData.id,
        name: props.roleData.name,
        code: props.roleData.code,
        sort: props.roleData.sort,
        enabled: props.roleData.status === 1,
      })
    } else {
      Object.assign(form, {
        id: '',
        name: '',
        code: '',
        sort: 0,
        enabled: true,
      })
    }
  }

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    },
  )

  watch(
    () => props.roleData,
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true },
  )

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      const payload = {
        name: form.name,
        code: form.code,
        sort: form.sort,
        status: (form.enabled ? 1 : 0) as 0 | 1,
      }

      if (props.dialogType === 'add') {
        await createRole(payload)
        ElMessage.success('新增成功')
      } else {
        await updateRole(form.id, payload)
        ElMessage.success('修改成功')
      }

      emit('success')
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    } finally {
      submitting.value = false
    }
  }
</script>
