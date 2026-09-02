import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { UploadResult } from '@nova/shared-types';
import {
  STORAGE_SERVICE,
  type StorageService,
} from './storage/storage.interface';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    file: Express.Multer.File | undefined,
    userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize =
      this.configService.get<number>('upload.uploadMaxSize') ?? 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds limit');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const ext = MIME_TO_EXT[file.mimetype] ?? '';
    const key = `admin/${userId}/${randomUUID()}${ext}`;

    return this.storageService.upload(file, key);
  }
}
