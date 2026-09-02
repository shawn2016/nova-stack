import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @RequirePermission('content:article:list')
  @ApiOperation({ summary: '文章列表（分页）' })
  list(@Query() query: ListArticlesDto) {
    return this.articleService.list(query);
  }

  @Get(':id')
  @RequirePermission('content:article:view')
  @ApiOperation({ summary: '文章详情' })
  findOne(@Param('id') id: string) {
    return this.articleService.findById(id);
  }

  @Post()
  @RequirePermission('content:article:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建文章' })
  create(@Body() body: CreateArticleDto, @CurrentUser() user: AuthUser) {
    return this.articleService.create(body, user.userId);
  }

  @Put(':id')
  @RequirePermission('content:article:update')
  @ApiOperation({ summary: '更新文章' })
  update(@Param('id') id: string, @Body() body: UpdateArticleDto) {
    return this.articleService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('content:article:delete')
  @ApiOperation({ summary: '删除文章' })
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }

  @Patch(':id/publish')
  @RequirePermission('content:article:publish')
  @ApiOperation({ summary: '发布文章' })
  publish(@Param('id') id: string) {
    return this.articleService.publish(id);
  }
}
