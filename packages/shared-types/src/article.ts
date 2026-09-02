/** 文章完整实体 */
export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverUrl?: string;
  status: 0 | 1;
  authorId: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 文章列表项（不含正文） */
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  coverUrl?: string;
  status: 0 | 1;
  publishedAt?: string;
}

/** 创建文章请求 */
export interface CreateArticleDto {
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
}

/** 更新文章请求 */
export interface UpdateArticleDto {
  title?: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  status?: 0 | 1;
}
