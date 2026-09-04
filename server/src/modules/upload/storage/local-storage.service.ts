import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { UploadResult } from '@nova/shared-types';
import type { UploadLocalSettings } from '../upload-settings.types';

@Injectable()
export class LocalStorageService {
  async upload(
    file: Express.Multer.File,
    key: string,
    config: UploadLocalSettings,
  ): Promise<UploadResult> {
    const targetPath = join(config.uploadsDir, key);

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.buffer);

    return {
      url: `${config.appPublicUrl.replace(/\/$/, '')}/uploads/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async delete(key: string, config: UploadLocalSettings): Promise<void> {
    const targetPath = join(config.uploadsDir, key);
    await unlink(targetPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
  }
}
