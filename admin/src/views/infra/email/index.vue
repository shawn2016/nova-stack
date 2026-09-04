<template>
  <div class="art-full-height">
    <ArtListPanel
      v-model:active-tab="activeTab"
      v-model:show-search-bar="showSearchBar"
      v-model:columns="columnChecks"
      :tabs="EMAIL_TABS"
      :loading="panelLoading"
      @refresh="handlePanelRefresh"
      @tab-change="handleTabChange"
    >
      <template #search>
        <ArtSearchBar
          :key="activeTab"
          v-model="searchForms[activeTab]"
          :items="currentSearchItems"
          :showExpand="false"
          embedded
          @reset="handleSearchReset"
          @search="handleSearch"
        />
      </template>
      <template #head-actions>
        <template v-if="activeTab === 'channels'">
          <ElButton
            v-permission="'infra:email:channel:create'"
            type="primary"
            @click="openChannelDialog('add')"
          >
            新增通道
          </ElButton>
        </template>
        <template v-else-if="activeTab === 'templates'">
          <ElButton
            v-permission="'infra:email:template:create'"
            type="primary"
            @click="openTemplateDialog('add')"
          >
            新增模板
          </ElButton>
          <ElButton v-permission="'infra:email:send'" plain @click="sendVisible = true">
            测试发送
          </ElButton>
        </template>
      </template>

      <ArtTable
        :loading="panelLoading"
        :data="currentData"
        :columns="visibleColumns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ArtListPanel>

    <ElDialog v-model="channelVisible" :title="channelMode === 'add' ? '新增通道' : '编辑通道'" width="480px">
      <ElForm ref="channelFormRef" :model="channelForm" label-width="88px">
        <ElFormItem label="名称" required>
          <ElInput v-model="channelForm.name" />
        </ElFormItem>
        <ElFormItem label="Provider" required>
          <ElSelect v-model="channelForm.provider" style="width: 100%">
            <ElOption label="mock" value="mock" />
            <ElOption label="smtp" value="smtp" />
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
        <ElFormItem label="主题" required>
          <ElInput v-model="templateForm.subject" placeholder="欢迎加入 {siteName}" />
        </ElFormItem>
        <ElFormItem label="内容" required>
          <ElInput v-model="templateForm.content" type="textarea" :rows="3" placeholder="您好，欢迎加入 {siteName}！" />
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
        <ElFormItem label="收件人" required>
          <ElInput v-model="sendForm.to" placeholder="user@example.com" />
        </ElFormItem>
        <ElFormItem label="参数 JSON" required>
          <ElInput v-model="sendForm.paramsJson" type="textarea" :rows="3" placeholder='{"siteName":"Nova Stack"}' />
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
  import ArtTableActions from '@/components/core/tables/art-table-actions/index.vue'
  import type { TableActionItem } from '@/components/core/tables/art-table-actions/index.vue'
  import { getColumnChecks } from '@/hooks/core/useTableColumns'
  import type { ColumnOption } from '@/types/component'
  import {
    createEmailChannel,
    createEmailTemplate,
    deleteEmailChannel,
    deleteEmailTemplate,
    fetchEmailChannelList,
    fetchEmailLogList,
    fetchEmailTemplateList,
    sendEmail,
    updateEmailChannel,
    updateEmailTemplate,
  } from '@/api/email'
  import type { EmailChannelListItem, EmailLogListItem, EmailTemplateListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'InfraEmail' })

  type EmailTab = 'channels' | 'templates' | 'logs'

  const EMAIL_TABS = [
    { name: 'channels', label: '通道' },
    { name: 'templates', label: '模板' },
    { name: 'logs', label: '日志' },
  ]

  const activeTab = ref<EmailTab>('channels')
  const showSearchBar = ref(true)
  const channels = ref<EmailChannelListItem[]>([])
  const templates = ref<EmailTemplateListItem[]>([])
  const logs = ref<EmailLogListItem[]>([])
  const channelLoading = ref(false)
  const templateLoading = ref(false)
  const logLoading = ref(false)
  const pagination = reactive({ current: 1, size: 20, total: 0 })

  const searchForms = reactive({
    channels: { keyword: '' },
    templates: { keyword: '' },
    logs: { to: '', templateCode: '' },
  })

  const currentSearchItems = computed(() => {
    if (activeTab.value === 'logs') {
      return [
        {
          label: '收件人',
          key: 'to',
          type: 'input',
          props: { clearable: true, placeholder: '请输入邮箱' },
        },
        {
          label: '模板',
          key: 'templateCode',
          type: 'input',
          props: { clearable: true, placeholder: '模板 Code' },
        },
      ]
    }
    return [
      {
        label: '关键词',
        key: 'keyword',
        type: 'input',
        props: {
          clearable: true,
          placeholder: activeTab.value === 'channels' ? '通道名称' : '模板名称或 Code',
        },
      },
    ]
  })

  function createChannelColumns(): ColumnOption<EmailChannelListItem>[] {
    return [
      { prop: 'name', label: '名称', minWidth: 120 },
      { prop: 'provider', label: 'Provider', width: 100 },
      {
        prop: 'status',
        label: '状态',
        width: 90,
        formatter: (row) =>
          h(ElTag, { type: row.status === 1 ? 'success' : 'info' }, () =>
            row.status === 1 ? '启用' : '禁用',
          ),
      },
      {
        prop: 'operation',
        label: '操作',
        width: 160,
        fixed: 'right',
        formatter: (row) => h(ArtTableActions, { items: channelActions(row) }),
      },
    ]
  }

  function createTemplateColumns(): ColumnOption<EmailTemplateListItem>[] {
    return [
      { prop: 'code', label: 'Code', width: 120 },
      { prop: 'name', label: '名称', minWidth: 120 },
      { prop: 'subject', label: '主题', minWidth: 160, showOverflowTooltip: true },
      { prop: 'content', label: '内容', minWidth: 200, showOverflowTooltip: true },
      {
        prop: 'status',
        label: '状态',
        width: 90,
        formatter: (row) =>
          h(ElTag, { type: row.status === 1 ? 'success' : 'info' }, () =>
            row.status === 1 ? '启用' : '禁用',
          ),
      },
      {
        prop: 'operation',
        label: '操作',
        width: 160,
        fixed: 'right',
        formatter: (row) => h(ArtTableActions, { items: templateActions(row) }),
      },
    ]
  }

  function createLogColumns(): ColumnOption<EmailLogListItem>[] {
    return [
      { prop: 'to', label: '收件人', width: 180 },
      { prop: 'templateCode', label: '模板', width: 120 },
      { prop: 'subject', label: '主题', minWidth: 160, showOverflowTooltip: true },
      { prop: 'content', label: '内容', minWidth: 180, showOverflowTooltip: true },
      {
        prop: 'status',
        label: '状态',
        width: 80,
        formatter: (row) =>
          h(ElTag, { type: row.status === 1 ? 'success' : 'danger' }, () =>
            row.status === 1 ? '成功' : '失败',
          ),
      },
      {
        prop: 'sentAt',
        label: '发送时间',
        minWidth: 160,
        formatter: (row) => new Date(row.sentAt).toLocaleString('zh-CN'),
      },
    ]
  }

  function getColumnsForTab(tab: EmailTab) {
    if (tab === 'channels') return createChannelColumns()
    if (tab === 'templates') return createTemplateColumns()
    return createLogColumns()
  }

  const columnChecks = ref(getColumnChecks(getColumnsForTab('channels')))

  const visibleColumns = computed(() =>
    columnChecks.value.filter((col) => col.checked !== false && col.visible !== false),
  )

  const currentData = computed(() => {
    if (activeTab.value === 'channels') return channels.value
    if (activeTab.value === 'templates') return templates.value
    return logs.value
  })

  const panelLoading = computed(() => {
    if (activeTab.value === 'channels') return channelLoading.value
    if (activeTab.value === 'templates') return templateLoading.value
    return logLoading.value
  })

  const channelVisible = ref(false)
  const channelMode = ref<'add' | 'edit'>('add')
  const channelSubmitting = ref(false)
  const channelForm = reactive({
    id: '',
    name: '',
    provider: 'mock' as 'mock' | 'smtp',
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
    subject: '',
    content: '',
    enabled: true,
  })

  const sendVisible = ref(false)
  const sendSubmitting = ref(false)
  const sendForm = reactive({
    templateCode: '',
    to: 'user@example.com',
    paramsJson: '{"siteName":"Nova Stack"}',
  })

  onMounted(async () => {
    await Promise.all([loadChannels(), loadTemplates()])
    if (templates.value.length) {
      sendForm.templateCode = templates.value[0].code
    }
  })

  watch(activeTab, (tab) => {
    columnChecks.value = getColumnChecks(getColumnsForTab(tab))
  })

  function handlePanelRefresh() {
    return loadCurrentTab()
  }

  function handleTabChange() {
    pagination.current = 1
    loadCurrentTab()
  }

  function handleSearch() {
    pagination.current = 1
    loadCurrentTab()
  }

  function handleSearchReset() {
    if (activeTab.value === 'logs') {
      searchForms.logs.to = ''
      searchForms.logs.templateCode = ''
    } else {
      searchForms[activeTab.value].keyword = ''
    }
    handleSearch()
  }

  function handleSizeChange(size: number) {
    pagination.size = size
    pagination.current = 1
    loadCurrentTab()
  }

  function handleCurrentChange(current: number) {
    pagination.current = current
    loadCurrentTab()
  }

  function loadCurrentTab() {
    if (activeTab.value === 'channels') return loadChannels()
    if (activeTab.value === 'templates') return loadTemplates()
    return loadLogs()
  }

  async function loadChannels() {
    channelLoading.value = true
    try {
      const res = await fetchEmailChannelList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchForms.channels.keyword || undefined,
      })
      channels.value = res.records
      pagination.total = res.total
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
      const res = await fetchEmailTemplateList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchForms.templates.keyword || undefined,
      })
      templates.value = res.records
      pagination.total = res.total
    } finally {
      templateLoading.value = false
    }
  }

  async function loadLogs() {
    logLoading.value = true
    try {
      const res = await fetchEmailLogList({
        current: pagination.current,
        size: pagination.size,
        to: searchForms.logs.to || undefined,
        templateCode: searchForms.logs.templateCode || undefined,
      })
      logs.value = res.records
      pagination.total = res.total
    } finally {
      logLoading.value = false
    }
  }

  function channelActions(row: EmailChannelListItem): TableActionItem[] {
    return [
      {
        key: 'edit',
        label: '编辑',
        auth: 'infra:email:channel:update',
        onClick: () => openChannelDialog('edit', row),
      },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        auth: 'infra:email:channel:delete',
        onClick: () => removeChannel(row),
      },
    ]
  }

  function templateActions(row: EmailTemplateListItem): TableActionItem[] {
    return [
      {
        key: 'edit',
        label: '编辑',
        auth: 'infra:email:template:update',
        onClick: () => openTemplateDialog('edit', row),
      },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        auth: 'infra:email:template:delete',
        onClick: () => removeTemplate(row),
      },
    ]
  }

  function openChannelDialog(mode: 'add' | 'edit', row?: EmailChannelListItem) {
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
        await createEmailChannel(payload)
        ElMessage.success('新增成功')
      } else {
        await updateEmailChannel(channelForm.id, payload)
        ElMessage.success('更新成功')
      }
      channelVisible.value = false
      await loadChannels()
    } finally {
      channelSubmitting.value = false
    }
  }

  async function removeChannel(row: EmailChannelListItem) {
    await ElMessageBox.confirm(`确定删除通道「${row.name}」吗？`, '删除确认', { type: 'warning' })
    await deleteEmailChannel(row.id)
    ElMessage.success('删除成功')
    await loadChannels()
  }

  function openTemplateDialog(mode: 'add' | 'edit', row?: EmailTemplateListItem) {
    templateMode.value = mode
    if (mode === 'edit' && row) {
      Object.assign(templateForm, {
        id: row.id,
        code: row.code,
        name: row.name,
        channelId: row.channelId,
        subject: row.subject,
        content: row.content,
        enabled: row.status === 1,
      })
    } else {
      Object.assign(templateForm, {
        id: '',
        code: '',
        name: '',
        channelId: channels.value[0]?.id ?? '',
        subject: '欢迎加入 {siteName}',
        content: '您好，欢迎加入 {siteName}！',
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
        subject: templateForm.subject,
        content: templateForm.content,
        status: (templateForm.enabled ? 1 : 0) as 0 | 1,
      }
      if (templateMode.value === 'add') {
        await createEmailTemplate(payload)
        ElMessage.success('新增成功')
      } else {
        await updateEmailTemplate(templateForm.id, payload)
        ElMessage.success('更新成功')
      }
      templateVisible.value = false
      await loadTemplates()
    } finally {
      templateSubmitting.value = false
    }
  }

  async function removeTemplate(row: EmailTemplateListItem) {
    await ElMessageBox.confirm(`确定删除模板「${row.code}」吗？`, '删除确认', { type: 'warning' })
    await deleteEmailTemplate(row.id)
    ElMessage.success('删除成功')
    await loadTemplates()
  }

  async function submitSend() {
    sendSubmitting.value = true
    try {
      const params = JSON.parse(sendForm.paramsJson) as Record<string, string>
      await sendEmail({
        to: sendForm.to,
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
