<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="480px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="88px">
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model="formData.username"
          :disabled="dialogType === 'edit'"
          placeholder="请输入用户名"
        />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入密码"
        />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="0">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="角色" prop="roleIds">
        <ElSelect v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <ElOption
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { SysUserListItem } from '@nova/shared-types'
  import {
    assignUserRoles,
    createUser,
    fetchRoleList,
    updateUser,
  } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    userData?: Partial<SysUserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const roleOptions = ref<{ id: number; name: string }[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  })

  const dialogType = computed(() => props.type)

  const formData = reactive({
    username: '',
    password: '',
    nickname: '',
    status: 1 as 0 | 1,
    roleIds: [] as number[],
  })

  const rules = computed<FormRules>(() => ({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' },
    ],
    password:
      dialogType.value === 'add'
        ? [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' },
          ]
        : [],
    nickname: [{ max: 32, message: '昵称最多 32 个字符', trigger: 'blur' }],
  }))

  async function loadRoleOptions() {
    const result = await fetchRoleList()
    roleOptions.value = result.records.map((role) => ({ id: role.id, name: role.name }))
  }

  function initFormData() {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      username: isEdit && row ? row.username || '' : '',
      password: '',
      nickname: isEdit && row ? row.nickname || '' : '',
      status: isEdit && row ? (row.status ?? 1) : 1,
      roleIds: isEdit && row ? [...(row.roleIds ?? [])] : [],
    })
  }

  function handleClosed() {
    formRef.value?.resetFields()
    Object.assign(formData, {
      username: '',
      password: '',
      nickname: '',
      status: 1,
      roleIds: [],
    })
  }

  watch(
    () => [props.visible, props.type, props.userData] as const,
    ([visible]) => {
      if (visible) {
        loadRoleOptions()
        initFormData()
        nextTick(() => formRef.value?.clearValidate())
      }
    },
    { immediate: true },
  )

  async function handleSubmit() {
    if (!formRef.value) return

    await formRef.value.validate()
    submitting.value = true

    try {
      const { username, password, nickname, status, roleIds } = formData

      if (dialogType.value === 'add') {
        const created = await createUser({
          username,
          password,
          nickname: nickname || undefined,
          status,
        })
        if (roleIds.length) {
          await assignUserRoles(created.id, { roleIds })
        }
        ElMessage.success('添加成功')
      } else if (props.userData?.id) {
        await updateUser(props.userData.id, {
          nickname: nickname || undefined,
          status,
        })
        await assignUserRoles(props.userData.id, { roleIds })
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      submitting.value = false
    }
  }
</script>
