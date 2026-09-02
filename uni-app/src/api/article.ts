import type {
  Article,
  ArticleListItem,
  PaginationParams,
  PaginationResult,
} from '@nova/shared-types';
import { request } from '@/utils/request';

export function listArticles(params: PaginationParams) {
  return request<PaginationResult<ArticleListItem>>({
    url: '/member/articles',
    method: 'GET',
    data: params,
  });
}

export function getArticle(id: number) {
  return request<Article>({
    url: `/member/articles/${id}`,
    method: 'GET',
  });
}
