import type {
  UploadAliyunSettings,
  UploadLocalSettings,
  UploadSettings,
  UploadStorageProvider,
  UploadTencentSettings,
  UpdateUploadSettingsDto,
} from '@nova/shared-types';

export type {
  UploadAliyunSettings,
  UploadLocalSettings,
  UploadStorageProvider,
  UploadTencentSettings,
};

export interface UploadRuntimeConfig {
  provider: UploadStorageProvider;
  maxSize: number;
  local: UploadLocalSettings;
  aliyun: UploadAliyunSettings & { accessKeySecret: string };
  tencent: UploadTencentSettings & { secretKey: string };
}

export const UPLOAD_CONFIG_GROUP = 'upload';
export const SECRET_MASK = '******';

export const UPLOAD_CONFIG_KEYS = {
  provider: 'upload.storage.provider',
  maxSize: 'upload.max_size',
  localAppPublicUrl: 'upload.local.app_public_url',
  localUploadsDir: 'upload.local.uploads_dir',
  aliyunRegion: 'upload.aliyun.region',
  aliyunBucket: 'upload.aliyun.bucket',
  aliyunAccessKeyId: 'upload.aliyun.access_key_id',
  aliyunAccessKeySecret: 'upload.aliyun.access_key_secret',
  aliyunPublicBaseUrl: 'upload.aliyun.public_base_url',
  tencentRegion: 'upload.tencent.region',
  tencentBucket: 'upload.tencent.bucket',
  tencentSecretId: 'upload.tencent.secret_id',
  tencentSecretKey: 'upload.tencent.secret_key',
  tencentPublicBaseUrl: 'upload.tencent.public_base_url',
} as const;

export type UploadSettingsResponse = UploadSettings;

export type { UpdateUploadSettingsDto };
