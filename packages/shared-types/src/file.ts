/** 文件存储提供商 */
export type UploadStorageProvider = 'local' | 'aliyun_oss' | 'tencent_cos';

/** 文件记录中的存储类型（含历史 oss 别名） */
export type FileStorageType = UploadStorageProvider | 'oss';

export const UPLOAD_STORAGE_PROVIDER_LABELS: Record<UploadStorageProvider, string> = {
  local: '本地存储',
  aliyun_oss: '阿里云 OSS',
  tencent_cos: '腾讯云 COS',
};

/** 含历史 oss 别名的展示标签 */
export const FILE_STORAGE_LABELS: Record<FileStorageType, string> = {
  local: UPLOAD_STORAGE_PROVIDER_LABELS.local,
  aliyun_oss: UPLOAD_STORAGE_PROVIDER_LABELS.aliyun_oss,
  tencent_cos: UPLOAD_STORAGE_PROVIDER_LABELS.tencent_cos,
  oss: UPLOAD_STORAGE_PROVIDER_LABELS.aliyun_oss,
};

export interface UploadLocalSettings {
  appPublicUrl: string;
  uploadsDir: string;
}

export interface UploadAliyunSettings {
  region: string;
  bucket: string;
  accessKeyId: string;
  /** 返回 masked 值时为 ****** */
  accessKeySecret: string;
  publicBaseUrl: string;
}

export interface UploadTencentSettings {
  region: string;
  bucket: string;
  secretId: string;
  /** 返回 masked 值时为 ****** */
  secretKey: string;
  publicBaseUrl: string;
}

/** 文件上传/存储配置（Admin 可读可写） */
export interface UploadSettings {
  provider: UploadStorageProvider;
  maxSize: number;
  local: UploadLocalSettings;
  aliyun: UploadAliyunSettings;
  tencent: UploadTencentSettings;
}

export interface UpdateUploadSettingsDto {
  provider?: UploadStorageProvider;
  maxSize?: number;
  local?: Partial<UploadLocalSettings>;
  aliyun?: Partial<UploadAliyunSettings>;
  tencent?: Partial<UploadTencentSettings>;
}

/** 文件资源列表项 */
export interface FileListItem {
  id: string;
  url: string;
  objectKey: string;
  storage: FileStorageType;
  mimeType: string;
  size: number;
  originalName: string | null;
  uploaderId: string;
  uploaderName: string | null;
  createdAt: string;
}

/** 文件列表查询 */
export interface ListFilesQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  storage?: FileStorageType;
}
