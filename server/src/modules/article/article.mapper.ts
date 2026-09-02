import type { Article, ArticleListItem } from '@nova/shared-types';
import { ArticleEntity } from '../../database/entities';

export function toArticle(entity: ArticleEntity): Article {
  return {
    id: Number(entity.id),
    title: entity.title,
    summary: entity.summary,
    content: entity.content,
    coverUrl: entity.coverUrl ?? undefined,
    status: entity.status as 0 | 1,
    authorId: Number(entity.authorId),
    publishedAt: entity.publishedAt?.toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toArticleListItem(entity: ArticleEntity): ArticleListItem {
  return {
    id: Number(entity.id),
    title: entity.title,
    summary: entity.summary,
    coverUrl: entity.coverUrl ?? undefined,
    status: entity.status as 0 | 1,
    publishedAt: entity.publishedAt?.toISOString(),
  };
}
