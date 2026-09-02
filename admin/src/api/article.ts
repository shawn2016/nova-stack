import type {
  Article,
  ArticleListItem,
  CreateArticleDto,
  PaginationResult,
  UpdateArticleDto,
} from '@nova/shared-types';
import { request } from './request';

export interface ListArticlesParams {
  page: number;
  pageSize: number;
  status?: 0 | 1;
}

export function listArticles(params: ListArticlesParams) {
  return request<PaginationResult<ArticleListItem>>({
    url: '/articles',
    method: 'GET',
    params,
  });
}

export function getArticle(id: number) {
  return request<Article>({
    url: `/articles/${id}`,
    method: 'GET',
  });
}

export function createArticle(data: CreateArticleDto) {
  return request<Article>({
    url: '/articles',
    method: 'POST',
    data,
  });
}

export function updateArticle(id: number, data: UpdateArticleDto) {
  return request<Article>({
    url: `/articles/${id}`,
    method: 'PUT',
    data,
  });
}

export function deleteArticle(id: number) {
  return request<{ success: true }>({
    url: `/articles/${id}`,
    method: 'DELETE',
  });
}

export function publishArticle(id: number) {
  return request<Article>({
    url: `/articles/${id}/publish`,
    method: 'PATCH',
  });
}
