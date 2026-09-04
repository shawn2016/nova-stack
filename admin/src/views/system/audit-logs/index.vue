<template>
  <div class="audit-logs-page art-full-height">
    <LoginLogsPanel v-if="activeTab === 'login'" v-model:active-tab="activeTab" />
    <OperLogsPanel v-else v-model:active-tab="activeTab" />
  </div>
</template>

<script setup lang="ts">
  import LoginLogsPanel from './modules/login-logs-panel.vue'
  import OperLogsPanel from './modules/oper-logs-panel.vue'
  import type { AuditLogTab } from './modules/audit-log-tabs'

  defineOptions({ name: 'AuditLogs' })

  const activeTab = ref<AuditLogTab>('login')
</script>
