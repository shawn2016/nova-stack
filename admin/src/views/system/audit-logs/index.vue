<template>
  <div class="audit-logs-page art-full-height">
    <ElCard class="art-table-card audit-logs-page__card">
      <ElTabs v-model="activeTab" class="audit-logs-page__tabs">
        <ElTabPane label="登录日志" name="login">
          <LoginLogsPanel />
        </ElTabPane>
        <ElTabPane label="操作日志" name="oper">
          <OperLogsPanel />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import LoginLogsPanel from './modules/login-logs-panel.vue'
  import OperLogsPanel from './modules/oper-logs-panel.vue'

  defineOptions({ name: 'AuditLogs' })

  const activeTab = ref('login')
</script>

<style lang="scss" scoped>
  .audit-logs-page {
    &__card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }

    &__tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      :deep(.el-tabs__content) {
        flex: 1;
        min-height: 0;
      }

      :deep(.el-tab-pane) {
        height: 100%;
      }
    }
  }
</style>
