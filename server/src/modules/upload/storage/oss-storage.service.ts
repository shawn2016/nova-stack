import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import type { UploadResult } from '@nova/shared-types';
import type { StorageService } from './storage.interface';

@Injectable()
export class OssStorageService implements StorageService {
  private client: OSS | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OSS {
    if (!this.client) {
      this.client = new OSS({
        region: this.configService.get<string>('upload.ossRegion')!,
        accessKeyId: this.configService.get<string>('upload.ossAccessKeyId')!,
        accessKeySecret: this.configService.get<string>(
          'upload.ossAccessKeySecret',
        )!,
        bucket: this.configService.get<string>('upload.ossBucket')!,
      });
    }

    return this.client;
  }

  async upload(file: Express.Multer.File, key: string): Promise<UploadResult> {
    await this.getClient().put(key, file.buffer);

    const publicBaseUrl = this.configService.get<string>(
      'upload.ossPublicBaseUrl',
    );
    const region = this.configService.get<string>('upload.ossRegion')!;
    const bucket = this.configService.get<string>('upload.ossBucket')!;
    const baseUrl =
      publicBaseUrl && publicBaseUrl.length > 0
        ? publicBaseUrl.replace(/\/$/, '')
        : `https://${bucket}.${region}.aliyuncs.com`;

    return {
      url: `${baseUrl}/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
