import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '../../database/entities';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { MemberArticleController } from './member-article.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
  controllers: [ArticleController, MemberArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
