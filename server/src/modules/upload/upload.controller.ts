import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { UploadService } from './upload.service';

@ApiTags('files')
@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @RequirePermission('system:file:upload')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件（Admin）' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize:
          parseInt(process.env.UPLOAD_MAX_SIZE ?? '5242880', 10) ||
          5 * 1024 * 1024,
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.uploadService.upload(file, user.userId);
  }
}
