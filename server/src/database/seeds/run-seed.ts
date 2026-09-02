import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { entities } from '../entities';
import { runInitSeed } from './init.seed';

loadEnv({ path: resolve(__dirname, '../../../.env') });

function buildDataSource(): DataSource {
  return new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'nova_stack',
    entities,
    synchronize: process.env.NODE_ENV !== 'production',
  });
}

async function main(): Promise<void> {
  if (process.env.SKIP_SEED === 'true') {
    console.log('[seed] SKIP_SEED=true，已跳过');
    return;
  }

  const dataSource = buildDataSource();

  try {
    await dataSource.initialize();
    await runInitSeed(dataSource);
    console.log('[seed] 初始化完成：admin/admin123、super_admin、系统管理菜单骨架');
    if ((process.env.NODE_ENV ?? 'development') !== 'production') {
      console.log('[seed] 开发会员：13800138000/member123');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed] 失败：无法连接 MySQL 或执行 seed');
    console.error(`[seed] ${message}`);
    console.error(
      '[seed] 请确认 MySQL 已启动，并在 server/.env 中配置 DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE',
    );
    console.error('[seed] 临时跳过可设置 SKIP_SEED=true');
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main();
