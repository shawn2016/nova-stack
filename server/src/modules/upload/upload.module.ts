import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalStorageService } from './storage/local-storage.service';
import { OssStorageService } from './storage/oss-storage.service';
import { STORAGE_SERVICE } from './storage/storage.interface';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalStorageService,
    OssStorageService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, LocalStorageService, OssStorageService],
      useFactory: (
        configService: ConfigService,
        localStorageService: LocalStorageService,
        ossStorageService: OssStorageService,
      ) => {
        return configService.get<boolean>('upload.ossEnabled')
          ? ossStorageService
          : localStorageService;
      },
    },
  ],
})
export class UploadModule {}
