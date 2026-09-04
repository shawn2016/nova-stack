import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  UpdateUploadSettingsDto,
  UploadStorageProvider,
} from '@nova/shared-types';
import { In, Repository } from 'typeorm';
import { SysConfigEntity } from '../../database/entities';
import {
  SECRET_MASK,
  UPLOAD_CONFIG_GROUP,
  UPLOAD_CONFIG_KEYS,
  type UploadRuntimeConfig,
  type UploadSettingsResponse,
} from './upload-settings.types';

const CONFIG_META: Record<
  string,
  { name: string; defaultValue?: () => string }
> = {
  [UPLOAD_CONFIG_KEYS.provider]: {
    name: '存储提供商',
    defaultValue: () => 'local',
  },
  [UPLOAD_CONFIG_KEYS.maxSize]: {
    name: '上传大小上限（字节）',
  },
  [UPLOAD_CONFIG_KEYS.localAppPublicUrl]: { name: '本地访问域名' },
  [UPLOAD_CONFIG_KEYS.localUploadsDir]: { name: '本地上传目录' },
  [UPLOAD_CONFIG_KEYS.aliyunRegion]: { name: '阿里云 Region' },
  [UPLOAD_CONFIG_KEYS.aliyunBucket]: { name: '阿里云 Bucket' },
  [UPLOAD_CONFIG_KEYS.aliyunAccessKeyId]: { name: '阿里云 AccessKeyId' },
  [UPLOAD_CONFIG_KEYS.aliyunAccessKeySecret]: { name: '阿里云 AccessKeySecret' },
  [UPLOAD_CONFIG_KEYS.aliyunPublicBaseUrl]: { name: '阿里云 CDN 域名' },
  [UPLOAD_CONFIG_KEYS.tencentRegion]: { name: '腾讯云 Region' },
  [UPLOAD_CONFIG_KEYS.tencentBucket]: { name: '腾讯云 Bucket' },
  [UPLOAD_CONFIG_KEYS.tencentSecretId]: { name: '腾讯云 SecretId' },
  [UPLOAD_CONFIG_KEYS.tencentSecretKey]: { name: '腾讯云 SecretKey' },
  [UPLOAD_CONFIG_KEYS.tencentPublicBaseUrl]: { name: '腾讯云 CDN 域名' },
};

