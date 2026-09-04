import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap';
import { MemberUserEntity } from '../../src/database/entities';
import { runInitSeed } from '../../src/database/seeds/init.seed';
import { RedisService } from '../../src/redis/redis.service';
import { DataSource } from 'typeorm';
import { initE2eSchema } from './e2e-schema';

function createMockRedis() {
  const store = new Map<string, string>();

  return {
    set: jest.fn(async (key: string, value: string, mode?: string, ttl?: number) => {
      store.set(key, value);
      void mode;
      void ttl;
    }),
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    exists: jest.fn(async (key: string) => (store.has(key) ? 1 : 0)),
    del: jest.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
    incr: jest.fn(async (key: string) => {
      const current = parseInt(store.get(key) ?? '0', 10);
      const next = current + 1;
      store.set(key, String(next));
      return next;
    }),
    expire: jest.fn(async () => 1),
    keys: jest.fn(async (pattern: string) => {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      return [...store.keys()].filter((key) => regex.test(key));
    }),
    _store: store,
  };
}

export type MockRedis = ReturnType<typeof createMockRedis>;

export interface E2eAppContext {
  app: INestApplication;
  mockRedis: MockRedis;
  dataSource: DataSource;
}

/** 使用 sqlite 内存库 + Mock Redis 启动完整 Nest 应用（e2e 专用） */
export async function createE2eApp(): Promise<E2eAppContext> {
  process.env.NODE_ENV = 'test';
  process.env.SKIP_EXTERNAL_SERVICES = 'true';
  process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.JWT_ACCESS_EXPIRES_IN = '2h';
  process.env.PORT = '0';
  process.env.OSS_ENABLED = 'false';
  process.env.APP_PUBLIC_URL = 'http://localhost:3000';
  process.env.UPLOAD_MAX_SIZE = '5242880';
  process.env.IP_BLACKLIST_WHITELIST = '';
  process.env.IP_BLACKLIST_FAIL_THRESHOLD = '3';
  process.env.TRUST_PROXY = 'true';

  const mockRedis = createMockRedis();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        autoLoadEntities: true,
        synchronize: false,
      }),
      TypeOrmModule.forFeature([MemberUserEntity]),
      AppModule,
    ],
  })
    .overrideProvider(RedisService)
    .useValue({
      getClient: () => mockRedis,
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  await configureApp(app);
  await app.init();

  const dataSource = moduleFixture.get(DataSource);
  await initE2eSchema(dataSource);
  await runInitSeed(dataSource);

  return { app, mockRedis, dataSource };
}
