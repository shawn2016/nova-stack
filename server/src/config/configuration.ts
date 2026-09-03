import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  skipExternalServices: process.env.SKIP_EXTERNAL_SERVICES === 'true',
  corsOrigins:
    process.env.CORS_ORIGINS ??
    'http://localhost:5173,http://localhost:5174',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'nova_stack',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'change-me-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
}));

export const uploadConfig = registerAs('upload', () => ({
  ossEnabled: process.env.OSS_ENABLED === 'true',
  ossRegion: process.env.OSS_REGION ?? 'oss-cn-hangzhou',
  ossBucket: process.env.OSS_BUCKET ?? '',
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID ?? '',
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? '',
  ossPublicBaseUrl: process.env.OSS_PUBLIC_BASE_URL ?? '',
  appPublicUrl: process.env.APP_PUBLIC_URL ?? 'http://localhost:3000',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE ?? '5242880', 10),
  uploadsDir: process.env.UPLOADS_DIR ?? `${process.cwd()}/uploads`,
}));