@Injectable()
export class UploadSettingsService {
  constructor(
    @InjectRepository(SysConfigEntity)
    private readonly configRepo: Repository<SysConfigEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getSettings(): Promise<UploadSettingsResponse> {
    const runtime = await this.getRuntimeConfig(true);
    return {
      provider: runtime.provider,
      maxSize: runtime.maxSize,
      local: runtime.local,
      aliyun: {
        ...runtime.aliyun,
        accessKeySecret: runtime.aliyun.accessKeySecret ? SECRET_MASK : '',
      },
      tencent: {
        ...runtime.tencent,
        secretKey: runtime.tencent.secretKey ? SECRET_MASK : '',
      },
    };
  }

  async updateSettings(dto: UpdateUploadSettingsDto): Promise<UploadSettingsResponse> {
    if (dto.provider !== undefined) {
      await this.upsert(UPLOAD_CONFIG_KEYS.provider, dto.provider);
    }
    if (dto.maxSize !== undefined) {
      await this.upsert(UPLOAD_CONFIG_KEYS.maxSize, String(dto.maxSize));
    }
    if (dto.local) {
      if (dto.local.appPublicUrl !== undefined) {
        await this.upsert(UPLOAD_CONFIG_KEYS.localAppPublicUrl, dto.local.appPublicUrl);
      }
      if (dto.local.uploadsDir !== undefined) {
        await this.upsert(UPLOAD_CONFIG_KEYS.localUploadsDir, dto.local.uploadsDir);
      }
    }
    if (dto.aliyun) {
      await this.patchProviderFields(dto.aliyun, {
        region: UPLOAD_CONFIG_KEYS.aliyunRegion,
        bucket: UPLOAD_CONFIG_KEYS.aliyunBucket,
        accessKeyId: UPLOAD_CONFIG_KEYS.aliyunAccessKeyId,
        accessKeySecret: UPLOAD_CONFIG_KEYS.aliyunAccessKeySecret,
        publicBaseUrl: UPLOAD_CONFIG_KEYS.aliyunPublicBaseUrl,
      });
    }
    if (dto.tencent) {
      await this.patchProviderFields(dto.tencent, {
        region: UPLOAD_CONFIG_KEYS.tencentRegion,
        bucket: UPLOAD_CONFIG_KEYS.tencentBucket,
        secretId: UPLOAD_CONFIG_KEYS.tencentSecretId,
        secretKey: UPLOAD_CONFIG_KEYS.tencentSecretKey,
        publicBaseUrl: UPLOAD_CONFIG_KEYS.tencentPublicBaseUrl,
      });
    }

    return this.getSettings();
  }

  async getRuntimeConfig(maskSecrets = false): Promise<UploadRuntimeConfig> {
    const keys = Object.values(UPLOAD_CONFIG_KEYS);
    const configs = await this.configRepo.find({
      where: { configKey: In(keys) },
    });
    const map = new Map(configs.map((item) => [item.configKey, item.configValue]));

    const envDefaults = this.envDefaults();
    const provider = this.parseProvider(
      map.get(UPLOAD_CONFIG_KEYS.provider) ?? envDefaults.provider,
    );

    return {
      provider,
      maxSize: this.parseNumber(
        map.get(UPLOAD_CONFIG_KEYS.maxSize),
        envDefaults.maxSize,
      ),
      local: {
        appPublicUrl:
          map.get(UPLOAD_CONFIG_KEYS.localAppPublicUrl) ??
          envDefaults.local.appPublicUrl,
        uploadsDir:
          map.get(UPLOAD_CONFIG_KEYS.localUploadsDir) ??
          envDefaults.local.uploadsDir,
      },
      aliyun: {
        region:
          map.get(UPLOAD_CONFIG_KEYS.aliyunRegion) ?? envDefaults.aliyun.region,
        bucket:
          map.get(UPLOAD_CONFIG_KEYS.aliyunBucket) ?? envDefaults.aliyun.bucket,
        accessKeyId:
          map.get(UPLOAD_CONFIG_KEYS.aliyunAccessKeyId) ??
          envDefaults.aliyun.accessKeyId,
        accessKeySecret:
          map.get(UPLOAD_CONFIG_KEYS.aliyunAccessKeySecret) ??
          envDefaults.aliyun.accessKeySecret,
        publicBaseUrl:
          map.get(UPLOAD_CONFIG_KEYS.aliyunPublicBaseUrl) ??
          envDefaults.aliyun.publicBaseUrl,
      },
      tencent: {
        region:
          map.get(UPLOAD_CONFIG_KEYS.tencentRegion) ?? envDefaults.tencent.region,
        bucket:
          map.get(UPLOAD_CONFIG_KEYS.tencentBucket) ?? envDefaults.tencent.bucket,
        secretId:
          map.get(UPLOAD_CONFIG_KEYS.tencentSecretId) ??
          envDefaults.tencent.secretId,
        secretKey:
          map.get(UPLOAD_CONFIG_KEYS.tencentSecretKey) ??
          envDefaults.tencent.secretKey,
        publicBaseUrl:
          map.get(UPLOAD_CONFIG_KEYS.tencentPublicBaseUrl) ??
          envDefaults.tencent.publicBaseUrl,
      },
    };
  }

  private envDefaults(): UploadRuntimeConfig {
    return {
      provider: 'local',
      maxSize:
        this.configService.get<number>('upload.uploadMaxSize') ?? 5 * 1024 * 1024,
      local: {
        appPublicUrl:
          this.configService.get<string>('upload.appPublicUrl') ??
          'http://localhost:3000',
        uploadsDir:
          this.configService.get<string>('upload.uploadsDir') ??
          `${process.cwd()}/uploads`,
      },
      aliyun: {
        region: this.configService.get<string>('upload.ossRegion') ?? 'oss-cn-hangzhou',
        bucket: this.configService.get<string>('upload.ossBucket') ?? '',
        accessKeyId: this.configService.get<string>('upload.ossAccessKeyId') ?? '',
        accessKeySecret:
          this.configService.get<string>('upload.ossAccessKeySecret') ?? '',
        publicBaseUrl:
          this.configService.get<string>('upload.ossPublicBaseUrl') ?? '',
      },
      tencent: {
        region: 'ap-guangzhou',
        bucket: '',
        secretId: '',
        secretKey: '',
        publicBaseUrl: '',
      },
    };
  }

  private parseProvider(value: string): UploadStorageProvider {
    if (value === 'aliyun_oss' || value === 'tencent_cos') {
      return value;
    }
    return 'local';
  }

  private parseNumber(value: string | undefined, fallback: number): number {
    if (!value) {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async patchProviderFields(
    dto: Record<string, string | undefined>,
    keyMap: Record<string, string>,
  ): Promise<void> {
    for (const field of Object.keys(keyMap)) {
      const value = dto[field];
      if (value === undefined) {
        continue;
      }
      const configKey = keyMap[field];
      if (
        (field === 'accessKeySecret' || field === 'secretKey') &&
        (!value || value === SECRET_MASK)
      ) {
        continue;
      }
      await this.upsert(configKey, value);
    }
  }

  private async upsert(configKey: string, configValue: string): Promise<void> {
    const meta = CONFIG_META[configKey];
    let config = await this.configRepo.findOne({ where: { configKey } });
    if (!config) {
      config = this.configRepo.create({
        configKey,
        configName: meta?.name ?? configKey,
        configValue,
        configGroup: UPLOAD_CONFIG_GROUP,
        remark: null,
      });
    } else {
      config.configName = meta?.name ?? config.configName;
      config.configValue = configValue;
      config.configGroup = UPLOAD_CONFIG_GROUP;
    }
    await this.configRepo.save(config);
  }
}
