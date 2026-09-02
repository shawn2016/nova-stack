import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MemberAuthGuard } from '../member-auth/guards/member-auth.guard';
import { ArticleService } from './article.service';

@ApiTags('member-articles')
@ApiBearerAuth()
@Controller('member/articles')
@UseGuards(MemberAuthGuard)
export class MemberArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiOperation({ summary: '会员端已发布文章列表' })
  list(@Query() query: PaginationDto) {
    return this.articleService.listPublishedForMember(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '会员端已发布文章详情' })
  findOne(@Param('id') id: string) {
    return this.articleService.findPublishedByIdForMember(id);
  }
}
