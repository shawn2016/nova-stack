<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ElTabs v-model="activeTab">
        <ElTabPane label="通道" name="channels">
          <ArtTableHeader :loading="channelLoading" :showSearchBar="false" @refresh="loadChannels">
            <template #left>
              <ElButton v-permission="'infra:sms:channel:create'" @click="openChannelDialog('add')">
                新增通道
              </ElButton>
            </template>
          </ArtTableHeader>
          <ElTable v-loading="channelLoading" :data="channels" size="small">
            <ElTableColumn prop="name" label="名称" min-width="120" />
            <ElTableColumn prop="provider" label="Provider" width="100" />
            <ElTableColumn prop="status" label="状态" width="90">
              <template #default="{ row }">
                <ElTag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="140" align="right">
              <template #default="{ row }">
                <ElButton
                  v-permission="'infra:sms:channel:update'"
                  link
                  type="primary"
                  @click="openChannelDialog('edit', row)"
                >
                  编辑
                </ElButton>
                <ElButton
                  v-permission="'infra:sms:channel:delete'"
                  link
                  type="danger"
                  @click="removeChannel(row)"
                >
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="模板" name="templates">
          <ArtTableHeader :loading="templateLoading" :showSearchBar="false" @refresh="loadTemplates">
            <template #left>
              <ElButton
                v-permission="'infra:sms:template:create'"
                @click="openTemplateDialog('add')"
              >
                新增模板
              </ElButton>
              <ElButton v-permission="'infra:sms:send'" type="primary" plain @click="sendVisible = true">
                测试发送
              </ElButton>
            </template>
          </ArtTableHeader>
          <ElTable v-loading="templateLoading" :data="templates" size="small">
            <ElTableColumn prop="code" label="Code" width="120" />
            <ElTableColumn prop="name" label="名称" min-width="120" />
            <ElTableColumn prop="content" label="内容" min-width="200" show-overflow-tooltip />
            <ElTableColumn prop="status" label="状态" width="90">
              <template #default="{ row }">
                <ElTag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="140" align="right">
              <template #default="{ row }">
                <ElButton
                  v-permission="'infra:sms:template:update'"
                  link
                  type="primary"
                  @click="openTemplateDialog('edit', row)"
                >
                  编辑
                </ElButton>
                <ElButton
                  v-permission="'infra:sms:template:delete'"
                  link
                  type="danger"
                  @click="removeTemplate(row)"
                >
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="日志" name="logs">
          <ArtTableHeader :loading="logLoading" :showSearchBar="false" @refresh="loadLogs" />
          <ElTable v-loading="logLoading" :data="logs" size="small">
            <ElTableColumn prop="phone" label="手机号" width="120" />
            <ElTableColumn prop="templateCode" label="模板" width="120" />
            <ElTableColumn prop="content" label="内容" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="status" label="状态" width="80">
              <template #default="{ row }">
                <ElTag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="sentAt" label="发送时间" min-width="160">
              <template #default="{ row }">
                {{ new Date(row.sentAt).toLocaleString('zh-CN') }}
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ElDialog v-model="channelVisible" :title="channelMode === 'add' ? '新增通道' : '编辑通道'" width="480px">
      <ElForm ref="channelFormRef" :model="channelForm" label-width="88px">
        <ElFormItem label="名称" required>
          <ElInput v-model="channelForm.name" />
        </ElFormItem>
        <ElFormItem label="Provider" required>
          <ElSelect v-model="channelForm.provider" style="width: 100%">
            <ElOption label="mock" value="mock" />
            <ElOption label="aliyun" value="aliyun" />
            <ElOption label="tencent" value="tencent" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="配置 JSON" required>
          <ElInput v-model="channelForm.config" type="textarea" :rows="3" />
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="channelForm.enabled" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="channelVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="channelSubmitting" @click="submitChannel">提交</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="templateVisible" :title="templateMode === 'add' ? '新增模板' : '编辑模板'" width="520px">
      <ElForm ref="templateFormRef" :model="templateForm" label-width="88px">
        <ElFormItem label="Code" required>
          <ElInput v-model="templateForm.code" :disabled="templateMode === 'edit'" />
        </ElFormItem>
        <ElFormItem label="名称" required>
          <ElInput v-model="templateForm.name" />
        </ElFormItem>
        <ElFormItem label="通道" required>
          <ElSelect v-model="templateForm.channelId" style="width: 100%">
            <ElOption v-for="c in channels" :key="c.id" :label="c.name" :value="c.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="内容" required>
          <ElInput v-model="templateForm.content" type="textarea" :rows="3" placeholder="使用 {code} 占位" />
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="templateForm.enabled" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="templateVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="templateSubmitting" @click="submitTemplate">提交</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="sendVisible" title="测试发送" width="480px">
      <ElForm :model="sendForm" label-width="88px">
        <ElFormItem label="模板" required>
          <ElSelect v-model="sendForm.templateCode" style="width: 100%">
            <ElOption v-for="t in templates" :key="t.code" :label="`${t.code} (${t.name})`" :value="t.code" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="手机号" required>
          <ElInput v-model="sendForm.phone" placeholder="13800138000" />
        </ElFormItem>
        <ElFormItem label="参数 JSON" required>
          <ElInput v-model="sendForm.paramsJson" type="textarea" :rows="3" placeholder='{"code":"123456"}' />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="sendVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="sendSubmitting" @click="submitSend">发送</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import {
    createSmsChannel,
    createSmsTemplate,
    deleteSmsChannel,
    deleteSmsTemplate,
    fetchSmsChannelList,
    fetchSmsLogList,
    fetchSmsTemplateList,
    sendSms,
    updateSmsChannel,
    updateSmsTemplate,
  } from '@/api/sms'
  import type { SmsChannelListItem, SmsLogListItem, SmsTemplateListItem } from '@nova/shared-types'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'InfraSms' })

  const activeTab = ref('channels')
  const channels = ref<SmsChannelListItem[]>([])
  const templates = ref<SmsTemplateListItem[]>([])
  const logs = ref<SmsLogListItem[]>([])
  const channelLoading = ref(false)
  const templateLoading = ref(false)
  const logLoading = ref(false)

  const channelVisible = ref(false)
  const channelMode = ref<'add' | 'edit'>('add')
  const channelSubmitting = ref(false)
  const channelForm = reactive({
    id: '',
    name: '',
    provider: 'mock' as 'mock' | 'aliyun' | 'tencent',
    config: '{}',
    enabled: true,
  })

  const templateVisible = ref(false)
  const templateMode = ref<'add' | 'edit'>('add')
  const templateSubmitting = ref(false)
  const templateForm = reactive({
    id: '',
    code: '',
    name: '',
    channelId: '',
    content: '',
    enabled: true,
  })

  const sendVisible = ref(false)
  const sendSubmitting = ref(false)
  const sendForm = reactive({
    templateCode: '',
    phone: '13800138000',
    paramsJson: '{"code":"123456"}',
  })

  onMounted(async () => {
    await Promise.all([loadChannels(), loadTemplates()])
    if (templates.value.length) {
      sendForm.templateCode = templates.value[0].code
    }
  })

  watch(activeTab, (tab) => {
    if (tab === 'logs') loadLogs()
  })

  async function loadChannels() {
    channelLoading.value = true
    try {
      const res = await fetchSmsChannelList({ current: 1, size: 100 })
      channels.value = res.records
      if (!templateForm.channelId && channels.value.length) {
        templateForm.channelId = channels.value[0].id
      }
    } finally {
      channelLoading.value = false
    }
  }

  async function loadTemplates() {
    templateLoading.value = true
    try {
      const res = await fetchSmsTemplateList({ current: 1, size: 100 })
      templates.value = res.records
    } finally {
      templateLoading.value = false
    }
  }

  async function loadLogs() {
    logLoading.value = true
    try {
      const res = await fetchSmsLogList({ current: 1, size: 50 })
      logs.value = res.records
    } finally {
      logLoading.value = false
    }
  }

  function openChannelDialog(mode: 'add' | 'edit', row?: SmsChannelListItem) {
    channelMode.value = mode
    if (mode === 'edit' && row) {
      Object.assign(channelForm, {
        id: row.id,
        name: row.name,
        provider: row.provider,
        config: row.config,
        enabled: row.status === 1,
      })
    } else {
      Object.assign(channelForm, { id: '', name: '', provider: 'mock', config: '{}', enabled: true })
    }
    channelVisible.value = true
  }

  async function submitChannel() {
    channelSubmitting.value = true
    try {
      const payload = {
        name: channelForm.name,
        provider: channelForm.provider,
        config: channelForm.config,
        status: (channelForm.enabled ? 1 : 0) as 0 | 1,
      }
      if (channelMode.value === 'add') {
        await createSmsChannel(payload)
        ElMessage.success('新增成功')
      } else {
        await updateSmsChannel(channelForm.id, payload)
        ElMessage.success('更新成功')
      }
      channelVisible.value = false
      await loadChannels()
    } finally {
      channelSubmitting.value = false
    }
  }

  async function removeChannel(row: SmsChannelListItem) {
    await ElMessageBox.confirm(`确定删除通道「${row.name}」吗？`, '删除确认', { type: 'warning' })
    await deleteSmsChannel(row.id)
    ElMessage.success('删除成功')
    await loadChannels()
  }

  function openTemplateDialog(mode: 'add' | 'edit', row?: SmsTemplateListItem) {
    templateMode.value = mode
    if (mode === 'edit' && row) {
      Object.assign(templateForm, {
        id: row.id,
        code: row.code,
        name: row.name,
        channelId: row.channelId,
        content: row.content,
        enabled: row.status === 1,
      })
    } else {
      Object.assign(templateForm, {
        id: '',
        code: '',
        name: '',
        channelId: channels.value[0]?.id ?? '',
        content: '您的验证码是{code}',
        enabled: true,
      })
    }
    templateVisible.value = true
  }

  async function submitTemplate() {
    templateSubmitting.value = true
    try {
      const payload = {
        code: templateForm.code,
        name: templateForm.name,
        channelId: templateForm.channelId,
        content: templateForm.content,
        status: (templateForm.enabled ? 1 : 0) as 0 | 1,
      }
      if (templateMode.value === 'add') {
        await createSmsTemplate(payload)
        ElMessage.success('新增成功')
      } else {
        await updateSmsTemplate(templateForm.id, payload)
        ElMessage.success('更新成功')
      }
      templateVisible.value = false
      await loadTemplates()
    } finally {
      templateSubmitting.value = false
    }
  }

  async function removeTemplate(row: SmsTemplateListItem) {
    await ElMessageBox.confirm(`确定删除模板「${row.code}」吗？`, '删除确认', { type: 'warning' })
    await deleteSmsTemplate(row.id)
    ElMessage.success('删除成功')
    await loadTemplates()
  }

  async function submitSend() {
    sendSubmitting.value = true
    try {
      const params = JSON.parse(sendForm.paramsJson) as Record<string, string>
      await sendSms({
        phone: sendForm.phone,
        templateCode: sendForm.templateCode,
        params,
      })
      ElMessage.success('发送成功')
      sendVisible.value = false
      if (activeTab.value === 'logs') await loadLogs()
    } catch {
      ElMessage.error('发送失败，请检查参数 JSON')
    } finally {
      sendSubmitting.value = false
    }
  }
</script>
