import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { UploadResult } from '@nova/shared-types';
import type { StorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  constructor(private readonly configService: ConfigService) {}

  async upload(file: Express.Multer.File, key: string): Promise<UploadResult> {
    const uploadsDir =
      this.configService.get<string>('upload.uploadsDir') ??
      join(process.cwd(), 'uploads');
    const appPublicUrl =
      this.configService.get<string>('upload.appPublicUrl') ??
      'http://localhost:3000';
    const targetPath = join(uploadsDir, key);

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.buffer);

    return {
      url: `${appPublicUrl.replace(/\/$/, '')}/uploads/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
