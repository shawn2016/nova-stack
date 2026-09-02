<template>
  <a-card title="文章管理">
    <a-space direction="vertical" fill>
      <a-space wrap>
        <a-select
          v-model="statusFilter"
          placeholder="状态筛选"
          allow-clear
          style="width: 140px"
          @change="handleSearch"
        >
          <a-option :value="0">草稿</a-option>
          <a-option :value="1">已发布</a-option>
        </a-select>
        <a-button type="primary" @click="handleSearch">查询</a-button>
        <a-button
          type="primary"
          v-permission="'content:article:create'"
          @click="goCreate"
        >
          新建文章
        </a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'gray'">
            {{ record.status === 1 ? '已发布' : '草稿' }}
          </a-tag>
        </template>
        <template #publishedAt="{ record }">
          {{ formatDate(record.publishedAt) }}
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              v-permission="'content:article:update'"
              @click="goEdit(record.id)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0"
              type="text"
              size="small"
              v-permission="'content:article:publish'"
              @click="handlePublish(record.id)"
            >
              发布
            </a-button>
            <a-popconfirm content="确定删除该文章？" @ok="handleDelete(record.id)">
              <a-button
                type="text"
                size="small"
                status="danger"
                v-permission="'content:article:delete'"
              >
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>

      <a-pagination
        v-model:current="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        show-total
        show-page-size
        @change="fetchList"
        @page-size-change="handlePageSizeChange"
      />
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue';
import type { ArticleListItem } from '@nova/shared-types';
import * as articleApi from '@/api/article';

const router = useRouter();

const loading = ref(false);
const list = ref<ArticleListItem[]>([]);
const statusFilter = ref<0 | 1 | undefined>(undefined);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const columns: TableColumnData[] = [
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '摘要', dataIndex: 'summary', ellipsis: true },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '发布时间', slotName: 'publishedAt', width: 180 },
  { title: '操作', slotName: 'actions', width: 220 },
];

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function fetchList() {
  loading.value = true;
  try {
    const result = await articleApi.listArticles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: statusFilter.value,
    });
    list.value = result.list;
    pagination.total = result.total;
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '加载文章列表失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  fetchList();
}

function handlePageSizeChange() {
  pagination.page = 1;
  fetchList();
}

function goCreate() {
  router.push('/content/articles/create');
}

function goEdit(id: number) {
  router.push(`/content/articles/${id}/edit`);
}

async function handlePublish(id: number) {
  try {
    await articleApi.publishArticle(id);
    Message.success('发布成功');
    fetchList();
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '发布失败');
  }
}

async function handleDelete(id: number) {
  try {
    await articleApi.deleteArticle(id);
    Message.success('删除成功');
    if (list.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1;
    }
    fetchList();
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '删除失败');
  }
}

onMounted(() => {
  fetchList();
});
</script>
