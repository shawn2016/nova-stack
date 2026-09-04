import type {
  Article,
  ArticleListItem,
  CreateArticleDto,
  PaginationResult,
  UpdateArticleDto
} from '@nova/shared-types'
import { request } from './request'

export interface ArticleListQuery {
  status?: 0 | 1
  current?: number
  size?: number
}

function toTableResponse<T>(result: PaginationResult<T>) {
  return {
    records: result.list,
    total: result.total,
    current: result.page,
    size: result.pageSize
  }
}

export function fetchArticleList(params: ArticleListQuery = {}) {
  const { status, current = 1, size = 20 } = params
  return request<PaginationResult<ArticleListItem>>({
    url: '/articles',
    method: 'GET',
    params: {
      page: current,
      pageSize: size,
      ...(status !== undefined ? { status } : {})
    }
  }).then(toTableResponse)
}

export function getArticle(id: number) {
  return request<Article>({
    url: `/articles/${id}`,
    method: 'GET'
  })
}

export function createArticle(data: CreateArticleDto) {
  return request<Article>({
    url: '/articles',
    method: 'POST',
    data
  })
}

export function updateArticle(id: number, data: UpdateArticleDto) {
  return request<Article>({
    url: `/articles/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteArticle(id: number) {
  return request<{ success: true }>({
    url: `/articles/${id}`,
    method: 'DELETE'
  })
}

export function publishArticle(id: number) {
  return request<Article>({
    url: `/articles/${id}/publish`,
    method: 'PATCH'
  })
}
