import type { UploadResult } from '@nova/shared-types';

export interface StorageService {
  upload(file: Express.Multer.File, key: string): Promise<UploadResult>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
