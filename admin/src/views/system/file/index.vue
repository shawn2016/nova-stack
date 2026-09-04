<template>
  <div class="art-full-height file-page">
    <ArtListPanel
      title="文件管理"
      v-model:show-search-bar="showSearchBar"
      :loading="loading"
      :show-column-settings="false"
      @refresh="loadFiles"
    >
      <template #search>
        <ArtSearchBar
          v-model="searchForm"
          :items="formItems"
          :showExpand="false"
          embedded
          @reset="handleReset"
          @search="handleSearch"
        />
      </template>
      <template #head-actions>
        <ElButton
          v-permission="'system:file:settings'"
          @click="openSettings"
          v-ripple
        >
          存储配置
        </ElButton>
        <ElUpload
          v-permission="'system:file:upload'"
          :show-file-list="false"
          accept="image/jpeg,image/png,image/gif,image/webp"
          :http-request="handleUpload"
        >
          <ElButton type="primary" :loading="uploading" v-ripple>上传图片</ElButton>
        </ElUpload>
      </template>

      <div v-loading="loading" class="file-grid-wrap">
        <ElEmpty v-if="!loading && !files.length" description="暂无文件，请上传图片" />
        <div v-else class="file-grid">
          <div v-for="item in files" :key="item.id" class="file-card">
            <div class="file-card__preview">
              <ElImage :src="item.url" fit="cover" :preview-src-list="[item.url]" />
            </div>
            <div class="file-card__meta">
              <div class="file-card__row">
                <ElTag size="small" :type="storageTagType(item.storage)">
                  {{ FILE_STORAGE_LABELS[item.storage] }}
                </ElTag>
                <span class="file-card__size">{{ formatSize(item.size) }}</span>
              </div>
              <div class="file-card__name" :title="item.originalName ?? item.objectKey">
                {{ item.originalName ?? item.objectKey }}
              </div>
              <div class="file-card__sub">
                {{ item.uploaderName ?? item.uploaderId }} ·
                {{ formatDate(item.createdAt) }}
              </div>
            </div>
            <div class="file-card__actions">
              <ElButton link type="primary" @click="copyUrl(item.url)">复制链接</ElButton>
              <ElButton
                v-permission="'system:file:delete'"
                link
                type="danger"
                @click="handleDelete(item)"
              >
                删除
              </ElButton>
            </div>
          </div>
        </div>

        <div v-if="total > 0" class="file-pagination">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="total"
            :page-sizes="[12, 24, 48]"
            layout="total, sizes, prev, pager, next"
            @current-change="loadFiles"
            @size-change="loadFiles"
          />
        </div>
      </div>
    </ArtListPanel>

    <ElDialog v-model="settingsVisible" title="存储配置" width="640px" align-center>
      <ElForm label-width="140px">
        <ElFormItem label="存储方式">
          <ElRadioGroup v-model="settingsForm.provider">
            <ElRadio value="local">本地存储</ElRadio>
            <ElRadio value="aliyun_oss">阿里云 OSS</ElRadio>
            <ElRadio value="tencent_cos">腾讯云 COS</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="上传大小上限">
          <ElInputNumber
            v-model="settingsForm.maxSize"
            :min="1024"
            :step="1024 * 1024"
            controls-position="right"
          />
          <span class="settings-hint">字节，当前约 {{ formatSize(settingsForm.maxSize) }}</span>
        </ElFormItem>

        <template v-if="settingsForm.provider === 'local'">
          <ElFormItem label="访问域名">
            <ElInput v-model="settingsForm.local.appPublicUrl" placeholder="http://localhost:3000" />
          </ElFormItem>
          <ElFormItem label="上传目录">
            <ElInput v-model="settingsForm.local.uploadsDir" placeholder="/path/to/uploads" />
          </ElFormItem>
        </template>

        <template v-if="settingsForm.provider === 'aliyun_oss'">
          <ElFormItem label="Region">
            <ElInput v-model="settingsForm.aliyun.region" placeholder="oss-cn-hangzhou" />
          </ElFormItem>
          <ElFormItem label="Bucket">
            <ElInput v-model="settingsForm.aliyun.bucket" />
          </ElFormItem>
          <ElFormItem label="AccessKeyId">
            <ElInput v-model="settingsForm.aliyun.accessKeyId" />
          </ElFormItem>
          <ElFormItem label="AccessKeySecret">
            <ElInput
              v-model="settingsForm.aliyun.accessKeySecret"
              type="password"
              show-password
              placeholder="留空则不修改"
            />
          </ElFormItem>
          <ElFormItem label="CDN 域名">
            <ElInput
              v-model="settingsForm.aliyun.publicBaseUrl"
              placeholder="可选，如 https://cdn.example.com"
            />
          </ElFormItem>
        </template>

        <template v-if="settingsForm.provider === 'tencent_cos'">
          <ElFormItem label="Region">
            <ElInput v-model="settingsForm.tencent.region" placeholder="ap-guangzhou" />
          </ElFormItem>
          <ElFormItem label="Bucket">
            <ElInput v-model="settingsForm.tencent.bucket" />
          </ElFormItem>
          <ElFormItem label="SecretId">
            <ElInput v-model="settingsForm.tencent.secretId" />
          </ElFormItem>
          <ElFormItem label="SecretKey">
            <ElInput
              v-model="settingsForm.tencent.secretKey"
              type="password"
              show-password
              placeholder="留空则不修改"
            />
          </ElFormItem>
          <ElFormItem label="CDN 域名">
            <ElInput
              v-model="settingsForm.tencent.publicBaseUrl"
              placeholder="可选，如 https://cdn.example.com"
            />
          </ElFormItem>
        </template>
      </ElForm>
      <template #footer>
        <ElButton @click="settingsVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="settingsSaving" @click="handleSaveSettings">
          保存
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import {
    FILE_STORAGE_LABELS,
    UPLOAD_STORAGE_PROVIDER_LABELS,
    type FileListItem,
    type FileStorageType,
    type UploadSettings,
    type UploadStorageProvider,
  } from '@nova/shared-types'
  import type { UploadRequestOptions } from 'element-plus'
  import { deleteFile, fetchFileList } from '@/api/file'
  import { fetchUploadSettings, updateUploadSettings } from '@/api/upload-settings'
  import { uploadFile } from '@/api/upload'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'SystemFile' })

  const SECRET_MASK = '******'

  const showSearchBar = ref(true)
  const loading = ref(false)
  const uploading = ref(false)
  const files = ref<FileListItem[]>([])
  const total = ref(0)
  const pagination = reactive({ current: 1, size: 24 })
  const settingsVisible = ref(false)
  const settingsSaving = ref(false)

  const searchForm = reactive<{ keyword: string; storage?: FileStorageType }>({
    keyword: '',
    storage: undefined,
  })

  const appliedFilters = reactive<{ keyword: string; storage?: FileStorageType }>({
    keyword: '',
    storage: undefined,
  })

  const settingsForm = reactive<UploadSettings>({
    provider: 'local',
    maxSize: 5 * 1024 * 1024,
    local: {
      appPublicUrl: 'http://localhost:3000',
      uploadsDir: '',
    },
    aliyun: {
      region: '',
      bucket: '',
      accessKeyId: '',
      accessKeySecret: '',
      publicBaseUrl: '',
    },
    tencent: {
      region: '',
      bucket: '',
      secretId: '',
      secretKey: '',
      publicBaseUrl: '',
    },
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '文件名 / URL' },
    },
    {
      label: '存储',
      key: 'storage',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '全部',
        options: [
          { label: UPLOAD_STORAGE_PROVIDER_LABELS.local, value: 'local' },
          { label: UPLOAD_STORAGE_PROVIDER_LABELS.aliyun_oss, value: 'aliyun_oss' },
          { label: UPLOAD_STORAGE_PROVIDER_LABELS.tencent_cos, value: 'tencent_cos' },
          { label: '阿里云 OSS（历史）', value: 'oss' },
        ],
      },
    },
  ])

  function storageTagType(storage: FileStorageType): 'info' | 'success' | 'warning' {
    if (storage === 'local') return 'info'
    if (storage === 'tencent_cos') return 'warning'
    return 'success'
  }

  function formatSize(size: number): string {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }

  function formatDate(value: string): string {
    return value.replace('T', ' ').slice(0, 16)
  }

  async function loadFiles() {
    loading.value = true
    try {
      const result = await fetchFileList({
        current: pagination.current,
        size: pagination.size,
        keyword: appliedFilters.keyword,
        storage: appliedFilters.storage,
      })
      files.value = result.records
      total.value = result.total
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      loading.value = false
    }
  }

  async function openSettings() {
    try {
      const settings = await fetchUploadSettings()
      Object.assign(settingsForm, settings)
      settingsVisible.value = true
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '加载配置失败')
    }
  }

  async function handleSaveSettings() {
    settingsSaving.value = true
    try {
      const payload = {
        provider: settingsForm.provider as UploadStorageProvider,
        maxSize: settingsForm.maxSize,
        local: { ...settingsForm.local },
        aliyun: {
          ...settingsForm.aliyun,
          ...(settingsForm.aliyun.accessKeySecret === SECRET_MASK ||
          !settingsForm.aliyun.accessKeySecret
            ? { accessKeySecret: undefined }
            : {}),
        },
        tencent: {
          ...settingsForm.tencent,
          ...(settingsForm.tencent.secretKey === SECRET_MASK ||
          !settingsForm.tencent.secretKey
            ? { secretKey: undefined }
            : {}),
        },
      }
      const updated = await updateUploadSettings(payload)
      Object.assign(settingsForm, updated)
      ElMessage.success('存储配置已保存')
      settingsVisible.value = false
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      settingsSaving.value = false
    }
  }

  function handleSearch() {
    appliedFilters.keyword = searchForm.keyword
    appliedFilters.storage = searchForm.storage
    pagination.current = 1
    void loadFiles()
  }

  function handleReset() {
    searchForm.keyword = ''
    searchForm.storage = undefined
    appliedFilters.keyword = ''
    appliedFilters.storage = undefined
    pagination.current = 1
    void loadFiles()
  }

  async function handleUpload(options: UploadRequestOptions) {
    uploading.value = true
    try {
      await uploadFile(options.file as File)
      ElMessage.success('上传成功')
      pagination.current = 1
      await loadFiles()
      options.onSuccess?.({})
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      ElMessage.error(message)
      options.onError?.(error as Error)
    } finally {
      uploading.value = false
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      ElMessage.success('链接已复制')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  function handleDelete(item: FileListItem) {
    ElMessageBox.confirm('确定删除该文件吗？删除后链接将失效。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await deleteFile(item.id)
        ElMessage.success('删除成功')
        await loadFiles()
      })
      .catch(() => undefined)
  }

  onMounted(() => {
    void loadFiles()
  })
</script>

<style scoped>
  .file-grid-wrap {
    min-height: 200px;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .file-card {
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .file-card__preview {
    aspect-ratio: 1;
    background: var(--el-fill-color-light);
  }

  .file-card__preview :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .file-card__meta {
    padding: 10px 12px 0;
  }

  .file-card__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .file-card__size {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-card__name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-card__sub {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-card__actions {
    display: flex;
    justify-content: space-between;
    padding: 8px 8px 10px;
  }

  .file-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .settings-hint {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
