<template>
  <div class="art-full-height">
    <ArtListPanel
      v-model:columns="columnChecks"
      :loading="loading"
      @refresh="refreshData"
    >
      <template #toolbar-left>
        <ElButton v-permission="'infra:job:create'" @click="openDialog('add')" v-ripple>
          新增任务
        </ElButton>
      </template>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ArtListPanel>

    <JobDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :job-data="currentJob"
      :handlers="handlers"
      @success="refreshData"
    />

    <ElDrawer v-model="logVisible" title="执行日志" size="640px">
      <ElTable v-loading="logLoading" :data="logData" size="small">
        <ElTableColumn prop="startTime" label="开始时间" min-width="160">
          <template #default="{ row }">
            {{ new Date(row.startTime).toLocaleString('zh-CN') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="80">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="durationMs" label="耗时(ms)" width="100" />
        <ElTableColumn prop="message" label="消息" min-width="140" />
      </ElTable>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import ArtTableActions from '@/components/core/tables/art-table-actions/index.vue'
  import type { TableActionItem } from '@/components/core/tables/art-table-actions/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    deleteJob,
    fetchJobHandlers,
    fetchJobList,
    fetchJobLogList,
    runJob,
    updateJobStatus,
  } from '@/api/job'
  import type { JobHandlerInfo, JobListItem, JobLogListItem } from '@nova/shared-types'
  import { ElMessageBox, ElTag } from 'element-plus'
  import JobDialog from './modules/job-dialog.vue'

  defineOptions({ name: 'InfraJob' })

  const handlers = ref<JobHandlerInfo[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentJob = ref<JobListItem | undefined>(undefined)
  const logVisible = ref(false)
  const logLoading = ref(false)
  const logData = ref<JobLogListItem[]>([])
  const logJobId = ref('')

  const statusTag: Record<0 | 1, { type: 'info' | 'success'; label: string }> = {
    0: { type: 'info', label: '暂停' },
    1: { type: 'success', label: '运行中' },
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
  } = useTable({
    core: {
      apiFn: fetchJobList,
      apiParams: { current: 1, size: 20 },
      columnsFactory: () => [
        { prop: 'name', label: '任务名称', minWidth: 140 },
        { prop: 'jobGroup', label: '分组', width: 100 },
        { prop: 'invokeTarget', label: 'Handler', minWidth: 140 },
        { prop: 'cronExpression', label: 'Cron', minWidth: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: JobListItem) => {
            const tag = statusTag[row.status]
            return h(ElTag, { type: tag.type }, () => tag.label)
          },
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: JobListItem) => {
            const items: TableActionItem[] = [
              {
                key: 'edit',
                label: '编辑',
                auth: 'infra:job:update',
                onClick: () => handleAction('edit', row),
              },
              {
                key: 'toggle',
                label: row.status === 1 ? '暂停' : '启用',
                auth: 'infra:job:update',
                onClick: () => handleAction('toggle', row),
              },
              {
                key: 'run',
                label: '执行一次',
                auth: 'infra:job:run',
                onClick: () => handleAction('run', row),
              },
              {
                key: 'logs',
                label: '日志',
                auth: 'infra:job:log:list',
                onClick: () => handleAction('logs', row),
              },
              {
                key: 'delete',
                label: '删除',
                danger: true,
                auth: 'infra:job:delete',
                onClick: () => handleAction('delete', row),
              },
            ]
            return h(ArtTableActions, { items })
          },
        },
      ],
    },
  })

  onMounted(async () => {
    handlers.value = await fetchJobHandlers()
  })

  function openDialog(type: 'add' | 'edit', row?: JobListItem) {
    dialogType.value = type
    currentJob.value = row
    dialogVisible.value = true
  }

  async function handleAction(key: string | undefined, row: JobListItem) {
    switch (key) {
      case 'edit':
        openDialog('edit', row)
        break
      case 'toggle':
        await updateJobStatus(row.id, { status: row.status === 1 ? 0 : 1 })
        ElMessage.success('状态已更新')
        refreshData()
        break
      case 'run':
        await runJob(row.id)
        ElMessage.success('已触发执行')
        break
      case 'logs':
        logJobId.value = row.id
        logVisible.value = true
        await loadLogs()
        break
      case 'delete':
        await ElMessageBox.confirm(`确定删除任务「${row.name}」吗？`, '删除确认', {
          type: 'warning',
        })
        await deleteJob(row.id)
        ElMessage.success('删除成功')
        refreshData()
        break
    }
  }

  async function loadLogs() {
    logLoading.value = true
    try {
      const result = await fetchJobLogList({ jobId: logJobId.value, current: 1, size: 50 })
      logData.value = result.records
    } finally {
      logLoading.value = false
    }
  }
</script>
